import { useFlowConfig } from "@/hooks/useFlowConfig";
import type { PricingConfig } from "@/addons/calculators/components/data/types";
import { usePricingConfig } from "@/addons/calculators/components/hooks/usePricingConfig";

/**
 * EstimatorRegistry acts as the single source of truth for all Estimator settings.
 * It provides a unified interface to Pricing, Packages, Addons, ALCS, Results, and Media.
 */
export function useEstimatorRegistry() {
  // Pricing lives in estimator_flow_config under key "pricing" (QA-02). usePricingConfig
  // memoises the merged config, so its identity only changes when saved data does —
  // the Pricing workspace resets its form on identity change.
  const pricing = usePricingConfig();

  const savePricing = (config: PricingConfig): Promise<void> => pricing.saveAsync(config);

  // Flow Configurations (estimator_flow_config table via useFlowConfig)
  const propertyTypes = useFlowConfig("property_types");
  const executionTiers = useFlowConfig("execution_tiers");
  const services = useFlowConfig("services");
  const addons = useFlowConfig("addons");
  const alcsRules = useFlowConfig("alcs_rules");
  const resultTemplates = useFlowConfig("result_templates");
  const mediaAssets = useFlowConfig("media_assets");

  const all = [pricing, propertyTypes, executionTiers, services, addons, alcsRules, resultTemplates, mediaAssets];

  return {
    isLoading: all.some((q) => q.isLoading),
    loadFailed: all.some((q) => q.loadFailed),
    pricingRates: {
      data: pricing.config,
      save: savePricing,
      isSaving: pricing.isSaving,
      loadFailed: pricing.loadFailed,
      retry: pricing.retry,
    },
    propertyTypes,
    executionTiers,
    services,
    addons,
    alcsRules,
    resultTemplates,
    mediaAssets,
  };
}
