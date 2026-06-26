import { useEffect, useRef } from "react";
import { useCalculatorStore } from "./hooks/useCalculatorStore";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { StepPropertyType } from "./steps/StepPropertyType";
import { StepPropertyDetails } from "./steps/StepPropertyDetails";
import { StepLocation } from "./steps/StepLocation";
import { StepBudget } from "./steps/StepBudget";
import { StepServices } from "./steps/StepServices";
import { StepAddons } from "./steps/StepAddons";
import { StepTimeline } from "./steps/StepTimeline";
import { StepResults } from "./steps/StepResults";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";
import { useToast } from "@/hooks/useToast";
import { EstimatorBackground } from "@/addons/_shared/components/backgrounds/EstimatorBackground";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoIcon from "@/assets/logo-icon.png";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";
// SplitText + BlurText removed — Phase 1B: sidebar owns step heading chrome
const STEP_LABELS = ["Type", "Details", "Location", "Investment", "Services", "Bespoke", "Timeline"];

const STEP_DESCRIPTIONS: Record<number, { title: string; subtitle: string }> = {
    0: { title: "Property Type", subtitle: "Tell us about the kind of space you want to transform." },
    1: { title: "Property Details", subtitle: "Help us understand the size and specifications of your space." },
    2: { title: "Location", subtitle: "Where your project is located affects material and labour costs." },
    3: { title: "Investment Scope", subtitle: "Define your comfort zone — we tailor recommendations to your capital." },
    4: { title: "Service Level", subtitle: "Choose the level of white-glove involvement you need." },
    5: { title: "Bespoke Commissions", subtitle: "Enhance your residence with signature bespoke inclusions." },
    6: { title: "Timeline & Contact", subtitle: "When do you plan to start, and how can we reach you?" },
};

/** Compact one-line summary of what the user chose in each completed step. */
function getStepSummary(stepIndex: number, formData: import("./data/types").CalculatorFormData): string | null {
    switch (stepIndex) {
        case 0: return formData.propertyType
            ? formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1).replace(/_/g, " ")
            : null;
        case 1: {
            const parts: string[] = [];
            if (formData.bhk) parts.push(formData.bhk);
            else if (formData.area) parts.push(`${formData.area} sqft`);
            if (formData.stage) parts.push(formData.stage);
            return parts.length ? parts.join(" · ") : null;
        }
        case 2: return (formData.city && formData.state)
            ? `${formData.city}, ${formData.state}`
            : formData.state || null;
        case 3: return formData.budgetPreset || (formData.budgetAmount ? `₹${(formData.budgetAmount / 100000).toFixed(0)}L` : null);
        case 4: return formData.selectedService
            ? `${formData.selectedService}${formData.executionTier ? ` · ${formData.executionTier}` : ""}`
            : null;
        case 5: {
            const addons = [
                formData.modularKitchen && "Kitchen",
                formData.smartHome && "Smart Home",
                formData.falseCeiling && "False Ceiling",
                formData.customFurniture && "Furniture",
            ].filter(Boolean);
            return addons.length ? addons.slice(0, 2).join(", ") + (addons.length > 2 ? " +more" : "") : "None";
        }
        case 6: return formData.startTiming || null;
        default: return null;
    }
}

interface CostEstimatorProps {
    onBack?: () => void;
}

export function CostEstimator({ onBack }: CostEstimatorProps = {}) {
    const { settings } = useSiteSettings();
    const logoUrl = settings?.company_logo_url || settings?.logo_light_url || logoIcon;
    const analytics = useAnalytics();
    const { toast } = useToast();
    const {
        formData, currentStep, showResults, estimate,
        canProceed, validationMessage, isSaving,
        discoveryApplied, discoveryName, discoveryRationale, dismissDiscovery,
        updateField, updateFields, nextStep, prevStep, goToStep,
        reset, saveLead, alcsEstimatorResponse,
    } = useCalculatorStore(analytics);

    const startedRef = useRef(false);
    useEffect(() => {
        if (!startedRef.current) {
            startedRef.current = true;
            track(analytics, "estimate_path_selected", { pathId: "calculator_started" });

            if (discoveryApplied) {
                const name = discoveryName || "your style profile";
                toast({
                    title: `Personalized for ${name}`,
                    description:
                        discoveryRationale ||
                        "Pre-filled based on your style profile. Feel free to adjust anything.",
                });
            }
        }
    }, [analytics, toast, discoveryApplied, discoveryName, discoveryRationale]);

    useEffect(() => {
        if (showResults && estimate) {
            saveLead();
        }
    }, [showResults, estimate, saveLead]);

    const progress = Math.round((currentStep / STEP_LABELS.length) * 100);
    const stepInfo = STEP_DESCRIPTIONS[currentStep] ?? STEP_DESCRIPTIONS[0];

    if (showResults) {
        return (
            <div className="w-full min-h-screen bg-kiro-bg text-kiro-ink overflow-y-auto overflow-x-hidden font-sans relative flex justify-center items-start">
                <EstimatorBackground />
                
                {/* Nav Header (Standalone) */}
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2">
                  <a
                    href="/"
                    className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0 hover:opacity-75 focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
                    aria-label="Return to CrossAngle Home"
                  >
                    <img
                      src={logoUrl}
                      alt="Cross Angle Interior"
                      className="h-8 md:h-10 w-auto transition-all duration-500 shrink-0 animate-in fade-in zoom-in duration-300"
                    />
                    <AnimatedLogo
                      isScrolled={false}
                      className="flex gap-1 sm:gap-1.5 font-bold tracking-tight whitespace-nowrap min-w-0 [&_span]:text-kiro-ink"
                    />
                  </a>
                </div>

                <div className="w-full max-w-6xl px-6 pt-16 pb-8 relative z-10">
                    <StepResults
                        formData={formData}
                        estimate={estimate}
                        discoveryApplied={discoveryApplied}
                        discoveryName={discoveryName}
                        discoveryRationale={discoveryRationale}
                        alcsEstimatorResponse={alcsEstimatorResponse}
                        onReset={reset}
                        onBack={prevStep}
                    />
                </div>
            </div>
        );
    }

    return (
        <form 
            onSubmit={(e) => { 
                e.preventDefault(); 
                if (canProceed && !isSaving) nextStep(); 
            }}
            className="min-h-[100dvh] grid grid-cols-1 md:grid-cols-[280px_1fr] bg-kiro-bg font-sans text-kiro-ink relative overflow-x-hidden"
        >
            {/* Skip link — first focusable element, visible only on keyboard focus */}
            <a
                href="#estimator-form-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-kiro-accent focus:text-white focus:rounded-[8px] focus:text-sm focus:font-semibold focus:shadow-lg"
            >
                Skip to form
            </a>

            {/* Dark Premium Background */}
            <EstimatorBackground />

            {/* Sidebar */}
            <aside aria-label="Estimator progress" className="hidden md:flex flex-col bg-kiro-surface border-r border-kiro-line p-8 sticky top-0 h-[100dvh] overflow-y-auto z-20 shadow-[4px_0_16px_rgba(0,0,0,0.02)]">
                {/* Logo + title */}
                <a href="/" className="flex items-center gap-2 mb-6 group hover:opacity-75 transition-opacity focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:outline-none focus-visible:ring-offset-2 rounded-lg" aria-label="Return to CrossAngle Home">
                    <img src={logoUrl} alt="CrossAngle Logo" className="h-5 w-auto shrink-0 animate-in fade-in duration-300" />
                    <h1 className="text-[14px] tracking-[0.08em] uppercase text-kiro-accent font-semibold font-label m-0">
                        Cost Estimator
                    </h1>
                </a>

                {/* Discovery badge — compact strip */}
                {discoveryApplied && (
                    <div role="status" aria-live="polite" className="mb-5 px-3 py-2 bg-kiro-accent/[0.06] border border-kiro-accent/20 rounded-[6px] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-kiro-accent block leading-none mb-0.5">Blueprint</span>
                            <span className="text-[12px] font-semibold text-kiro-ink truncate block">{discoveryName}</span>
                        </div>
                        <button type="button" onClick={dismissDiscovery} aria-label="Dismiss personalization" className="shrink-0 text-kiro-accent/60 hover:text-kiro-ink transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-kiro-accent">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Step counter + current step subtitle — sidebar owns this chrome */}
                <div className="mb-4">
                    <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-kiro-accent/70 mb-1">
                        Step {currentStep + 1} of {STEP_LABELS.length}
                    </div>
                    <p className="text-[12px] text-kiro-inkSoft leading-snug m-0">
                        {stepInfo.subtitle}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mb-6 relative">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-kiro-ink/40">Journey</span>
                        <motion.span
                            key={progress}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-mono text-kiro-accent font-semibold"
                        >
                            {progress}%
                        </motion.span>
                    </div>
                    <div className="h-[2px] bg-kiro-ink/[0.08] relative overflow-hidden rounded-full">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-kiro-accent shadow-[0_0_8px_rgba(139,111,71,0.3)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </div>

                {/* Stepper list with vertical spine line */}
                <nav aria-label="Estimator steps">
                <div className="relative">
                    <div className="absolute left-[10px] top-[21px] bottom-[21px] w-[2px] bg-kiro-ink/[0.08] -z-10" aria-hidden="true" />
                    <motion.div
                        className="absolute left-[10px] top-[21px] w-[2px] bg-kiro-accent shadow-[0_0_8px_rgba(209,175,110,0.4)] origin-top -z-10"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: currentStep / (STEP_LABELS.length - 1) }}
                        style={{ bottom: "21px" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        aria-hidden="true"
                    />
                    <ol className="space-y-1 relative z-10 m-0 p-0 list-none">
                        {STEP_LABELS.map((label, i) => {
                            const done = i < currentStep;
                            const active = i === currentStep;
                            const isClickable = i <= currentStep;
                            const summary = done ? getStepSummary(i, formData) : null;
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        disabled={!isClickable}
                                        aria-current={active ? "step" : undefined}
                                        aria-label={`Step ${i + 1}: ${label}${done ? " (completed)" : active ? " (current)" : ""}`}
                                        onClick={() => isClickable && goToStep(i)}
                                        className={`w-full flex items-center gap-3 py-2 text-[13px] transition-all duration-200 rounded-md px-1 -mx-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2 ${
                                            isClickable
                                                ? "cursor-pointer text-kiro-ink hover:text-kiro-accent hover:bg-kiro-accent/[0.04]"
                                                : "cursor-not-allowed text-kiro-inkSoft/40"
                                        } ${active ? "text-kiro-ink font-semibold" : done ? "text-kiro-accent" : ""}`}
                                    >
                                        <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center text-[10px] font-semibold shrink-0 transition-all duration-300 bg-white ${
                                            active
                                                ? "border-kiro-accent bg-kiro-accent text-white shadow-[0_0_8px_rgba(209,175,110,0.4)]"
                                                : done
                                                    ? "border-kiro-accent text-kiro-accent"
                                                    : "border-kiro-ink/[0.08] text-kiro-inkSoft/40"
                                        }`} aria-hidden="true">
                                            {done ? "✓" : i + 1}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="leading-tight">{label}</span>
                                            {summary && (
                                                <span className="text-[11px] text-kiro-accent/70 font-normal truncate leading-tight mt-0.5" aria-hidden="true">
                                                    {summary}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </div>
                </nav>

                {/* Footer text pushed to bottom by mt-auto */}
                <div className="mt-auto pt-4 border-t border-kiro-line">
                    <p className="text-[10px] text-kiro-inkSoft leading-relaxed tracking-wide">
                        Progress saved automatically.<br />
                        You can leave and return anytime.
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="p-6 sm:p-8 md:px-[56px] md:py-[48px] w-full max-w-[760px] mx-auto flex flex-col relative z-10" aria-label="Estimator form">
                {/* Mobile Header */}
                <div className="md:hidden mb-6 border-b border-kiro-ink/[0.06] pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-[12px] tracking-[0.1em] uppercase text-kiro-accent font-semibold m-0">Cost Estimator</h1>
                        <span className="text-[10px] font-mono text-kiro-accent font-semibold">{progress}%</span>
                    </div>
                    {/* Mobile progress bar */}
                    <div className="h-[3px] bg-kiro-line rounded-full overflow-hidden mb-3">
                        <motion.div
                            className="h-full bg-kiro-accent rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-kiro-accent bg-kiro-accent text-white flex items-center justify-center text-[11px] font-semibold shrink-0 shadow-[0_0_8px_rgba(139,111,71,0.3)]" aria-hidden="true">
                            {currentStep + 1}
                        </div>
                        <span className="text-kiro-ink font-semibold text-[14px]">{STEP_LABELS[currentStep]}</span>
                    </div>
                    {/* Mobile step dots */}
                    <div className="flex items-center gap-1.5 mt-2" aria-hidden="true">
                        {STEP_LABELS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i <= currentStep ? "bg-kiro-accent" : "bg-kiro-line"
                                } ${i === currentStep ? "w-4" : "w-1.5"}`}
                            />
                        ))}
                    </div>
                </div>

                <div id="estimator-form-content" className="flex-1 min-h-0" tabIndex={-1}>
                    {/* Compact step heading — sidebar owns counter + subtitle; main keeps just the contextual H2 */}
                    <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight font-serif text-kiro-ink mb-5 leading-tight">
                        {stepInfo.title}
                    </h2>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {currentStep === 0 && <StepPropertyType formData={formData} updateField={updateField} />}
                            {currentStep === 1 && <StepPropertyDetails formData={formData} updateField={updateField} updateFields={updateFields} />}
                            {currentStep === 2 && <StepLocation formData={formData} updateFields={updateFields} />}
                            {currentStep === 3 && <StepBudget formData={formData} updateField={updateField} />}
                            {currentStep === 4 && <StepServices formData={formData} updateField={updateField} />}
                            {currentStep === 5 && <StepAddons formData={formData} updateField={updateField} />}
                            {currentStep === 6 && <StepTimeline formData={formData} updateField={updateField} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2 mt-8 sm:mt-[40px] pt-[20px] sm:pt-[24px] border-t border-kiro-ink/[0.06]">
                    {/* Validation message — id used by aria-describedby on Continue */}
                    {validationMessage && (
                        <motion.p
                            id="step-validation-msg"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[13px] text-amber-700 font-medium text-right"
                            role="alert"
                            aria-live="polite"
                        >
                            {validationMessage}
                        </motion.p>
                    )}
                    <div className="flex gap-3 justify-between">
                        <button 
                            type="button"
                            onClick={() => currentStep === 0 ? onBack?.() : prevStep()} 
                            disabled={currentStep === 0 && !onBack} 
                            aria-label={currentStep === 0 ? "Go back" : `Go to previous step: ${STEP_LABELS[currentStep - 1] || ""}`}
                            className="px-5 sm:px-[28px] py-[12px] sm:py-[14px] bg-transparent border border-kiro-line text-kiro-ink rounded-[10px] text-[14px] sm:text-[15px] font-semibold transition-all duration-200 hover:bg-kiro-accent/[0.04] hover:border-kiro-accent/40 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                        </button>
                        <button 
                            type="button"
                            onClick={nextStep} 
                            disabled={!canProceed || isSaving}
                            aria-label={currentStep === STEP_LABELS.length - 1 ? "Get your estimate" : `Continue to ${STEP_LABELS[currentStep + 1] || "next step"}`}
                            aria-describedby={validationMessage ? "step-validation-msg" : undefined}
                            className="px-5 sm:px-[28px] py-[12px] sm:py-[14px] bg-kiro-accent text-white hover:bg-[#705939] rounded-[10px] text-[14px] sm:text-[15px] font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(139,111,71,0.2)] hover:shadow-[0_6px_20px_rgba(139,111,71,0.3)] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                        >
                            {isSaving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {currentStep === STEP_LABELS.length - 1 ? "Get Estimate" : "Continue"}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </form>
    );
}
