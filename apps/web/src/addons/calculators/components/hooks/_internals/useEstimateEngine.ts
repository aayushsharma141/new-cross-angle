/**
 * Estimate engine hook — owns the live estimate computation and ALCS pipeline.
 *
 * Concerns:
 * - Fetching dynamic pricing config from Supabase
 * - Running calculateEstimate on formData changes (pure memoised computation)
 * - Running ALCS full pipeline when a Discovery handoff exists
 */

import { useState, useMemo, useEffect } from "react";
import type { CalculatorFormData, EstimateResult, PricingConfig } from "../../data/types";
import { calculateEstimate } from "../../data/calculation-engine";
import { DEFAULT_PRICING_CONFIG } from "../../data/pricing-config";
import { runALCSPipeline } from "../../data/engines";
import type { OrchestratorOutput } from "../../data/engines";
import type { DiscoveryHandoff, EstimatorResponse } from "../../data/discovery-handoff";
import type { ExecutionBlueprint } from "../../data/engines/types";
import { supabase } from "@/lib/supabase";

export function useEstimateEngine(
  formData: CalculatorFormData,
  discoveryHandoff: DiscoveryHandoff | null,
) {
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from("estimate_rates")
          .select("config")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data?.config) {
          setPricingConfig({ ...DEFAULT_PRICING_CONFIG, ...(data.config as PricingConfig) });
        }
      } catch (err) {
        console.error("Failed to load dynamic pricing config. Using defaults.", err);
      }
    };
    void fetchConfig();
  }, []);

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
