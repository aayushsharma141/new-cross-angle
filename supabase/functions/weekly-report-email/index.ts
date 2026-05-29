/**
 * weekly-report-email
 * ─────────────────────────────────────────────────────────────────────────────
 * Aggregates weekly lead acquisition performance metrics, pipeline value,
 * and outbound admin activities, delivering an elegant HTML report to stakeholders.
 *
 * Triggered:
 *   - Weekly via pg_cron (e.g. every Monday morning)
 *   - Manually from the Admin Hub UI by authenticated administrators
 *
 * Environment:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (automatic)
 *   RESEND_API_KEY (required — for report delivery)
 *   LEAD_ALERT_EMAIL (required — destination address)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { 
  handlePreflight, 
  okResponse, 
  badRequestResponse, 
  serverErrorResponse, 
  structuredLog, 
  getRequestId,
  verifyAdmin
} from "../_lib/security.ts";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  score: number | null;
  lead_score: number | null;
  budget_value_inr: number | null;
  lead_source: string | null;
  created_at: string;
}

interface ClosedLead {
  id: string;
  name: string | null;
  status: string;
  budget_value_inr: number | null;
  loss_reason: string | null;
  closed_at: string | null;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  lead: {
    name: string | null;
    email: string | null;
  } | null;
}

const FN = "weekly-report-email";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatINR(val: number | null | undefined): string {
  if (!val || val <= 0) return "₹0";
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)} L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(str: string | null | undefined): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Security Verification ────────────────────────────────────────────────────

async function verifyRequestAuthorized(req: Request, serviceKey: string): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false, error: "Missing or malformed Authorization header" };
  }
  const token = authHeader.slice(7);

  // 1. Allow Service Role Key (cron)
  if (serviceKey && token === serviceKey) {
    return { authorized: true };
  }

  // 2. Allow Admin JWT (manual dashboard trigger)
  const adminCheck = await verifyAdmin(req);
  if (adminCheck.error) {
    return { authorized: false, error: adminCheck.error };
  }

  return { authorized: true };
}

// ─── HTML Template Generator ──────────────────────────────────────────────────

function buildReportEmailHtml(
  startDateStr: string,
  endDateStr: string,
  metrics: {
    newLeadsCount: number;
    pipelineGenerated: number;
    wonCount: number;
    wonValue: number;
    lostCount: number;
    avgLeadScore: number;
    activeCount: number;
    activeValue: number;
    statusCounts: Record<string, number>;
    sourceCounts: Record<string, number>;
    activityCounts: Record<string, number>;
    lossReasonCounts: Record<string, number>;
    recentActivities: Activity[];
  }
): string {
  const formattedStart = formatDate(startDateStr);
  const formattedEnd = formatDate(endDateStr);

  // Status meter UI
  const totalActive = Object.values(metrics.statusCounts).reduce((a, b) => a + b, 0) || 1;
  const statusMeterRows = Object.entries(metrics.statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => {
      const pct = Math.round((count / totalActive) * 100);
      return `
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #E5E5EA; text-transform: capitalize;">${status.replace(/_/g, " ")}</td>
          <td style="padding: 8px 0; font-size: 14px; color: #C5A880; font-weight: bold; text-align: right; width: 60px;">${count}</td>
          <td style="padding: 8px 0; width: 140px; text-align: right;">
            <div style="background-color: #2C2C2E; border-radius: 4px; height: 8px; width: 120px; display: inline-block; overflow: hidden; vertical-align: middle;">
              <div style="background-color: #D4AF37; height: 100%; width: ${pct}%; border-radius: 4px;"></div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Source breakdown rows
  const totalNew = metrics.newLeadsCount || 1;
  const sourceRows = Object.entries(metrics.sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => {
      const pct = Math.round((count / totalNew) * 100);
      return `
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #E5E5EA; text-transform: capitalize;">${source.replace(/_/g, " ")}</td>
          <td style="padding: 8px 0; font-size: 14px; color: #C5A880; font-weight: bold; text-align: right; width: 60px;">${count}</td>
          <td style="padding: 8px 0; font-size: 12px; color: #8E8E93; text-align: right; width: 50px;">${pct}%</td>
        </tr>
      `;
    })
    .join("");

  // Recent activity log rows
  const activityRows = metrics.recentActivities.length > 0
    ? metrics.recentActivities.slice(0, 10).map((act) => {
        const leadName = act.lead ? escapeHtml(act.lead.name) : "Unknown Lead";
        const dateStr = new Date(act.created_at).toLocaleDateString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
        });
        const desc = act.description ? escapeHtml(act.description) : "";
        const badgeColor = act.activity_type === "status_change" ? "#34C759" : act.activity_type === "call" ? "#0A84FF" : "#BF5AF2";
        return `
          <tr style="border-bottom: 1px solid #1C1C1E;">
            <td style="padding: 10px 0; font-size: 13px; color: #E5E5EA; vertical-align: top;">
              <span style="display: inline-block; padding: 2px 6px; font-size: 10px; border-radius: 4px; font-weight: bold; background-color: ${badgeColor}; color: #FFFFFF; text-transform: uppercase; margin-right: 6px; vertical-align: middle;">
                ${act.activity_type.replace(/_/g, " ")}
              </span>
              <strong style="color: #FFFFFF;">${leadName}</strong>: ${desc}
            </td>
            <td style="padding: 10px 0; font-size: 12px; color: #8E8E93; text-align: right; vertical-align: top; width: 110px; white-space: nowrap;">
              ${dateStr}
            </td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="2" style="padding: 16px 0; text-align: center; color: #8E8E93; font-style: italic; font-size: 14px;">No activities logged in this window.</td></tr>`;

  // Loss Reason Breakdown table (if lost leads present)
  let lossSection = "";
  if (metrics.lostCount > 0) {
    const lossRows = Object.entries(metrics.lossReasonCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #E5E5EA; text-transform: capitalize;">${reason.replace(/_/g, " ")}</td>
          <td style="padding: 8px 0; font-size: 13px; color: #FF453A; font-weight: bold; text-align: right; width: 60px;">${count}</td>
        </tr>
      `).join("");

    lossSection = `
      <div style="background-color: #1C1C1E; border-radius: 8px; padding: 20px; border: 1px solid #3A3A3C; margin-bottom: 24px;">
        <h3 style="margin-top: 0; color: #FF453A; font-size: 16px; border-bottom: 1px solid #2C2C2E; padding-bottom: 8px;">Loss Reason Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${lossRows}
        </table>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cross Angle CRM Weekly Report</title>
</head>
<body style="background-color: #0A0A0A; color: #E5E5EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px 0;">
  <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #111111; border-radius: 12px; border-collapse: collapse; overflow: hidden; border: 1px solid #1C1C1E; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- BRAND HEADER -->
    <tr>
      <td style="background-color: #0F0F10; padding: 30px 40px; border-bottom: 2px solid #C5A880; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px; color: #FFFFFF; font-family: 'Times New Roman', Times, serif;">CROSS ANGLE INTERIOR</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #C5A880; text-transform: uppercase; letter-spacing: 3px;">WEEKLY PERFORMANCE DIGEST</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #8E8E93;">${formattedStart} - ${formattedEnd}</p>
      </td>
    </tr>

    <!-- CONTENT WRAPPER -->
    <tr>
      <td style="padding: 30px 40px;">
        
        <!-- KPI METRICS GRID -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <!-- New Leads -->
            <td style="width: 50%; padding-right: 10px; padding-bottom: 20px;">
              <div style="background-color: #1C1C1E; border-radius: 8px; padding: 16px; border: 1px solid #2C2C2E; text-align: center;">
                <div style="font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">New Leads</div>
                <div style="font-size: 28px; font-weight: bold; color: #FFFFFF;">${metrics.newLeadsCount}</div>
              </div>
            </td>
            <!-- Pipeline Value -->
            <td style="width: 50%; padding-left: 10px; padding-bottom: 20px;">
              <div style="background-color: #1C1C1E; border-radius: 8px; padding: 16px; border: 1px solid #2C2C2E; text-align: center;">
                <div style="font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">New Pipeline</div>
                <div style="font-size: 28px; font-weight: bold; color: #34C759;">${formatINR(metrics.pipelineGenerated)}</div>
              </div>
            </td>
          </tr>
          <tr>
            <!-- Leads Won -->
            <td style="width: 50%; padding-right: 10px;">
              <div style="background-color: #1C1C1E; border-radius: 8px; padding: 16px; border: 1px solid #2C2C2E; text-align: center;">
                <div style="font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Leads Won</div>
                <div style="font-size: 28px; font-weight: bold; color: #C5A880;">${metrics.wonCount} <span style="font-size: 14px; font-weight: normal; color: #8E8E93;">(${formatINR(metrics.wonValue)})</span></div>
              </div>
            </td>
            <!-- Avg Score -->
            <td style="width: 50%; padding-left: 10px;">
              <div style="background-color: #1C1C1E; border-radius: 8px; padding: 16px; border: 1px solid #2C2C2E; text-align: center;">
                <div style="font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Avg Quality Score</div>
                <div style="font-size: 28px; font-weight: bold; color: #0A84FF;">${metrics.avgLeadScore}/100</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- SNAPSHOT SUMMARY BANNER -->
        <div style="background: linear-gradient(135deg, #1C1C1E 0%, #0F0F10 100%); border-radius: 8px; padding: 16px 20px; border: 1px solid #C5A880; margin-bottom: 24px; text-align: center;">
          <span style="font-size: 13px; color: #8E8E93;">CURRENT ACTIVE CRM WORKLOAD</span>
          <h2 style="margin: 5px 0; font-size: 22px; color: #FFFFFF; font-weight: bold;">
            ${metrics.activeCount} Open Leads <span style="font-size: 15px; color: #C5A880; font-weight: normal;">(${formatINR(metrics.activeValue)} pipeline)</span>
          </h2>
        </div>

        <!-- PIPELINE STATUS DISTRIBUTION -->
        <div style="background-color: #1C1C1E; border-radius: 8px; padding: 20px; border: 1px solid #2C2C2E; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; border-bottom: 1px solid #2C2C2E; padding-bottom: 8px;">Active Stage Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${statusMeterRows || '<tr><td style="padding:10px 0;color:#8E8E93;font-style:italic;">No active leads. All leads are closed.</td></tr>'}
          </table>
        </div>

        <!-- LEAD SOURCES -->
        <div style="background-color: #1C1C1E; border-radius: 8px; padding: 20px; border: 1px solid #2C2C2E; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; border-bottom: 1px solid #2C2C2E; padding-bottom: 8px;">Weekly Acquisition Channels</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${sourceRows || '<tr><td style="padding:10px 0;color:#8E8E93;font-style:italic;">No new leads generated this week.</td></tr>'}
          </table>
        </div>

        <!-- LOSS REASON CHART -->
        ${lossSection}

        <!-- ADMINISTRATIVE RECENT ACTIVITY LOG -->
        <div style="background-color: #1C1C1E; border-radius: 8px; padding: 20px; border: 1px solid #2C2C2E; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px; border-bottom: 1px solid #2C2C2E; padding-bottom: 8px;">Outbound Admin Activity Trail</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${activityRows}
          </table>
        </div>

        <!-- CALL TO ACTION PANEL -->
        <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
          <a href="https://crossangleinterior.com/admin/leads" target="_blank" style="background-color: #C5A880; color: #0A0A0A; padding: 14px 28px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(197, 168, 128, 0.3);">
            Access Admin Control Center
          </a>
        </div>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background-color: #0F0F10; padding: 20px 40px; text-align: center; font-size: 11px; color: #8E8E93; border-top: 1px solid #1C1C1E;">
        This telemetry digest is automatically generated by pg_cron CRM reporter.<br/>
        Cross Angle Interior • Bangalore, India • Confidential Telemetry
      </td>
    </tr>

  </table>
</body>
</html>
  `;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);
  structuredLog("info", FN, "Handling report request", {}, requestId);

  if (req.method !== "POST") {
    return badRequestResponse(req, "Method not allowed. Use POST.", {}, requestId);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1. Verify authorization
  const auth = await verifyRequestAuthorized(req, serviceKey);
  if (!auth.authorized) {
    structuredLog("warn", FN, "Unauthorized request attempt", { error: auth.error }, requestId);
    return badRequestResponse(req, auth.error ?? "Unauthorized", {}, requestId);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fallbackEmail = Deno.env.get("LEAD_ALERT_EMAIL");

  if (!resendApiKey) {
    const errorMsg = "Missing environment parameter: RESEND_API_KEY";
    structuredLog("error", FN, errorMsg, {}, requestId);
    return serverErrorResponse(req, errorMsg, {}, FN, new Error(errorMsg), requestId);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Fetch recipients from DB, fall back to env var
  let recipients: string[] = [];
  const { data: settings } = await supabase
    .from("site_settings")
    .select("report_recipients")
    .limit(1)
    .maybeSingle();
  
  if (settings?.report_recipients && Array.isArray(settings.report_recipients) && settings.report_recipients.length > 0) {
    recipients = settings.report_recipients as string[];
  } else if (fallbackEmail) {
    recipients = [fallbackEmail];
  }

  if (recipients.length === 0) {
    const errorMsg = "No report recipients configured (check Settings > Reports or LEAD_ALERT_EMAIL env)";
    structuredLog("error", FN, errorMsg, {}, requestId);
    return serverErrorResponse(req, errorMsg, {}, FN, new Error(errorMsg), requestId);
  }

  try {
    // Determine report dates
    const requestBody = await req.json().catch(() => ({}));
    const startParam = requestBody.start_date;
    const endParam = requestBody.end_date;

    const endDate = endParam ? new Date(endParam) : new Date();
    const startDate = startParam ? new Date(startParam) : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDateIso = startDate.toISOString();
    const endDateIso = endDate.toISOString();

    structuredLog("info", FN, "Date scope compiled", { startDateIso, endDateIso }, requestId);

    // ── DATA QUERY 1: New Leads ──
    const { data: newLeads, error: newLeadsError } = await supabase
      .from("leads")
      .select("id, name, email, phone, status, lead_source, created_at, lead_score, score, budget_value_inr")
      .gte("created_at", startDateIso)
      .lte("created_at", endDateIso);

    if (newLeadsError) throw newLeadsError;

    // ── DATA QUERY 2: Closed Leads ──
    const { data: closedLeads, error: closedLeadsError } = await supabase
      .from("leads")
      .select("id, name, status, budget_value_inr, loss_reason, closed_at")
      .gte("closed_at", startDateIso)
      .lte("closed_at", endDateIso)
      .in("status", ["won", "lost"]);

    if (closedLeadsError) throw closedLeadsError;

    // ── DATA QUERY 3: Outbound Activities ──
    const { data: recentActivities, error: activitiesError } = await supabase
      .from("lead_activities")
      .select(`
        id,
        activity_type,
        description,
        metadata,
        created_at,
        lead:lead_id (
          name,
          email
        )
      `)
      .gte("created_at", startDateIso)
      .lte("created_at", endDateIso)
      .order("created_at", { ascending: false });

    if (activitiesError) throw activitiesError;

    // ── DATA QUERY 4: Pipeline Snapshot ──
    const { data: pipelineSnapshot, error: pipelineError } = await supabase
      .from("leads")
      .select("status, budget_value_inr")
      .not("status", "eq", "won")
      .not("status", "eq", "lost");

    if (pipelineError) throw pipelineError;

    // ── METRIC COMPILATION ──
    const safeNewLeads = (newLeads || []) as Lead[];
    const safeClosedLeads = (closedLeads || []) as unknown as ClosedLead[];
    const safeActivities = (recentActivities || []) as unknown as Activity[];
    const safePipeline = (pipelineSnapshot || []) as { status: string; budget_value_inr: number | null }[];

    // KPI values
    const newLeadsCount = safeNewLeads.length;
    const pipelineGenerated = safeNewLeads.reduce((sum, l) => sum + (l.budget_value_inr ?? 0), 0);

    const wonLeads = safeClosedLeads.filter(l => l.status === "won");
    const wonCount = wonLeads.length;
    const wonValue = wonLeads.reduce((sum, l) => sum + (l.budget_value_inr ?? 0), 0);
    const lostCount = safeClosedLeads.filter(l => l.status === "lost").length;

    // Avg score
    const scores = safeNewLeads.map(l => l.score ?? l.lead_score ?? 0);
    const avgLeadScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Active snap
    const activeCount = safePipeline.length;
    const activeValue = safePipeline.reduce((sum, l) => sum + (l.budget_value_inr ?? 0), 0);

    // Grouping breakdowns
    const statusCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    const activityCounts: Record<string, number> = {};
    const lossReasonCounts: Record<string, number> = {};

    // Group active snapshot by stage
    for (const item of safePipeline) {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    }

    // Group new leads by source
    for (const lead of safeNewLeads) {
      const src = lead.lead_source || "unknown";
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }

    // Group activities by type
    for (const act of safeActivities) {
      activityCounts[act.activity_type] = (activityCounts[act.activity_type] || 0) + 1;
    }

    // Group lost leads by reason
    for (const lead of safeClosedLeads.filter(l => l.status === "lost")) {
      const reason = lead.loss_reason || "unspecified";
      lossReasonCounts[reason] = (lossReasonCounts[reason] || 0) + 1;
    }

    // Build the visual HTML digest email template
    const htmlEmailContent = buildReportEmailHtml(startDateIso, endDateIso, {
      newLeadsCount,
      pipelineGenerated,
      wonCount,
      wonValue,
      lostCount,
      avgLeadScore,
      activeCount,
      activeValue,
      statusCounts,
      sourceCounts,
      activityCounts,
      lossReasonCounts,
      recentActivities: safeActivities,
    });

    // Send the report via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cross Angle CRM <telemetry@crossangleinterior.com>",
        to: recipients,
        subject: `📊 Cross Angle CRM Weekly Report: ${newLeadsCount} New Leads • ${wonCount} Won`,
        html: htmlEmailContent,
      }),
    });

    if (!response.ok) {
      const resErr = await response.text();
      throw new Error(`Resend Delivery Failed (${response.status}): ${resErr}`);
    }

    const resJson = await response.json();
    structuredLog("info", FN, "Weekly KPI report delivered", { email_id: resJson.id }, requestId);

    return okResponse(req, {
      success: true,
      emailId: resJson.id,
      window: { start: startDateIso, end: endDateIso },
      metrics: {
        newLeadsCount,
        pipelineGenerated,
        wonCount,
        wonValue,
        lostCount,
        avgLeadScore,
        activeCount,
        activeValue,
      }
    }, {}, undefined, undefined, requestId);

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    structuredLog("error", FN, "Weekly Report Execution Failed", { error: errorMsg }, requestId);
    return serverErrorResponse(req, errorMsg, {}, FN, error, requestId);
  }
});
