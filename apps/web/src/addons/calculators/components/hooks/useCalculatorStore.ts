/* ═══════════════════════════════════════════════
   Calculator Store — thin orchestrator (7-step flow)
   ═══════════════════════════════════════════════
   All concerns are now delegated to focused hooks in ./_internals/.
   This file's only job is to compose them and expose a single API.
*/

import { useState, useCallback, useMemo, useRef } from "react";
import type { CalculatorFormData } from "../data/types";
import { loadDraft, INITIAL_FORM_DATA, ESTIMATOR_DRAFT_KEY } from "./_internals/useDraftPersistence";
import { useDraftPersistence } from "./_internals/useDraftPersistence";
import { useEstimateEngine } from "./_internals/useEstimateEngine";
import { useLeadCapture } from "./_internals/useLeadCapture";
import { BUDGET_SLIDER } from "../data/pricing-config";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneDigits = (v: string) => v.replace(/\D/g, "").length;

const TOTAL_STEPS = 8; // 0..6 = input steps, 7 = results

export function useCalculatorStore() {
    const analytics = useAnalytics();

    // ── Draft / Discovery pre-fill ─────────────────────────────────────────
    const draftResult = useMemo(() => loadDraft(), []);
    const [formData, setFormData] = useState<CalculatorFormData>(draftResult.data);
    const [currentStep, setCurrentStep] = useState(draftResult.step);
    const [showResults, setShowResults] = useState(false);
    const [discoveryApplied, setDiscoveryApplied] = useState(draftResult.appliedDiscovery);
    const [discoveryName] = useState(draftResult.displayName);
    const [discoveryRationale] = useState(draftResult.rationale);
    const prefillSnapshotRef = useRef(draftResult.prefillSnapshot);

    const discoveryHandoff = draftResult.discoveryHandoff;

    // Persist draft + fire prefill analytics
    useDraftPersistence(formData, currentStep);

    // ── Estimate computation + ALCS ────────────────────────────────────────
    const { estimate, alcsPipeline, alcsEstimatorResponse, executionBlueprint } =
        useEstimateEngine(formData, discoveryHandoff);

    // ── Lead capture + scoring ────────────────────────────────────────────
    const { isSaving, saveLead, scoreLead } =
        useLeadCapture(formData, estimate, discoveryHandoff, alcsPipeline, prefillSnapshotRef);

    // ── Form state mutations ──────────────────────────────────────────────
    const updateField = useCallback(<K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateFields = useCallback((partial: Partial<CalculatorFormData>) => {
        setFormData(prev => ({ ...prev, ...partial }));
    }, []);

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
        if (showResults) { setShowResults(false); return; }
        setCurrentStep(prev => Math.max(0, prev - 1));
    }, [showResults]);

    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step < TOTAL_STEPS - 1) {
            setShowResults(false);
            setCurrentStep(step);
        }
    }, []);

    const dismissDiscovery = useCallback(() => {
        const snap = prefillSnapshotRef.current;
        if (snap && analytics) {
            track(analytics, "discovery_prefill_dismissed", { archetype: snap.archetype, step: currentStep });
        }
        setDiscoveryApplied(false);
    }, [analytics, currentStep]);

    const reset = useCallback(() => {
        setFormData({ ...INITIAL_FORM_DATA });
        setCurrentStep(0);
        setShowResults(false);
        setDiscoveryApplied(false);
        localStorage.removeItem(ESTIMATOR_DRAFT_KEY);
    }, []);

    // ── Validation ────────────────────────────────────────────────────────
    // Types that open with a BHK picker; area/room counters stay hidden until one is chosen.
    const needsConfiguration = (["apartment", "independent_floor", "villa", "turnkey"] as (string | null)[]).includes(formData.propertyType);
    const canProceed = useMemo(() => {
        switch (currentStep) {
            case 0: return !!formData.propertyType;
            case 1: return formData.area > 0 && (!needsConfiguration || !!formData.bhk);
            case 2: return !!formData.city;
            case 3: return formData.budgetAmount >= BUDGET_SLIDER.min;
            case 4: return !!formData.selectedService && (formData.selectedService !== "C5" || !!formData.executionTier);
            case 5: return true;
            case 6: return !!formData.name.trim() && EMAIL_RE.test(formData.email.trim()) && phoneDigits(formData.phone) >= 10;
            default: return false;
        }
    }, [currentStep, formData, needsConfiguration]);

    const validationMessage = useMemo(() => {
        if (canProceed) return "";
        switch (currentStep) {
            case 0: return "Select a property type to continue";
            case 1: return needsConfiguration && !formData.bhk ? "Choose a configuration to continue" : "Set your area (sq ft) to continue";
            case 2: return "Select your city to continue";
            case 3: return "Pick a range or drag the slider to continue";
            case 4: return formData.selectedService === "C5" && !formData.executionTier
                ? "Select an execution tier for Full Scope"
                : "Select a service to continue";
            case 6: return !formData.name.trim() ? "Enter your name" : !EMAIL_RE.test(formData.email.trim()) ? "Enter a valid email, like name@example.com" : "Enter a phone number with at least 10 digits";
            default: return "";
        }
    }, [canProceed, currentStep, formData, needsConfiguration]);

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