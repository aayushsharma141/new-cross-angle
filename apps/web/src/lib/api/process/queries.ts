import { supabase } from "@/integrations/supabase/client";
import type { ProcessStage, ProcessFAQ, ProcessMetric } from "./types";
import type { SupabaseDesignProcessStep } from "../_shared/supabase-types";

export const processApi = {
  getProcessStages: async (): Promise<ProcessStage[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("design_process_steps")
        .select("*")
        .order("display_order", { ascending: true });

      if (error || !data) return [];

      return (data as any[]).map((d: SupabaseDesignProcessStep) => ({
        id: d.id,
        number: d.step_number || "00",
        title: d.title || "",
        subtitle: d.subtitle || "",
        summary: d.description || "",
        detail: d.detail || "",
        timeline: d.timeline_estimate || "",
        budgetRange: d.budget_range || "",
        clientDoes: d.client_does || [],
        weDo: d.we_do || [],
        deliverables: d.deliverables || [],
        image: d.image_url || "",
      }));
    } catch (e) {
      console.warn("Error fetching process stages:", e);
      return [];
    }
  },

  getProcessFAQs: async (): Promise<ProcessFAQ[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("process_faqs" as any)
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return (data as any[]).map((d: { question: string; answer: string }) => ({
      question: d.question,
      answer: d.answer,
    }));
  },

  getProcessMetrics: async (): Promise<ProcessMetric[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("process_metrics" as any)
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return (data as any[]).map((d: { value: string; label: string; suffix: string | null }) => ({
      value: d.value,
      label: d.label,
      suffix: d.suffix || undefined,
    }));
  },
};
