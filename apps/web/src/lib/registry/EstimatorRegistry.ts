import { useFlowConfig } from "@/hooks/useFlowConfig";
import type { PricingConfig } from "@/addons/calculators/components/data/types";
import { DEFAULT_PRICING_CONFIG } from "@/addons/calculators/components/data/pricing-config";

/**
 * EstimatorRegistry acts as the single source of truth for all Estimator settings.
 * It provides a unified interface to Pricing, Packages, Addons, ALCS, Results, and Media.
 */
export function useEstimatorRegistry() {
  // Pricing Logic — stored in estimator_flow_config under key "pricing" (QA-02).
  // The former `estimate_rates` table never existed in production.
  const pricing = useFlowConfig<PricingConfig | null>("pricing");

  const savePricing = (config: PricingConfig) =>
    new Promise<void>((resolve, reject) => {
      pricing.save(config, { onSuccess: resolve, onError: reject });
    });

  // Flow Configurations (estimator_flow_config table via useFlowConfig)
  const propertyTypes = useFlowConfig("property_types");
  const executionTiers = useFlowConfig("execution_tiers");
  const services = useFlowConfig("services");
  const addons = useFlowConfig("addons");
  const alcsRules = useFlowConfig("alcs_rules");
  const resultTemplates = useFlowConfig("result_templates");
  const mediaAssets = useFlowConfig("media_assets");

  const isLoading =
    pricing.isLoading ||
    propertyTypes.isLoading || 
    executionTiers.isLoading || 
    services.isLoading || 
    addons.isLoading ||
    alcsRules.isLoading ||
    resultTemplates.isLoading ||
    mediaAssets.isLoading;

  return {
    isLoading,
    pricingRates: {
      data: { ...DEFAULT_PRICING_CONFIG, ...(pricing.data ?? {}) },
      save: savePricing,
      isSaving: pricing.isSaving,
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
