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
  RecommendationEvidence,
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

class PathScorer {
  score = 0;
  evidence: RecommendationEvidence[] = [];
  constructor(public path: ExecutionPath) {}
  add(signal: string, impact: number, source: RecommendationEvidence["source"], rationale: string) {
    if (impact === 0) return;
    this.score += impact;
    this.evidence.push({ signal, scoreImpact: impact, source, rationale });
  }
}

function applySensoryAlignment(handoff: DiscoveryHandoff, scorer: PathScorer) {
  const { luxuryResolvedAs, lighting, textures = [] } = handoff.sensory || {};
  let totalBonus = 0;

  const addBonus = (signal: string, impact: number, rationale: string) => {
    scorer.add(signal, impact, "sensory", rationale);
    totalBonus += impact;
  };

  if (luxuryResolvedAs === "invest-in-materials") {
    if (scorer.path === "full_premium") addBonus("Material-first luxury language", 15, "Matches Full Premium execution model");
    if (scorer.path === "hero_space") addBonus("Material-first luxury language", 12, "Materials shine in hero zones");
  } else if (luxuryResolvedAs === "invest-in-tech") {
    if (scorer.path === "smart_renovation") addBonus("Tech-integrated luxury language", 15, "Aligns with structural upgrade strategy");
  } else if (luxuryResolvedAs === "invest-in-space") {
    if (scorer.path === "phased_evolution") addBonus("Space-first luxury language", 12, "Phasing allows maximum spatial capture");
  } else if (luxuryResolvedAs === "balanced") {
    if (scorer.path === "smart_renovation") addBonus("Balanced luxury language", 8, "Aligns with optimized renovation");
  }

  if (lighting === "natural") {
    if (scorer.path === "full_premium") addBonus("Natural light preference", 8, "Requires comprehensive window/layout changes");
  } else if (lighting === "dramatic") {
    if (scorer.path === "full_premium") addBonus("Statement lighting preference", 10, "Supports heavy electrical overhaul");
    if (scorer.path === "hero_space") addBonus("Statement lighting preference", 5, "Focus statement lighting in key zones");
  } else if (lighting === "warm") {
    if (scorer.path === "hero_space") addBonus("Warm lighting preference", 5, "Enhances localized ambiance");
  }

  if (textures.includes("organic")) {
    if (scorer.path === "hero_space") addBonus("Organic texture preference", 5, "Natural materials highlight hero areas");
    if (scorer.path === "full_premium") addBonus("Organic texture preference", 3, "Broad application of natural materials");
  }
  if (textures.includes("textural") || textures.includes("layered")) {
    if (scorer.path === "full_premium") addBonus("Layered texture preference", 4, "High execution complexity supported");
  }
  if (textures.includes("minimal")) {
    if (scorer.path === "smart_renovation") addBonus("Minimal texture preference", 5, "Clean lines suit strategic upgrades");
  }

  if (totalBonus > 25) {
    const penalty = 25 - totalBonus;
    scorer.add("Sensory impact cap adjustment", penalty, "sensory", "Maximum sensory influence reached");
  }
}

function applySocialFocus(priorities: DiscoveryHandoff["priorities"], scorer: PathScorer) {
  if (!priorities?.emotionalWeights) return;
  
  let socialSum = 0;
  Object.entries(priorities.emotionalWeights).forEach(([key, weight]) => {
    const k = key.toLowerCase();
    if (k.includes("living") || k.includes("dining") || k.includes("entertainment")) {
      socialSum += weight;
    }
  });
  
  const normalized = (socialSum / 3.0) * 100;
  if (normalized > 60 && scorer.path === "hero_space") {
    scorer.add("High social hosting priority", 10, "lifestyle", "Hero spaces maximize entertaining ROI");
  }
}

function scorePaths(ctx: EngineContext): { path: ExecutionPath; score: number; summary: string; evidence: RecommendationEvidence[] }[] {
  const paths: { path: ExecutionPath; score: number; summary: string; evidence: RecommendationEvidence[] }[] = [];

  // 1. Full Premium
  const fp = new PathScorer("full_premium");
  let fpBase = 30;
  if (ctx.propertySuitability.score >= 70 && ctx.investment.benchmarkPosition !== "below" && ctx.conflicts.overallAlignment >= 70) {
    fpBase = 70 + (ctx.propertySuitability.score - 70);
    fp.add("Strong property fit", fpBase, "property", "Property supports high-end execution");
  } else {
    fp.add("Base viability", fpBase, "property", "Default execution floor");
  }
  
  if (ctx.investment.benchmarkPosition === "premium") {
    fp.add("Premium budget", 30, "budget", "Capital allows uncompromised quality");
  } else if (ctx.investment.benchmarkPosition === "above") {
    fp.add("Strong budget", 15, "budget", "Capital allows comprehensive execution");
  } else if (ctx.investment.benchmarkPosition === "below") {
    fp.add("Severe budget constraint", -40, "budget", "Insufficient capital for comprehensive premium execution");
  }
  
  if (ctx.existingProperty.renovationToRebuildRatio > 0.65 || ctx.handoff.property.ageYears >= 30) {
    fp.add("Structural risk", -35, "property", "Age or rebuild ratio makes premium renovation risky");
  }

  if (ctx.investment.budgetArchetype === "conservative") {
    fp.add("Psychological mismatch", -25, "archetype", "Conservative investor typically resists premium markup");
  } else if (ctx.investment.budgetArchetype === "balanced" && ctx.handoff.sensory.luxuryResolvedAs === "balanced") {
    fp.add("Restrained preference", -50, "archetype", "Investor prefers a restrained approach despite capital");
  }

  applySensoryAlignment(ctx.handoff, fp);
  paths.push({
    path: fp.path,
    score: fp.score,
    summary: fpBase >= 70 
      ? "Your property, budget, and aspirations align well. A comprehensive, quality-forward execution delivers maximum emotional return."
      : "Full premium execution is possible but may create financial strain.",
    evidence: fp.evidence,
  });

  // 2. Smart Renovation
  if (ctx.existingProperty.hasExistingProperty && ctx.existingProperty.recommendedPath !== "new_build_exploration") {
    const sr = new PathScorer("smart_renovation");
    sr.add("Base viability", 40, "property", "Existing property supports renovation");
    
    if (ctx.handoff.property.ageYears >= 30) {
      sr.add("Structural age risk", -25, "property", "Renovation is risky on very old structures");
    }

    if (ctx.handoff.property.type.includes("apartment")) {
      sr.add("Apartment suitability", 10, "property", "Renovation is standard for apartment upgrades");
    }

    if (ctx.existingProperty.layoutFlexibility === "flexible") sr.add("Flexible layout", 15, "property", "High structural adaptability");
    else if (ctx.existingProperty.layoutFlexibility === "moderate") sr.add("Moderate layout flexibility", 5, "property", "Some structural adaptability");
    
    if (ctx.propertySuitability.score >= 50) sr.add("Adequate property suitability", 10, "property", "Property fits core needs");
    if (ctx.conflicts.overallAlignment >= 60) sr.add("Good aspiration alignment", 10, "archetype", "Low friction with existing space");
    
    if (ctx.investment.budgetArchetype === "balanced" || ctx.investment.budgetArchetype === "conservative") {
      if (ctx.investment.benchmarkPosition !== "below") {
        sr.add("Pragmatic alignment", 20, "archetype", "Matches balanced/conservative investment psychology");
      } else {
        sr.add("Pragmatic alignment", 10, "archetype", "Matches pragmatic approach despite budget constraints");
      }
    }

    if (ctx.investment.benchmarkPosition === "below") {
      sr.add("Budget constraint", -10, "budget", "Renovation requires careful cost management");
    } else if (ctx.investment.benchmarkPosition === "at") {
      sr.add("Balanced capital", 15, "budget", "Budget perfectly aligns with strategic upgrades");
    }

    applySensoryAlignment(ctx.handoff, sr);
    paths.push({
      path: sr.path,
      score: sr.score,
      summary: "Keep the structure, upgrade emotional impact areas, optimize lighting and storage for maximum lifestyle improvement.",
      evidence: sr.evidence,
    });
  }

  // 3. Hero Space Strategy
  if (ctx.investment.benchmarkPosition === "below" || ctx.investment.benchmarkPosition === "at" || ctx.handoff.priorities.mustHave.length <= 2) {
    const hs = new PathScorer("hero_space");
    hs.add("Targeted investment approach", 55, "budget", "Optimizes capital by focusing on key zones");
    
    if (ctx.investment.benchmarkPosition === "below") {
      hs.add("Resolves budget pressure", 15, "budget", "Prevents spreading budget too thin");
    }

    if ((ctx.investment.budgetArchetype === "conservative" || ctx.investment.budgetArchetype === "balanced") && ctx.handoff.priorities.mustHave.length > 2) {
      hs.add("Archetype mismatch", -15, "archetype", "Pragmatic investors often prefer even distribution");
    }

    if (ctx.conflicts.conflicts.length > 0) hs.add("Feasibility mitigation", 10, "lifestyle", "Resolves conflicts by focusing on priorities");
    
    // Strong priority concentration
    const topWeight = Object.values(ctx.handoff.priorities.emotionalWeights).sort((a,b) => b-a)[0] || 0;
    if (topWeight > 0.8) {
      hs.add("Highly concentrated priorities", 20, "lifestyle", "Clear emotional center to the home");
    }

    applySensoryAlignment(ctx.handoff, hs);
    applySocialFocus(ctx.handoff.priorities, hs);
    
    const topZones = ctx.investment.highImpactZones.slice(0, 2).join(" + ");
    paths.push({
      path: hs.path,
      score: hs.score,
      summary: `Invest deeply in ${topZones || 'core spaces'} with premium finishes. Keep remaining areas practical and quality-conscious.`,
      evidence: hs.evidence,
    });
  }

  // 4. Phased Evolution
  if (ctx.investment.benchmarkPosition === "below" || ctx.conflicts.overallAlignment < 60 || ctx.handoff.property.areaSqFt > 2000) {
    const pe = new PathScorer("phased_evolution");
    pe.add("Base phasing viability", 45, "property", "Scale allows for logical staging");
    
    if (ctx.handoff.property.ageYears >= 30) {
      pe.add("Structural risk", -25, "property", "Age makes phasing impractical");
    }

    if (ctx.handoff.property.areaSqFt > 3000) {
      pe.add("Large scale property", 15, "property", "Scale requires phased execution");
    }

    if (ctx.investment.benchmarkPosition === "below") {
      pe.add("Budget pressure mitigation", 25, "budget", "Spreads investment over time without compromising quality");
    }
    
    if (ctx.simulation.livabilityScore > 60) {
      pe.add("High baseline livability", 15, "property", "Space is usable during phasing");
    } else if (ctx.investment.benchmarkPosition === "below") {
      pe.add("Poor livability penalty", -10, "property", "Hard to live in during early phases");
    }
    
    applySensoryAlignment(ctx.handoff, pe);
    paths.push({
      path: pe.path,
      score: pe.score,
      summary: "Phase 1: core civil + lighting + must-have rooms. Phase 2 (12–18 months): premium finishes and luxury additions.",
      evidence: pe.evidence,
    });
  }

  // 5. Rebuild Recommendation
  if (ctx.existingProperty.renovationToRebuildRatio > 0.65 || (ctx.propertySuitability.score < 40 && ctx.existingProperty.hasExistingProperty) || ctx.handoff.property.ageYears >= 25) {
    const rr = new PathScorer("rebuild_recommendation");
    rr.add("Base rebuild evaluation", 40, "property", "Age or suitability flags major intervention");
    
    if (ctx.handoff.property.ageYears >= 30) {
      rr.add("End of structural lifecycle", 30, "property", "Age requires major structural replacement");
    }

    if (ctx.existingProperty.renovationToRebuildRatio > 0.65) {
      rr.add("Inefficient renovation ratio", 25, "budget", "Renovation cost approaches rebuild cost");
    }
    
    if (ctx.propertySuitability.score < 40) {
      rr.add("Poor property suitability", 20, "property", "Current structure highly limits lifestyle");
    }
    
    if (ctx.investment.benchmarkPosition === "below") {
      if (ctx.handoff.property.ageYears >= 30) {
        rr.add("Budget constraint (Mitigated)", -10, "budget", "Rebuild is necessary despite budget");
      } else {
        rr.add("Budget constraint", -30, "budget", "Rebuild requires significant capital");
      }
    }

    applySensoryAlignment(ctx.handoff, rr);
    paths.push({
      path: rr.path,
      score: rr.score,
      summary: "Current structure creates long-term friction for your desired family lifestyle. Exploring a new property may deliver better value.",
      evidence: rr.evidence,
    });
  }

  // Fallbacks if arrays are empty for some reason (e.g. hero_space logic skipped)
  if (paths.length === 0) {
    paths.push({
      path: "smart_renovation",
      score: 10,
      summary: "Standard renovation based on baseline metrics.",
      evidence: []
    });
  }

  return paths.sort((a, b) => b.score - a.score);
}

// ─── Reasoning Generator ─────────────────────────────────────────────────────

function buildSensoryClause(handoff: DiscoveryHandoff): string {
  const { luxuryResolvedAs, lighting, textures = [] } = handoff.sensory || {};
  if (luxuryResolvedAs === "invest-in-materials") return "your luxury language centers on material quality — natural stone, solid wood, and premium textiles";
  if (luxuryResolvedAs === "invest-in-tech") return "your luxury language centers on smart integration — automated systems and invisible tech";
  if (lighting === "natural") return "your preference for natural light makes open-plan spaces with deep fenestration the highest-ROI investment";
  if (lighting === "dramatic") return "your preference for statement lighting makes curated pendant and architectural lighting the defining design investment";
  if (textures.includes("organic")) return "your preference for organic textures calls for natural wood grain, stone, and linen in the hero spaces";
  return "";
}

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
  const sensoryClause = buildSensoryClause(ctx.handoff);
  
  const traitPart = `Because your family lifestyle prioritizes ${traitStr}`;
  const sensoryPart = sensoryClause ? ` — and ${sensoryClause} —` : "";

  switch (path) {
    case "full_premium":
      return `${traitPart}${sensoryPart} a comprehensive execution delivers maximum emotional return, provided your property and budget can support it. Every room receives attention proportional to its role in your daily well-being.`;
    case "smart_renovation":
      return `${traitPart}${sensoryPart} your existing property becomes the canvas — not a constraint. Strategic renovation upgrades the spaces that matter most while preserving what already works.`;
    case "hero_space":
      return `${traitPart}${sensoryPart} your investment creates maximum emotional return when focused on social and sensory spaces first. The hero zone strategy concentrates premium quality where you'll experience it daily.`;
    case "phased_evolution":
      return `${traitPart}${sensoryPart} phasing allows you to lock in the design vision now while spreading investment. Phase 1 delivers the foundation — livability, light, and core spaces — while Phase 2 adds luxury layers.`;
    case "rebuild_recommendation":
      return `${traitPart}${sensoryPart} the current property's structural constraints create recurring daily friction. Exploring a new space lets you build this lifestyle from the ground up.`;
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

function computeConfidence(ctx: EngineContext): number {
  let conf = 70; // Base confidence
  
  if (ctx.handoff.sensory?.luxuryResolvedAs) conf += 5;
  if (ctx.handoff.sensory?.lighting) conf += 5;
  
  if (ctx.handoff.priorities?.emotionalWeights && Object.keys(ctx.handoff.priorities.emotionalWeights).length > 0) {
    conf += 10;
  }
  
  // Deduct based on feasibility conflicts
  const conflictPenalty = ctx.conflicts.conflicts.length * 5;
  conf -= Math.min(conflictPenalty, 20);
  
  return Math.max(0, Math.min(100, conf));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeAIRecommendation(context: EngineContext): AIRecommendationResult {
  const rankedPaths = scorePaths(context);
  const topPath = rankedPaths[0];

  // Extract evidence and determine primary drivers
  const evidence = topPath.evidence.sort((a, b) => Math.abs(b.scoreImpact) - Math.abs(a.scoreImpact));
  const primaryDrivers = evidence
    .filter(e => e.scoreImpact > 0)
    .slice(0, 3)
    .map(e => {
      // Map signals to shorter driver names if needed, or just use the signal string
      if (e.signal.includes("luxury language")) return "Material Quality";
      if (e.signal.includes("lighting")) return "Lighting Preference";
      if (e.signal.includes("texture")) return "Sensory Materials";
      if (e.signal.includes("social")) return "Entertaining Needs";
      if (e.signal.includes("property") || e.signal.includes("layout")) return "Property Fit";
      if (e.signal.includes("viability")) return "Baseline Fit";
      if (e.signal.includes("Budget") || e.signal.includes("investment")) return "Budget Dynamics";
      return e.signal;
    });

  return {
    strategyLabel: topPath.path.replace(/_/g, " ").replace(/kiro-accent\w/g, l => l.toUpperCase()),
    propertyFit: context.propertySuitability.score,
    propertyFitTier: context.propertySuitability.tier,
    executionPath: topPath.path,
    focusAreas: context.investment.highImpactZones,
    reasoning: generateReasoning(context, topPath.path),
    summary: generateSummary(context, topPath.path),
    confidence: computeConfidence(context),
    evidence,
    primaryDrivers: Array.from(new Set(primaryDrivers)),
  };
}
