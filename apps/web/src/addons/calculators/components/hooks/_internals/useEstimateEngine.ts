/**
 * Estimate engine hook — owns the live estimate computation and ALCS pipeline.
 *
 * Concerns:
 * - Fetching dynamic pricing config from Supabase
 * - Running calculateEstimate on formData changes (pure memoised computation)
 * - Running ALCS full pipeline when a Discovery handoff exists
 */

import { useMemo } from "react";
import type { CalculatorFormData, EstimateResult } from "../../data/types";
import { calculateEstimate } from "../../data/calculation-engine";
import { runALCSPipeline } from "../../data/engines";
import type { OrchestratorOutput } from "../../data/engines";
import type { DiscoveryHandoff, EstimatorResponse } from "../../data/discovery-handoff";
import type { ExecutionBlueprint } from "../../data/engines/types";
import { usePricingConfig } from "../usePricingConfig";

export function useEstimateEngine(
  formData: CalculatorFormData,
  discoveryHandoff: DiscoveryHandoff | null,
) {
  const { config: pricingConfig } = usePricingConfig();

  const estimate: EstimateResult | null = useMemo(() => {
    if (!formData.selectedService) return null;
    if (formData.area <= 0) return null;
    return calculateEstimate(formData, pricingConfig);
  }, [formData, pricingConfig]);

  const alcsPipeline: OrchestratorOutput | null = useMemo(() => {
    if (!discoveryHandoff) return null;
    try {
      return runALCSPipeline({ handoff: discoveryHandoff });
    } catch (e) {
      console.warn("[Estimator] ALCS pipeline error:", e);
      return null;
    }
  }, [discoveryHandoff]);

  const alcsEstimatorResponse: EstimatorResponse | null = alcsPipeline?.engines.costEngine ?? null;
  const executionBlueprint: ExecutionBlueprint | null = alcsPipeline?.blueprint ?? null;

  return {
    estimate,
    pricingConfig,
    alcsPipeline,
    alcsEstimatorResponse,
    executionBlueprint,
  };
}
