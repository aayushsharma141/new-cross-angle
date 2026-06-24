/**
 * ALCS Engine Types — Shared across all intelligence engines
 *
 * Every engine receives a DiscoveryHandoff and produces typed output
 * that the orchestrator chains into the final ExecutionBlueprint.
 */

import type { DiscoveryHandoff, NegotiationOption, NegotiationStrategy, PropertyFitTier } from "../discovery-handoff";

// ─── Lifestyle Density ───────────────────────────────────────────────────────

export type DensityLevel = "low" | "moderate" | "high" | "extreme";

export interface LifestyleDensityResult {
  level: DensityLevel;
  score: number;                    // 0–100
  /** Per-dimension scores */
  dimensions: {
    occupancy: number;              // people/sqft
    activity: number;               // cooking + WFH + hosting intensity
    storage: number;                // inferred storage need
    noise: number;                  // noise generation vs sensitivity
    maintenance: number;            // cleaning/upkeep load
  };
  /** AI narrative */
  narrative: string;
  /** Critical warnings */
  warnings: string[];
}

// ─── Space Allocation ────────────────────────────────────────────────────────

export interface SpaceAllocationResult {
  /** Rooms with allocated sqft and status */
  allocations: RoomAllocation[];
  /** Compromises made (with explanation) */
  compromises: SpaceCompromise[];
  /** Total allocated vs available */
  totalAllocated: number;
  totalAvailable: number;
  /** Breathing room — % of space unallocated */
  breathingRoom: number;
}

export interface RoomAllocation {
  room: string;
  idealSqFt: number;
  allocatedSqFt: number;
  priority: "must-have" | "nice-to-have" | "inferred";
  emotionalWeight: number;           // 0–1 from Discovery
  /** Was this room compressed? */
  compressed: boolean;
  /** Compression explanation if compressed */
  compressionNote?: string;
}

export interface SpaceCompromise {
  room: string;
  originalConcept: string;
  smartAlternative: string;
  reason: string;
  emotionalImpact: "minimal" | "moderate" | "significant";
}

// ─── Feasibility Conflicts ───────────────────────────────────────────────────

export type ConflictCategory = "emotional_vs_reality" | "space_vs_lifestyle" | "budget_vs_sensory" | "identity_vs_property" | "aspiration_vs_timeline";

export interface FeasibilityConflict {
  id: string;
  category: ConflictCategory;
  severity: "advisory" | "warning" | "critical";
  /** What the user wants */
  aspiration: string;
  /** What reality shows */
  reality: string;
  /** Guidance (never "this won't work") */
  guidance: string;
  /** Affected priority name */
  affectedPriority: string;
}

export interface FeasibilityConflictResult {
  conflicts: FeasibilityConflict[];
  overallAlignment: number;          // 0–100 (100 = no conflicts)
  narrative: string;
}

// ─── Existing Property Analysis ──────────────────────────────────────────────

export type PropertyPath = "strategic_renovation" | "space_reallocation" | "new_build_exploration" | "optimize_existing";

export interface ExistingPropertyResult {
  hasExistingProperty: boolean;
  recommendedPath: PropertyPath;
  pathRationale: string;
  /** If renovation cost > X% of rebuild → suggest new build */
  renovationToRebuildRatio: number;
  structuralConstraints: string[];
  layoutFlexibility: "rigid" | "moderate" | "flexible";
  /** For non-owners: ideal property recommendations */
  idealPropertySpec?: {
    type: string;
    minSqFt: number;
    maxSqFt: number;
    layoutNotes: string[];
  };
}

// ─── Investment Reality ──────────────────────────────────────────────────────

export type BudgetArchetype = "conservative" | "balanced" | "experience_focused" | "statement_oriented";

export interface InvestmentRealityResult {
  budgetArchetype: BudgetArchetype;
  archetypeNarrative: string;
  /** Where money creates maximum emotional return */
  highImpactZones: string[];
  /** Where to be frugal without emotional loss */
  lowImpactZones: string[];
  /** ₹ per sqft the user is investing */
  investmentDensity: number;
  /** How this compares to their city tier */
  cityBenchmark: { low: number; median: number; high: number };
  /** Is user over/under/at market? */
  benchmarkPosition: "below" | "at" | "above" | "premium";
}

// ─── Execution Strategy ──────────────────────────────────────────────────────

export type ExecutionPath = "smart_renovation" | "hero_space" | "phased_evolution" | "rebuild_recommendation" | "full_premium";

export interface ExecutionStrategyResult {
  recommendedPath: ExecutionPath;
  rationale: string;
  /** Paths ranked by suitability */
  rankedPaths: {
    path: ExecutionPath;
    score: number;
    summary: string;
  }[];
  /** Key focus areas for the recommended path */
  focusAreas: string[];
  /** Estimated timeline */
  timelineWeeks: { min: number; max: number };
}

// ─── Adaptive Negotiation ────────────────────────────────────────────────────

export type NegotiationMode = "hero_focus" | "material_swap" | "phased_execution" | "multi_use_space" | "emotional_preservation" | "structural_simplification";

export interface AdaptiveNegotiationResult {
  /** Primary mode selected by AI */
  primaryMode: NegotiationMode;
  /** Ordered list of negotiation options */
  options: NegotiationOption[];
  /** Priorities protected (highest emotional weight first) */
  protectedPriorities: string[];
  /** Priorities compressed */
  compressedPriorities: string[];
  /** Total potential savings across all options */
  maxSavings: number;
}

// ─── Reality Simulation ──────────────────────────────────────────────────────

export interface RealitySimulationResult {
  /** Daily life scenarios that work well */
  positives: SimulationScenario[];
  /** Potential friction points */
  frictions: SimulationScenario[];
  /** 5-year projection concerns */
  futureRisks: string[];
  /** Overall livability score */
  livabilityScore: number;          // 0–100
}

export interface SimulationScenario {
  scenario: string;
  explanation: string;
  affectedRoom: string;
  confidence: "high" | "medium" | "low";
}

// ─── AI Recommendation ──────────────────────────────────────────────────────

export interface RecommendationEvidence {
  signal: string;      // e.g., "Natural light preference", "Material-first luxury language"
  scoreImpact: number; // e.g., +15, -4
  source: "sensory" | "lifestyle" | "property" | "archetype" | "budget";
  rationale: string;
}

export interface AIRecommendationResult {
  /** Best-fit strategy label */
  strategyLabel: string;
  /** Property fit score (from suitability engine) */
  propertyFit: number;
  propertyFitTier: PropertyFitTier;
  /** Recommended execution path */
  executionPath: ExecutionPath;
  /** Focus areas ranked by emotional ROI */
  focusAreas: string[];
  /** Narrative "Because..." explanation */
  reasoning: string;
  /** Short human summary */
  summary: string;
  /** Explainability: confidence score out of 100 */
  confidence: number;
  /** Explainability: ledger of how the recommendation was scored */
  evidence: RecommendationEvidence[];
  /** Explainability: top drivers (e.g. ["Material Quality", "Natural Light"]) */
  primaryDrivers: string[];
}

// ─── Final Execution Blueprint (9 Sections) ─────────────────────────────────

export interface ExecutionBlueprint {
  /** Section 1: Living Identity (from Discovery) */
  livingIdentity: {
    archetype: string;
    emotionalGoal: string;
    sensoryNeeds: string[];
    lifestyleThemes: string[];
  };

  /** Section 2: Property Compatibility */
  propertyCompatibility: {
    fitScore: number;
    fitTier: PropertyFitTier;
    mainStrength: string;
    mainLimitation: string;
  };

  /** Section 3: Lifestyle Fit Analysis */
  lifestyleFit: {
    hosting: FitLevel;
    familyExpansion: FitLevel;
    privacy: FitLevel;
    storageLongevity: FitLevel;
    workFromHome: FitLevel;
  };

  /** Section 4: AI Strategic Recommendation */
  recommendation: AIRecommendationResult;

  /** Section 5: Investment Breakdown */
  investment: {
    totalMin: number;
    totalMax: number;
    breakdown: { label: string; amount: number }[];
    budgetArchetype: BudgetArchetype;
  };

  /** Section 6: Emotional Priority Protection */
  emotionalProtection: {
    protected: string[];
    negotiated: string[];
    deferred: string[];
  };

  /** Section 7: Future Evolution Readiness */
  futureReadiness: {
    adaptations: { scenario: string; readiness: FitLevel }[];
  };

  /** Section 8: Execution Timeline */
  timeline: {
    phases: {
      phase: number;
      label: string;
      timelineWeeks: string;
      scopeItems: string[];
      estimatedCost: number;
    }[];
  };

  /** Section 9: AI Summary Narrative */
  aiSummary: string;

  /** Metadata */
  generatedAt: string;
  engineVersion: string;
}

export type FitLevel = "high" | "medium" | "low" | "not-applicable";

// ─── Re-exports for convenience ──────────────────────────────────────────────

export type { DiscoveryHandoff, NegotiationOption, NegotiationStrategy, PropertyFitTier };
