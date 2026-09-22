/**
 * Draft persistence hook — owns localStorage read/write and Discovery pre-fill.
 *
 * Concerns:
 * - Loading persisted draft from localStorage on mount
 * - Applying Discovery archetype pre-fill when the user starts fresh
 * - Syncing formData + step to localStorage on every change
 */

import { useMemo, useEffect, useRef } from "react";
import type { CalculatorFormData, PricingConfig } from "../../data/types";

import { loadDiscoveryResult } from "@/addons/discovery/core/persistence";
import { getEstimatorPreFill } from "../../data/archetype-mapping";
import { buildDiscoveryHandoff } from "../../data/discovery-handoff";
import type { OrchestratorOutput } from "../../data/engines";
import type { DiscoveryHandoff } from "../../data/discovery-handoff";
import { track } from "@/analytics/track";
import { useAnalytics } from "@/analytics/AnalyticsProvider";

const ESTIMATOR_DRAFT_KEY = "interior-estimator-draft";

/** Snapshot of the values applied by a Discovery pre-fill — used for analytics outcome tracking. */
export interface DiscoveryPreFillSnapshot {
  archetype: string;
  service: string;
  executionTier: string | null;
  addonFields: string[];
  hasAiIdentity: boolean;
}

const INITIAL_FORM_DATA: CalculatorFormData = {
  propertyType: null,
  bhk: null,
  area: 1000,
  stage: null,
  floors: 1,
  floorNumber: null,
  livingRooms: 1,
  bedrooms: 2,
  bathrooms: 2,
  toilets: 0,
  kitchen: 1,
  balconies: 1,
  hasPool: false,
  hasGarden: false,
  hasGym: false,
  hasHomeTheater: false,
  hasServantQuarters: false,
  hasCoveredParking: false,
  cabins: 2,
  conferenceRooms: 1,
  hasReception: true,
  hasPantry: true,
  hasServerRoom: false,
  hasTrainingRoom: false,
  hasLounge: false,
  renovationScope: null,
  renovationRooms: [],
  renovationPropertyType: null,
  state: "",
  city: "",
  cityTier: "tier1",
  budgetAmount: 500000,
  budgetPreset: "",
  selectedService: null,
  executionTier: null,
  modularKitchen: false,
  wardrobes: 0,
  falseCeiling: false,
  smartHome: false,
  customFurniture: false,
  premiumLighting: false,
  startTiming: null,
  projectMonths: 3,
  extraVisits: 5,
  name: "",
  email: "",
  phone: "",
};

function loadDraft(): {
  data: CalculatorFormData;
  step: number;
  appliedDiscovery: boolean;
  displayName: string;
  rationale: string;
  prefillSnapshot: DiscoveryPreFillSnapshot | null;
  discoveryHandoff: DiscoveryHandoff | null;
} {
  let data = { ...INITIAL_FORM_DATA };
  let step = 0;
  let appliedDiscovery = false;
  let displayName = "";
  let rationale = "";
  let prefillSnapshot: DiscoveryPreFillSnapshot | null = null;
  let discoveryHandoff: DiscoveryHandoff | null = null;

  try {
    const raw = localStorage.getItem(ESTIMATOR_DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.data && typeof parsed.step === "number") {
        data = { ...data, ...parsed.data };
        step = parsed.step;
      } else {
        data = { ...data, ...(parsed as Partial<CalculatorFormData>) };
      }
    }
  } catch (e) {
    console.warn("[Estimator] Could not load draft:", e);
  }

  if (data.selectedService === null) {
    const discovery = loadDiscoveryResult();
    if (discovery) {
      const preFill = getEstimatorPreFill(discovery.archetype);
      if (preFill.selectedService) {
        data.selectedService = preFill.selectedService;
        if (preFill.executionTier) data.executionTier = preFill.executionTier;
        data = { ...data, ...preFill.addons };
        appliedDiscovery = true;
        displayName = discovery.aiIdentity?.identityName || discovery.displayName || discovery.archetype;
        rationale = preFill.rationale;
        const addonFields = Object.entries(preFill.addons)
          .filter(([, v]) => v === true)
          .map(([k]) => k);
        prefillSnapshot = {
          archetype: discovery.archetype,
          service: preFill.selectedService,
          executionTier: preFill.executionTier,
          addonFields,
          hasAiIdentity: !!discovery.aiIdentity?.identityName,
        };
        if (discovery.signals) {
          try {
            discoveryHandoff = buildDiscoveryHandoff(
              discovery.signals,
              discovery.archetype,
              (discovery as { archetypeConfidence?: number }).archetypeConfidence ?? 0.8,
            );
          } catch (e) {
            console.warn("[Estimator] Could not build discovery handoff:", e);
          }
        }
        try {
          localStorage.setItem(ESTIMATOR_DRAFT_KEY, JSON.stringify({ data, step }));
        } catch { /* quota / private mode */ }
      }
    }
  }

  return { data, step, appliedDiscovery, displayName, rationale, prefillSnapshot, discoveryHandoff };
}

export function useDraftPersistence(formData: CalculatorFormData, currentStep: number) {
  const analytics = useAnalytics();
  const draftResult = useMemo(() => loadDraft(), []);

  const prefillSnapshotRef = useRef<DiscoveryPreFillSnapshot | null>(draftResult.prefillSnapshot);
  const prefillAppliedFiredRef = useRef(false);

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(ESTIMATOR_DRAFT_KEY, JSON.stringify({ data: formData, step: currentStep }));
    } catch { /* ignore */ }
  }, [formData, currentStep]);

  // Fire discovery_prefill_applied exactly once after mount
  useEffect(() => {
    if (prefillAppliedFiredRef.current) return;
    const snap = prefillSnapshotRef.current;
    if (!snap || !analytics) return;
    prefillAppliedFiredRef.current = true;
    track(analytics, "discovery_prefill_applied", {
      archetype: snap.archetype,
      service: snap.service,
      executionTier: snap.executionTier,
      addonsApplied: snap.addonFields,
      hasAiIdentity: snap.hasAiIdentity,
    });
  }, [analytics]);

  return {
    draftResult,
    prefillSnapshotRef,
    ESTIMATOR_DRAFT_KEY,
    INITIAL_FORM_DATA,
  };
}

export { INITIAL_FORM_DATA, ESTIMATOR_DRAFT_KEY, loadDraft };
export type { CalculatorFormData, PricingConfig, OrchestratorOutput };
