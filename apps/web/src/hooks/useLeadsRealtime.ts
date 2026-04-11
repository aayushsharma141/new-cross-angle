/**
 * useLeadsRealtime
 * ─────────────────────────────────────────────────────────────────────────────
 * Option C Hybrid strategy:
 *   • Subscribes to Supabase Postgres changes on the `leads` table
 *   • When a remote INSERT/UPDATE/DELETE arrives, marks the cache as stale
 *   • Exposes `lastUpdated` timestamp (ISO string) and `hasPendingUpdate` flag
 *   • Consumer shows "Updated X seconds ago" + manual "Refresh" button
 *   • Falls back gracefully if Realtime is unavailable (no crash)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeState {
  /** ISO string of the last time the leads query was refreshed */
  lastUpdated: string;
  /** True when Supabase has sent a new event but user hasn't refreshed yet */
  hasPendingUpdate: boolean;
  /** Whether an active Realtime channel is connected */
  isConnected: boolean;
  /** Manually trigger a cache invalidation */
  refresh: () => void;
}

export function useLeadsRealtime(): RealtimeState {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["leads"] });
    setLastUpdated(new Date().toISOString());
    setHasPendingUpdate(false);
  }, [queryClient]);

  useEffect(() => {
    // Build the Realtime channel for leads table changes
    const channel = supabase
      .channel("crm_leads_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => {
          // Mark stale — don't auto-refresh to avoid disrupting active edits
          setHasPendingUpdate(true);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, []);

  return {
    lastUpdated,
    hasPendingUpdate,
    isConnected,
    refresh: invalidate,
  };
}
