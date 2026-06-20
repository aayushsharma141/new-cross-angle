/**
 * ALCS Estimator Engine — Core Cost Computation
 * 
 * Implements PRD §3 (Renovation vs New-Build rules), §4 (Cost Model),
 * §9 (Property Suitability Scoring).
 * 
 * Sources:
 * - CPWD Plinth Area Rates (Nov 2023): ~₹2250/sqft (₹24,236/m²) baseline
 * - JK Cement (2026): Mumbai ₹2700–5000/sqft, Bengaluru ₹1800–4200/sqft
 * - NoBrokerHood (2026): Renovation ₹1500–4000/sqft
 * - Contingency: 10–15% of execution cost
 */

import type {
  DiscoveryHandoff,
  EstimatorRequest,
  EstimatorResponse,
  NegotiationOption,
  NegotiationStrategy,
  PropertyFitTier,
  BudgetConflictLevel,
} from "./discovery-handoff";

// ─── Cost Rate Tables (INR per sqft) ─────────────────────────────────────────

/** CPWD-anchored renovation rates by finish quality */
const RENOVATION_RATES = {
  economy:  { min: 1500, max: 2000 }, // NoBrokerHood basic
  standard: { min: 2000, max: 2800 }, // Mid-range urban
  premium:  { min: 2800, max: 4000 }, // Housiey premium
  luxury:   { min: 4000, max: 6000 }, // High-end Mumbai/Delhi
} as const;

/** New build rates — CPWD anchor + JK Cement metro data */
const NEW_BUILD_RATES = {
  economy:  { min: 1800, max: 2250 }, // CPWD baseline
  standard: { min: 2250, max: 3200 }, // Tier-1 cities
  premium:  { min: 3200, max: 4500 }, // Metro premium
  luxury:   { min: 5000, max: 8000 }, // Ultra-luxury Mumbai
} as const;

/** Reconfigure: hybrid renovation + 15% overhead */
const RECONFIGURE_OVERHEAD = 1.15;

/** City tier multipliers on top of base rates */
const CITY_MULTIPLIERS: Record<"metro" | "tier1" | "tier2", number> = {
  metro: 1.20,
  tier1: 1.10,
  tier2: 1.00,
};

/** Mechanical (plumbing + electrical + HVAC) as % of interior cost */
const MECHANICAL_PCT = 0.15;

/** Structural/civil as % of total for renovations */
const STRUCTURAL_PCT_RENOVATION = 0.10;
const STRUCTURAL_PCT_NEW_BUILD   = 0.30;

/** Old home structural fix buffer (homes > 20 yrs): ₹80k–200k */
const OLD_HOME_STRUCTURAL_BUFFER_MIN = 80_000;
const OLD_HOME_STRUCTURAL_BUFFER_MAX = 200_000;

/** Contingency percentage */
const CONTINGENCY_PCT = 0.12; // 12% mid-range

/** Professional design fee as % of execution */
const DESIGN_FEE_PCT = 0.08;

// ─── Finish Tier Inference ────────────────────────────────────────────────────

type FinishTier = "economy" | "standard" | "premium" | "luxury";

function inferFinishTier(handoff: DiscoveryHandoff): FinishTier {
  const { budget, property } = handoff;
  const budgetPerSqft = budget / property.areaSqFt;

  if (budgetPerSqft >= 5000) return "luxury";
  if (budgetPerSqft >= 3000) return "premium";
  if (budgetPerSqft >= 1800) return "standard";
  return "economy";
}

// ─── Core Cost Engine ─────────────────────────────────────────────────────────

function computeBaseCost(handoff: DiscoveryHandoff): { min: number; max: number; tier: FinishTier } {
  const { property } = handoff;
  const area = property.areaSqFt;
  const multiplier = CITY_MULTIPLIERS[property.cityTier];
  const tier = inferFinishTier(handoff);

  let rateTable: Record<FinishTier, { min: number; max: number }>;

  if (property.scope === "new_build") {
    rateTable = NEW_BUILD_RATES;
  } else if (property.scope === "reconfigure") {
    // Hybrid rates with overhead
    rateTable = {
      economy:  { min: Math.round(RENOVATION_RATES.economy.min  * RECONFIGURE_OVERHEAD), max: Math.round(RENOVATION_RATES.economy.max  * RECONFIGURE_OVERHEAD) },
      standard: { min: Math.round(RENOVATION_RATES.standard.min * RECONFIGURE_OVERHEAD), max: Math.round(RENOVATION_RATES.standard.max * RECONFIGURE_OVERHEAD) },
      premium:  { min: Math.round(RENOVATION_RATES.premium.min  * RECONFIGURE_OVERHEAD), max: Math.round(RENOVATION_RATES.premium.max  * RECONFIGURE_OVERHEAD) },
      luxury:   { min: Math.round(RENOVATION_RATES.luxury.min   * RECONFIGURE_OVERHEAD), max: Math.round(RENOVATION_RATES.luxury.max   * RECONFIGURE_OVERHEAD) },
    };
  } else {
    // renovation (default)
    rateTable = RENOVATION_RATES;
  }

  const rates = rateTable[tier];
  return {
    min: Math.round(area * rates.min * multiplier),
    max: Math.round(area * rates.max * multiplier),
    tier,
  };
}

// ─── Cost Breakdown ───────────────────────────────────────────────────────────

function buildBreakdown(handoff: DiscoveryHandoff, baseCost: { min: number; max: number }) {
  const midpoint = (baseCost.min + baseCost.max) / 2;
  const isNewBuild = handoff.property.scope === "new_build";
  const structPct = isNewBuild ? STRUCTURAL_PCT_NEW_BUILD : STRUCTURAL_PCT_RENOVATION;

  const structure  = Math.round(midpoint * structPct);
  const interiors  = Math.round(midpoint * (1 - structPct - MECHANICAL_PCT));
  const mechanical = Math.round(midpoint * MECHANICAL_PCT);
  const design     = Math.round(midpoint * DESIGN_FEE_PCT);
  const contingency = Math.round(midpoint * CONTINGENCY_PCT);

  // Old-home buffer
  let oldHomeBuffer = 0;
  if (handoff.property.ageYears >= 20) {
    oldHomeBuffer = Math.round(
      (OLD_HOME_STRUCTURAL_BUFFER_MIN + OLD_HOME_STRUCTURAL_BUFFER_MAX) / 2
    );
  }

  return { structure: structure + oldHomeBuffer, interiors, mechanical, design, contingency };
}

// ─── Property Suitability Score (0–100) ──────────────────────────────────────

export function computePropertySuitability(handoff: DiscoveryHandoff): {
  score: number;
  tier: PropertyFitTier;
  narrative: string;
} {
  const { property, priorities, lifestyle } = handoff;
  let score = 100;
  const issues: string[] = [];

  // Space density: must-have rooms vs area
  const mustHaveCount = priorities.mustHave.length;
  const sqftPerRoom = property.areaSqFt / Math.max(mustHaveCount, 1);

  if (sqftPerRoom < 80) {
    score -= 35;
    issues.push(`${mustHaveCount} must-have rooms in ${property.areaSqFt} sqft is very tight`);
  } else if (sqftPerRoom < 120) {
    score -= 20;
    issues.push("space is compact relative to your room priorities");
  } else if (sqftPerRoom < 180) {
    score -= 8;
  }

  // Family density
  const sqftPerPerson = property.areaSqFt / Math.max(lifestyle.members, 1);
  if (sqftPerPerson < 100) { score -= 15; issues.push("high occupancy density"); }
  else if (sqftPerPerson < 150) { score -= 8; }

  // WFH + space conflict
  if (lifestyle.workFromHome && !priorities.mustHave.includes("Home Office") && !priorities.mustHave.includes("Study")) {
    score -= 10;
    issues.push("no dedicated work space despite WFH");
  }

  // Hosting vs space
  if ((lifestyle.hostingFreq === "Often" || lifestyle.hostingFreq === "Always") && property.areaSqFt < 700) {
    score -= 12;
    issues.push("frequent hosting in small space");
  }

  // Pets
  if (lifestyle.petsPresent && property.areaSqFt < 600) {
    score -= 5;
    issues.push("limited space for pets");
  }

  // Old building structural risk
  if (property.ageYears >= 30 && property.scope !== "new_build") {
    score -= 10;
    issues.push("older building may have structural constraints");
  }

  score = Math.max(0, Math.min(100, score));

  let tier: PropertyFitTier;
  let narrative: string;

  if (score >= 80) {
    tier = "excellent";
    narrative = "Your property is well-suited to your lifestyle goals. Most of your priorities can be realized comfortably.";
  } else if (score >= 60) {
    tier = "good";
    narrative = issues.length
      ? `Your property can work well with thoughtful planning. Key consideration: ${issues[0]}.`
      : "Your property suits your goals with minor adjustments.";
  } else if (score >= 40) {
    tier = "constrained";
    narrative = `Your property has real constraints for your goals: ${issues.slice(0, 2).join("; ")}. We'll help you prioritize what matters most.`;
  } else {
    tier = "poor";
    narrative = `Significant gap between your aspirations and property constraints: ${issues[0]}. We recommend exploring creative alternatives or phased plans.`;
  }

  return { score, tier, narrative };
}

// ─── Budget Conflict Analysis ─────────────────────────────────────────────────

function analyzeBudgetConflict(budget: number, estimatedMin: number, estimatedMax: number): {
  level: BudgetConflictLevel;
  gapPercent: number;
  gapAmount: number;
} {
  const midEstimate = (estimatedMin + estimatedMax) / 2;
  const gapAmount = budget - midEstimate;
  const gapPercent = Math.round((gapAmount / midEstimate) * 100);

  let level: BudgetConflictLevel;
  if (gapPercent >= -10) level = "none";       // within 10% is OK
  else if (gapPercent >= -30) level = "minor";
  else if (gapPercent >= -50) level = "moderate";
  else level = "critical";

  return { level, gapPercent, gapAmount: Math.round(gapAmount) };
}

// ─── Strategy Selection ───────────────────────────────────────────────────────

function selectStrategy(
  budgetConflict: ReturnType<typeof analyzeBudgetConflict>,
  suitabilityScore: number
): { strategy: NegotiationStrategy; rationale: string } {
  if (budgetConflict.level === "none" && suitabilityScore >= 60) {
    return {
      strategy: "standard",
      rationale: "Your budget and property align well with your goals. We can proceed with a full, quality-forward plan.",
    };
  }

  if (budgetConflict.level === "minor") {
    return {
      strategy: "hero_focus",
      rationale: "A modest budget gap means we prioritize your hero spaces — living room and master bedroom — with premium finishes, while other areas get quality-conscious alternatives.",
    };
  }

  if (budgetConflict.level === "moderate") {
    return {
      strategy: "material_swaps",
      rationale: "A notable gap between your goals and budget. We'll suggest high-quality alternatives (engineered stone vs marble, laminate vs solid wood) that deliver similar aesthetics at lower cost.",
    };
  }

  if (budgetConflict.level === "critical") {
    if (suitabilityScore < 40) {
      return {
        strategy: "explore_rebuild",
        rationale: "Both the budget gap and property constraints are significant. We recommend evaluating whether renovation makes more sense than reconsidering the space itself.",
      };
    }
    return {
      strategy: "phased_execution",
      rationale: "A significant budget gap means we phase your project: core structure and essential finishes now, enhancements in a second phase 12–18 months later — spreading costs while locking in the design.",
    };
  }

  return {
    strategy: "standard",
    rationale: "Proceeding with a balanced plan tailored to your profile.",
  };
}

// ─── Main Compute Function ────────────────────────────────────────────────────

export function computeEstimate(request: EstimatorRequest): EstimatorResponse {
  const handoff = request.discovery;
  const scope = request.scopeOverride ?? handoff.property.scope;
  const effectiveHandoff = { ...handoff, property: { ...handoff.property, scope } };

  const baseCost = computeBaseCost(effectiveHandoff);
  const breakdown = buildBreakdown(effectiveHandoff, baseCost);
  const totalMin = baseCost.min + breakdown.design + breakdown.contingency;
  const totalMax = baseCost.max + breakdown.design + breakdown.contingency;
  const suitability = computePropertySuitability(effectiveHandoff);
  const budgetConflict = analyzeBudgetConflict(handoff.budget, totalMin, totalMax);
  const { strategy, rationale } = selectStrategy(budgetConflict, suitability.score);

  // Import negotiation engine dynamically to avoid circular deps
  const negotiationOptions = generateNegotiationOptions(effectiveHandoff, budgetConflict, totalMin, totalMax);

  // Phasing plan (if strategy requires it)
  const phases = strategy === "phased_execution"
    ? buildPhasingPlan(effectiveHandoff, totalMin, totalMax)
    : undefined;

  return {
    totalMin,
    totalMax,
    costBreakdown: breakdown,
    phases,
    strategy,
    strategyRationale: rationale,
    negotiationOptions,
    fitScore: suitability.score,
    fitTier: suitability.tier,
    fitNarrative: suitability.narrative,
    budgetConflict,
    timestamp: new Date().toISOString(),
  };
}

// ─── Negotiation Options Generator ───────────────────────────────────────────

function generateNegotiationOptions(
  handoff: DiscoveryHandoff,
  budgetConflict: ReturnType<typeof analyzeBudgetConflict>,
  totalMin: number,
  totalMax: number
): NegotiationOption[] {
  if (budgetConflict.level === "none") return [];

  const options: NegotiationOption[] = [];
  const midCost = (totalMin + totalMax) / 2;

  // Hero Focus: premium in 1 zone, standard elsewhere
  const heroSavings = Math.round(midCost * 0.18);
  options.push({
    id: "hero_focus",
    strategy: "hero_focus",
    label: "Hero Zone Focus",
    description: "Allocate premium finishes to your most-used space (living room + master bedroom). All other rooms get quality-conscious standard finishes.",
    savingsAmount: heroSavings,
    savingsPct: Math.round((heroSavings / midCost) * 100),
    tradeoff: "Secondary bedrooms and ancillary spaces use standard-grade finishes",
    affectedPriority: handoff.priorities.mustHave[0] || "Living Space",
    satisfactionImpact: 2,
  });

  // Material Swaps
  const swapSavings = Math.round(midCost * 0.22);
  options.push({
    id: "material_swaps",
    strategy: "material_swaps",
    label: "Smart Material Alternatives",
    description: "Substitute premium materials with high-quality equivalents: engineered stone counters, laminate flooring in secondary rooms, profile lighting instead of imported fixtures.",
    savingsAmount: swapSavings,
    savingsPct: Math.round((swapSavings / midCost) * 100),
    tradeoff: "Not all materials will be natural/imported, but the aesthetic character is preserved",
    affectedPriority: "Material quality",
    satisfactionImpact: 2,
  });

  // Phased Execution
  if (budgetConflict.level === "moderate" || budgetConflict.level === "critical") {
    const phase1Cost = Math.round(handoff.budget * 0.85);
    options.push({
      id: "phased_execution",
      strategy: "phased_execution",
      label: "Two-Phase Execution",
      description: `Phase 1 now (₹${(phase1Cost / 100000).toFixed(0)}L): complete structure, essential finishes, must-have rooms. Phase 2 in 12–18 months: enhancements, premium zones, add-ons.`,
      savingsAmount: Math.round(midCost - phase1Cost),
      savingsPct: Math.round(((midCost - phase1Cost) / midCost) * 100),
      tradeoff: "Some elements deferred 12–18 months; design locked in now for continuity",
      affectedPriority: "Timeline",
      satisfactionImpact: 3,
    });
  }

  // Scope Reduction (if critical)
  if (budgetConflict.level === "critical") {
    const reductionSavings = Math.round(midCost * 0.30);
    options.push({
      id: "scope_reduction",
      strategy: "material_swaps",
      label: "Scope Reduction",
      description: `Remove 'nice-to-have' spaces (${handoff.priorities.niceToHave.slice(0, 2).join(", ")}) from this phase entirely. Focus only on must-have rooms.`,
      savingsAmount: reductionSavings,
      savingsPct: Math.round((reductionSavings / midCost) * 100),
      tradeoff: `${handoff.priorities.niceToHave.slice(0, 2).join(" and ")} not done in this phase`,
      affectedPriority: handoff.priorities.niceToHave[0] || "Optional spaces",
      satisfactionImpact: 4,
    });
  }

  // Sort by satisfactionImpact (lowest sacrifice first)
  return options.sort((a, b) => a.satisfactionImpact - b.satisfactionImpact);
}

// ─── Phasing Plan Builder ────────────────────────────────────────────────────

function buildPhasingPlan(
  handoff: DiscoveryHandoff,
  totalMin: number,
  totalMax: number
): EstimatorResponse["phases"] {
  const phase1Budget = Math.round(handoff.budget * 0.85);
  const phase2Budget = Math.round((totalMin + totalMax) / 2 - phase1Budget);

  return [
    {
      phase: 1,
      label: "Foundation & Essential Spaces",
      scopeItems: [
        "Structural / civil work",
        "Essential plumbing & electrical",
        ...handoff.priorities.mustHave.slice(0, 3),
        "Standard-finish flooring throughout",
      ],
      estimatedCost: phase1Budget,
      timeline: "3–5 months",
    },
    {
      phase: 2,
      label: "Enhancements & Finishes",
      scopeItems: [
        "Premium finishes in hero zones",
        ...handoff.priorities.niceToHave.slice(0, 2),
        "Add-ons (modular kitchen, wardrobes, lighting)",
        "Art & accessories",
      ],
      estimatedCost: Math.max(phase2Budget, 0),
      timeline: "12–18 months later",
    },
  ];
}
