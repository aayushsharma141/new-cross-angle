/**
 * auto-score-lead
 * ─────────────────────────────────────────────────────────────────────────────
 * Automatically recalculates and persists lead scores whenever a lead is
 * created or updated via webhook trigger from Supabase.
 * 
 * Integrates with the frontend scoring logic (leadScoring.ts) to ensure
 * consistent server-side and client-side scores.
 * 
 * Trigger: Supabase INSERT/UPDATE trigger on `leads` table
 * 
 * Score factors (matches frontend):
 *   Budget:      0–30  (INR value tiers)
 *   Category:    0–20  (project type fit)
 *   Timeline:    0–20  (urgency signals)
 *   Contact:     0–10  (email + phone present)
 *   Source:      0–15  (referral > estimator > website > social)
 *   Recency:     0–5   (fresh leads get a bonus)
 *   ─────────────────────────────────────────────
 *   Total:       0–100
 * 
 * Also logs a score_changed activity when score changes by ≥5 points.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { 
  structuredLog, 
  getRequestId, 
  handlePreflight, 
  okResponse, 
  badRequestResponse, 
  serverErrorResponse,
  unauthorizedResponse 
} from "../_lib/security.ts";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  timeline: string | null;
  budget: string | null;
  budget_value_inr: number | null;
  category: string | null;
  lead_type: string | null;
  lead_source: string | null;
  source: string | null;
  score: number | null;
  score_details: unknown | null;
  last_activity_at: string | null;
  created_at: string;
}

// ─── Scoring Logic (mirrors leadScoring.ts) ────────────────────────────────────

interface ScoreBreakdown {
  budget: number;
  category: number;
  timeline: number;
  contactQuality: number;
  source: number;
  recency: number;
}

interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

function calculateBudgetScore(lead: Lead): number {
  const numericBudget = lead.budget_value_inr;
  const budgetText = (lead.budget || lead.message || "").toLowerCase();

  if (numericBudget !== null) {
    if (numericBudget >= 5_000_000) return 30;
    if (numericBudget >= 3_000_000) return 25;
    if (numericBudget >= 1_500_000) return 20;
    if (numericBudget >= 1_000_000) return 15;
    if (numericBudget >= 500_000) return 10;
    return 5;
  }

  if (budgetText.includes("30l") || budgetText.includes("30 l") || budgetText.includes("crore")) return 30;
  if (budgetText.includes("20l") || budgetText.includes("25l") || budgetText.includes("20 l")) return 25;
  if (budgetText.includes("15l") || budgetText.includes("15 l")) return 20;
  if (budgetText.includes("10l") || budgetText.includes("10 l")) return 15;
  if (budgetText.includes("5l") || budgetText.includes("5 l")) return 10;
  if (budgetText.includes("budget") || budgetText.includes("lakh")) return 5;
  return 0;
}

function calculateCategoryScore(lead: Lead): number {
  const cat = (lead.category || lead.lead_type || "").toLowerCase();
  if (cat.includes("interior") || cat.includes("full home") || cat.includes("villa") || cat.includes("bungalow")) return 20;
  if (cat.includes("renovation") || cat.includes("multiple")) return 15;
  if (cat.includes("commercial") || cat.includes("office")) return 20;
  if (cat.includes("consultation") || cat.includes("room")) return 10;
  return 0;
}

function calculateTimelineScore(lead: Lead): number {
  const msg = (lead.message || lead.timeline || "").toLowerCase();
  if (msg.includes("urgent") || msg.includes("immediately") || msg.includes("asap") || msg.includes("this month")) return 20;
  if (msg.includes("month") || msg.includes("soon") || msg.includes("next") || msg.includes("2 month") || msg.includes("3 month")) return 15;
  if (msg.includes("planning") || msg.includes("exploring") || msg.includes("year")) return 5;
  if (lead.timeline) return 8;
  return 0;
}

function calculateContactScore(lead: Lead): number {
  if (lead.email && lead.phone) return 10;
  if (lead.email) return 5;
  return 0;
}

function calculateSourceScore(lead: Lead): number {
  const src = (lead.source || lead.lead_source || "").toLowerCase();
  if (src.includes("referral")) return 15;
  if (src.includes("organic") || src.includes("google") || src.includes("website") || src === "website_contact") return 12;
  if (src.includes("estimator")) return 12;
  if (src.includes("style_quiz") || src.includes("aesthetic_discovery_engine")) return 10;
  if (src.includes("social") || src.includes("instagram") || src.includes("facebook")) return 8;
  if (src.includes("paid") || src.includes("ad")) return 6;
  return 5;
}

function calculateRecencyScore(lead: Lead): number {
  const activityDate = lead.last_activity_at ?? lead.created_at;
  if (!activityDate) return 0;

  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(activityDate).getTime()) / 86_400_000
  );

  if (daysSinceActivity <= 1) return 5;
  if (daysSinceActivity <= 3) return 4;
  if (daysSinceActivity <= 7) return 3;
  if (daysSinceActivity <= 14) return 1;
  return 0;
}

function scoreLead(lead: Lead): ScoreResult {
  const budget = calculateBudgetScore(lead);
  const category = calculateCategoryScore(lead);
  const timeline = calculateTimelineScore(lead);
  const contactQuality = calculateContactScore(lead);
  const source = calculateSourceScore(lead);
  const recency = calculateRecencyScore(lead);

  const score = Math.min(budget + category + timeline + contactQuality + source + recency, 100);

  return {
    score,
    breakdown: { budget, category, timeline, contactQuality, source, recency },
  };
}

// ─── Deno Deploy KV (for idempotency) ─────────────────────────────────────────

interface SimpleKv {
  get<T>(key: unknown[]): Promise<{ value: T | null }>;
  set(key: unknown[], value: unknown, options?: { expireIn?: number }): Promise<{ ok: boolean }>;
  delete(key: unknown[]): Promise<{ ok: boolean }>;
}

class MemoryKv implements SimpleKv {
  private store = new Map<string, { value: unknown; expireAt: number }>();

  get<T>(key: unknown[]): Promise<{ value: T | null }> {
    const keyStr = JSON.stringify(key);
    const item = this.store.get(keyStr);
    if (!item) return Promise.resolve({ value: null });
    if (Date.now() >= item.expireAt) {
      this.store.delete(keyStr);
      return Promise.resolve({ value: null });
    }
    return Promise.resolve({ value: item.value as T });
  }

  set(key: unknown[], value: unknown, options?: { expireIn?: number }): Promise<{ ok: boolean }> {
    const keyStr = JSON.stringify(key);
    const expireIn = options?.expireIn ?? 3600000;
    this.store.set(keyStr, { value, expireAt: Date.now() + expireIn });
    return Promise.resolve({ ok: true });
  }

  delete(key: unknown[]): Promise<{ ok: boolean }> {
    const keyStr = JSON.stringify(key);
    this.store.delete(keyStr);
    return Promise.resolve({ ok: true });
  }
}

let _kv: SimpleKv | null = null;

async function getKv(): Promise<SimpleKv> {
  if (!_kv) {
    const openKvFn = (Deno as unknown as { openKv?: unknown }).openKv;
    if (typeof openKvFn === "function") {
      try {
        _kv = await (openKvFn as () => Promise<SimpleKv>)();
      } catch (e) {
        console.warn("Failed to open Deno.Kv, falling back to MemoryKv:", e);
        _kv = new MemoryKv();
      }
    } else {
      console.warn("Deno.openKv is not available, falling back to MemoryKv");
      _kv = new MemoryKv();
    }
  }
  return _kv;
}

// ─── Log Score Activity ────────────────────────────────────────────────────────

async function logScoreActivity(
  supabase: SupabaseClient,
  leadId: string,
  oldScore: number | null,
  newScore: number,
  breakdown: ScoreBreakdown,
  requestId: string
): Promise<void> {
  const oldStr = oldScore !== null ? String(Math.round(oldScore)) : "—";
  const newStr = String(Math.round(newScore));
  const delta = oldScore !== null ? newScore - oldScore : newScore;
  const deltaStr = delta >= 0 ? `+${delta.toFixed(0)}` : delta.toFixed(0);

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "score_changed",
    description: `Lead score updated: ${oldStr} → ${newStr} (${deltaStr} pts)`,
    metadata: {
      old_score: oldScore,
      new_score: newScore,
      delta,
      breakdown,
      trace_id: requestId,
    },
    performed_by: null,
  });
}

// ─── Supabase Database Trigger ─────────────────────────────────────────────────
/**
 * This function is designed to be triggered by a Supabase pg_trigger on the
 * `leads` table. Configure it in Supabase Dashboard:
 * 
 *   CREATE OR REPLACE FUNCTION public.handle_lead_score_update()
 *   RETURNS trigger AS $$
 *   BEGIN
 *     PERFORM net.http_post(
 *       url := env('SUPABASE_URL') || '/functions/v1/auto-score-lead',
 *       headers := jsonb_build_object(
 *         'Content-Type', 'application/json',
 *         'Authorization', 'Bearer ' || env('SUPABASE_SERVICE_ROLE_KEY')
 *       ),
 *       content := jsonb_build_object(
 *         'lead_id', NEW.id,
 *         'old_score', OLD.score
 *       )
 *     );
 *     RETURN NEW;
 *   END;
 *   $$ LANGUAGE plpgsql;
 * 
 *   CREATE TRIGGER on_lead_change_score_update
 *   AFTER INSERT OR UPDATE OF budget, budget_value_inr, category, lead_type, message, timeline, source, email, phone ON leads
 *   FOR EACH ROW EXECUTE FUNCTION public.handle_lead_score_update();
 */

const FN = "auto-score-lead";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${SERVICE_KEY}`) {
      return unauthorizedResponse(req, "Invalid token", {}, requestId);
    }

    const { lead_id: leadId, old_score: oldScore } = await req.json();

    if (!leadId) {
      return badRequestResponse(req, "No lead_id provided", {}, requestId);
    }

    const kv = await getKv();
    const idemKey = [FN, leadId];
    const existing = await kv.get(idemKey);
    if (existing.value) {
      structuredLog("info", FN, "Skipping — recently scored", { leadId }, requestId);
      return okResponse(req, { success: true, skipped: "recently_scored" }, {}, undefined, undefined, requestId);
    }
    await kv.set(idemKey, { ts: Date.now() }, { expireIn: 5 * 60 * 1000 });

    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) {
      structuredLog("error", FN, "Lead not found", { leadId, error: fetchError?.message }, requestId);
      return serverErrorResponse(req, `Lead not found: ${leadId}`, {}, FN, fetchError, requestId);
    }

    const typedLead = lead as Lead;
    const { score, breakdown } = scoreLead(typedLead);
    const currentScore = typedLead.score ?? 0;

    if (Math.abs(score - currentScore) < 1) {
      structuredLog("info", FN, "Score unchanged", { leadId, score }, requestId);
      return okResponse(req, { success: true, unchanged: true }, {}, undefined, undefined, requestId);
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update({ score, score_details: breakdown })
      .eq("id", leadId);

    if (updateError) {
      structuredLog("error", FN, "Failed to update score", {
        leadId, score, error: updateError.message,
      }, requestId);
      return serverErrorResponse(req, "Failed to update score", {}, FN, updateError, requestId);
    }

    if (Math.abs(score - (oldScore ?? currentScore)) >= 5) {
      await logScoreActivity(supabase, leadId, oldScore ?? currentScore, score, breakdown, requestId);
    }

    structuredLog("info", FN, "Lead scored", {
      leadId, oldScore: oldScore ?? currentScore, newScore: score,
      delta: score - (oldScore ?? currentScore), breakdown,
    }, requestId);

    return okResponse(req, { success: true, new_score: score }, {}, undefined, undefined, requestId);
  } catch (error) {
    structuredLog("error", FN, "Unhandled scoring exception", { error: String(error) }, requestId);
    return serverErrorResponse(req, "Internal scoring failure", {}, FN, error, requestId);
  }
});
