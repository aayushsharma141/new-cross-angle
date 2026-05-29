/**
 * AI Recommendation Engine — Step 11
 *
 * Becomes: Strategic Consultant.
 * Synthesizes all engine outputs into a coherent recommendation
 * with explainability ("Because your family lifestyle prioritizes…").
 */

import type { DiscoveryHandoff, PropertyFitTier } from "../discovery-handoff";
import type {
  AIRecommendationResult,
  ExecutionPath,
  LifestyleDensityResult,
  FeasibilityConflictResult,
  InvestmentRealityResult,
  RealitySimulationResult,
  ExistingPropertyResult,
} from "./types";

// ─── Execution Path Selection ────────────────────────────────────────────────

interface EngineContext {
  handoff: DiscoveryHandoff;
  propertySuitability: { score: number; tier: PropertyFitTier };
  density: LifestyleDensityResult;
  conflicts: FeasibilityConflictResult;
  investment: InvestmentRealityResult;
  simulation: RealitySimulationResult;
  existingProperty: ExistingPropertyResult;
}

function scorePaths(ctx: EngineContext): { path: ExecutionPath; score: number; summary: string }[] {
  const paths: { path: ExecutionPath; score: number; summary: string }[] = [];

  // Full Premium
  if (ctx.propertySuitability.score >= 70 && ctx.investment.benchmarkPosition !== "below" && ctx.conflicts.overallAlignment >= 70) {
    paths.push({
      path: "full_premium",
      score: 85 + (ctx.propertySuitability.score - 70),
      summary: "Your property, budget, and aspirations align well. A comprehensive, quality-forward execution delivers maximum emotional return.",
    });
  } else {
    paths.push({ path: "full_premium", score: 30, summary: "Full premium execution is possible but may create financial strain." });
  }

  // Smart Renovation
  if (ctx.existingProperty.hasExistingProperty && ctx.existingProperty.recommendedPath !== "new_build_exploration") {
    const score = 50
      + (ctx.existingProperty.layoutFlexibility === "flexible" ? 20 : ctx.existingProperty.layoutFlexibility === "moderate" ? 10 : 0)
      + (ctx.propertySuitability.score >= 50 ? 15 : 0)
      + (ctx.conflicts.overallAlignment >= 60 ? 10 : 0);
    paths.push({
      path: "smart_renovation",
      score,
      summary: "Keep the structure, upgrade emotional impact areas, optimize lighting and storage for maximum lifestyle improvement.",
    });
  }

  // Hero Space Strategy
  if (ctx.investment.benchmarkPosition === "below" || ctx.investment.benchmarkPosition === "at") {
    const topZones = ctx.investment.highImpactZones.slice(0, 2).join(" + ");
    paths.push({
      path: "hero_space",
      score: 60 + (ctx.conflicts.conflicts.length > 0 ? 10 : 0),
      summary: `Invest deeply in ${topZones} with premium finishes. Keep remaining areas practical and quality-conscious.`,
    });
  }

  // Phased Evolution
  if (ctx.investment.benchmarkPosition === "below" || ctx.conflicts.overallAlignment < 60) {
    paths.push({
      path: "phased_evolution",
      score: 55 + (ctx.simulation.livabilityScore > 60 ? 10 : 0),
      summary: "Phase 1: core civil + lighting + must-have rooms. Phase 2 (12–18 months): premium finishes and luxury additions.",
    });
  }

  // Rebuild Recommendation
  if (ctx.existingProperty.renovationToRebuildRatio > 0.65 || (ctx.propertySuitability.score < 35 && ctx.existingProperty.hasExistingProperty)) {
    paths.push({
      path: "rebuild_recommendation",
      score: 40 + (ctx.propertySuitability.score < 30 ? 20 : 0),
      summary: "Current structure creates long-term friction for your desired family lifestyle. Exploring a new property may deliver better value.",
    });
  }

  return paths.sort((a, b) => b.score - a.score);
}

// ─── Reasoning Generator ─────────────────────────────────────────────────────

function generateReasoning(ctx: EngineContext, path: ExecutionPath): string {
  const lifestyle = ctx.handoff.lifestyle;
  const emotionalGoal = ctx.handoff.emotionalGoal.toLowerCase();

  const lifestyleTraits: string[] = [];
  if (lifestyle.hostingFreq === "Often" || lifestyle.hostingFreq === "Always") lifestyleTraits.push("social connection");
  if (lifestyle.cookingRole === "Daily Ritual") lifestyleTraits.push("daily cooking rituals");
  if (lifestyle.workFromHome) lifestyleTraits.push("productive home working");
  if (lifestyle.children > 0) lifestyleTraits.push("child-friendly living");
  if (emotionalGoal.includes("peace") || emotionalGoal.includes("calm")) lifestyleTraits.push("emotional decompression");

  const traitStr = lifestyleTraits.slice(0, 3).join(", ");

  switch (path) {
    case "full_premium":
      return `Because your family lifestyle prioritizes ${traitStr}, and your property and budget can support it — a comprehensive execution delivers maximum emotional return. Every room receives attention proportional to its role in your daily well-being.`;
    case "smart_renovation":
      return `Because your family lifestyle prioritizes ${traitStr}, your existing property becomes the canvas — not a constraint. Strategic renovation upgrades the spaces that matter most while preserving what already works.`;
    case "hero_space":
      return `Because your family lifestyle prioritizes ${traitStr}, your investment creates maximum emotional return when focused on social and sensory spaces first. The hero zone strategy concentrates premium quality where you'll experience it daily.`;
    case "phased_evolution":
      return `Because your family lifestyle prioritizes ${traitStr}, phasing allows you to lock in the design vision now while spreading investment. Phase 1 delivers the foundation — livability, light, and core spaces — while Phase 2 adds luxury layers.`;
    case "rebuild_recommendation":
      return `Because your family lifestyle prioritizes ${traitStr}, the current property's structural constraints create recurring daily friction. Exploring a new space lets you build this lifestyle from the ground up.`;
  }
}

// ─── Summary Generator ───────────────────────────────────────────────────────

function generateSummary(ctx: EngineContext, path: ExecutionPath): string {
  const fitLabel = ctx.propertySuitability.tier === "excellent" ? "well-suited" :
    ctx.propertySuitability.tier === "good" ? "workable" :
    ctx.propertySuitability.tier === "constrained" ? "challenging but achievable" : "significantly constrained";

  const pathLabels: Record<ExecutionPath, string> = {
    full_premium: "Comprehensive Premium Execution",
    smart_renovation: "Smart Strategic Renovation",
    hero_space: "Hero Space Investment Strategy",
    phased_evolution: "Phased Lifestyle Evolution",
    rebuild_recommendation: "New Space Exploration",
  };

  return `Your property is ${fitLabel} for your lifestyle goals (${ctx.propertySuitability.score}% fit). The recommended strategy is "${pathLabels[path]}" — focusing on ${ctx.investment.highImpactZones.slice(0, 2).join(" and ")} as highest emotional return areas.`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeAIRecommendation(context: EngineContext): AIRecommendationResult {
  const rankedPaths = scorePaths(context);
  const topPath = rankedPaths[0];

  return {
    strategyLabel: topPath.path.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    propertyFit: context.propertySuitability.score,
    propertyFitTier: context.propertySuitability.tier,
    executionPath: topPath.path,
    focusAreas: context.investment.highImpactZones,
    reasoning: generateReasoning(context, topPath.path),
    summary: generateSummary(context, topPath.path),
  };
}
