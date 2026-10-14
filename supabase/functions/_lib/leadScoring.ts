/**
 * The one lead-scoring formula. Everything that writes leads.score uses this:
 * auto-score-lead, score-lead's bulk recompute, and (mirrored in the browser)
 * apps/web/src/lib/scoring/leadScoring.ts. lead-scoring-parity.test.ts fails if
 * the browser copy and this one disagree.
 *
 * Pure TypeScript with no imports, so Deno and Vitest can both load it.
 * Bump SCORE_VERSION whenever a weight or threshold changes; it is stored in
 * leads.score_details so you can tell which rules produced a stored score.
 */
export const SCORE_VERSION = "v1";

export interface Lead {
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

export interface ScoreBreakdown {
  budget: number;
  category: number;
  timeline: number;
  contactQuality: number;
  source: number;
  recency: number;
}

export interface ScoreResult {
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

export function scoreLead(lead: Lead): ScoreResult {
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


export type Temperature = "hot" | "warm" | "cold";

export function temperatureFor(score: number): Temperature {
  return score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";
}

/** What gets stored in leads.score_details. */
export function scoreDetails(result: ScoreResult, computedAt = new Date().toISOString()) {
  return { ...result.breakdown, version: SCORE_VERSION, computed_at: computedAt };
}
