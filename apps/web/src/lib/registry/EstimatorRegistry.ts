import { useFlowConfig } from "@/hooks/useFlowConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PricingConfig } from "@/addons/calculators/components/data/types";
import { DEFAULT_PRICING_CONFIG } from "@/addons/calculators/components/data/pricing-config";

/**
 * EstimatorRegistry acts as the single source of truth for all Estimator settings.
 * It provides a unified interface to Pricing, Packages, Addons, ALCS, Results, and Media.
 */
export function useEstimatorRegistry() {
  const queryClient = useQueryClient();

  // Pricing Logic (estimate_rates table)
  const { data: rateData, isLoading: isLoadingRates } = useQuery<{ id?: string; config: PricingConfig; updated_at?: string } | null>({
    queryKey: ["estimate-rates"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("estimate_rates")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return (data || null) as any;
    },
  });

  const saveRates = useMutation({
    mutationFn: async (config: PricingConfig) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = { config: config as any, updated_at: new Date().toISOString() };
      if (rateData?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("estimate_rates").update(payload).eq("id", rateData.id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("estimate_rates").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimate-rates"] });
    },
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
    isLoadingRates || 
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
      data: rateData?.config ? { ...DEFAULT_PRICING_CONFIG, ...rateData.config } : DEFAULT_PRICING_CONFIG,
      save: saveRates.mutateAsync,
      isSaving: saveRates.isPending,
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
