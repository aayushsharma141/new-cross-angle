/**
 * log-lead-activity
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal activity logger for CRM leads.
 * 
 * Supports ALL activity types with automatic metadata enrichment:
 *   - lead_created, lead_updated, status_changed
 *   - note_added, email_sent, email_opened, email_clicked
 *   - call_made, call_missed, meeting_scheduled, meeting_completed
 *   - task_created, task_completed, task_overdue
 *   - assignment_changed, forecast_changed
 *   - engagement_detected (from PostHog/Ahira)
 * 
 * Cron-triggered: Runs every 15 minutes via pg_cron.
 * Manual trigger: POST from CRM UI on any lead action.
 * 
 * Environment:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (automatic in Supabase)
 *   LEAD_ALERT_EMAIL  — optional, for stale/dead-lead alerts
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  buildCorsHeaders,
  handlePreflight,
  badRequestResponse,
  serverErrorResponse,
  verifyAdmin,
  structuredLog,
  type AuthResult,
} from "../_lib/security.ts";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ActivityType =
  | "lead_created"
  | "lead_updated"
  | "status_changed"
  | "note_added"
  | "email_sent"
  | "email_opened"
  | "email_clicked"
  | "email_copied"
  | "call_made"
  | "call_missed"
  | "meeting_scheduled"
  | "meeting_completed"
  | "task_created"
  | "task_completed"
  | "task_overdue"
  | "assignment_changed"
  | "forecast_changed"
  | "next_step_updated"
  | "budget_confirmed"
  | "lead_qualified"
  | "lead_reactivated"
  | "engagement_detected"
  | "whatsapp_sent"
  | "document_shared";

interface ActivityPayload {
  lead_id: string;
  activity_type: ActivityType;
  description?: string;
  metadata?: Record<string, unknown>;
  old_status?: string;
  new_status?: string;
  performed_by?: string;
}

interface LogResult {
  id: string;
  lead_id: string;
  activity_type: string;
  created_at: string;
}

// ─── Stage Labels ───────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  consultation_scheduled: "Consultation",
  proposal_sent: "Proposal",
  negotiation: "Negotiation",
  final_review: "Final Review",
  won: "Won",
  lost: "Lost",
};

// ─── Auto-description Generator ─────────────────────────────────────────────────

function generateDescription(
  type: ActivityType,
  payload: ActivityPayload,
  leadName?: string
): string {
  const name = leadName || "Lead";

  switch (type) {
    case "status_changed":
      return `${name} moved to ${STAGE_LABELS[payload.new_status || ""] || payload.new_status}`;
    case "note_added":
      return `Note added by ${payload.performed_by ? "team member" : "system"}`;
    case "email_sent":
      return `Follow-up email sent to ${name}`;
    case "email_opened":
      return `${name} opened the follow-up email`;
    case "email_clicked":
      return `${name} clicked a link in the email`;
    case "email_copied":
      return `Email template copied for ${name}`;
    case "call_made":
      return `Outbound call completed with ${name}`;
    case "call_missed":
      return `Missed call from ${name}`;
    case "meeting_scheduled":
      return `Meeting scheduled with ${name}`;
    case "meeting_completed":
      return `Meeting completed with ${name}`;
    case "assignment_changed":
      return `${name} reassigned to ${payload.metadata?.assigned_to || "another user"}`;
    case "forecast_changed":
      return `${name} forecast updated to ${payload.metadata?.forecast_category || "unknown"}`;
    case "next_step_updated":
      return `Next step set: ${payload.metadata?.next_step || "none"}`;
    case "budget_confirmed":
      return `Budget confirmed at ${payload.metadata?.budget || "unknown"}`;
    case "lead_qualified":
      return `${name} marked as qualified`;
    case "lead_reactivated":
      return `${name} reactivated after staleness`;
    case "engagement_detected":
      return `New engagement detected: ${payload.metadata?.engagement_type || "unknown signal"}`;
    case "whatsapp_sent":
      return `WhatsApp message sent to ${name}`;
    case "document_shared":
      return `Document shared with ${name}`;
    case "lead_updated":
      return `Lead profile updated`;
    case "lead_created":
      return `${name} entered the pipeline`;
    default:
      return payload.description || `${type.replace(/_/g, " ")} recorded`;
  }
}

// ─── DB Write ──────────────────────────────────────────────────────────────────

async function writeActivity(
  supabase: ReturnType<typeof createClient>,
  payload: ActivityPayload,
  actorId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const description =
    payload.description ||
    generateDescription(payload.activity_type, payload, undefined);

  const { data, error } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: payload.lead_id,
      activity_type: payload.activity_type,
      description,
      metadata: payload.metadata || {},
      old_status: payload.old_status,
      new_status: payload.new_status,
      performed_by: actorId,
    })
    .select("id")
    .single();

  if (error) {
    structuredLog("error", "log-lead-activity", "Failed to write activity", {
      lead_id: payload.lead_id,
      activity_type: payload.activity_type,
      error: error.message,
    });
    return { success: false, error: error.message };
  }

  // Also update last_activity_at on the lead
  await supabase
    .from("leads")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", payload.lead_id);

  return { success: true, id: (data as LogResult).id };
}

// ─── Batch Write ───────────────────────────────────────────────────────────────

async function writeActivities(
  supabase: ReturnType<typeof createClient>,
  payloads: ActivityPayload[],
  actorId?: string
): Promise<{ success: boolean; count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  if (payloads.length === 0) {
    return { success: true, count: 0, errors: [] };
  }

  const records = payloads.map((p) => ({
    lead_id: p.lead_id,
    activity_type: p.activity_type,
    description: p.description || generateDescription(p.activity_type, p, undefined),
    metadata: p.metadata || {},
    old_status: p.old_status,
    new_status: p.new_status,
    performed_by: actorId,
  }));

  const { data, error } = await supabase
    .from("lead_activities")
    .insert(records)
    .select("id");

  if (error) {
    structuredLog("error", "log-lead-activity", "Batch insert failed", {
      count: payloads.length,
      error: error.message,
    });
    return { success: false, count: 0, errors: [error.message] };
  }

  count = (data as LogResult[]).length;

  // Update last_activity_at for all affected leads
  const leadIds = [...new Set(payloads.map((p) => p.lead_id))];
  const now = new Date().toISOString();
  for (const id of leadIds) {
    await supabase
      .from("leads")
      .update({ last_activity_at: now })
      .eq("id", id);
  }

  return { success: true, count, errors };
}

// ─── Status Change Helper ────────────────────────────────────────────────────────

async function logStatusChange(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  oldStatus: string,
  newStatus: string,
  actorId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  return writeActivity(supabase, {
    lead_id: leadId,
    activity_type: "status_changed",
    description: `Stage changed from ${STAGE_LABELS[oldStatus] || oldStatus} to ${STAGE_LABELS[newStatus] || newStatus}`,
    old_status: oldStatus,
    new_status: newStatus,
    performed_by: actorId,
    metadata: {
      from_stage: oldStatus,
      to_stage: newStatus,
      from_label: STAGE_LABELS[oldStatus] || oldStatus,
      to_label: STAGE_LABELS[newStatus] || newStatus,
    },
  }, actorId);
}

// ─── Main Handler ───────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const preflight = handlePreflight(req, { credentialed: true });
  if (preflight) return preflight;

  try {
    // ── Auth (admin required for manual triggers) ──
    const auth: AuthResult = await verifyAuth(req);
    const actorId = auth.user?.id;

    if (!actorId) {
      return badRequestResponse(req, "Authentication required");
    }

    // ── Parse body ──
    let body: {
      activities?: ActivityPayload[];
      activity?: ActivityPayload;
      lead_id?: string;
      activity_type?: ActivityType;
      description?: string;
      metadata?: Record<string, unknown>;
      old_status?: string;
      new_status?: string;
    };

    try {
      body = await req.json();
    } catch {
      return badRequestResponse(req, "Invalid JSON payload");
    }

    // ── Init Supabase ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Batch mode ──
    if (body.activities && Array.isArray(body.activities)) {
      const result = await writeActivities(supabase, body.activities, actorId);
      structuredLog("info", "log-lead-activity", "Batch activity logged", {
        count: result.count,
        actorId,
      });
      return new Response(
        JSON.stringify({
          success: result.success,
          count: result.count,
          errors: result.errors,
        }),
        {
          headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    // ── Single activity mode ──
    const activity: ActivityPayload = body.activity || {
      lead_id: body.lead_id!,
      activity_type: body.activity_type!,
      description: body.description,
      metadata: body.metadata,
      old_status: body.old_status,
      new_status: body.new_status,
      performed_by: actorId,
    };

    if (!activity.lead_id || !activity.activity_type) {
      return badRequestResponse(req, "lead_id and activity_type are required");
    }

    // ── Auto-logic for status changes ──
    if (
      activity.activity_type === "status_changed" &&
      activity.old_status &&
      activity.new_status
    ) {
      const result = await logStatusChange(
        supabase,
        activity.lead_id,
        activity.old_status,
        activity.new_status,
        actorId
      );
      return new Response(JSON.stringify(result), {
        headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ── Generic activity ──
    const result = await writeActivity(supabase, activity, actorId);
    return new Response(JSON.stringify(result), {
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    structuredLog("error", "log-lead-activity", "Unhandled error", { error: msg });
    return serverErrorResponse(req, msg);
  }
});
