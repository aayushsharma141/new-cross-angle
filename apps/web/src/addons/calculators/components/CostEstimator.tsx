import { useEffect, useRef } from "react";
import { useCalculatorStore } from "./hooks/useCalculatorStore";
import { useFlowConfig } from "@/hooks/useFlowConfig";
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
import { WorkspacePanel } from "@/components/patterns/WorkspacePanel";
import { ECOSYSTEM_COPY } from "@/addons/_shared/ecosystemCopy";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoIcon from "@/assets/logo-icon.png";
import { formatCurrency } from "./data/format-utils";
import { SERVICES as DEFAULT_SERVICES, BUDGET_SLIDER } from "./data/pricing-config";

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
        reset, saveLead, submitState, alcsEstimatorResponse,
    } = useCalculatorStore();

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
            void saveLead();
        }
    }, [showResults, estimate, saveLead]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only act on bare-page keystrokes. On a focused control, Enter already
            // activates it (a second nextStep() here skipped a step) and arrows
            // belong to sliders, radiogroups and text caret movement.
            const target = e.target as HTMLElement;
            if (
                e.defaultPrevented ||
                e.metaKey || e.ctrlKey || e.altKey ||
                target.closest("input, textarea, select, button, a, [role='radio'], [role='slider'], [role='combobox'], [role='listbox'], [contenteditable='true']")
            ) {
                return;
            }
            if (e.key === "Enter" || e.key === "ArrowRight") {
                if (canProceed && !isSaving && !showResults) {
                    nextStep();
                }
            } else if (e.key === "ArrowLeft") {
                if (!showResults) {
                    if (currentStep === 0 && onBack) {
                        onBack();
                    } else if (currentStep > 0) {
                        prevStep();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canProceed, isSaving, showResults, currentStep, onBack, nextStep, prevStep]);

    // Prefetch all configuration data on mount so there's no loading delay between steps
    useFlowConfig("property_types");
    useFlowConfig("bhk_presets");
    useFlowConfig("villa_bhk");
    useFlowConfig("project_stages_map");
    useFlowConfig("renovation_stages");
    useFlowConfig("renovation_rooms");
    useFlowConfig("location_data");
    useFlowConfig("city_tiers");
    useFlowConfig("investment_presets");
    const { data: services = DEFAULT_SERVICES } = useFlowConfig<typeof DEFAULT_SERVICES>("services");
    useFlowConfig("execution_tiers");
    useFlowConfig("addons");
    useFlowConfig("timeline_options");


    const progress = Math.round((currentStep / STEP_LABELS.length) * 100);
    const stepInfo = STEP_DESCRIPTIONS[currentStep] ?? STEP_DESCRIPTIONS[0];

    const sidebarContent = (
        <div className="flex flex-col h-full relative z-10 p-6 md:p-8">
            <a href="/" className="flex items-center gap-2 mb-8 group hover:opacity-75 transition-opacity focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:outline-none focus-visible:ring-offset-2 rounded-lg" aria-label="Return to CrossAngle Home">
                <img src={logoUrl} alt="CrossAngle Logo" className="h-5 w-auto shrink-0 animate-in fade-in duration-300" />
                <h1 className="text-[14px] tracking-[0.08em] uppercase text-foreground font-semibold font-label m-0">
                    Digital Studio
                </h1>
            </a>
                
                {discoveryApplied && (
                    <div role="status" aria-live="polite" className="mb-8 p-4 bg-kiro-accent-light rounded-[10px] border-l-[3px] border-kiro-accent text-[13px] relative bg-kiro-accent/[0.06] border border-kiro-accent/20">
                        <button type="button" onClick={dismissDiscovery} aria-label="Dismiss personalization banner" className="absolute top-2 right-2 text-kiro-accent hover:text-kiro-ink transition-colors p-1 rounded-full hover:bg-kiro-accent/10">
                            <X className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] font-mono tracking-wider uppercase text-kiro-accent block mb-1">Discovery Blueprint</span>
                        <strong className="text-kiro-ink">Personalized for {discoveryName}</strong><br/>
                        <span className="text-kiro-inkSoft mt-1 block">{discoveryRationale || ECOSYSTEM_COPY.estimatorWithBlueprint}</span>
                    </div>
                )}

                {/* Progress bar */}
                <div className="mb-8 relative">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-mono tracking-wider uppercase text-kiro-ink/50">Journey</span>
                        <motion.span
                            key={progress}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[12px] font-mono text-kiro-accent font-semibold"
                        >
                            {progress}%
                        </motion.span>
                    </div>
                    <div role="progressbar" aria-label="Estimate progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-[3px] bg-kiro-ink/[0.07] relative overflow-hidden rounded-full">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-kiro-accent to-kiro-accent/70 rounded-full"
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
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        disabled={!isClickable}
                                        aria-current={active ? "step" : undefined}
                                        aria-label={`Step ${i + 1}: ${label}${done ? " (completed)" : active ? " (current)" : ""}`}
                                        onClick={() => isClickable && goToStep(i)}
                                        className={`w-full flex items-center gap-3 py-2.5 text-[14px] transition-all duration-300 rounded-md px-1 -mx-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2 ${
                                            isClickable 
                                                ? "cursor-pointer text-kiro-ink hover:text-kiro-accent hover:bg-kiro-accent/[0.04] hover:-translate-y-0.5" 
                                                : "cursor-not-allowed text-kiro-inkSoft/70"
                                        } ${active ? "text-kiro-ink font-semibold" : done ? "text-kiro-accent" : ""}`}
                                    >
                                        <div className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[13px] font-semibold shrink-0 transition-all duration-300 bg-white group-hover:shadow-[0_0_8px_rgba(209,175,110,0.3)] ${
                                            active 
                                                ? "border-kiro-accent bg-kiro-accent text-white shadow-[0_0_8px_rgba(209,175,110,0.4)]" 
                                                : done 
                                                    ? "border-kiro-accent text-kiro-accent" 
                                                    : "border-kiro-ink/25 text-kiro-inkSoft/70"
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
                <div className="mt-auto pt-4 border-t border-kiro-line/60">
                    <p className="text-[12px] text-kiro-inkSoft leading-relaxed tracking-wide">
                        Progress saved automatically.<br />
                        You can leave and return anytime.
                    </p>
                </div>
        </div>
    );

    const mainContent = (
        <div className="p-6 pb-0 md:px-8 md:pt-8 md:pb-0 lg:px-12 lg:pt-12 lg:pb-0 w-full mx-auto h-[100dvh] flex flex-col relative z-10 overflow-hidden font-sans text-foreground" aria-label="Estimator form">
            {/* Ambient background decoration — always visible */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-kiro-accent/[0.04] blur-[120px]" />
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-kiro-accent/[0.03] blur-[80px]" />
                <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--kiro-ink)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
            {/* Animated background for results page */}
            {showResults && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <EstimatorBackground />
                </div>
            )}
            
            <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 pb-8">
                {showResults ? (
                    <div className="flex-1 flex flex-col min-h-0">
                        <StepResults
                            formData={formData}
                            estimate={estimate!}
                            discoveryApplied={discoveryApplied}
                            discoveryName={discoveryName}
                            discoveryRationale={discoveryRationale}
                            alcsEstimatorResponse={alcsEstimatorResponse}
                            onReset={reset}
                            onBack={prevStep}
                            submitState={submitState}
                            onRetrySubmit={() => void saveLead()}
                        />
                    </div>
                ) : (
                    <>
                        {/* Mobile Header */}
                <div className="md:hidden mb-6 border-b border-kiro-ink/[0.06] pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-[12px] tracking-[0.1em] uppercase text-kiro-accent font-semibold m-0">Cost Estimator</h1>
                        <span className="text-[12px] font-mono text-kiro-accent font-semibold">{progress}%</span>
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
                        <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-kiro-accent bg-kiro-accent text-white flex items-center justify-center text-[13px] font-semibold shrink-0 shadow-[0_0_8px_rgba(139,111,71,0.3)]" aria-hidden="true">
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

                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 mb-4">
                            <div className="text-[12px] tracking-[0.1em] uppercase text-kiro-accent font-bold mb-2 font-mono" aria-hidden="true">Step {currentStep + 1} of {STEP_LABELS.length}</div>
                    <div key={currentStep} className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
                        <h2 className="mb-2 text-[28px] sm:text-[32px] md:text-[36px] font-semibold tracking-tight font-serif text-kiro-ink">
                            {stepInfo.title}
                        </h2>
                        <p className="mb-8 sm:mb-10 text-[15px] sm:text-[16px] md:text-[18px] text-kiro-ink/70 font-medium">
                            {stepInfo.subtitle}
                        </p>
                    </div>
                    {currentStep === 0 && (
                        <div className="mb-8 rounded-[8px] border border-kiro-line bg-white/80 p-4 text-sm text-kiro-inkSoft shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
                            <span className="text-kiro-accent font-semibold">
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
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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

                <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-kiro-ink/[0.06] pb-6 md:pb-[14px] lg:pb-[14px] shrink-0 bg-kiro-bg">
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
                            className="px-5 sm:px-[28px] py-[12px] sm:py-[14px] bg-transparent border border-kiro-line text-kiro-ink rounded-[10px] text-[14px] sm:text-[15px] font-semibold transition-all duration-200 hover:bg-kiro-accent/[0.04] hover:border-kiro-accent/40 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                        </button>
                        <button 
                            type="button"
                            onClick={nextStep} 
                            disabled={!canProceed || isSaving}
                            aria-label={currentStep === STEP_LABELS.length - 1 ? "Get your estimate" : `Continue to ${STEP_LABELS[currentStep + 1] || "next step"}`}
                            className="relative overflow-hidden px-5 sm:px-[28px] py-[12px] sm:py-[14px] bg-kiro-accent text-white hover:bg-kiro-accent/90 rounded-[10px] text-[14px] sm:text-[15px] font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(139,111,71,0.2)] hover:shadow-[0_8px_24px_rgba(139,111,71,0.3)] hover:-translate-y-[2px] active:scale-[0.97] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-kiro-accent flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2 before:absolute before:inset-0 before:-translate-x-full hover:before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent group"
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
                </>
                )}
            </div>
        </div>
    );

    const briefRows: { label: string; value: string }[] = [
        { label: "Property", value: formData.propertyType ? formData.propertyType.replace(/_/g, " ") : "" },
        { label: "Area", value: currentStep >= 1 && formData.area > 0 ? `${formData.area.toLocaleString("en-IN")} sq ft` : "" },
        { label: "City", value: currentStep >= 2 ? formData.city : "" },
        { label: "Budget", value: currentStep >= 3 && formData.budgetAmount >= BUDGET_SLIDER.min ? formatCurrency(formData.budgetAmount) : "" },
        { label: "Service", value: currentStep >= 4 && formData.selectedService ? services.find(s => s.id === formData.selectedService)?.label ?? "" : "" },
    ];

    const dossierContent = (
        <aside className="flex flex-col p-6 md:p-8 h-full relative z-10" aria-label="Your brief so far">
            <h3 className="text-[12px] font-mono tracking-wider uppercase text-kiro-inkSoft mb-5">Your brief so far</h3>
            <dl className="m-0 divide-y divide-kiro-line">
                {briefRows.map(({ label, value }) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="text-[13px] text-kiro-inkSoft">{label}</dt>
                        <dd className={`m-0 text-right text-[14px] capitalize ${value ? "font-semibold text-kiro-ink" : "text-kiro-inkSoft/60"}`}>
                            {value || "Not set"}
                        </dd>
                    </div>
                ))}
            </dl>
            <p className="mt-6 text-[13px] text-kiro-inkSoft leading-relaxed">
                Your range appears once you finish the last step. Nothing is sent to us until you see your result.
            </p>
        </aside>
    );

    return (
        <WorkspacePanel sidebar={sidebarContent} mainContent={mainContent} dossierContent={dossierContent} />
    );
}
