/**
 * Lead capture hook — owns the network submission, lead scoring, and conversion analytics.
 *
 * Concerns:
 * - Calling the submit-estimate Edge Function
 * - Tracking contact_form_submitted and discovery_prefill_outcome events
 * - Computing lead score for CRM routing
 */

import { useState, useCallback } from "react";
import type { CalculatorFormData, EstimateResult } from "../../data/types";
import { DEFAULT_PRICING_CONFIG } from "../../data/pricing-config";
import type { DiscoveryHandoff } from "../../data/discovery-handoff";
import type { OrchestratorOutput } from "../../data/engines";
import type { DiscoveryPreFillSnapshot } from "./useDraftPersistence";
import { track } from "@/analytics/track";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { supabase } from "@/lib/supabase";

export interface LeadScore {
  total: number;
  category: "HOT" | "WARM" | "COLD";
  breakdown: {
    budget: number;
    scope: number;
    area: number;
    timeline: number;
    city: number;
    engagement: number;
  };
}

export function useLeadCapture(
  formData: CalculatorFormData,
  estimate: EstimateResult | null,
  discoveryHandoff: DiscoveryHandoff | null,
  alcsPipeline: OrchestratorOutput | null,
  prefillSnapshotRef: React.RefObject<DiscoveryPreFillSnapshot | null>,
) {
  const analytics = useAnalytics();
  const [isSaving, setIsSaving] = useState(false);

  const scoreLead = useCallback((): LeadScore => {
    const w = DEFAULT_PRICING_CONFIG.scoring_weights;
    let budgetScore = 0, scopeScore = 0, areaScore = 0, timelineScore = 0, cityScore = 0;

    if (formData.budgetAmount >= 5000000) budgetScore = w.budget;
    else if (formData.budgetAmount >= 2000000) budgetScore = w.budget * 0.7;
    else if (formData.budgetAmount >= 500000) budgetScore = w.budget * 0.4;
    else budgetScore = w.budget * 0.15;

    if (formData.selectedService === "C5") scopeScore = w.service;
    else if (formData.selectedService === "C4") scopeScore = w.service * 0.8;
    else if (formData.selectedService === "C3") scopeScore = w.service * 0.6;
    else if (formData.selectedService === "C2") scopeScore = w.service * 0.4;
    else scopeScore = w.service * 0.2;

    if (formData.area >= 3000) areaScore = w.area;
    else if (formData.area >= 1500) areaScore = w.area * 0.6;
    else areaScore = w.area * 0.3;

    if (formData.startTiming === "Immediate") timelineScore = w.timeline;
    else if (formData.startTiming === "1-3 Months") timelineScore = w.timeline * 0.5;
    else timelineScore = w.timeline * 0.2;

    if (formData.cityTier === "metro") cityScore = w.city;
    else if (formData.cityTier === "tier1") cityScore = w.city * 0.6;
    else cityScore = w.city * 0.3;

    const total = Math.round(budgetScore + scopeScore + areaScore + timelineScore + cityScore);
    const category = total >= 70 ? "HOT" as const : total >= 40 ? "WARM" as const : "COLD" as const;

    return {
      total,
      category,
      breakdown: {
        budget: Math.round(budgetScore),
        scope: Math.round(scopeScore),
        area: Math.round(areaScore),
        timeline: Math.round(timelineScore),
        city: Math.round(cityScore),
        engagement: 0,
      },
    };
  }, [formData]);

  const saveLead = useCallback(async () => {
    if (!estimate) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-estimate", {
        body: {
          formData,
          discoveryContext: discoveryHandoff ?? undefined,
          alcsRecommendation: alcsPipeline?.blueprint.recommendation ?? undefined,
        },
      });

      if (error) {
        console.error("Submission failed:", error);
      } else {
        track(analytics, "contact_form_submitted", {
          leadSource: "estimator",
          email: formData.email,
          leadId: data?.leadId,
          sessionId: discoveryHandoff?.userId ?? crypto.randomUUID(),
          correlationId: data?.leadId,
        });
      }

      if (error) {
        console.error("Edge Function error:", error);
        throw error;
      }

      const snap = prefillSnapshotRef.current;
      if (snap && analytics) {
        const finalService = formData.selectedService;
        const finalTier = formData.executionTier;
        const addonsKeptCount = snap.addonFields.filter(
          (field) => (formData as unknown as Record<string, unknown>)[field] === true,
        ).length;
        track(analytics, "discovery_prefill_outcome", {
          archetype: snap.archetype,
          originalService: snap.service,
          finalService,
          originalTier: snap.executionTier,
          finalTier,
          serviceKept: finalService === snap.service,
          tierKept: finalTier === snap.executionTier,
          addonsKeptCount,
          addonsOriginalCount: snap.addonFields.length,
        });
      }
    } catch (err) {
      console.error("Failed to save lead securely:", err);
    } finally {
      setIsSaving(false);
    }
  }, [estimate, formData, analytics, discoveryHandoff, alcsPipeline, prefillSnapshotRef]);

  return { isSaving, saveLead, scoreLead };
}
