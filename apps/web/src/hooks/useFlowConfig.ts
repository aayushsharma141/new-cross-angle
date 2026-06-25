import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import {
  PROPERTY_TYPES,
  SERVICES,
  ADDONS,
  BHK_PRESETS,
  VILLA_BHK,
  RENOVATION_STAGES,
  RENOVATION_ROOMS,
  PROJECT_STAGES_MAP,
  LOCATION_DATA,
  TIERS,
  INVESTMENT_PRESETS,
  TIMELINE_OPTIONS,
} from "@/addons/calculators/components/data/pricing-config";
import { ADJECTIVE_OPTIONS, materialOptions, lightOptions, visualImages, DESIGN_LANGUAGES, COLOR_MOODS, DISLIKE_COLORS } from "@/constants/discovery";
import { CRM_STAGES } from "@/lib/crm/stages";

export type FlowConfigKey =
  | "property_types"
  | "bhk_presets"
  | "villa_bhk"
  | "project_stages"
  | "project_stages_map"
  | "renovation_stages"
  | "renovation_rooms"
  | "services"
  | "execution_tiers"
  | "addons"
  | "location_data"
  | "city_tiers"
  | "investment_presets"
  | "timeline_options"
  | "discovery_adjectives"
  | "discovery_materials"
  | "discovery_lights"
  | "discovery_archetypes"
  | "discovery_questions"
  | "discovery_visual_prompts"
  | "crm_stages"
  | "alcs_rules"
  | "result_templates"
  | "media_assets";

const DEFAULTS: Record<FlowConfigKey, unknown> = {
  property_types: PROPERTY_TYPES,
  bhk_presets: BHK_PRESETS,
  villa_bhk: VILLA_BHK,
  project_stages: PROJECT_STAGES_MAP,
  project_stages_map: PROJECT_STAGES_MAP,
  renovation_stages: RENOVATION_STAGES,
  renovation_rooms: RENOVATION_ROOMS,
  services: SERVICES,
  execution_tiers: null,
  addons: ADDONS,
  location_data: LOCATION_DATA,
  city_tiers: TIERS,
  investment_presets: INVESTMENT_PRESETS,
  timeline_options: TIMELINE_OPTIONS,
  discovery_adjectives: ADJECTIVE_OPTIONS,
  discovery_materials: materialOptions,
  discovery_lights: lightOptions,
  discovery_archetypes: [],
  discovery_questions: {
    design_languages: DESIGN_LANGUAGES,
    color_moods: COLOR_MOODS,
    dislike_colors: DISLIKE_COLORS,
  },
  discovery_visual_prompts: visualImages,
  crm_stages: CRM_STAGES.map(s => ({ id: s.id, label: s.label, dotClass: s.dotClass })),
  alcs_rules: null,
  result_templates: null,
  media_assets: null,
};

export function useFlowConfig<T = unknown>(key: FlowConfigKey) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<T>({
    queryKey: ["flow-config", key],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: row, error } = await (supabase as any)
        .from("estimator_flow_config")
        .select("data")
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      if (row?.data) return row.data as T;
      return DEFAULTS[key] as T;
    },
    staleTime: 60_000,
  });

  const upsert = useMutation({
    mutationFn: async (newData: T) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("estimator_flow_config")
        .upsert({ key, data: newData, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flow-config", key] });
      toast({ title: "Saved", description: `${key} updated successfully.` });
    },
    onError: (e: Error) => {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    },
  });

  const save = (
    newData: T,
    options?: { onSuccess?: () => void; onError?: (e: Error) => void }
  ) =>
    upsert.mutate(newData, {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    });

  return {
    data: data ?? (DEFAULTS[key] as T),
    isLoading,
    save,
    isSaving: upsert.isPending,
  };
}
