import { useMemo } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { DEFAULT_PRICING_CONFIG, mergePricingConfig } from "../data/pricing-config";
import type { PricingConfig } from "../data/types";

/**
 * The single source of estimator prices: the admin "pricing" row merged over the
 * defaults. The calculator, its step cards and the admin editors all read this,
 * and submit-estimate prices from the same row, so shown and stored totals agree.
 */
export function usePricingConfig() {
  const query = useFlowConfig<Partial<PricingConfig> | null>("pricing");
  const config = useMemo(() => mergePricingConfig(DEFAULT_PRICING_CONFIG, query.data), [query.data]);
  return { ...query, config };
}
