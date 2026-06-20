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
import { saveSession, loadSession, clearSession } from "../flow/persistence";
import { startSession, trackQuizStarted, trackQuizCompleted, trackQuizStepViewed, trackQuizStepCompleted } from "../infrastructure/analytics/tracker";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { synthesizeConsultationIntelligence, detectInterpretationConflict } from "../alcs/intelligence";
import WelcomeScreen from "./WelcomeScreen";
import PropertyReality from "./PropertyReality";
import LifestyleReflection from "./LifestyleReflection";
import VisualInstinct from "./VisualInstinct";
import RoomPriority from "./RoomPriority";
import ReinterpretationGate from "./ReinterpretationGate";
import AdjectiveSelection from "./AdjectiveSelection";
import PivotQuestion from "./PivotQuestion";
import MaterialResonance from "./MaterialResonance";
import LightCalibration from "./LightCalibration";
import BudgetAlignment from "./BudgetAlignment";
import AnalysisPhase from "./AnalysisPhase";
import MiniResultPreview from "./MiniResultPreview";
import LeadGatePhase from "./LeadGatePhase";
const ResultsReveal = lazy(() => import("./ResultsReveal"));
import ProgressBar from "./ProgressBar";
import DotPattern from "@/components/magicui/dot-pattern";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import DiscoveryProgressSidebar from "./DiscoveryProgressSidebar";
import LiquidEther from "@/components/ReactBits/LiquidEther";



export interface DiscoveryConfig {
    firmName?: string;
    availableModes?: ("quick" | "deep" | "both")[];
}

interface DiscoveryEngineProps {
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
    const [resumePrompt, setResumePrompt] = useState<boolean>(false);
    const analytics = useAnalytics();
    const analyticsTrack = analytics.track.bind(analytics);

    // Check for saved session on mount
    useEffect(() => {
        const saved = loadSession();
        if (saved) setResumePrompt(true);
    }, []);

    // Persist session on stage change (only during active quiz)
    useEffect(() => {
        if (stage > Stage.Welcome && stage < Stage.Results) {
            saveSession({ stage, mode, scores, signals, sessionId });
        }
        if (stage === Stage.Results || stage === Stage.LeadCapture) {
            clearSession();
        }
    }, [stage, mode, scores, signals, sessionId]);

    const archetype = useMemo(() => getArchetype(scores), [scores]);


    const handleRetake = useCallback(() => {
            analyticsTrack("cta_clicked", { ctaId: "retake_quiz", destination: "quiz_start" });
        const defaultSession = resetSession();
        setScores(defaultSession.scores);
        setSignals(defaultSession.signals);
        setAiResult(defaultSession.aiResult);
        setMode(defaultSession.mode);
        setStage(defaultSession.stage);
        setSessionId(null);
        clearSession();
    }, [analyticsTrack]);

    const handleResume = useCallback(() => {
        const saved = loadSession();
        if (saved) {
            setStage(saved.stage);
            setMode(saved.mode);
            setScores(saved.scores);
            setSignals(saved.signals);
            setSessionId(saved.sessionId);
        }
        setResumePrompt(false);
    }, []);

    const handleDismissResume = useCallback(() => {
        clearSession();
        setResumePrompt(false);
    }, []);

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

    const handleSidebarNavigate = useCallback((targetStage: Stage) => {
        if (targetStage < stage) {
            transitionToStage(targetStage);
        }
    }, [stage, transitionToStage]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (sessionId) {
            trackQuizStepViewed(analyticsTrack, sessionId, Stage[stage]);
        }
    }, [stage, sessionId, analyticsTrack]);

    const updateScores = useCallback((partial: Partial<AestheticScores>) => {
        setScores((prev) => addScores(prev, partial));
    }, []);

    const handleStart = useCallback((m: "quick" | "deep", intent?: string) => {
        setMode(m);
        if (intent) {
            setSignals((prev) => ({ ...prev, intent }));
        }
        const sid = startSession();
        setSessionId(sid);
        setStartTime(Date.now());
        trackQuizStarted(analyticsTrack, sid, m);
        transitionToStage(getNextStage(Stage.Welcome, m));
    }, [transitionToStage, analyticsTrack]);

    const handlePivotComplete = useCallback(
        (data: { primaryValue: 'beauty' | 'practicality' | 'impression' | 'longevity' | 'identity' }) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "PivotQuestion");
            setSignals((prev) => ({ ...prev, primaryValue: data.primaryValue }));
            transitionToStage(getNextStage(Stage.PivotQuestion, mode));
        }, [mode, transitionToStage, sessionId, analyticsTrack]
    );

    const handlePropertyRealityComplete = useCallback(
        (data: { propertyType?: "Apartment" | "Villa" | "Independent Floor" | "Studio"; carpetArea?: number; projectScope?: "Cosmetic Renovation" | "Full Structural Renovation" | "Bare Shell" | "New Build" }) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "PropertyReality");
            setSignals((prev) => ({ ...prev, ...data }));
            transitionToStage(getNextStage(Stage.PropertyReality, mode));
        }, [mode, transitionToStage, sessionId, analyticsTrack]
    );

    const handleLifestyleComplete = useCallback(
        (data: { familyStructure?: 'Nuclear' | 'Joint' | 'Pets' | 'Elderly', cookingRole?: 'Daily Ritual' | 'Quick Utility' | 'Hosting', hostingFrequency?: 'Weekly' | 'Monthly' | 'Rarely' }) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "Lifestyle");
            setSignals((prev) => ({ ...prev, ...data }));
            transitionToStage(getNextStage(Stage.Lifestyle, mode));
        }, [mode, transitionToStage, sessionId, analyticsTrack]
    );

    const handleRoomPriorityComplete = useCallback(
        (data: {
            roomPriorities: Record<string, 'Must-Have' | 'Nice-to-Have'>;
            roomEmotionalWeights?: Record<string, import('@/types/discovery').RoomEmotionalWeight>;
            roomConflictResolution?: 'Multi-use' | 'Reduce Density';
        }) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "RoomPriority");
            setSignals((prev) => ({ ...prev, ...data }));
            transitionToStage(getNextStage(Stage.RoomPriority, mode));
        }, [mode, transitionToStage, sessionId, analyticsTrack]
    );

    const handleVisualComplete = useCallback(
        (partial: Partial<AestheticScores>, selectedIds?: number[]) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "VisualInstinct");
            updateScores(partial);

            // Compute updated scores for intelligence synthesis
            const updatedScores = addScores(scores, partial);

            if (selectedIds) {
                const tags = selectedIds.map((id) => visualImages.find((i) => i.id === id)?.tags).filter(Boolean) as Partial<AestheticScores>[];
                setSignals((prev) => {
                    const updatedSignals = { ...prev, selectedImageIds: selectedIds, selectedImageTags: tags };

                    // Synthesize full consultation intelligence
                    const intelligence = synthesizeConsultationIntelligence(updatedSignals, updatedScores);
                    return { ...updatedSignals, consultationIntelligence: intelligence };
                });
            }

            // Check for intent/visual conflict — route through gate if detected
            const conflictCheck = detectInterpretationConflict(
                { ...signals, selectedImageIds: selectedIds || [] } as UserSignals,
                updatedScores
            );

            if (conflictCheck.detected) {
                transitionToStage(Stage.ReinterpretationGate);
            } else {
                transitionToStage(getNextStage(Stage.VisualInstinct, mode));
            }
        }, [mode, transitionToStage, sessionId, updateScores, analyticsTrack, scores, signals]
    );

    const handleReinterpretationResolve = useCallback(
        (resolution: 'emotionally-quiet' | 'visually-luxurious' | 'balanced') => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "ReinterpretationGate");
            setSignals((prev) => ({
                ...prev,
                intentVisualConflict: resolution,
                consultationIntelligence: prev.consultationIntelligence
                    ? {
                        ...prev.consultationIntelligence,
                        interpretationConflict: {
                            ...prev.consultationIntelligence.interpretationConflict,
                            resolution,
                        },
                    }
                    : undefined,
            }));
            transitionToStage(getNextStage(Stage.VisualInstinct, mode)); // Continue normal flow
        }, [mode, transitionToStage, sessionId, analyticsTrack]
    );

    const handleAdjectiveComplete = useCallback(
        (partial: Partial<AestheticScores>, adjectives: string[], freeText: string) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "AdjectiveSelection");
            updateScores(partial);
            setSignals((prev) => ({ ...prev, selectedAdjectives: adjectives, freeTextReflection: freeText }));
            transitionToStage(getNextStage(Stage.AdjectiveSelection, mode));
        }, [mode, transitionToStage, sessionId, updateScores, analyticsTrack]
    );

    const handleMaterialComplete = useCallback(
        (partial: Partial<AestheticScores>, materialName?: string) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "MaterialResonance");
            updateScores(partial);
            if (materialName) setSignals((prev) => ({ ...prev, materialChoice: materialName }));
            transitionToStage(getNextStage(Stage.MaterialResonance, mode));
        }, [mode, transitionToStage, sessionId, updateScores, analyticsTrack]
    );

    const handleLightComplete = useCallback(
        (partial: Partial<AestheticScores>, lightName?: string) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "LightCalibration");
            updateScores(partial);
            if (lightName) setSignals((prev) => ({ ...prev, lightPreference: lightName }));
            transitionToStage(getNextStage(Stage.LightCalibration, mode));
        }, [mode, transitionToStage, sessionId, updateScores, analyticsTrack]
    );

    const handleBudgetComplete = useCallback(
        (data: { budgetBracket: string; luxuryResolution?: string }) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "BudgetAlignment");
            setSignals((prev) => ({ ...prev, ...data }));
            transitionToStage(getNextStage(Stage.BudgetAlignment, mode));
        }, [mode, transitionToStage, sessionId, analyticsTrack]
    );

    const handleAnalysisComplete = useCallback(
        (result?: AIAestheticResult) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "Analysis");
            if (result) setAiResult(result);
            transitionToStage(getNextStage(Stage.Analysis, mode));
        }, [mode, sessionId, transitionToStage, analyticsTrack]
    );

    const handleMiniResultComplete = useCallback(() => {
        if (sessionId) {
            trackQuizStepCompleted(analyticsTrack, sessionId, "MiniResult");
            // quiz_completed carries all funnel state — no separate session write needed
            const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
            trackQuizCompleted(analyticsTrack, sessionId, archetype.name, totalSeconds);
        }
        transitionToStage(getNextStage(Stage.MiniResult, mode));
    }, [sessionId, transitionToStage, mode, archetype.name, startTime, analyticsTrack]);

    const handleLeadCaptureComplete = useCallback(() => {
        if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, "LeadCapture");
        transitionToStage(getNextStage(Stage.LeadCapture, mode));
    }, [sessionId, analyticsTrack, transitionToStage, mode]);

    const normalizedScores: AestheticScores = {
        minimalism: normalizeScore(scores.minimalism),
        warmth: normalizeScore(scores.warmth),
        social: normalizeScore(scores.social),
        structure: normalizeScore(scores.structure),
        novelty: normalizeScore(scores.novelty),
    };

    const currentSignals: UserSignals = { ...signals, scores: normalizedScores };

    const isQuizStage = stage > Stage.Welcome && stage < Stage.Results;

    return (
        <div className={cn(
            "min-h-[100dvh] grid font-sans text-[#1a1a1a] relative",
            isQuizStage ? "grid-cols-1 md:grid-cols-[280px_1fr] bg-[#faf8f5] h-[100dvh] overflow-hidden" : "grid-cols-1 bg-[#faf8f5]"
        )}>
            {/* Cinematic wipe overlay */}
            <AnimatePresence>
                {showWipe && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[100] origin-left bg-[#1a1a1a]"
                    />
                )}
            </AnimatePresence>

            {/* Resume prompt */}
            <AnimatePresence>
                {resumePrompt && stage === Stage.Welcome && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        role="alertdialog"
                        aria-label="Resume previous session"
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] bg-[#ffffff] border border-[#e8e4dd] backdrop-blur-xl px-6 py-4 rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex items-center gap-4"
                    >
                        <p className="text-sm text-[#1a1a1a]/70">Continue where you left off?</p>
                        <button onClick={handleResume} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-[#8b6f47] text-white rounded-[6px] hover:bg-[#705939] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47]">Resume</button>
                        <button onClick={handleDismissResume} className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5a5a5a] hover:text-[#1a1a1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] rounded-[6px]">Start Over</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Morphic Premium Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
                <LiquidEther 
                    colors={
                        stage === Stage.Results || stage === Stage.LeadCapture
                            ? ['#1a1a1a', '#3a3a3a', '#5a5a5a'] // Dark mode colors for results
                            : ['#c9a96e', '#8b6f47', '#5a705e', '#faf8f5'] // Light luxury palette
                    }
                    mouseForce={25}
                    viscous={25}
                    isBounce={false}
                    autoDemo={true}
                    className="w-full h-full"
                />
            </div>

            {/* ── LUXURY PROGRESS SIDEBAR (260px) ── */}
            {isQuizStage && (
                <DiscoveryProgressSidebar
                    currentStage={stage}
                    archetype={stage >= Stage.PatternPreview ? archetype.name : undefined}
                    scores={stage >= Stage.PatternPreview ? normalizedScores : undefined}
                    onNavigate={handleSidebarNavigate}
                />
            )}

            {/* ── MAIN CONTENT AREA ── */}
            <main className={cn(
                "flex flex-col relative z-10 mx-auto w-full transition-all duration-300",
                (stage === Stage.Welcome || stage === Stage.Results)
                    ? "min-h-[100dvh] w-full max-w-none p-0"
                    : (!isQuizStage)
                        ? "p-6 sm:p-8 md:px-[56px] md:py-[48px] min-h-[100dvh] max-w-none"
                        : "h-[100dvh] overflow-hidden max-w-none"
            )} aria-label="Discovery quiz content">
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

                {/* Stage content — fills remaining height, each component manages its own scroll */}
                <div className="flex-1 min-h-0 relative z-10 h-full">
                    <AnimatePresence mode="wait">
                        {stage === Stage.Welcome && <WelcomeScreen key="welcome" onStart={handleStart} config={config} />}
                        {stage === Stage.PropertyReality && (
                            <PropertyReality key="property" onComplete={handlePropertyRealityComplete} intent={currentSignals.intent} />
                        )}
                        {stage === Stage.Lifestyle && (
                            <LifestyleReflection key="lifestyle" onComplete={handleLifestyleComplete} />
                        )}
                        {stage === Stage.RoomPriority && (
                            <RoomPriority key="room-priority" signals={currentSignals} onComplete={handleRoomPriorityComplete} />
                        )}
                        {stage === Stage.VisualInstinct && (
                            <VisualInstinct key="visual" sessionId={sessionId} signals={currentSignals} onComplete={handleVisualComplete} />
                        )}
                        {stage === Stage.ReinterpretationGate && currentSignals.consultationIntelligence?.interpretationConflict.detected && (
                            <ReinterpretationGate
                                key="reinterpretation-gate"
                                conflict={currentSignals.consultationIntelligence.interpretationConflict}
                                signals={currentSignals}
                                onResolve={handleReinterpretationResolve}
                            />
                        )}
                        {stage === Stage.AdjectiveSelection && (
                            <AdjectiveSelection key="adjectives" sessionId={sessionId} onComplete={handleAdjectiveComplete} />
                        )}
                        {stage === Stage.PivotQuestion && (
                            <PivotQuestion key="pivot" onComplete={handlePivotComplete} />
                        )}
                        {stage === Stage.MaterialResonance && (
                            <MaterialResonance key="material" onComplete={handleMaterialComplete} />
                        )}
                        {stage === Stage.LightCalibration && (
                            <LightCalibration key="light" onComplete={handleLightComplete} />
                        )}
                        {stage === Stage.BudgetAlignment && (
                            <BudgetAlignment
                                key="budget"
                                signals={currentSignals}
                                onComplete={handleBudgetComplete}
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
                        {stage === Stage.Results && (
                            <Suspense fallback={
                                <div className="w-full h-[60vh] flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 rounded-full border border-[#e8e4dd] border-t-kiro-accent animate-spin" />
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a5a] font-mono">Loading Results...</p>
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
                                    onComplete={() => {
                                        if (onComplete) onComplete({ scores: normalizedScores, signals: currentSignals, aiResult });
                                    }}
                                />
                            </Suspense>
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
                    </AnimatePresence>
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
