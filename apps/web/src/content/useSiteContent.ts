import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { getBlockDef, normalizeBlock, type ContentKey, type ContentMap } from "./registry";

/*
 * `site_content*` tables and their functions are newer than the generated Supabase
 * types (see supabase/migrations/20261013000000_site_content.sql), so calls go
 * through `as never`, the same way the other post-types tables are read.
 */

interface PublishedRow {
  key: string;
  value: unknown;
  published_at: string;
}

/** Every published block, in one request. Small, so cached for 5 minutes by the app defaults. */
function usePublishedBlocks() {
  return useQuery({
    queryKey: queryKeys.siteContent.published,
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.from("site_content" as never).select("key, value");
      if (error) throw error;
      const map: Record<string, unknown> = {};
      for (const row of (data ?? []) as unknown as PublishedRow[]) map[row.key] = row.value;
      return map;
    },
    // A failed request must never blank the site: callers fall back to built-in text.
    retry: 1,
  });
}

/**
 * The text for a content block: published value → built-in default.
 * Always returns a complete, correctly shaped object, including while loading.
 */
export function useSiteContent<K extends ContentKey>(key: K): ContentMap[K] {
  const { data } = usePublishedBlocks();
  const raw = data?.[key];
  return useMemo(() => normalizeBlock(getBlockDef(key), raw), [key, raw]);
}

/* ─── Super admin editor ─────────────────────────────────────────────────── */

export interface DraftRow {
  key: string;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}
export interface VersionRow {
  id: string;
  key: string;
  value: unknown;
  published_at: string;
  published_by: string | null;
  replaced_at: string;
}
export interface PublishedInfo {
  value: unknown;
  published_at: string;
  published_by: string | null;
}

export function useAdminContent() {
  const queryClient = useQueryClient();

  const published = useQuery({
    queryKey: [...queryKeys.siteContent.published, "admin"],
    queryFn: async (): Promise<Record<string, PublishedInfo>> => {
      const { data, error } = await supabase
        .from("site_content" as never)
        .select("key, value, published_at, published_by");
      if (error) throw error;
      const map: Record<string, PublishedInfo> = {};
      for (const r of (data ?? []) as unknown as (PublishedInfo & { key: string })[]) map[r.key] = r;
      return map;
    },
  });

  const drafts = useQuery({
    queryKey: queryKeys.siteContent.drafts,
    queryFn: async (): Promise<Record<string, DraftRow>> => {
      const { data, error } = await supabase.from("site_content_drafts" as never).select("*");
      if (error) throw error;
      const map: Record<string, DraftRow> = {};
      for (const r of (data ?? []) as unknown as DraftRow[]) map[r.key] = r;
      return map;
    },
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["siteContent"] });
  };

  const rpc = async (fn: string, args: Record<string, unknown>) => {
    const { error } = await supabase.rpc(fn as never, args as never);
    if (error) throw error;
  };

  const saveDraft = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => rpc("save_site_content_draft", { p_key: key, p_value: value }),
    onSuccess: refresh,
  });
  const discardDraft = useMutation({
    mutationFn: (key: string) => rpc("discard_site_content_draft", { p_key: key }),
    onSuccess: refresh,
  });
  const publish = useMutation({
    mutationFn: (key: string) => rpc("publish_site_content", { p_key: key }),
    onSuccess: refresh,
  });
  const revert = useMutation({
    mutationFn: ({ key, versionId }: { key: string; versionId: string }) =>
      rpc("revert_site_content", { p_key: key, p_version_id: versionId }),
    onSuccess: refresh,
  });
  const resetToDefault = useMutation({
    mutationFn: (key: string) => rpc("reset_site_content", { p_key: key }),
    onSuccess: refresh,
  });

  return { published, drafts, saveDraft, discardDraft, publish, revert, resetToDefault };
}

export function useContentVersions(key: string | null) {
  return useQuery({
    queryKey: queryKeys.siteContent.versions(key ?? ""),
    enabled: !!key,
    queryFn: async (): Promise<VersionRow[]> => {
      const { data, error } = await supabase
        .from("site_content_versions" as never)
        .select("*")
        .eq("key", key as never)
        .order("replaced_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as VersionRow[];
    },
  });
}
