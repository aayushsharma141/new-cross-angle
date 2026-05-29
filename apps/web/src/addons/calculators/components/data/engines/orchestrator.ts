/**
 * ALCS Orchestrator — Master Engine Chain
 *
 * Chains: Discovery Handoff → 10 Engines → Final Execution Blueprint
 *
 * Flow:
 * 1. Property Suitability (from existing estimator-engine.ts)
 * 2. Existing Property Analysis
 * 3. Lifestyle Density Mapping
 * 4. Space Allocation Intelligence
 * 5. Feasibility Conflict Detection
 * 6. Investment Reality Analysis
 * 7. Cost Computation (from existing estimator-engine.ts)
 * 8. Adaptive Negotiation (from existing estimator-engine.ts)
 * 9. Reality Simulation
 * 10. AI Recommendation
 * → Blueprint Generator
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type { ExecutionBlueprint } from "./types";

// Engine imports
import { computePropertySuitability, computeEstimate } from "../estimator-engine";
import { analyzeExistingProperty } from "./existing-property";
import { computeLifestyleDensity } from "./lifestyle-density";
import { computeSpaceAllocation } from "./space-allocation";
import { computeFeasibilityConflicts } from "./feasibility-conflict";
import { computeInvestmentReality } from "./investment-reality";
import { computeRealitySimulation } from "./reality-simulation";
import { computeAIRecommendation } from "./ai-recommendation";
import { generateExecutionBlueprint } from "./blueprint-generator";

// ─── Main Orchestrator ───────────────────────────────────────────────────────

export interface OrchestratorInput {
  handoff: DiscoveryHandoff;
}

export interface OrchestratorOutput {
  /** Full 9-section blueprint */
  blueprint: ExecutionBlueprint;
  /** Raw engine results for granular UI access */
  engines: {
    propertySuitability: ReturnType<typeof computePropertySuitability>;
    existingProperty: ReturnType<typeof analyzeExistingProperty>;
    density: ReturnType<typeof computeLifestyleDensity>;
    space: ReturnType<typeof computeSpaceAllocation>;
    conflicts: ReturnType<typeof computeFeasibilityConflicts>;
    investment: ReturnType<typeof computeInvestmentReality>;
    simulation: ReturnType<typeof computeRealitySimulation>;
    recommendation: ReturnType<typeof computeAIRecommendation>;
    /** Legacy C1–C5 cost engine response */
    costEngine: ReturnType<typeof computeEstimate>;
  };
}

/**
 * Run the full ALCS engine chain.
 *
 * This is a synchronous, pure-computation pipeline.
 * No network calls, no side effects.
 * Safe to run on every state change in a useMemo.
 */
export function runALCSPipeline(input: OrchestratorInput): OrchestratorOutput {
  const { handoff } = input;

  // ── Step 2: Property Suitability ──
  const propertySuitability = computePropertySuitability(handoff);

  // ── Step 3: Existing Property Analysis ──
  const existingProperty = analyzeExistingProperty(handoff);

  // ── Step 4: Lifestyle Density ──
  const density = computeLifestyleDensity(handoff);

  // ── Step 5: Space Allocation ──
  const space = computeSpaceAllocation(handoff);

  // ── Step 6: Feasibility Conflicts ──
  const conflicts = computeFeasibilityConflicts(handoff);

  // ── Step 7: Investment Reality ──
  const investment = computeInvestmentReality(handoff);

  // ── Cost Engine (existing) ──
  const costEngine = computeEstimate({ discovery: handoff });

  // ── Step 10: Reality Simulation ──
  const simulation = computeRealitySimulation(handoff, space, density);

  // ── Step 11: AI Recommendation ──
  const recommendation = computeAIRecommendation({
    handoff,
    propertySuitability,
    density,
    conflicts,
    investment,
    simulation,
    existingProperty,
  });

  // ── Step 12: Blueprint Generation ──
  const blueprint = generateExecutionBlueprint({
    handoff,
    propertySuitability,
    density,
    space,
    conflicts,
    investment,
    simulation,
    recommendation,
    existingProperty,
    costBreakdown: costEngine.costBreakdown,
    totalMin: costEngine.totalMin,
    totalMax: costEngine.totalMax,
  });

  return {
    blueprint,
    engines: {
      propertySuitability,
      existingProperty,
      density,
      space,
      conflicts,
      investment,
      simulation,
      recommendation,
      costEngine,
    },
  };
}
