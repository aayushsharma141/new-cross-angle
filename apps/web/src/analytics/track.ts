import type { AnalyticsClient } from "./posthog-client";
import type { AnalyticsEventMap } from "./events";
import { supabase } from "@/integrations/supabase/client";

/**
 * Type-safe wrapper around `client.track` for PRODUCT & LEARNING telemetry.
 * Routes to PostHog (Product Analytics) AND Supabase (Learning System of Record).
 * Enforces the payload schema defined in `AnalyticsEventMap`.
 */
export function track<K extends keyof AnalyticsEventMap>(
  client: AnalyticsClient | undefined,
  event: K,
  properties: AnalyticsEventMap[K]
): void {
  try {
    if (client) {
      client.track(event, properties);
    }
  } catch (err) {
    console.warn(`[Product Analytics] Error tracking ${String(event)}:`, err);
  }

  // Fire and forget to Supabase
  const metadata = properties as Record<string, unknown>;
  // user_id in analytics_events is an FK to auth.users, so it can only be a real user ID.
  const userId = metadata.designerId || undefined;

  const enrichedPayload = {
    ...properties,
    timestamp: metadata.timestamp || new Date().toISOString(),
    eventVersion: metadata.eventVersion || 1,
    schemaVersion: metadata.schemaVersion || "2026-07",
  };

  supabase.from("analytics_events").insert({
    event_type: event as string,
    payload: enrichedPayload,
    user_id: userId,
  }).then(
    ({ error }) => {
      if (error) {
        console.error(`[Learning Telemetry] Failed to record ${String(event)} in Supabase:`, error);
      }
    },
    (err) => {
      console.error(`[Learning Telemetry] Unexpected error recording ${String(event)}:`, err);
    }
  );
}

/**
 * Records LEARNING telemetry.
 * Routes to Supabase `analytics_events` as the system of record,
 * and optionally also to PostHog for unified UX tracking.
 */
export async function recordLearningEvent<K extends keyof AnalyticsEventMap>(
  client: AnalyticsClient | undefined,
  event: K,
  properties: AnalyticsEventMap[K],
  sendToPostHog = true
): Promise<void> {
  // 1. Dual write to PostHog if requested (Product Analytics)
  try {
    if (sendToPostHog && client) {
      client.track(event, properties);
    }
  } catch (err) {
    console.warn(`[Product Analytics] Error tracking ${String(event)}:`, err);
  }

  // 2. Write to Supabase (Learning System of Record)
  try {
    const metadata = properties as Record<string, unknown>;
    // user_id in analytics_events is an FK to auth.users, so it can only be a real user ID.
    const userId = metadata.designerId || undefined;

    const enrichedPayload = {
      ...properties,
      timestamp: metadata.timestamp || new Date().toISOString(),
      eventVersion: metadata.eventVersion || 1,
      schemaVersion: metadata.schemaVersion || "2026-07",
    };

    const { error } = await supabase.from("analytics_events").insert({
      event_type: event as string,
      payload: enrichedPayload,
      user_id: userId,
    });

    if (error) {
      console.error(`[Learning Telemetry] Failed to record ${String(event)} in Supabase:`, error);
    }
  } catch (err) {
    console.error(`[Learning Telemetry] Unexpected error recording ${String(event)}:`, err);
  }
}
