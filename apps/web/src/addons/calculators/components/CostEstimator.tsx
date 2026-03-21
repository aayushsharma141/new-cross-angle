/* ═══════════════════════════════════════════════
   Interior Cost Estimator — Main Orchestrator
   Fixed 3-panel split layout (Discovery-style)
   Left 30%: Info  |  10%: Progress  |  60%: Content
   ═══════════════════════════════════════════════ */

import { useEffect, useRef } from "react";
import { useCalculatorStore } from "./hooks/useCalculatorStore";
import { StepPropertyType } from "./steps/StepPropertyType";
import { StepPropertyDetails } from "./steps/StepPropertyDetails";
import { StepLocation } from "./steps/StepLocation";
import { StepBudget } from "./steps/StepBudget";
import { StepServices } from "./steps/StepServices";
import { StepAddons } from "./steps/StepAddons";
import { StepTimeline } from "./steps/StepTimeline";
import { StepResults } from "./steps/StepResults";
import { THEME } from "./data/pricing-config";
import { motion, AnimatePresence } from "framer-motion";

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

const navBtnStyle = "px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98]";

export function CostEstimator() {
    const {
        formData, currentStep, showResults, estimate,
        canProceed, isSaving,
        updateField, updateFields, nextStep, prevStep, goToStep,
        reset, saveLead,
    } = useCalculatorStore();

    useEffect(() => {
        if (showResults && estimate) {
            saveLead();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showResults]);

    // Refs for dynamic progress bar styles
    const largeProgressBarRef = useRef<HTMLDivElement>(null);
    const smallProgressBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const pct = ((currentStep + 1) / STEP_LABELS.length) * 100;
        if (largeProgressBarRef.current) {
            largeProgressBarRef.current.style.setProperty("--progress", `${pct}%`);
        }
        if (smallProgressBarRef.current) {
            smallProgressBarRef.current.style.setProperty("--progress", `${pct}%`);
        }
    }, [currentStep]);

    const stepInfo = STEP_DESCRIPTIONS[currentStep] ?? STEP_DESCRIPTIONS[0];

    /* ── Results mode: full-width, no side panels ── */
    if (showResults) {
        return (
            <div className="w-full h-screen bg-site-bg overflow-y-auto font-sans relative">
                <a href="/" className="absolute top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2 bg-site-bg-card/50 backdrop-blur-md rounded-none text-xs font-bold uppercase tracking-widest text-site-text hover:bg-site-crimson hover:text-site-bg transition-all border border-site-border">
                    <span>←</span> Home
                </a>
                <div className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
                    <StepResults
                        formData={formData}
                        estimate={estimate}
                        onReset={reset}
                        onBack={prevStep}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen bg-site-bg font-sans overflow-hidden text-site-text">

            {/* ═══ LEFT PANEL ═══ */}
            <div
                className="hidden lg:flex lg:w-[30%] min-w-[300px] h-full flex-col justify-between border-r border-site-border p-12 relative overflow-hidden shrink-0 bg-gradient-to-b from-site-bg-card to-site-bg"
            >
                {/* Subtle dot pattern overlay */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] bg-[length:20px_20px]" />

                <div className="relative z-10">
                    <div className="text-[10px] text-site-crimson font-black uppercase tracking-[0.4em] mb-4">
                        Cost Estimator
                    </div>
                    <h2 className="text-3xl font-black text-site-text-heading leading-tight tracking-tighter mb-6 uppercase">
                        {stepInfo.title}
                    </h2>
                    <p className="text-site-text-muted text-sm leading-relaxed max-w-[240px]">
                        {stepInfo.subtitle}
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="w-10 h-0.5 bg-site-crimson/40 mb-6" />
                    <h3 className="hidden lg:block text-xl font-serif font-bold text-site-text-heading mb-2">Estimate Your Dream Space</h3>
                    <p className="text-[10px] text-site-text-meta font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                        Get a transparent, instant estimate for your interior design project. No hidden costs, just honest pricing.
                    </p>
                    {currentStep === 0 && (
                        <a href="/" className="inline-flex items-center gap-2 mt-6 text-xs font-bold uppercase tracking-widest text-site-text hover:text-site-crimson transition-colors">
                            <span className="text-lg">←</span> Home
                        </a>
                    )}
                </div>
            </div>

            {/* ═══ MIDDLE PANEL ═══ */}
            <div className="flex lg:flex-col lg:w-20 w-full h-auto lg:h-full items-center justify-between lg:justify-center border-b lg:border-b-0 lg:border-r border-site-border bg-site-bg-card/50 p-4 lg:p-0 relative shrink-0">
                <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-site-border" />
                <div
                    ref={largeProgressBarRef}
                    className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-px bg-site-crimson transition-all duration-700 ease-out shadow-[0_0_15px_rgba(227, 83, 54,0.5)] h-[var(--progress)]"
                />
                <div className="lg:hidden absolute bottom-0 left-0 right-0 h-[2px] bg-site-border">
                    <div
                        ref={smallProgressBarRef}
                        className="h-full bg-site-crimson transition-all duration-700 ease-out shadow-[0_0_10px_rgba(227, 83, 54,0.5)] w-[var(--progress)]"
                    />
                </div>

                <div className="flex lg:flex-col items-center justify-between lg:justify-around lg:h-[85%] w-full relative z-10 px-4 lg:px-0">
                    {STEP_LABELS.map((label, i) => {
                        const done = i < currentStep;
                        const active = i === currentStep;
                        return (
                            <button
                                key={i}
                                onClick={() => i < currentStep && goToStep(i)}
                                title={label}
                                className={`group flex flex-col items-center gap-1.5 transition-all outline-none ${i <= currentStep ? "cursor-pointer" : "cursor-default opacity-40"}`}
                            >
                                <div className={`
                                    w-7 h-7 lg:w-8 lg:h-8 rounded-none flex items-center justify-center text-[10px] font-black transition-all duration-300
                                    ${done ? "bg-site-crimson text-site-bg" : active ? "bg-site-crimson text-site-bg shadow-[0_0_15px_rgba(227, 83, 54,0.4)]" : "bg-site-bg-card text-site-text-meta border border-site-border"}
                                    ${active ? "scale-110 ring-4 ring-site-crimson/20" : "scale-100"}
                                `}>
                                    {done ? "✓" : i + 1}
                                </div>
                                <span className={`
                                    hidden lg:block text-[8px] font-black uppercase tracking-widest transition-colors duration-300
                                    ${active ? "text-site-crimson" : done ? "text-site-text-muted" : "text-site-text-meta"}
                                `}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ RIGHT PANEL ═══ */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="lg:hidden p-6 border-b border-site-border bg-site-bg/80 backdrop-blur-md">
                    <div className="text-[9px] text-site-crimson font-black uppercase tracking-[0.3em] mb-1">
                        {labelForStep(currentStep)}
                    </div>
                    <h2 className="text-xl font-black text-site-text-heading tracking-tight uppercase">
                        {stepInfo.title}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-16 lg:py-16 pb-32">
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
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
                </div>

                <div className="absolute bottom-0 left-0 right-0 border-t border-site-border bg-site-bg/90 backdrop-blur-2xl p-4 pb-6 lg:px-16 lg:py-6 flex justify-between items-center z-20">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`
                            ${navBtnStyle} text-site-text-muted border border-site-border hover:text-site-crimson hover:border-site-crimson/50 rounded-none
                            ${currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}
                        `}
                    >
                        Back
                    </button>

                    <div className="hidden sm:flex flex-col items-center">
                        <div className="text-[10px] text-site-text-meta font-black uppercase tracking-widest mb-1.5 grayscale opacity-50">
                            Progress
                        </div>
                        <div className="flex gap-1">
                            {STEP_LABELS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-1 rounded-none transition-all duration-500 ${i <= currentStep ? "bg-site-crimson" : "bg-site-border"}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={nextStep}
                        disabled={!canProceed || isSaving}
                        className={`
                            ${navBtnStyle} min-w-[140px] shadow-lg rounded-none
                            ${canProceed ? "bg-site-crimson text-site-bg hover:bg-site-crimson/90 shadow-site-crimson/10" : "bg-site-bg-card text-site-text-meta cursor-not-allowed"}
                        `}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Please wait
                            </span>
                        ) : currentStep === STEP_LABELS.length - 1 ? (
                            "Get Estimate →"
                        ) : (
                            "Continue →"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function labelForStep(step: number) {
    return STEP_LABELS[step] || "Step";
}
