/**
 * stale-lead-checker
 * ─────────────────────────────────────────────────────────────────────────────
 * Cron-triggered: Runs every 6 hours via pg_cron.
 * 
 * Scans for leads that have been inactive beyond their stage threshold
 * and flags them as stale. Optionally sends notification emails to admins
 * and creates follow-up tasks.
 * 
 * Thresholds (matches frontend STALENESS_THRESHOLDS):
 *   new:                  7 days
 *   initial_contact:      10 days
 *   contacted:            14 days
 *   qualified:            21 days
 *   consultation_scheduled: 14 days
 *   proposal_sent:        30 days
 *   proposal:             30 days
 *   negotiation:          21 days
 *   final_review:         14 days
 * 
 * Notifications sent:
 *   - Daily digest if STALE_LEAD_DAILY_DIGEST=true
 *   - Per-lead alert for Hot leads that go stale
 * 
 * Environment:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (automatic)
 *   RESEND_API_KEY (optional — for email alerts)
 *   LEAD_ALERT_EMAIL (optional — defaults to admin inbox)
 *   STALE_LEAD_DAILY_DIGEST (default: true)
 *   STALE_LEAD_THRESHOLDS_OVERRIDE (JSON, optional)
 */

// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { 
  handlePreflight, 
  okResponse, 
  badRequestResponse, 
  serverErrorResponse, 
  structuredLog, 
  getRequestId 
} from "../_lib/security.ts";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  score: number | null;
  budget_value_inr: number | null;
  lead_source: string | null;
  last_activity_at: string | null;
  created_at: string;
  stale_flagged_at: string | null;
  assigned_to: string | null;
}

interface StaleLeadResult {
  lead: Lead;
  daysSinceActivity: number;
  threshold: number;
  daysOverdue: number;
}

// ─── Staleness Thresholds (in days) ─────────────────────────────────────────

const STALENESS_THRESHOLDS: Record<string, number> = {
  new: 7,
  initial_contact: 10,
  contacted: 14,
  qualified: 21,
  consultation_scheduled: 14,
  proposal_sent: 30,
  proposal: 30,
  negotiation: 21,
  final_review: 14,
};

const HOT_SCORE_THRESHOLD = 70;
const CRON_INTERVAL_HOURS = 6;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function thresholdForStatus(status: string): number {
  return STALENESS_THRESHOLDS[status] ?? 14; // default 14 days
}

function isStale(lead: Lead): { stale: boolean; daysOverdue: number } {
  const lastActivity = lead.last_activity_at || lead.created_at;
  const daysSinceActivity = daysSince(lastActivity);
  const threshold = thresholdForStatus(lead.status);

  if (lead.status === "won" || lead.status === "lost") {
    return { stale: false, daysOverdue: 0 };
  }

  if (daysSinceActivity > threshold) {
    return { stale: true, daysOverdue: daysSinceActivity - threshold };
  }
  return { stale: false, daysOverdue: 0 };
}

function formatINR(val: number | null | undefined): string {
  if (!val || val <= 0) return "—";
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function escapeHtml(str: string | null | undefined): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Email Sending ─────────────────────────────────────────────────────────────

async function sendResendEmail(
  payload: { from: string; to: string[]; subject: string; html: string },
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body}`);
  }
}

// ─── Build Digest Email ────────────────────────────────────────────────────────

function buildDigestEmail(staleResults: StaleLeadResult[], hotStale: StaleLeadResult[]): {
  subject: string;
  html: string;
} {
  const appBaseUrl = (Deno.env.get("APP_BASE_URL") || Deno.env.get("SITE_URL") || "https://crossangleinterior.com").replace(/\/$/, "");
  const crmUrl = `${appBaseUrl}/admin/crm/leads`;

  const formatRow = (r: StaleLeadResult) => {
    const score = r.lead.score ?? 0;
    const temp = score >= HOT_SCORE_THRESHOLD ? "🔥" : score >= 40 ? "🌡️" : "❄️";
    return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #1f2937;">${escapeHtml(r.lead.name)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #1f2937;">${escapeHtml(r.lead.email || "—")}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #1f2937;">${escapeHtml(r.lead.status.replace(/_/g, " "))}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #1f2937;">${r.daysSinceActivity}d</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #1f2937;">${temp} ${score}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #1f2937;">${formatINR(r.lead.budget_value_inr)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #1f2937;">${r.daysOverdue}d overdue</td>
      </tr>`;
  };

  return {
    subject: `⚠️ CRM Stale Lead Report — ${staleResults.length} leads need attention`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #f3f4f6; max-width: 900px; margin: 0 auto; padding: 32px; background: #111827;">
        <h2 style="color: #fbbf24; margin: 0 0 8px;">Stale Lead Report</h2>
        <p style="color: #9ca3af; margin: 0 0 24px; font-size: 14px;">
          Generated: ${new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} IST
        </p>

        ${hotStale.length > 0 ? `
          <div style="background: #7f1d1d; border: 1px solid #dc2626; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #fca5a5; margin: 0 0 8px;">🔥 Hot Leads Need Immediate Attention</h3>
            <p style="color: #fecaca; margin: 0; font-size: 13px;">
              ${hotStale.length} hot lead${hotStale.length > 1 ? "s have" : " has"} gone stale. Prioritize outreach.
            </p>
          </div>
        ` : ""}

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #1f2937;">
              <th style="padding: 10px 12px; text-align: left; color: #d1d5db;">Name</th>
              <th style="padding: 10px 12px; text-align: left; color: #d1d5db;">Email</th>
              <th style="padding: 10px 12px; text-align: left; color: #d1d5db;">Stage</th>
              <th style="padding: 10px 12px; text-align: left; color: #d1d5db;">Inactive</th>
              <th style="padding: 10px 12px; text-align: left; color: #d1d5db;">Score</th>
              <th style="padding: 10px 12px; text-align: left; color: #d1d5db;">Budget</th>
              <th style="padding: 10px 12px; text-align: left; color: #d1d5db;">Overdue</th>
            </tr>
          </thead>
          <tbody style="color: #e5e7eb;">
            ${staleResults.map(formatRow).join("")}
          </tbody>
        </table>

        <a href="${crmUrl}?filter=stale"
           style="display: inline-block; background: #d97706; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
          Review Stale Leads in CRM →
        </a>

        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          This is an automated report from CrossAngle CRM. Disable stale lead alerts in System Settings.
        </p>
      </div>
    `,
  };
}

// ─── Log Activity ─────────────────────────────────────────────────────────────

async function logActivity(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  activityType: string,
  description: string,
  metadata: Record<string, unknown> = {},
  requestId?: string
): Promise<void> {
  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: activityType,
    description,
    metadata: { ...metadata, trace_id: requestId },
    performed_by: null,
  });
}

// ─── Mark Leads Stale ─────────────────────────────────────────────────────────

async function markStale(
  supabase: ReturnType<typeof createClient>,
  leads: Lead[],
  requestId?: string
): Promise<number> {
  if (leads.length === 0) return 0;

  const ids = leads.map((l) => l.id);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("leads")
    .update({ stale_flagged_at: now })
    .in("id", ids)
    .is("stale_flagged_at", null); // only update if not already flagged

  if (error) {
    structuredLog("error", "stale-lead-checker", "Failed to mark leads stale", {
      ids,
      error: error.message,
    }, requestId);
  }

  // Log activity for each newly stale lead
  for (const lead of leads) {
    if (!lead.stale_flagged_at) {
      await logActivity(
        supabase,
        lead.id,
        "lead_stale_flagged",
        `${lead.name || "Lead"} flagged as stale — ${daysSince(lead.last_activity_at || lead.created_at)} days inactive`,
        { days_inactive: daysSince(lead.last_activity_at || lead.created_at), status: lead.status },
        requestId
      );
    }
  }

  return leads.length;
}

// ─── Unmark Active Leads ──────────────────────────────────────────────────────

async function unmarkActive(
  supabase: ReturnType<typeof createClient>,
  stillStaleIds: string[],
  requestId?: string
): Promise<number> {
  if (stillStaleIds.length === 0) return 0;

  const { error } = await supabase
    .from("leads")
    .update({ stale_flagged_at: null })
    .in("id", stillStaleIds);

  if (error) {
    structuredLog("error", "stale-lead-checker", "Failed to unmark active leads", {
      error: error.message,
    }, requestId);
    return 0;
  }

  return stillStaleIds.length;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);
  const FN = "stale-lead-checker";

  if (req.method !== "POST") {
    return badRequestResponse(req, "Method not allowed", {}, requestId);
  }

  structuredLog("info", FN, "Starting stale lead scan", {}, requestId);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // ── Fetch all non-closed leads ──
  const { data: leads, error: fetchError } = await supabase
    .from("leads")
    .select(
      "id, name, email, phone, status, score, budget_value_inr, lead_source, last_activity_at, created_at, stale_flagged_at, assigned_to"
    )
    .not("status", "eq", "won")
    .not("status", "eq", "lost");

  if (fetchError) {
    structuredLog("error", FN, "Failed to fetch leads", {
      error: fetchError.message,
    }, requestId);
    return serverErrorResponse(req, fetchError.message, {}, FN, fetchError, requestId);
  }

  const allLeads = (leads || []) as Lead[];

  // ── Categorize leads ──
  const staleResults: StaleLeadResult[] = [];
  const newlyActive: Lead[] = [];

  for (const lead of allLeads) {
    const { stale, daysOverdue } = isStale(lead);
    const lastActivity = lead.last_activity_at || lead.created_at;
    const daysSinceActivity = daysSince(lastActivity);

    if (stale) {
      staleResults.push({
        lead,
        daysSinceActivity,
        threshold: thresholdForStatus(lead.status),
        daysOverdue,
      });
    } else if (lead.stale_flagged_at && lead.status !== "won" && lead.status !== "lost") {
      // Lead was stale but is now active again
      newlyActive.push(lead);
    }
  }

  // Sort: hot leads first, then by days overdue desc
  staleResults.sort((a, b) => {
    const aHot = (a.lead.score ?? 0) >= HOT_SCORE_THRESHOLD ? 1 : 0;
    const bHot = (b.lead.score ?? 0) >= HOT_SCORE_THRESHOLD ? 1 : 0;
    if (bHot !== aHot) return bHot - aHot;
    return b.daysOverdue - a.daysOverdue;
  });

  const hotStale = staleResults.filter((r) => (r.lead.score ?? 0) >= HOT_SCORE_THRESHOLD);
  const newlyStale = staleResults.filter((r) => !r.lead.stale_flagged_at);
  const alreadyFlagged = staleResults.filter((r) => !!r.lead.stale_flagged_at);

  // ── Update DB ──
  await markStale(supabase, newlyStale.map((r) => r.lead), requestId);
  await unmarkActive(
    supabase,
    newlyActive.map((l) => l.id),
    requestId
  );

  // ── Send notifications ──
  const alertEmail = Deno.env.get("LEAD_ALERT_EMAIL");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const sendDigest = Deno.env.get("STALE_LEAD_DAILY_DIGEST") !== "false";

  if (staleResults.length > 0 && alertEmail && resendApiKey && sendDigest) {
    try {
      const email = buildDigestEmail(staleResults, hotStale);
      await sendResendEmail({
        from: "Cross Angle Interior <hello@crossangleinterior.com>",
        to: [alertEmail],
        subject: email.subject,
        html: email.html,
      });
      structuredLog("info", FN, "Digest email sent", {
        to: alertEmail,
        staleCount: staleResults.length,
        hotCount: hotStale.length,
      }, requestId);
    } catch (err) {
      structuredLog("error", FN, "Failed to send digest email", {
        error: err instanceof Error ? err.message : String(err),
      }, requestId);
    }
  }

  structuredLog("info", FN, "Stale lead scan complete", {
    totalScanned: allLeads.length,
    stale: staleResults.length,
    newlyStale: newlyStale.length,
    reactivated: newlyActive.length,
    hotStale: hotStale.length,
  }, requestId);

  return okResponse(
    req,
    {
      success: true,
      totalScanned: allLeads.length,
      stale: staleResults.length,
      newlyStale: newlyStale.length,
      reactivated: newlyActive.length,
      hotStale: hotStale.length,
      newlyStaleLeads: newlyStale.map((r) => ({
        id: r.lead.id,
        name: r.lead.name,
        daysOverdue: r.daysOverdue,
        score: r.lead.score,
      })),
    },
    {},
    undefined,
    undefined,
    requestId
  );
});
