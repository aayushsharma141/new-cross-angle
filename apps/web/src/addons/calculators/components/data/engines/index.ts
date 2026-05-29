/**
 * ALCS Engines — Barrel Export
 *
 * Usage:
 *   import { runALCSPipeline } from "./engines";
 *   const { blueprint, engines } = runALCSPipeline({ handoff });
 */

// Master orchestrator (main entry point)
export { runALCSPipeline } from "./orchestrator";
export type { OrchestratorInput, OrchestratorOutput } from "./orchestrator";

// Individual engines (for granular UI use)
export { analyzeExistingProperty } from "./existing-property";
export { computeLifestyleDensity } from "./lifestyle-density";
export { computeSpaceAllocation } from "./space-allocation";
export { computeFeasibilityConflicts } from "./feasibility-conflict";
export { computeInvestmentReality } from "./investment-reality";
export { computeRealitySimulation } from "./reality-simulation";
export { computeAIRecommendation } from "./ai-recommendation";
export { generateExecutionBlueprint } from "./blueprint-generator";

// Types
export type * from "./types";
