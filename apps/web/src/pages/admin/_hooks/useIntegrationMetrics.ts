import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Metrics for the service integrations page.
 *
 * Every figure here is read from a table something in this repo writes to, or
 * from a live probe. Integrations we cannot measure from the browser report
 * `null`, and the page labels them "not measured" rather than showing a number
 * that looks observed but is not.
 */

const WINDOW_DAYS = 7;

/** ISO timestamp for the start of the reporting window. */
function windowStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - WINDOW_DAYS);
  return d.toISOString();
}

export interface IntegrationMetric {
  label: string;
  value: string;
  /** Where the number came from, shown under the value. */
  source: string;
}

export interface IntegrationMeasurement {
  /** null when nothing in this codebase measures the integration. */
  metrics: IntegrationMetric[] | null;
  /** Shown when metrics is null. */
  unmeasuredReason?: string;
}

export interface SupabaseProbe {
  reachable: boolean;
  latencyMs: number;
}

/**
 * Round-trip latency of a real PostgREST query, measured in the browser.
 * This is the one integration we can time directly, because the page itself
 * talks to it.
 */
export function useSupabaseProbe() {
  return useQuery<SupabaseProbe>({
    queryKey: queryKeys.integrations.supabaseProbe,
    queryFn: async () => {
      const started = performance.now();
      const { error } = await supabase.from("projects").select("id").limit(1);
      const latencyMs = Math.round(performance.now() - started);
      if (error) throw error;
      return { reachable: true, latencyMs };
    },
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * The exact `activity_type` values the email-sending edge functions insert.
 * These are free-text strings, so nothing at the type level keeps them in step
 * with the writers — `integration-metric-sources.test.ts` pins them instead.
 * Rename one in an edge function without updating this list and the Resend
 * counters silently read zero.
 */
export const CUSTOMER_EMAIL_ACTIVITY_TYPES = ["auto_reply_sent", "email_sent"] as const;
export const INTERNAL_EMAIL_ACTIVITY_TYPES = ["internal_notification_sent"] as const;

export interface EmailMetrics {
  autoRepliesSent: number;
  internalNotificationsSent: number;
}

/**
 * Resend delivery counts, from the activity rows that handle-new-lead and
 * auto-reply-lead insert after the Resend API returns a success response.
 * A row exists only when Resend accepted the message, so these are deliveries,
 * not attempts.
 */
export function useEmailMetrics() {
  return useQuery<EmailMetrics>({
    queryKey: queryKeys.integrations.email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("activity_type")
        .in("activity_type", [
          ...CUSTOMER_EMAIL_ACTIVITY_TYPES,
          ...INTERNAL_EMAIL_ACTIVITY_TYPES,
        ])
        .gte("created_at", windowStart());

      if (error) throw error;

      const rows = data ?? [];
      const customer = new Set<string>(CUSTOMER_EMAIL_ACTIVITY_TYPES);
      const internal = new Set<string>(INTERNAL_EMAIL_ACTIVITY_TYPES);

      return {
        autoRepliesSent: rows.filter((r) => customer.has(r.activity_type)).length,
        internalNotificationsSent: rows.filter((r) => internal.has(r.activity_type)).length,
      };
    },
    staleTime: 60_000,
  });
}

export interface WebhookMetrics {
  pending: number;
  failed: number;
  succeeded: number;
}

/**
 * Telegram delivery health. The leads trigger posts to notify-telegram via
 * pg_net; deliveries that fail land in webhook_failures and retry-webhooks
 * works through them. A row set with no pending or failed entries means
 * notifications are getting through.
 */
export function useWebhookMetrics() {
  return useQuery<WebhookMetrics>({
    queryKey: queryKeys.integrations.webhooks,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_failures")
        .select("status")
        .gte("created_at", windowStart());

      if (error) throw error;

      const rows = data ?? [];
      return {
        pending: rows.filter((r) => r.status === "pending").length,
        failed: rows.filter((r) => r.status === "failed").length,
        succeeded: rows.filter((r) => r.status === "succeeded").length,
      };
    },
    staleTime: 60_000,
  });
}

export interface AnalyticsMetrics {
  pageViews: number;
  trackedEvents: number;
  lastSyncDate: string | null;
}

/**
 * PostHog totals, read from the daily rollup that sync-posthog-reporting
 * upserts. `lastSyncDate` is the newest date present, which is how you can
 * tell whether the nightly sync is still running.
 */
export function useAnalyticsMetrics() {
  return useQuery<AnalyticsMetrics>({
    queryKey: queryKeys.integrations.analytics,
    queryFn: async () => {
      const since = windowStart().slice(0, 10);
      const { data, error } = await supabase
        .from("analytics_reporting_daily")
        .select("date, metric_name, metric_value")
        .gte("date", since);

      if (error) throw error;

      const rows = data ?? [];
      const pageViews = rows
        .filter((r) => r.metric_name === "page_viewed")
        .reduce((sum, r) => sum + Number(r.metric_value ?? 0), 0);
      const trackedEvents = rows.reduce((sum, r) => sum + Number(r.metric_value ?? 0), 0);
      const lastSyncDate = rows.length
        ? rows.map((r) => r.date).sort().at(-1) ?? null
        : null;

      return { pageViews, trackedEvents, lastSyncDate };
    },
    staleTime: 5 * 60_000,
  });
}

export interface MediaMetrics {
  imagekitFiles: number;
  supabaseFiles: number;
  totalBytes: number;
}

/**
 * ImageKit vs Supabase Storage split. `storage_provider` is set to "imagekit"
 * by the upload and migration functions, so this is a true count of assets
 * living behind each provider — and a way to see migration progress.
 */
export function useMediaMetrics() {
  return useQuery<MediaMetrics>({
    queryKey: queryKeys.integrations.media,
    queryFn: async () => {
      const [imagekitRes, supabaseRes, bytesRes] = await Promise.all([
        supabase
          .from("media_files")
          .select("id", { count: "exact", head: true })
          .eq("storage_provider", "imagekit"),
        supabase
          .from("media_files")
          .select("id", { count: "exact", head: true })
          .eq("storage_provider", "supabase"),
        supabase.rpc("get_total_media_bytes"),
      ]);

      if (imagekitRes.error) throw imagekitRes.error;
      if (supabaseRes.error) throw supabaseRes.error;

      return {
        imagekitFiles: imagekitRes.count ?? 0,
        supabaseFiles: supabaseRes.count ?? 0,
        totalBytes: Number(bytesRes.data) || 0,
      };
    },
    staleTime: 5 * 60_000,
  });
}

export const REPORTING_WINDOW_DAYS = WINDOW_DAYS;

export interface IntegrationLastSeen {
  /** created_at of the newest email activity row, or null if none exists. */
  lastEmailAt: string | null;
  /** Newest date in the PostHog rollup, or null if the table is empty. */
  lastAnalyticsDate: string | null;
}

/**
 * When each integration last did something we can observe. Unlike a gateway
 * reachability check, a stale or missing value here means the integration is
 * not actually producing output.
 */
export function useIntegrationLastSeen() {
  return useQuery<IntegrationLastSeen>({
    queryKey: queryKeys.integrations.lastSeen,
    queryFn: async () => {
      const [emailRes, analyticsRes] = await Promise.all([
        supabase
          .from("lead_activities")
          .select("created_at")
          .in("activity_type", [
            ...CUSTOMER_EMAIL_ACTIVITY_TYPES,
            ...INTERNAL_EMAIL_ACTIVITY_TYPES,
          ])
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("analytics_reporting_daily")
          .select("date")
          .order("date", { ascending: false })
          .limit(1),
      ]);

      if (emailRes.error) throw emailRes.error;
      if (analyticsRes.error) throw analyticsRes.error;

      return {
        lastEmailAt: emailRes.data?.[0]?.created_at ?? null,
        lastAnalyticsDate: analyticsRes.data?.[0]?.date ?? null,
      };
    },
    staleTime: 60_000,
  });
}
