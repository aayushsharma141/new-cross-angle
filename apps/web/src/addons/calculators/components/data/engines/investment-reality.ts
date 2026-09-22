/**
 * Investment Reality Engine — Step 7
 *
 * NOT "what's your budget" — instead: "how do you want to invest emotionally?"
 *
 * Budget Archetypes:
 * - Conservative: longevity + practicality
 * - Balanced: emotional quality with discipline
 * - Experience-Focused: atmosphere + identity
 * - Statement-Oriented: luxury + visual impact
 *
 * Two users with ₹25L behave VERY differently psychologically.
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type { InvestmentRealityResult, BudgetArchetype } from "./types";

// ─── City Benchmarks (₹/sqft, CPWD + JK Cement + market data 2024–2026) ───

const CITY_BENCHMARKS: Record<string, { low: number; median: number; high: number }> = {
  metro:  { low: 1800, median: 3200, high: 6000 },
  tier1:  { low: 1500, median: 2500, high: 4500 },
  tier2:  { low: 1200, median: 2000, high: 3500 },
};

// ─── Budget Archetype Inference ──────────────────────────────────────────────

function inferBudgetArchetype(h: DiscoveryHandoff): BudgetArchetype {
  const budgetPerSqft = h.budget / h.property.areaSqFt;
  const benchmark = CITY_BENCHMARKS[h.property.cityTier] || CITY_BENCHMARKS.tier1;

  // Sensory signals indicate investment psychology
  const wantsLuxury = h.sensory.luxuryResolvedAs === "invest-in-materials";
  const wantsExperience = h.sensory.luxuryResolvedAs === "invest-in-space" || h.sensory.lighting === "dramatic";
  const wantsTech = h.sensory.luxuryResolvedAs === "invest-in-tech";

  // High budget + luxury materials = statement
  if (budgetPerSqft > benchmark.high * 0.8 && wantsLuxury) {
    return "statement_oriented";
  }

  // Dramatic lighting, experience-focused sensory = experience
  if (wantsExperience || (wantsTech && budgetPerSqft > benchmark.median)) {
    return "experience_focused";
  }

  // Budget below median = conservative
  if (budgetPerSqft < benchmark.median * 0.75) {
    return "conservative";
  }

  return "balanced";
}

// ─── Archetype Narrative ─────────────────────────────────────────────────────

const ARCHETYPE_NARRATIVES: Record<BudgetArchetype, string> = {
  conservative: "Your investment philosophy prioritizes longevity and practical value. You want every rupee to deliver tangible, lasting improvement. The design should focus on durable materials, smart storage, and reliable systems — building a foundation that serves well for 15+ years.",
  balanced: "You're investing with discipline but want the emotional quality of your home to clearly improve. The best strategy is selective premium investment — high-quality finishes in your most-used spaces, practical solutions everywhere else.",
  experience_focused: "You're investing in how the home feels, not just how it looks. Atmosphere, lighting, and spatial flow matter more than brand names. The design should prioritize experiential elements: integrated lighting, acoustic comfort, and spatial openness.",
  statement_oriented: "You're investing in a home that makes a visual and emotional statement. Premium materials, curated finishes, and distinctive design details are non-negotiable. The challenge is ensuring this investment creates lasting satisfaction, not trend-dependent regret.",
};

// ─── High/Low Impact Zone Mapping ────────────────────────────────────────────

function mapImpactZones(h: DiscoveryHandoff, archetype: BudgetArchetype): { high: string[]; low: string[] } {
  const high: string[] = [];
  const low: string[] = [];

  // Must-have rooms with highest emotional weight = high impact
  const sortedPriorities = Object.entries(h.priorities.emotionalWeights)
    .sort(([, a], [, b]) => b - a);

  for (const [room, weight] of sortedPriorities) {
    if (weight >= 0.7) high.push(room);
    else if (weight < 0.4) low.push(room);
  }

  // Archetype-specific additions
  if (archetype === "experience_focused" || archetype === "statement_oriented") {
    if (!high.includes("Lighting")) high.push("Lighting design");
    if (!high.includes("Living Room")) high.push("Living Room finishes");
  }

  if (archetype === "conservative") {
    if (!high.includes("Storage")) high.push("Built-in storage");
    if (!low.includes("Decorative elements")) low.push("Decorative wall treatments");
  }

  // Corridors and utility are always low-impact
  if (!low.includes("Corridors")) low.push("Corridor finishes");
  if (!low.includes("Utility")) low.push("Utility room");

  return { high: high.slice(0, 5), low: low.slice(0, 4) };
}

// ─── Benchmark Position ──────────────────────────────────────────────────────

function computeBenchmarkPosition(investmentDensity: number, benchmark: { low: number; median: number; high: number }): "below" | "at" | "above" | "premium" {
  if (investmentDensity >= benchmark.high) return "premium";
  if (investmentDensity >= benchmark.median * 1.15) return "above";
  if (investmentDensity >= benchmark.low) return "at";
  return "below";
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeInvestmentReality(handoff: DiscoveryHandoff): InvestmentRealityResult {
  const archetype = inferBudgetArchetype(handoff);
  const investmentDensity = Math.round(handoff.budget / handoff.property.areaSqFt);
  const benchmark = CITY_BENCHMARKS[handoff.property.cityTier] || CITY_BENCHMARKS.tier1;
  const position = computeBenchmarkPosition(investmentDensity, benchmark);
  const zones = mapImpactZones(handoff, archetype);

  return {
    budgetArchetype: archetype,
    archetypeNarrative: ARCHETYPE_NARRATIVES[archetype],
    highImpactZones: zones.high,
    lowImpactZones: zones.low,
    investmentDensity,
    cityBenchmark: benchmark,
    benchmarkPosition: position,
  };
}
