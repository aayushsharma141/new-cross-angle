/* ═══════════════════════════════════════════════
   Calculator Store — 7-step flow
   ═══════════════════════════════════════════════ */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { CalculatorFormData, EstimateResult, LeadScore, PricingConfig } from "../data/types";
import { calculateEstimate } from "../data/calculation-engine";
import { DEFAULT_PRICING_CONFIG } from "../data/pricing-config";
import { loadDiscoveryResult } from "@/addons/discovery/core/persistence";
import { getEstimatorPreFill } from "../data/archetype-mapping";
import { buildDiscoveryHandoff } from "../data/discovery-handoff";
import { runALCSPipeline } from "../data/engines";
import type { OrchestratorOutput } from "../data/engines";
import type { DiscoveryHandoff, EstimatorResponse } from "../data/discovery-handoff";
import type { ExecutionBlueprint } from "../data/engines/types";
import { supabase } from "@/lib/supabase";
import type { AnalyticsClient } from "@/analytics/posthog-client";
import { track } from "@/analytics/track";

const TOTAL_STEPS = 8; // 0..6 = input steps, 7 = results
const ESTIMATOR_DRAFT_KEY = "interior-estimator-draft";

const INITIAL_FORM_DATA: CalculatorFormData = {
    // Step 1
    propertyType: null,
    // Step 2
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
    // Step 3
    state: "",
    city: "",
    cityTier: "tier1",
    // Step 4
    budgetAmount: 500000,
    budgetPreset: "",
    // Step 5
    selectedService: null,
    executionTier: null,
    // Step 6
    modularKitchen: false,
    wardrobes: 0,
    falseCeiling: false,
    smartHome: false,
    customFurniture: false,
    premiumLighting: false,
    // Step 7
    startTiming: null,
    projectMonths: 3,
    extraVisits: 5,
    name: "",
    email: "",
    phone: "",
};

/** Snapshot of the values applied by a Discovery pre-fill — used for analytics outcome tracking. */
interface DiscoveryPreFillSnapshot {
    archetype: string;
    service: string;
    executionTier: string | null;
    /** Form-field names of add-ons that were toggled on by the pre-fill */
    addonFields: string[];
    hasAiIdentity: boolean;
}

/** Load persisted draft from localStorage and optionally apply Discovery pre-fill */
function loadDraft(): {
    data: CalculatorFormData;
    appliedDiscovery: boolean;
    displayName: string;
    rationale: string;
    prefillSnapshot: DiscoveryPreFillSnapshot | null;
    discoveryHandoff: DiscoveryHandoff | null;
} {
    let data = { ...INITIAL_FORM_DATA };
    let appliedDiscovery = false;
    let displayName = "";
    let rationale = "";
    let prefillSnapshot: DiscoveryPreFillSnapshot | null = null;
    let discoveryHandoff: DiscoveryHandoff | null = null;

    // 1. Restore any in-progress draft
    try {
        const raw = localStorage.getItem(ESTIMATOR_DRAFT_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<CalculatorFormData>;
            data = { ...data, ...parsed };
        }
    } catch (e) {
        console.warn("[Estimator] Could not load draft:", e);
    }

    // 2. Apply Discovery pre-fill ONLY when the user hasn't picked a service yet
    //    (i.e. a fresh session, not an in-progress form)
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
                // Snapshot the originally-applied values for outcome analytics at submission time
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
                // Build ALCS DiscoveryHandoff from the saved session signals
                if (discovery.signals) {
                    try {
                        discoveryHandoff = buildDiscoveryHandoff(
                            discovery.signals,
                            discovery.archetype,
                            (discovery as { archetypeConfidence?: number }).archetypeConfidence ?? 0.8
                        );
                    } catch (e) {
                        console.warn("[Estimator] Could not build discovery handoff:", e);
                    }
                }
                // Persist the merged state so page refreshes don't re-apply
                try {
                    localStorage.setItem(ESTIMATOR_DRAFT_KEY, JSON.stringify(data));
                } catch { /* quota / private mode */ }
            }
        }
    }

    return { data, appliedDiscovery, displayName, rationale, prefillSnapshot, discoveryHandoff };
}

/** Save current form to localStorage */
function saveDraft(data: CalculatorFormData) {
    try {
        localStorage.setItem(ESTIMATOR_DRAFT_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
}

export function useCalculatorStore(analytics?: AnalyticsClient) {
    const draftResult = useMemo(() => loadDraft(), []);
    const [formData, setFormData] = useState<CalculatorFormData>(draftResult.data);
    const [discoveryApplied, setDiscoveryApplied] = useState(draftResult.appliedDiscovery);
    const [discoveryName] = useState(draftResult.displayName);
    const [discoveryRationale] = useState(draftResult.rationale);
    const [currentStep, setCurrentStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    /** ALCS: Discovery handoff loaded at mount (from localStorage) */
    const discoveryHandoff: DiscoveryHandoff | null = draftResult.discoveryHandoff;

    /** Captured pre-fill snapshot — used to compute the outcome event at lead submission. */
    const prefillSnapshotRef = useRef<DiscoveryPreFillSnapshot | null>(draftResult.prefillSnapshot);
    /** Fired-once guard for discovery_prefill_applied. */
    const prefillAppliedFiredRef = useRef(false);

    /**
     * Fire `discovery_prefill_applied` exactly once when a Discovery pre-fill was applied on this mount.
     * Runs after mount so the analytics client (which is consent-gated) is fully initialised.
     */
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

    // Dynamic config pulled from Admin DB
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
                    setPricingConfig({ ...DEFAULT_PRICING_CONFIG, ...data.config as PricingConfig });
                }
            } catch (err) {
                console.error("Failed to load dynamic pricing config. Using defaults.", err);
            }
        };
        void fetchConfig();
    }, []);

    /** Update a single field */
    const updateField = useCallback(<K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            saveDraft(next);
            return next;
        });
    }, []);

    /** Bulk update multiple fields */
    const updateFields = useCallback((partial: Partial<CalculatorFormData>) => {
        setFormData(prev => {
            const next = { ...prev, ...partial };
            saveDraft(next);
            return next;
        });
    }, []);

    /** Live estimate (recalculated on every formData change) */
    const estimate: EstimateResult | null = useMemo(() => {
        if (!formData.selectedService) return null;
        if (formData.area <= 0) return null;
        return calculateEstimate(formData, pricingConfig);
    }, [formData, pricingConfig]);

    /**
     * ALCS Full Pipeline — runs all 10 engines when Discovery handoff exists.
     * Produces:
     * - executionBlueprint: the 9-section final result
     * - alcsEstimatorResponse: legacy EstimatorResponse for backward-compat UI
     * - engineResults: raw results from each engine for granular UI access
     *
     * Pure computation, safe in useMemo.
     */
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

    /** Step navigation */
    const nextStep = useCallback(() => {
        setCurrentStep(prev => {
            if (prev >= TOTAL_STEPS - 2) {
                setShowResults(true);
                if (analytics) track(analytics, "estimate_path_selected", { pathId: "calculator_complete" });
                return prev;
            }
            if (analytics) track(analytics, "estimate_path_selected", { pathId: `calculator_step_${prev + 1}` });
            return prev + 1;
        });
    }, [analytics]);

    const prevStep = useCallback(() => {
        if (showResults) {
            setShowResults(false);
            return;
        }
        setCurrentStep(prev => Math.max(0, prev - 1));
    }, [showResults]);

    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step < TOTAL_STEPS - 1) {
            setShowResults(false);
            setCurrentStep(step);
        }
    }, []);

    /** Dismiss the Discovery badge without resetting pre-filled values */
    const dismissDiscovery = useCallback(() => {
        const snap = prefillSnapshotRef.current;
        if (snap && analytics) {
            track(analytics, "discovery_prefill_dismissed", {
                archetype: snap.archetype,
                step: currentStep,
            });
        }
        setDiscoveryApplied(false);
    }, [analytics, currentStep]);

    /** Reset everything */
    const reset = useCallback(() => {
        const fresh = { ...INITIAL_FORM_DATA };
        setFormData(fresh);
        setCurrentStep(0);
        setShowResults(false);
        setDiscoveryApplied(false);
        localStorage.removeItem(ESTIMATOR_DRAFT_KEY);
    }, []);

    /** can proceed? — per-step validation */
    const canProceed = useMemo(() => {
        switch (currentStep) {
            case 0: return !!formData.propertyType;
            case 1: return formData.area > 0;
            case 2: return !!formData.city;
            case 3: return formData.budgetAmount > 0;
            case 4: return !!formData.selectedService && (formData.selectedService !== "C5" || !!formData.executionTier);
            case 5: return true; // add-ons are optional
            case 6: return !!formData.name && !!formData.phone;
            default: return false;
        }
    }, [currentStep, formData]);

    /** Validation message explaining why Continue is disabled */
    const validationMessage = useMemo(() => {
        if (canProceed) return "";
        switch (currentStep) {
            case 0: return "Select a property type to continue";
            case 1: return "Set your area (sq ft) to continue";
            case 2: return "Select your city to continue";
            case 3: return "Set your budget to continue";
            case 4: return formData.selectedService === "C5" && !formData.executionTier
                ? "Select an execution tier for Full Scope"
                : "Select a service to continue";
            case 6: return !formData.name ? "Enter your name" : "Enter your phone number";
            default: return "";
        }
    }, [canProceed, currentStep, formData]);

    /** Score a lead */
    const scoreLead = useCallback((): LeadScore => {
        const w = DEFAULT_PRICING_CONFIG.scoring_weights;
        let budgetScore = 0, scopeScore = 0, areaScore = 0, timelineScore = 0, cityScore = 0;

        // Budget
        if (formData.budgetAmount >= 5000000) budgetScore = w.budget;
        else if (formData.budgetAmount >= 2000000) budgetScore = w.budget * 0.7;
        else if (formData.budgetAmount >= 500000) budgetScore = w.budget * 0.4;
        else budgetScore = w.budget * 0.15;

        // Scope
        if (formData.selectedService === "C5") scopeScore = w.service;
        else if (formData.selectedService === "C4") scopeScore = w.service * 0.8;
        else if (formData.selectedService === "C3") scopeScore = w.service * 0.6;
        else if (formData.selectedService === "C2") scopeScore = w.service * 0.4;
        else scopeScore = w.service * 0.2;

        // Area
        if (formData.area >= 3000) areaScore = w.area;
        else if (formData.area >= 1500) areaScore = w.area * 0.6;
        else areaScore = w.area * 0.3;

        // Timeline
        if (formData.startTiming === "Immediate") timelineScore = w.timeline;
        else if (formData.startTiming === "1-3 Months") timelineScore = w.timeline * 0.5;
        else timelineScore = w.timeline * 0.2;

        // City
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

    /** Save lead referencing Edge Function internally to protect logic & payload injections */
    const saveLead = useCallback(async () => {
        if (!estimate) return;
        setIsSaving(true);
        try {
            // Let the secure server re-calculate and handle DB entries.
            // Forward the Discovery handoff so the edge function can persist
            // archetype + signals into the lead record for designer context.
            const { data, error } = await supabase.functions.invoke("submit-estimate", {
                body: {
                    formData,
                    // PHASE 13: CRM intelligence — full DiscoveryHandoff
                    // Undefined when user reaches Estimator without Discovery
                    discoveryContext: discoveryHandoff ?? undefined,
                    // PHASE 15: ALCS Recommendation & Explainability
                    alcsRecommendation: alcsPipeline?.blueprint.recommendation ?? undefined,
                }
            });

            if (error) {
                console.error("Edge Function error:", error);
                throw error;
            }

            // Note: the backend handles creating the lead and inserting it into estimate_leads.
            console.log("Lead securely captured via edge function:", data);

            // Conversion analytics: did the Discovery pre-fill survive to lead submission?
            const snap = prefillSnapshotRef.current;
            if (snap && analytics) {
                const finalService = formData.selectedService;
                const finalTier = formData.executionTier;
                const addonsKeptCount = snap.addonFields.filter(
                    (field) => (formData as unknown as Record<string, unknown>)[field] === true
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
            // Non-blocking for user UX. 
        } finally {
            setIsSaving(false);
        }
    }, [estimate, formData, analytics, discoveryHandoff, alcsPipeline]);

    return {
        formData,
        currentStep,
        showResults,
        estimate,
        canProceed,
        validationMessage,
        isSaving,
        totalSteps: TOTAL_STEPS - 1,
        updateField,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        reset,
        saveLead,
        scoreLead,
        discoveryApplied,
        discoveryName,
        discoveryRationale,
        dismissDiscovery,
        // ALCS Engine outputs
        discoveryHandoff,
        alcsEstimatorResponse,
        executionBlueprint,
        alcsPipeline,
    };
}
