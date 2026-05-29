/**
 * sync-posthog-reporting
 *
 * Scheduled Edge Function (invoke via pg_cron or Supabase scheduler).
 * Pulls yesterday's key funnel metrics from PostHog's Query / Trends API
 * and upserts rows into `analytics_reporting_daily`.
 *
 * Secrets required (Supabase Dashboard → Edge Functions → Secrets):
 *   POSTHOG_PERSONAL_API_KEY   — personal API token (read-only scope)
 *   POSTHOG_PROJECT_ID         — numeric project ID
 *   SUPABASE_DB_URL            — automatically injected by Supabase runtime
 *   SUPABASE_SERVICE_ROLE_KEY  — automatically injected by Supabase runtime
 *
 * NEVER exposed to the browser. Admin pages read from analytics_reporting_daily
 * via the normal Supabase client (RLS enforced).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  handlePreflight,
  okResponse,
  serverErrorResponse,
  structuredLog,
  getRequestId,
} from "../_lib/security.ts";

const FN = "sync-posthog-reporting";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PosthogTrendsResult {
  data: number[];
  days: string[];
  label: string;
}

interface ReportingRow {
  date: string;
  module_name: string;
  metric_name: string;
  metric_value: number;
  metadata?: Record<string, unknown>;
}

// ── PostHog Trends Helper ──────────────────────────────────────────────────────

async function fetchTrends(
  apiKey: string,
  projectId: string,
  event: string,
  dateFrom: string,
  dateTo: string,
): Promise<PosthogTrendsResult[]> {
  const params = new URLSearchParams({
    events: JSON.stringify([{ id: event, type: "events" }]),
    date_from: dateFrom,
    date_to: dateTo,
    interval: "day",
    display: "ActionsLineGraph",
  });

  const res = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/?${params}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PostHog Trends API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return (json.result ?? []) as PosthogTrendsResult[];
}

// ── Metric Definitions ─────────────────────────────────────────────────────────

const METRICS: Array<{
  module: string;
  metric: string;
  event: string;
}> = [
  { module: "discovery", metric: "quiz_started", event: "quiz_started" },
  { module: "discovery", metric: "quiz_completed", event: "quiz_completed" },
  { module: "discovery", metric: "lead_gate_viewed", event: "lead_gate_viewed" },
  { module: "discovery", metric: "lead_gate_submitted", event: "lead_gate_submitted" },
  { module: "estimator", metric: "estimate_path_selected", event: "estimate_path_selected" },
  { module: "contact", metric: "contact_form_started", event: "contact_form_started" },
  { module: "contact", metric: "contact_form_submitted", event: "contact_form_submitted" },
  { module: "navigation", metric: "cta_clicked", event: "cta_clicked" },
  { module: "navigation", metric: "page_viewed", event: "page_viewed" },
];

// ── Main Handler ───────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  const apiKey = Deno.env.get("POSTHOG_PERSONAL_API_KEY");
  const projectId = Deno.env.get("POSTHOG_PROJECT_ID");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!apiKey || !projectId || !supabaseUrl || !serviceRoleKey) {
    structuredLog("error", FN, "Missing required environment variables", {}, requestId);
    return serverErrorResponse(req, "Server misconfiguration", {}, FN, undefined, requestId);
  }

  // Allow explicit `date` query-param for backfills; default = yesterday UTC
  const url = new URL(req.url);
  const targetDate = url.searchParams.get("date") ??
    new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  structuredLog("info", FN, "Starting PostHog sync", { targetDate }, requestId);

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const rows: ReportingRow[] = [];

    for (const { module, metric, event } of METRICS) {
      try {
        const results = await fetchTrends(apiKey, projectId, event, targetDate, targetDate);

        for (const series of results) {
          const idx = series.days.indexOf(targetDate);
          const value = idx !== -1 ? (series.data[idx] ?? 0) : 0;

          rows.push({
            date: targetDate,
            module_name: module,
            metric_name: metric,
            metric_value: value,
            metadata: { posthog_label: series.label },
          });
        }

        // If PostHog returned no series at all, record a zero row
        if (results.length === 0) {
          rows.push({
            date: targetDate,
            module_name: module,
            metric_name: metric,
            metric_value: 0,
          });
        }
      } catch (metricErr) {
        // Log but continue — a single failed metric shouldn't abort the whole sync
        structuredLog("warn", FN, `Failed metric: ${metric}`, { error: String(metricErr) }, requestId);
      }
    }

    if (rows.length > 0) {
      const { error: upsertErr } = await supabase
        .from("analytics_reporting_daily")
        .upsert(rows, {
          onConflict: "date,module_name,metric_name",
          ignoreDuplicates: false,
        });

      if (upsertErr) throw upsertErr;
    }

    structuredLog("info", FN, "PostHog sync complete", { rowCount: rows.length, targetDate }, requestId);
    return okResponse(req, { success: true, date: targetDate, rowsUpserted: rows.length }, {}, undefined, undefined, requestId);

  } catch (error) {
    structuredLog("error", FN, "Sync failed", { error: String(error) }, requestId);
    return serverErrorResponse(req, "Sync failed", {}, FN, error, requestId);
  }
});
