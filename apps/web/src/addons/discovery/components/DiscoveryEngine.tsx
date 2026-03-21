import { useState, useCallback, useEffect, useMemo, Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Stage, AestheticScores, UserSignals, AIAestheticResult } from "@/types/discovery";
import { visualImages } from "@/constants/discovery";
import { getArchetype } from "../core/archetype";
import { normalizeScore } from "../core/normalization";
import { initialScores, addScores } from "../core/scoring";
import { initialSignals, resetSession } from "../flow/session";
import { getNextStage } from "../flow/transitions";
import { track, startSession, completeSession, trackQuizStarted, trackQuizCompleted } from "../infrastructure/analytics/tracker";
import WelcomeScreen from "./WelcomeScreen";
import ReflectionPrompt from "./ReflectionPrompt";
import LifestyleReflection from "./LifestyleReflection";
import VisualInstinct from "./VisualInstinct";
import AdjectiveSelection from "./AdjectiveSelection";
import EmotionalMapping from "./EmotionalMapping";
import MaterialResonance from "./MaterialResonance";
import LightCalibration from "./LightCalibration";
import PatternPreview from "./PatternPreview";
import AnalysisPhase from "./AnalysisPhase";
import MiniResultPreview from "./MiniResultPreview";
import LeadGatePhase from "./LeadGatePhase";
const ResultsReveal = lazy(() => import("./ResultsReveal"));
import ProgressBar from "./ProgressBar";
import DotPattern from "@/components/magicui/dot-pattern";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";

// Dot-nav stage map for the compact sidebar
const DOT_NAV_STAGES: { stage: Stage; label: string }[] = [
    { stage: Stage.Reflection, label: "Essence" },
    { stage: Stage.Lifestyle, label: "Rituals" },
    { stage: Stage.VisualInstinct, label: "Instinct" },
    { stage: Stage.AdjectiveSelection, label: "Language" },
    { stage: Stage.EmotionalMapping, label: "Feeling" },
    { stage: Stage.MaterialResonance, label: "Touch" },
    { stage: Stage.LightCalibration, label: "Atmosphere" },
    { stage: Stage.PatternPreview, label: "Synthesis" },
    { stage: Stage.Analysis, label: "Analysis" },
    { stage: Stage.MiniResult, label: "Preview" },
];

export interface DiscoveryConfig {
    firmName?: string;
    availableModes?: ("quick" | "deep" | "both")[];
}

export interface DiscoveryEngineProps {
    config?: DiscoveryConfig;
    onComplete?: (result: { scores: AestheticScores; signals: UserSignals; aiResult?: AIAestheticResult | null }) => void;
}

export const DiscoveryEngine = ({ config, onComplete }: DiscoveryEngineProps = {}) => {
    const [stage, setStage] = useState<Stage>(Stage.Welcome);
    const [mode, setMode] = useState<"quick" | "deep">("deep");
    const [scores, setScores] = useState<AestheticScores>(initialScores);
    const [signals, setSignals] = useState<UserSignals>(initialSignals);
    const [aiResult, setAiResult] = useState<AIAestheticResult | null>(null);
    const [showWipe, setShowWipe] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());

    const archetype = useMemo(() => getArchetype(scores), [scores]);

    const handleRetake = useCallback(() => {
        if (sessionId && aiResult) {
            track("restart_clicked", { sessionId, archetypeShown: aiResult.identityName });
        }
        const defaultSession = resetSession();
        setScores(defaultSession.scores);
        setSignals(defaultSession.signals);
        setAiResult(defaultSession.aiResult);
        setMode(defaultSession.mode);
        setStage(defaultSession.stage);
        setSessionId(null);
    }, [sessionId, aiResult]);

    const transitionToStage = useCallback((nextStage: Stage) => {
        // Preload heavy results component when getting close
        if (nextStage === Stage.PatternPreview || nextStage === Stage.Analysis) {
            import("./ResultsReveal").catch(() => { });
        }

        setShowWipe(true);
        setTimeout(() => {
            setStage(nextStage);
            setTimeout(() => setShowWipe(false), 300);
        }, 250);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (sessionId) {
            track("step_viewed", { stepName: Stage[stage], sessionId });
        }
    }, [stage, sessionId]);

    const updateScores = useCallback((partial: Partial<AestheticScores>) => {
        setScores((prev) => addScores(prev, partial));
    }, []);

    const handleStart = useCallback(async (m: "quick" | "deep") => {
        setMode(m);
        const sid = await startSession(m);
        setSessionId(sid);
        setStartTime(Date.now());
        trackQuizStarted(sid, m);
        transitionToStage(getNextStage(Stage.Welcome, m));
    }, [transitionToStage]);

    const handleReflectionComplete = useCallback(
        (answers: { question: string; answer: string }[]) => {
            if (sessionId) track("step_completed", { stepName: "Reflection", sessionId });
            setSignals((prev) => ({ ...prev, reflectionAnswers: answers }));
            transitionToStage(getNextStage(Stage.Reflection, mode));
        }, [mode, transitionToStage, sessionId]
    );

    const handleLifestyleComplete = useCallback(
        (partial: Partial<AestheticScores>, labels?: string[]) => {
            if (sessionId) track("step_completed", { stepName: "Lifestyle", sessionId });
            updateScores(partial);
            if (labels) {
                setSignals((prev) => ({ ...prev, lifestyleChoices: [...prev.lifestyleChoices, ...labels] }));
            }
            transitionToStage(getNextStage(Stage.Lifestyle, mode));
        }, [mode, transitionToStage, sessionId, updateScores]
    );

    const handleVisualComplete = useCallback(
        (partial: Partial<AestheticScores>, selectedIds?: number[]) => {
            if (sessionId) track("step_completed", { stepName: "VisualInstinct", sessionId });
            updateScores(partial);
            if (selectedIds) {
                const tags = selectedIds.map((id) => visualImages.find((i) => i.id === id)?.tags).filter(Boolean) as Partial<AestheticScores>[];
                setSignals((prev) => ({ ...prev, selectedImageIds: selectedIds, selectedImageTags: tags }));
            }
            transitionToStage(getNextStage(Stage.VisualInstinct, mode));
        }, [mode, transitionToStage, sessionId, updateScores]
    );

    const handleAdjectiveComplete = useCallback(
        (partial: Partial<AestheticScores>, adjectives: string[], freeText: string) => {
            if (sessionId) track("step_completed", { stepName: "AdjectiveSelection", sessionId });
            updateScores(partial);
            setSignals((prev) => ({ ...prev, selectedAdjectives: adjectives, freeTextReflection: freeText }));
            transitionToStage(getNextStage(Stage.AdjectiveSelection, mode));
        }, [mode, transitionToStage, sessionId, updateScores]
    );

    const handleEmotionalComplete = useCallback(
        (partial: Partial<AestheticScores>, sliderValues?: { label: string; value: number }[]) => {
            if (sessionId) track("step_completed", { stepName: "EmotionalMapping", sessionId });
            updateScores(partial);
            if (sliderValues) setSignals((prev) => ({ ...prev, sliderValues }));
            transitionToStage(getNextStage(Stage.EmotionalMapping, mode));
        }, [mode, transitionToStage, sessionId, updateScores]
    );

    const handleMaterialComplete = useCallback(
        (partial: Partial<AestheticScores>, materialName?: string) => {
            if (sessionId) track("step_completed", { stepName: "MaterialResonance", sessionId });
            updateScores(partial);
            if (materialName) setSignals((prev) => ({ ...prev, materialChoice: materialName }));
            transitionToStage(getNextStage(Stage.MaterialResonance, mode));
        }, [mode, transitionToStage, sessionId, updateScores]
    );

    const handleLightComplete = useCallback(
        (partial: Partial<AestheticScores>, lightName?: string) => {
            if (sessionId) track("step_completed", { stepName: "LightCalibration", sessionId });
            updateScores(partial);
            if (lightName) setSignals((prev) => ({ ...prev, lightPreference: lightName }));
            transitionToStage(getNextStage(Stage.LightCalibration, mode));
        }, [mode, transitionToStage, sessionId, updateScores]
    );

    const handlePatternComplete = useCallback(() => {
        if (sessionId) track("step_completed", { stepName: "PatternPreview", sessionId });
        transitionToStage(getNextStage(Stage.PatternPreview, mode));
    }, [mode, transitionToStage, sessionId]);

    const handleAnalysisComplete = useCallback(
        (result?: AIAestheticResult) => {
            if (sessionId) track("step_completed", { stepName: "Analysis", sessionId });
            if (result) setAiResult(result);
            transitionToStage(getNextStage(Stage.Analysis, mode));
        }, [mode, sessionId, transitionToStage]
    );

    const handleMiniResultComplete = useCallback(() => {
        if (sessionId) track("step_completed", { stepName: "MiniResult", sessionId });
        transitionToStage(getNextStage(Stage.MiniResult, mode));
    }, [sessionId, transitionToStage, mode]);

    const handleLeadCaptureComplete = useCallback(() => {
        if (sessionId) {
            const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
            trackQuizCompleted(sessionId, archetype.name, totalSeconds);
            completeSession(sessionId, archetype.name, totalSeconds);
        }
        setStage(getNextStage(Stage.LeadCapture, mode));
    }, [sessionId, mode, archetype.name, startTime]);

    const normalizedScores: AestheticScores = {
        minimalism: normalizeScore(scores.minimalism),
        warmth: normalizeScore(scores.warmth),
        social: normalizeScore(scores.social),
        structure: normalizeScore(scores.structure),
        novelty: normalizeScore(scores.novelty),
    };

    const currentSignals: UserSignals = { ...signals, scores: normalizedScores };

    const isQuizStage = stage > Stage.Welcome && stage < Stage.Results;
    const isResultsStage = stage === Stage.Results;

    return (
        <div className={cn(
            "w-full text-foreground relative flex flex-col lg:flex-row",
            // Deep warm-ink background for quiz stages and results
            isQuizStage ? "bg-site-bg h-screen overflow-hidden" : isResultsStage ? "bg-site-bg min-h-screen" : "bg-site-bg min-h-screen"
        )}>
            {/* Cinematic wipe overlay */}
            <AnimatePresence>
                {showWipe && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[100] origin-left bg-foreground"
                    />
                )}
            </AnimatePresence>

            {/* Warm center ambient glow — only on quiz stages */}
            {isQuizStage && (
                <div
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        background: "radial-gradient(ellipse 70% 50% at 60% 40%, rgba(26,26,26,0.95) 0%, #0F0F10 70%)",
                    }}
                />
            )}

            {/* Grain texture overlay for depth */}
            {isQuizStage && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                        backgroundSize: "300px 300px",
                    }}
                />
            )}

            {/* ── COMPACT DOT-NAV SIDEBAR (72px) ── */}
            {isQuizStage && (
                <div className="hidden lg:flex flex-col w-[72px] shrink-0 h-full border-r border-site-border bg-site-bg/80 backdrop-blur-xl relative z-10">
                    {/* Numbered dot nav */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                        {DOT_NAV_STAGES.map(({ stage: s, label }, idx) => {
                            const isActive = stage === s;
                            const isCompleted = stage > s;
                            return (
                                <div key={s} className="relative group flex flex-col items-center gap-1">
                                    {/* Dot — 8px active, 5px inactive */}
                                    <div className={`rounded-full transition-all duration-500 ${isActive
                                        ? "w-2.5 h-2.5 bg-site-crimson shadow-[0_0_10px_rgba(227, 83, 54,0.6)]"
                                        : isCompleted
                                            ? "w-1.5 h-1.5 bg-site-crimson/30"
                                            : "w-1.5 h-1.5 bg-site-text-meta/20"
                                        }`} />
                                    {/* Section number — always visible at 30%, active at full */}
                                    <span className={`text-[9px] font-mono tabular-nums transition-all duration-300 ${isActive ? "text-site-crimson/90" :
                                        isCompleted ? "text-site-text-meta/40" : "text-site-text-meta/20"
                                        }`}>
                                        {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    {/* Hover tooltip */}
                                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-site-bg-card border border-site-border text-[10px] text-site-text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                        {label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Bottom brand mark */}
                    <div className="shrink-0 pb-5 flex flex-col items-center gap-1.5">
                        <div className="w-px h-6 bg-gradient-to-t from-white/10 to-transparent" />
                        <span className="writing-vertical-rl rotate-180 text-[7px] tracking-[0.25em] uppercase text-white/15 font-mono">CE</span>
                    </div>
                </div>
            )}

            {/* ── MAIN CONTENT AREA ── */}
            <main className={cn(
                "flex-1 relative flex flex-col z-10",
                isQuizStage ? "lg:h-full overflow-hidden" : "w-full min-h-screen"
            )}>
                {/* Subtle dot texture */}
                {!isQuizStage && (
                    <DotPattern
                        width={20}
                        height={20}
                        cx={1}
                        cy={1}
                        cr={1}
                        className="absolute inset-0 -z-10 opacity-20 text-neutral-600 h-full w-full"
                    />
                )}

                {/* Mobile progress bar */}
                {isQuizStage && (
                    <div className="lg:hidden absolute top-0 left-0 right-0 z-50">
                        <ProgressBar currentStage={stage} variant="horizontal" />
                    </div>
                )}

                {/* Scrollable stage content */}
                <div className={cn(
                    "flex-1",
                    isQuizStage ? "overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide" : ""
                )}>
                    <div className="h-full flex flex-col">
                        <div className={cn(
                            "flex-1 w-full relative z-10 transition-all duration-500",
                            (stage === Stage.Welcome || stage === Stage.Results || stage === Stage.Lifestyle || stage === Stage.Reflection)
                                ? "max-w-none px-0 h-full"
                                : "h-full max-w-none px-0"
                        )}>
                            <AnimatePresence mode="wait">
                                {stage === Stage.Welcome && <WelcomeScreen key="welcome" onStart={handleStart} config={config} />}
                                {stage === Stage.Reflection && (
                                    <ReflectionPrompt key="reflection" onComplete={handleReflectionComplete} />
                                )}
                                {stage === Stage.Lifestyle && (
                                    <LifestyleReflection key="lifestyle" onComplete={handleLifestyleComplete} />
                                )}
                                {stage === Stage.VisualInstinct && (
                                    <VisualInstinct key="visual" sessionId={sessionId} onComplete={handleVisualComplete} />
                                )}
                                {stage === Stage.AdjectiveSelection && (
                                    <AdjectiveSelection key="adjectives" sessionId={sessionId} onComplete={handleAdjectiveComplete} />
                                )}
                                {stage === Stage.EmotionalMapping && (
                                    <EmotionalMapping key="emotional" onComplete={handleEmotionalComplete} />
                                )}
                                {stage === Stage.MaterialResonance && (
                                    <MaterialResonance key="material" onComplete={handleMaterialComplete} />
                                )}
                                {stage === Stage.LightCalibration && (
                                    <LightCalibration key="light" onComplete={handleLightComplete} />
                                )}
                                {stage === Stage.PatternPreview && (
                                    <PatternPreview
                                        key="pattern"
                                        scores={normalizedScores}
                                        signals={currentSignals}
                                        onComplete={handlePatternComplete}
                                    />
                                )}
                                {stage === Stage.Analysis && (
                                    <AnalysisPhase
                                        key="analysis"
                                        userSignals={currentSignals}
                                        fallbackArchetype={archetype}
                                        onComplete={handleAnalysisComplete}
                                    />
                                )}
                                {stage === Stage.MiniResult && (
                                    <MiniResultPreview
                                        key="mini-result"
                                        archetype={archetype}
                                        scores={normalizedScores}
                                        onComplete={handleMiniResultComplete}
                                    />
                                )}
                                {stage === Stage.LeadCapture && (
                                    <LeadGatePhase
                                        key="gate"
                                        sessionId={sessionId}
                                        scores={normalizedScores}
                                        archetype={archetype}
                                        signals={currentSignals}
                                        onComplete={handleLeadCaptureComplete}
                                    />
                                )}
                                {stage === Stage.Results && (
                                    <Suspense fallback={
                                        <div className="w-full h-[60vh] flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 rounded-full border border-site-border border-t-site-crimson animate-spin" />
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-site-text-meta font-mono">Loading Results...</p>
                                            </div>
                                        </div>
                                    }>
                                        <ResultsReveal
                                            key="results"
                                            scores={normalizedScores}
                                            archetype={archetype}
                                            aiResult={aiResult}
                                            sessionId={sessionId}
                                            signals={currentSignals}
                                            onRetake={handleRetake}
                                            onComplete={onComplete ? () => onComplete({ scores: normalizedScores, signals: currentSignals, aiResult }) : undefined}
                                        />
                                    </Suspense>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Subtle branding — Welcome/Results only */}
                {(stage === Stage.Welcome || stage === Stage.Results) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="fixed bottom-12 left-8 z-20 pointer-events-none hidden lg:flex flex-col items-center gap-4"
                    >
                        <div className="w-[1px] h-24 bg-gradient-to-t from-foreground/10 to-transparent" />
                        <div className="writing-vertical-rl rotate-180">
                            <AnimatedShinyText className="text-[10px] uppercase tracking-[0.6em] font-light">
                                AESTHETIC DISCOVERY ENGINE / v2.1
                            </AnimatedShinyText>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};
