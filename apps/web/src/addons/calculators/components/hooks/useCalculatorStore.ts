/* ═══════════════════════════════════════════════
   Calculator Store — 7-step flow
   ═══════════════════════════════════════════════ */

import { useState, useCallback, useMemo } from "react";
import type { CalculatorFormData, EstimateResult, LeadScore } from "../data/types";
import { calculateEstimate } from "../data/calculation-engine";
import { DEFAULT_PRICING_CONFIG } from "../data/pricing-config";
import { generateId } from "../data/format-utils";
import { supabase } from "@/lib/supabase";

const TOTAL_STEPS = 8; // 0..6 = input steps, 7 = results
const STORAGE_KEY = "interior-estimator-draft";

export const INITIAL_FORM_DATA: CalculatorFormData = {
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

/** Load persisted draft from localStorage */
function loadDraft(): CalculatorFormData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<CalculatorFormData>;
            return { ...INITIAL_FORM_DATA, ...parsed };
        }
    } catch { /* ignore */ }
    return { ...INITIAL_FORM_DATA };
}

/** Save current form to localStorage */
function saveDraft(data: CalculatorFormData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
}

export function useCalculatorStore() {
    const [formData, setFormData] = useState<CalculatorFormData>(loadDraft);
    const [currentStep, setCurrentStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
        return calculateEstimate(formData, DEFAULT_PRICING_CONFIG);
    }, [formData]);

    /** Step navigation */
    const nextStep = useCallback(() => {
        setCurrentStep(prev => {
            if (prev >= TOTAL_STEPS - 2) {
                // last input step → show results
                setShowResults(true);
                return prev;
            }
            return prev + 1;
        });
    }, []);

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

    /** Reset everything */
    const reset = useCallback(() => {
        const fresh = { ...INITIAL_FORM_DATA };
        setFormData(fresh);
        setCurrentStep(0);
        setShowResults(false);
        localStorage.removeItem(STORAGE_KEY);
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

    /** Save lead to Supabase */
    const saveLead = useCallback(async () => {
        if (!estimate) return;
        setIsSaving(true);
        try {
            const score = scoreLead();
            const lead = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                property_type: formData.propertyType,
                bhk: formData.bhk,
                area: formData.area,
                city: formData.city,
                state: formData.state,
                city_tier: formData.cityTier,
                budget: formData.budgetAmount,
                service: formData.selectedService,
                execution_tier: formData.executionTier,
                estimate_min: estimate.total.min,
                estimate_max: estimate.total.max,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                start_timing: formData.startTiming,
                lead_score: score.total,
                lead_category: score.category,
                score_breakdown: score.breakdown,
                form_data: formData,
            };

            await supabase.from("estimate_leads").insert(lead);

            // Also insert into main leads table for CRM tracking
            await supabase.from("leads").insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: `Cost estimate generated. Min: ₹${estimate.total.min.toLocaleString('en-IN')}, Max: ₹${estimate.total.max.toLocaleString('en-IN')}. Area: ${formData.area} sqft, Type: ${formData.propertyType}`,
                lead_source: 'estimator',
                city: formData.city,
                budget: formData.budgetAmount?.toString(),
                service: formData.selectedService,
                source_url: window.location.href,
                score: score.total
            });
        } catch (err) {
            console.error("Failed to save lead:", err);
        } finally {
            setIsSaving(false);
        }
    }, [estimate, formData, scoreLead]);

    return {
        formData,
        currentStep,
        showResults,
        estimate,
        canProceed,
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
    };
}
