import type { Lead } from "@/repositories/interfaces/LeadRepository";

export type { Lead };

// ============================================================
// TYPES
// ============================================================

export interface LeadScoreBreakdown {
  budget: number;        // 0–30
  category: number;      // 0–20
  timeline: number;      // 0–20
  contactQuality: number; // 0–10
  source: number;        // 0–15
  recency: number;       // 0–5  (freshness bonus, decays over time)
}

export interface LeadScoreDetails {
  total: number;
  breakdown: LeadScoreBreakdown;
  lastCalculated: string; // ISO date
}

export interface LeadHealth {
  completeness: number;  // 0–100 % of key fields populated
  freshnessDays: number; // days since last activity or creation
  isStale: boolean;      // freshnessDays > stalenessThreshold for this stage
  riskLevel: "low" | "medium" | "high";
}

// ============================================================
// CONSTANTS
// ============================================================

/** Minimum days of inactivity before a lead is considered stale per stage */
export const STALENESS_THRESHOLDS: Record<string, number> = {
  new: 7,
  initial_contact: 10,
  contacted: 14,
  qualified: 21,
  consultation_scheduled: 14,
  proposal: 30,
  proposal_sent: 30,
  negotiation: 21,
  final_review: 14,
  won: 999,
  lost: 999,
};

/** Win probability by stage (for weighted pipeline value) */
export const STAGE_WIN_PROBABILITY: Record<string, number> = {
  new: 0.05,
  initial_contact: 0.10,
  contacted: 0.15,
  qualified: 0.30,
  consultation_scheduled: 0.40,
  proposal: 0.50,
  proposal_sent: 0.50,
  negotiation: 0.70,
  final_review: 0.80,
  won: 1.0,
  lost: 0.0,
};

// ============================================================
// LEAD SCORING
// ============================================================

export function calculateLeadScore(lead: Partial<Lead>): number {
  const breakdown = calculateLeadScoreBreakdown(lead);
  return breakdown.total;
}

export function calculateLeadScoreBreakdown(lead: Partial<Lead>): LeadScoreDetails {
  let budget = 0;
  let category = 0;
  let timeline = 0;
  let contactQuality = 0;
  let source = 0;
  let recency = 0;

  // 1. Budget Scoring (Max 30)
  const numericBudget = typeof lead.budget_value_inr === "number" ? lead.budget_value_inr : null;
  const budgetText = (lead.budget || lead.message || "").toLowerCase();
  if (numericBudget !== null) {
    if (numericBudget >= 5_000_000) budget = 30;
    else if (numericBudget >= 3_000_000) budget = 25;
    else if (numericBudget >= 1_500_000) budget = 20;
    else if (numericBudget >= 1_000_000) budget = 15;
    else if (numericBudget >= 500_000) budget = 10;
    else budget = 5;
  } else if (budgetText.includes("30l") || budgetText.includes("30 l") || budgetText.includes("crore")) budget = 30;
  else if (budgetText.includes("20l") || budgetText.includes("25l") || budgetText.includes("20 l")) budget = 25;
  else if (budgetText.includes("15l") || budgetText.includes("15 l")) budget = 20;
  else if (budgetText.includes("10l") || budgetText.includes("10 l")) budget = 15;
  else if (budgetText.includes("5l") || budgetText.includes("5 l")) budget = 10;
  else if (budgetText.includes("budget") || budgetText.includes("lakh")) budget = 5;

  // 2. Project Type / Category (Max 20)
  const cat = (lead.category || lead.lead_type || "").toLowerCase();
  if (cat.includes("interior") || cat.includes("full home") || cat.includes("villa") || cat.includes("bungalow")) category = 20;
  else if (cat.includes("renovation") || cat.includes("multiple")) category = 15;
  else if (cat.includes("commercial") || cat.includes("office")) category = 20;
  else if (cat.includes("consultation") || cat.includes("room")) category = 10;

  // 3. Timeline / Intent (Max 20)
  const message = (lead.message || lead.timeline || "").toLowerCase();
  if (message.includes("urgent") || message.includes("immediately") || message.includes("asap") || message.includes("this month")) timeline = 20;
  else if (message.includes("month") || message.includes("soon") || message.includes("next") || message.includes("2 month") || message.includes("3 month")) timeline = 15;
  else if (message.includes("planning") || message.includes("exploring") || message.includes("year")) timeline = 5;
  else if (lead.timeline) timeline = 8; // timeline field set = has intent

  // 4. Contact Quality (Max 10) — both email and phone = high intent
  if (lead.email && lead.phone) contactQuality = 10;
  else if (lead.email) contactQuality = 5;

  // 5. Source (Max 15)
  const src = (lead.source || lead.lead_source || "").toLowerCase();
  if (src.includes("referral")) source = 15;
  else if (src.includes("organic") || src.includes("google") || src.includes("website") || src === "website_contact") source = 12;
  else if (src.includes("estimator")) source = 12; // high intent tool
  else if (src.includes("style_quiz")) source = 10;
  else if (src.includes("social") || src.includes("instagram") || src.includes("facebook")) source = 8;
  else if (src.includes("paid") || src.includes("ad")) source = 6;
  else source = 5;

  // 6. Recency Bonus (Max 5) — fresh leads get a bonus that decays over time
  const activityDate = lead.last_activity_at ?? lead.created_at;
  if (activityDate) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(activityDate).getTime()) / 86_400_000
    );
    if (daysSinceActivity <= 1) recency = 5;
    else if (daysSinceActivity <= 3) recency = 4;
    else if (daysSinceActivity <= 7) recency = 3;
    else if (daysSinceActivity <= 14) recency = 1;
    // else 0 — stale leads lose recency bonus
  }

  const total = Math.min(budget + category + timeline + contactQuality + source + recency, 100);

  return {
    total,
    breakdown: { budget, category, timeline, contactQuality, source, recency },
    lastCalculated: new Date().toISOString(),
  };
}

// ============================================================
// TEMPERATURE
// ============================================================

export function getLeadTemperature(score: number): {
  label: string;
  color: string;
  priority: "hot" | "warm" | "cold";
  emoji: string;
} {
  if (score >= 70) return {
    label: "Hot",
    emoji: "🔥",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    priority: "hot",
  };
  if (score >= 40) return {
    label: "Warm",
    emoji: "🌡️",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    priority: "warm",
  };
  return {
    label: "Cold",
    emoji: "❄️",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    priority: "cold",
  };
}

// ============================================================
// LEAD HEALTH
// ============================================================

/** Key fields used to measure data completeness */
const COMPLETENESS_FIELDS: (keyof Lead)[] = [
  "email", "phone", "city", "budget", "category", "source", "message", "notes",
];

export function getLeadHealth(lead: Lead): LeadHealth {
  // Completeness
  const filledCount = COMPLETENESS_FIELDS.filter(
    (f) => lead[f] != null && String(lead[f]).trim() !== ""
  ).length;
  const completeness = Math.round((filledCount / COMPLETENESS_FIELDS.length) * 100);

  // Freshness
  const lastActivity = lead.last_activity_at || lead.created_at;
  if (!lastActivity) return { isStale: false, freshnessDays: 0 };

  const activityDate = new Date(lastActivity);
  if (isNaN(activityDate.getTime())) return { isStale: false, freshnessDays: 0 };
  
  const freshnessDays = Math.floor(
    (Date.now() - activityDate.getTime()) / 86_400_000
  );

  const threshold = STALENESS_THRESHOLDS[lead.status] ?? 14;
  const isStale = freshnessDays > threshold;

  // Risk level: considers completeness + staleness + temperature
  const score = lead.score ?? calculateLeadScore(lead);
  const temp = getLeadTemperature(score);
  let riskLevel: "low" | "medium" | "high" = "low";
  if (isStale && temp.priority === "hot") riskLevel = "high";
  else if (isStale || completeness < 50) riskLevel = "medium";

  return { completeness, freshnessDays, isStale, riskLevel };
}

// ============================================================
// WEIGHTED PIPELINE VALUE
// ============================================================

/** Returns probable deal value = budget_value_inr × stage win probability */
export function getWeightedValue(lead: Lead): number {
  const prob = STAGE_WIN_PROBABILITY[lead.status] ?? 0.1;
  return (lead.budget_value_inr ?? 0) * prob;
}

/** Format INR value to compact notation */
export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "—";

  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`;
  
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

// ============================================================
// DUPLICATE DETECTION
// ============================================================

export interface DuplicateResult {
  isDuplicate: boolean;
  confidence: "exact" | "likely" | "none";
  matchedLead?: Lead;
}

export function detectDuplicate(candidate: Partial<Lead>, existingLeads: Lead[]): DuplicateResult {
  // Exact email match = 100% duplicate
  if (candidate.email) {
    const exactMatch = existingLeads.find(
      (l) => l.email?.toLowerCase() === candidate.email?.toLowerCase()
    );
    if (exactMatch) return { isDuplicate: true, confidence: "exact", matchedLead: exactMatch };
  }

  // Fuzzy match: same phone number
  if (candidate.phone) {
    const phoneMatch = existingLeads.find(
      (l) => l.phone && l.phone.replace(/\D/g, "") === candidate.phone?.replace(/\D/g, "")
    );
    if (phoneMatch) return { isDuplicate: true, confidence: "likely", matchedLead: phoneMatch };
  }

  return { isDuplicate: false, confidence: "none" };
}

// ============================================================
// HYGIENE RULES
// ============================================================

export const HYGIENE_RULES = {
  requiredOnCreate: ["name", "email"] as const,
  requiredOnStageAdvance: {
    qualified: ["email", "phone", "city"] as const,
    proposal: ["email", "phone", "city", "budget"] as const,
    proposal_sent: ["email", "phone", "city", "budget"] as const,
    won: ["notes"] as const,
    lost: ["loss_reason"] as const,
  } as Record<string, readonly string[]>,
};

// ============================================================
// CRM PIPELINE FORECAST
// ============================================================

export interface PipelineForecast {
  committed: number;      // Won + negotiation budget total
  bestCase: number;       // All open pipeline weighted
  atRisk: Lead[];         // Hot leads inactive > 7 days
  stale: Lead[];          // Any lead inactive > threshold
  totalOpenValue: number; // Unweighted sum of open deal budgets
}

export function buildForecast(leads: Lead[]): PipelineForecast {
  const openLeads = leads.filter((l) => l.status !== "won" && l.status !== "lost");

  const committed = leads
    .filter((l) => l.status === "won" || l.status === "negotiation" || l.status === "final_review")
    .reduce((acc, l) => acc + (l.budget_value_inr ?? 0), 0);

  const bestCase = openLeads.reduce((acc, l) => acc + getWeightedValue(l), 0);
  const totalOpenValue = openLeads.reduce((acc, l) => acc + (l.budget_value_inr ?? 0), 0);

  const atRisk = openLeads.filter((l) => {
    const score = l.score ?? calculateLeadScore(l);
    const { freshnessDays } = getLeadHealth(l);
    return score >= 70 && freshnessDays > 7;
  });

  const stale = openLeads.filter((l) => getLeadHealth(l).isStale);

  return { committed, bestCase, atRisk, stale, totalOpenValue };
}
