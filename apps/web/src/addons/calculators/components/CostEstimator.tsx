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
import { formatCurrency } from "./data/format-utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";
import { useToast } from "@/hooks/useToast";
import { EstimatorBackground } from "@/addons/_shared/components/backgrounds/EstimatorBackground";
import { ECOSYSTEM_COPY } from "@/addons/_shared/ecosystemCopy";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoIcon from "@/assets/logo-icon.png";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";

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
            <div className="w-full min-h-screen bg-[#faf8f5] text-[#1a1a1a] overflow-y-auto overflow-x-hidden font-sans relative flex justify-center items-start">
                <EstimatorBackground />
                
                {/* Nav Header (Standalone) */}
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
                  <a
                    href="/"
                    className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0 hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
                    aria-label="Return to CrossAngle Home"
                  >
                    <img
                      src={logoUrl}
                      alt="Cross Angle Interior"
                      className="h-11 md:h-16 w-auto transition-all duration-500 shrink-0 animate-in fade-in zoom-in duration-300"
                    />
                    <AnimatedLogo
                      isScrolled={false}
                      className="flex gap-1 sm:gap-1.5 font-bold tracking-tight whitespace-nowrap min-w-0 [&_span]:text-[#1a1a1a]"
                    />
                  </a>
                </div>

                <div className="w-full max-w-6xl px-6 pt-28 pb-16 relative z-10">
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
        <div className="h-[100dvh] grid grid-cols-1 md:grid-cols-[280px_1fr] bg-[#faf8f5] font-sans text-[#1a1a1a] relative overflow-hidden">
            {/* Dark Premium Background */}
            <EstimatorBackground />

            {/* Sidebar */}
            <aside aria-label="Estimator progress" className="hidden md:flex flex-col bg-[#ffffff] border-r border-[#e8e4dd] p-8 sticky top-0 h-[100dvh] overflow-y-auto z-20 shadow-[4px_0_16px_rgba(0,0,0,0.02)]">
                <a href="/" className="flex items-center gap-2 mb-8 group hover:opacity-75 transition-opacity focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 rounded-lg" aria-label="Return to CrossAngle Home">
                    <img src={logoUrl} alt="CrossAngle Logo" className="h-5 w-auto shrink-0 animate-in fade-in duration-300" />
                    <h1 className="text-[14px] tracking-[0.08em] uppercase text-[#8b6f47] font-semibold font-label m-0">
                        Cost Estimator
                    </h1>
                </a>
                
                {discoveryApplied && (
                    <div role="status" aria-live="polite" className="mb-8 p-4 bg-site-gold-light rounded-[8px] border-l-[3px] border-[#8b6f47] text-[13px] relative bg-[#ffffff]/80 border border-[#1a1a1a]/[0.05]">
                        <button type="button" onClick={dismissDiscovery} aria-label="Dismiss personalization banner" className="absolute top-2 right-2 text-[#8b6f47] hover:text-[#1a1a1a] transition-colors p-1 rounded-full hover:bg-[#8b6f47]/10">
                            <X className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#8b6f47] block mb-1">Discovery Blueprint</span>
                        <strong className="text-[#1a1a1a]">Personalized for {discoveryName}</strong><br/>
                        <span className="text-[#5a5a5a] mt-1 block">{discoveryRationale || ECOSYSTEM_COPY.estimatorWithBlueprint}</span>
                    </div>
                )}

                {/* Progress bar as in Discovery Engine */}
                <div className="mb-8 relative">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#1a1a1a]/50">Journey</span>
                        <motion.span
                            key={progress}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-mono text-[#8b6f47] font-semibold"
                        >
                            {progress}%
                        </motion.span>
                    </div>
                    <div className="h-[2px] bg-[#1a1a1a]/[0.08] relative overflow-hidden rounded-full">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-[#8b6f47] shadow-[0_0_8px_rgba(139,111,71,0.3)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </div>

                {/* Stepper list with vertical spine line */}
                <nav aria-label="Estimator steps">
                <div className="relative">
                    <div className="absolute left-[10px] top-[21px] bottom-[21px] w-[2px] bg-[#1a1a1a]/[0.08] -z-10" aria-hidden="true" />
                    <motion.div 
                        className="absolute left-[10px] top-[21px] w-[2px] bg-[#8b6f47] shadow-[0_0_8px_rgba(209,175,110,0.4)] origin-top -z-10"
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
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        disabled={!isClickable}
                                        aria-current={active ? "step" : undefined}
                                        aria-label={`Step ${i + 1}: ${label}${done ? " (completed)" : active ? " (current)" : ""}`}
                                        onClick={() => isClickable && goToStep(i)}
                                        className={`w-full flex items-center gap-3 py-2.5 text-[14px] transition-all duration-200 rounded-md px-1 -mx-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2 ${
                                            isClickable 
                                                ? "cursor-pointer text-[#1a1a1a] hover:text-[#8b6f47] hover:bg-[#8b6f47]/[0.04]" 
                                                : "cursor-not-allowed text-[#5a5a5a]/40"
                                        } ${active ? "text-[#1a1a1a] font-semibold" : done ? "text-[#8b6f47]" : ""}`}
                                    >
                                        <div className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-semibold shrink-0 transition-all duration-300 bg-white ${
                                            active 
                                                ? "border-[#8b6f47] bg-[#8b6f47] text-white shadow-[0_0_8px_rgba(209,175,110,0.4)]" 
                                                : done 
                                                    ? "border-[#8b6f47] text-[#8b6f47]" 
                                                    : "border-[#1a1a1a]/[0.08] text-[#5a5a5a]/40"
                                        }`} aria-hidden="true">
                                            {done ? "✓" : i + 1}
                                        </div>
                                        <span>{label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </div>
                </nav>

                {/* Footer text pushed to bottom by mt-auto */}
                <div className="mt-auto pt-4 border-t border-[#e8e4dd]">
                    <p className="text-[10px] text-[#5a5a5a] leading-relaxed tracking-wide">
                        Progress saved automatically.<br />
                        You can leave and return anytime.
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="p-6 sm:p-8 md:px-[56px] md:py-[48px] w-full max-w-[760px] mx-auto h-[100dvh] flex flex-col relative z-10 overflow-y-auto scroll-smooth" aria-label="Estimator form">
                {/* Mobile Header */}
                <div className="md:hidden mb-6 border-b border-[#1a1a1a]/[0.06] pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-[12px] tracking-[0.1em] uppercase text-[#8b6f47] font-semibold m-0">Cost Estimator</h1>
                        <span className="text-[10px] font-mono text-[#8b6f47] font-semibold">{progress}%</span>
                    </div>
                    {/* Mobile progress bar */}
                    <div className="h-[3px] bg-[#e8e4dd] rounded-full overflow-hidden mb-3">
                        <motion.div
                            className="h-full bg-[#8b6f47] rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#8b6f47] bg-[#8b6f47] text-white flex items-center justify-center text-[11px] font-semibold shrink-0 shadow-[0_0_8px_rgba(139,111,71,0.3)]" aria-hidden="true">
                            {currentStep + 1}
                        </div>
                        <span className="text-[#1a1a1a] font-semibold text-[14px]">{STEP_LABELS[currentStep]}</span>
                    </div>
                    {/* Mobile step dots */}
                    <div className="flex items-center gap-1.5 mt-2" aria-hidden="true">
                        {STEP_LABELS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i <= currentStep ? "bg-[#8b6f47]" : "bg-[#e8e4dd]"
                                } ${i === currentStep ? "w-4" : "w-1.5"}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <div className="text-[12px] tracking-[0.1em] uppercase text-[#8b6f47] font-bold mb-2 font-mono" aria-hidden="true">Step {currentStep + 1} of {STEP_LABELS.length}</div>
                    <h2 className="text-[28px] sm:text-[32px] md:text-[36px] font-semibold m-0 mb-2 tracking-tight font-serif text-[#1a1a1a]">{stepInfo.title}</h2>
                    <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[#1a1a1a]/70 font-medium mb-8 sm:mb-10">{stepInfo.subtitle}</p>
                    {currentStep === 0 && (
                        <div className="mb-8 rounded-[8px] border border-[#e8e4dd] bg-white/80 p-4 text-sm text-[#5a5a5a] shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
                            <span className="text-[#8b6f47] font-semibold">
                                {discoveryApplied ? "Blueprint connected: " : "Blueprint optional: "}
                            </span>
                            {discoveryApplied
                                ? `This estimate will carry ${discoveryName || "your Discovery profile"} into service and finish recommendations.`
                                : ECOSYSTEM_COPY.estimatorWithoutBlueprint}
                        </div>
                    )}

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
                            {currentStep === 2 && <StepLocation formData={formData} updateField={updateField} updateFields={updateFields} />}
                            {currentStep === 3 && <StepBudget formData={formData} updateField={updateField} />}
                            {currentStep === 4 && <StepServices formData={formData} updateField={updateField} />}
                            {currentStep === 5 && <StepAddons formData={formData} updateField={updateField} />}
                            {currentStep === 6 && <StepTimeline formData={formData} updateField={updateField} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2 mt-8 sm:mt-[40px] pt-[20px] sm:pt-[24px] border-t border-[#1a1a1a]/[0.06]">
                    {/* Validation message */}
                    {validationMessage && (
                        <motion.p
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
                            className="px-5 sm:px-[28px] py-[12px] sm:py-[14px] bg-transparent border border-[#e8e4dd] text-[#1a1a1a] rounded-[10px] text-[14px] sm:text-[15px] font-semibold transition-all duration-200 hover:bg-[#8b6f47]/[0.04] hover:border-[#8b6f47]/40 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                        </button>
                        <button 
                            type="button"
                            onClick={nextStep} 
                            disabled={!canProceed || isSaving}
                            aria-label={currentStep === STEP_LABELS.length - 1 ? "Get your estimate" : `Continue to ${STEP_LABELS[currentStep + 1] || "next step"}`}
                            className="px-5 sm:px-[28px] py-[12px] sm:py-[14px] bg-[#8b6f47] text-white hover:bg-[#705939] rounded-[10px] text-[14px] sm:text-[15px] font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(139,111,71,0.2)] hover:shadow-[0_6px_20px_rgba(139,111,71,0.3)] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
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
        </div>
    );
}
