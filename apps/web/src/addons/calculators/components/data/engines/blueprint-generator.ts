/**
 * Blueprint Generator — Step 12
 *
 * Assembles the 9-section Execution Blueprint from all engine outputs.
 * This is the final deliverable — a personalized living blueprint
 * that feels consultation-grade, not report-grade.
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type {
  ExecutionBlueprint,
  FitLevel,
  AIRecommendationResult,
  InvestmentRealityResult,
  FeasibilityConflictResult,
  LifestyleDensityResult,
  SpaceAllocationResult,
  RealitySimulationResult,
  ExistingPropertyResult,
} from "./types";

interface BlueprintContext {
  handoff: DiscoveryHandoff;
  propertySuitability: { score: number; tier: "excellent" | "good" | "constrained" | "poor"; narrative: string };
  density: LifestyleDensityResult;
  space: SpaceAllocationResult;
  conflicts: FeasibilityConflictResult;
  investment: InvestmentRealityResult;
  simulation: RealitySimulationResult;
  recommendation: AIRecommendationResult;
  existingProperty: ExistingPropertyResult;
  /** From the cost engine */
  costBreakdown: { structure: number; interiors: number; mechanical: number; design: number; contingency: number };
  totalMin: number;
  totalMax: number;
}

// ─── Section Builders ────────────────────────────────────────────────────────

function buildLivingIdentity(h: DiscoveryHandoff) {
  return {
    archetype: h.archetype,
    emotionalGoal: h.emotionalGoal,
    sensoryNeeds: [
      `${h.sensory.lighting} lighting preference`,
      ...h.sensory.textures.slice(0, 3),
      h.sensory.luxuryResolvedAs === "invest-in-materials" ? "Premium material expression"
        : h.sensory.luxuryResolvedAs === "invest-in-space" ? "Spatial openness priority"
        : h.sensory.luxuryResolvedAs === "invest-in-tech" ? "Technology-forward living"
        : "Balanced aesthetic investment",
    ],
    lifestyleThemes: buildLifestyleThemes(h),
  };
}

function buildLifestyleThemes(h: DiscoveryHandoff): string[] {
  const themes: string[] = [];
  if (h.lifestyle.hostingFreq === "Often" || h.lifestyle.hostingFreq === "Always") themes.push("Social & Hosting-centric");
  if (h.lifestyle.cookingRole === "Daily Ritual") themes.push("Kitchen as family anchor");
  if (h.lifestyle.workFromHome) themes.push("Productive home working");
  if (h.lifestyle.children > 0) themes.push("Family-forward, child-safe design");
  if (h.lifestyle.familyType === "Joint") themes.push("Multi-generational harmony");
  if (h.emotionalGoal.toLowerCase().includes("peace")) themes.push("Mental decompression");
  if (h.emotionalGoal.toLowerCase().includes("warm")) themes.push("Emotional warmth & connection");
  return themes.slice(0, 4);
}

function buildLifestyleFit(h: DiscoveryHandoff, simulation: RealitySimulationResult, density: LifestyleDensityResult): ExecutionBlueprint["lifestyleFit"] {
  const toFit = (condition: boolean, area: number): FitLevel => {
    if (!condition) return "not-applicable";
    if (area >= 70) return "high";
    if (area >= 40) return "medium";
    return "low";
  };

  const sqftPerPerson = h.property.areaSqFt / Math.max(h.lifestyle.members, 1);

  return {
    hosting: toFit(
      h.lifestyle.hostingFreq !== "Rarely",
      h.property.areaSqFt >= 700 ? 80 : h.property.areaSqFt >= 500 ? 50 : 25
    ),
    familyExpansion: toFit(
      h.lifestyle.children > 0 || h.lifestyle.familyType === "Nuclear",
      sqftPerPerson >= 200 ? 85 : sqftPerPerson >= 130 ? 55 : 30
    ),
    privacy: toFit(
      h.lifestyle.members > 2,
      sqftPerPerson >= 180 ? 80 : sqftPerPerson >= 120 ? 50 : 25
    ),
    storageLongevity: toFit(
      true,
      density.dimensions.storage < 50 ? 80 : density.dimensions.storage < 70 ? 50 : 25
    ),
    workFromHome: toFit(
      h.lifestyle.workFromHome,
      density.dimensions.noise < 50 ? 80 : density.dimensions.noise < 70 ? 50 : 25
    ),
  };
}

function buildEmotionalProtection(h: DiscoveryHandoff, conflicts: FeasibilityConflictResult, space: SpaceAllocationResult) {
  // Protected = high emotional weight rooms that weren't compressed
  const protectedRooms = space.allocations
    .filter(a => a.emotionalWeight >= 0.7 && !a.compressed)
    .map(a => a.room);

  // Negotiated = rooms that were compressed
  const negotiated = space.allocations
    .filter(a => a.compressed && a.emotionalWeight >= 0.4)
    .map(a => a.room);

  // Deferred = nice-to-have rooms with compromises
  const deferred = space.compromises
    .filter(c => c.emotionalImpact === "minimal")
    .map(c => c.room);

  return { protected: protectedRooms, negotiated, deferred };
}

function buildFutureReadiness(h: DiscoveryHandoff, simulation: RealitySimulationResult): ExecutionBlueprint["futureReadiness"] {
  const adaptations: { scenario: string; readiness: FitLevel }[] = [];

  if (h.lifestyle.children > 0) {
    adaptations.push({
      scenario: "Growing children (study zones, personal space)",
      readiness: h.property.areaSqFt > 1200 ? "high" : h.property.areaSqFt > 800 ? "medium" : "low",
    });
  }

  if (h.lifestyle.workFromHome) {
    adaptations.push({
      scenario: "Permanent remote work expansion",
      readiness: h.property.areaSqFt > 1000 ? "high" : "medium",
    });
  }

  adaptations.push({
    scenario: "Aging parents or accessibility needs",
    readiness: h.property.type === "apartment" ? "medium" : h.property.type === "villa" ? "high" : "medium",
  });

  adaptations.push({
    scenario: "Lifestyle upgrade (premium finishes later)",
    readiness: simulation.livabilityScore > 60 ? "high" : "medium",
  });

  return { adaptations };
}

function buildTimeline(recommendation: AIRecommendationResult, h: DiscoveryHandoff, totalMin: number, totalMax: number): ExecutionBlueprint["timeline"] {
  const midCost = (totalMin + totalMax) / 2;

  if (recommendation.executionPath === "phased_evolution") {
    return {
      phases: [
        {
          phase: 1,
          label: "Foundation & Essential Spaces",
          timelineWeeks: "Weeks 1–16",
          scopeItems: ["Structural/civil work", "Essential plumbing & electrical", ...h.priorities.mustHave.slice(0, 3), "Standard-finish flooring"],
          estimatedCost: Math.round(midCost * 0.6),
        },
        {
          phase: 2,
          label: "Atmosphere & Premium Upgrades",
          timelineWeeks: "12–18 months later",
          scopeItems: ["Premium finishes in hero zones", "Lighting design", ...h.priorities.niceToHave.slice(0, 2), "Art & accessories"],
          estimatedCost: Math.round(midCost * 0.3),
        },
        {
          phase: 3,
          label: "Luxury Additions & Personalization",
          timelineWeeks: "24+ months",
          scopeItems: ["Smart home integration", "Custom furniture", "Outdoor/balcony upgrade", "Final styling"],
          estimatedCost: Math.round(midCost * 0.1),
        },
      ],
    };
  }

  // Single-phase timeline
  return {
    phases: [
      {
        phase: 1,
        label: "Blueprint & Scope Calibration",
        timelineWeeks: "Weeks 1–4",
        scopeItems: ["Design finalization", "Material selection", "Contractor onboarding", "Permit processing"],
        estimatedCost: Math.round(midCost * 0.1),
      },
      {
        phase: 2,
        label: "Execution & Build",
        timelineWeeks: "Weeks 5–16",
        scopeItems: ["Civil/structural work", "Plumbing & electrical", "Flooring & wall finishes", "Kitchen & storage installation"],
        estimatedCost: Math.round(midCost * 0.7),
      },
      {
        phase: 3,
        label: "Finishing & Handover",
        timelineWeeks: "Weeks 17–20",
        scopeItems: ["Lighting installation", "Furniture placement", "Final punch list", "Move-in readiness"],
        estimatedCost: Math.round(midCost * 0.2),
      },
    ],
  };
}

function generateAISummary(ctx: BlueprintContext): string {
  const path = ctx.recommendation.executionPath;
  const topAreas = ctx.investment.highImpactZones.slice(0, 3).join(", ");
  const fitPct = ctx.propertySuitability.score;

  if (path === "phased_evolution") {
    return `Your ideal lifestyle is achievable through a phased approach — building the foundation now and layering premium elements over time. With a ${fitPct}% property fit, the strongest emotional return comes from investing first in ${topAreas}. This approach spreads financial commitment while locking in the design vision that reflects your ${ctx.handoff.archetype} identity.`;
  }

  if (path === "hero_space") {
    return `Your ideal lifestyle is best realized by concentrating premium investment in your highest-impact spaces: ${topAreas}. With a ${fitPct}% property fit, this hero-zone strategy delivers daily luxury where you'll experience it most — while maintaining quality-conscious practicality in supporting areas.`;
  }

  return `Your ideal lifestyle is achievable through strategic ${path.replace(/_/g, " ")}. With a ${fitPct}% property fit, the strongest emotional return comes from improving ${topAreas}. Your ${ctx.handoff.archetype} identity guides every material choice, lighting decision, and spatial proportion — creating a home that doesn't just look right, but feels deeply aligned with how you want to live.`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function generateExecutionBlueprint(ctx: BlueprintContext): ExecutionBlueprint {
  return {
    livingIdentity: buildLivingIdentity(ctx.handoff),
    propertyCompatibility: {
      fitScore: ctx.propertySuitability.score,
      fitTier: ctx.propertySuitability.tier,
      mainStrength: ctx.propertySuitability.narrative.split(".")[0] || "Property structure is sound",
      mainLimitation: ctx.conflicts.conflicts[0]?.reality || "No critical limitations detected",
    },
    lifestyleFit: buildLifestyleFit(ctx.handoff, ctx.simulation, ctx.density),
    recommendation: ctx.recommendation,
    investment: {
      totalMin: ctx.totalMin,
      totalMax: ctx.totalMax,
      breakdown: [
        { label: "Core Civil & Structure", amount: ctx.costBreakdown.structure },
        { label: "Interior Finishes & Furniture", amount: ctx.costBreakdown.interiors },
        { label: "Plumbing, Electrical & HVAC", amount: ctx.costBreakdown.mechanical },
        { label: "Professional Design Fee", amount: ctx.costBreakdown.design },
        { label: "Contingency Reserve", amount: ctx.costBreakdown.contingency },
      ],
      budgetArchetype: ctx.investment.budgetArchetype,
    },
    emotionalProtection: buildEmotionalProtection(ctx.handoff, ctx.conflicts, ctx.space),
    futureReadiness: buildFutureReadiness(ctx.handoff, ctx.simulation),
    timeline: buildTimeline(ctx.recommendation, ctx.handoff, ctx.totalMin, ctx.totalMax),
    aiSummary: generateAISummary(ctx),
    generatedAt: new Date().toISOString(),
    engineVersion: "2.0.0-alcs",
  };
}
