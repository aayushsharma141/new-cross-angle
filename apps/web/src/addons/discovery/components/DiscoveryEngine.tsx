import { useState, useCallback, useEffect, useMemo, Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Stage, AestheticScores, UserSignals, AIAestheticResult, DiscoveryConfig } from "@/types/discovery";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { visualImages } from "@/constants/discovery";
import { getArchetype } from "../core/archetype";
import { normalizeScore } from "../core/normalization";
import { initialScores, addScores } from "../core/scoring";
import { initialSignals, resetSession } from "../flow/session";
import { getNextStage } from "../flow/transitions";
import { saveSession, clearSession } from "../flow/persistence";
import { startSession, trackQuizStarted, trackQuizCompleted, trackQuizStepViewed, trackQuizStepCompleted } from "../infrastructure/analytics/tracker";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { synthesizeConsultationIntelligence, detectInterpretationConflict } from "../alcs/intelligence";
import DiscoveryLanding from "./DiscoveryLanding";
import PhysicalSpace from "./PhysicalSpace";
import Timeline from "./Timeline";
import MorningRoutine from "./MorningRoutine";
import KitchenUsage from "./KitchenUsage";
import EntertainmentStyle from "./EntertainmentStyle";
import RoomPriority from "./RoomPriority";
import VisualInstinct from "./VisualInstinct";
import ReinterpretationGate from "./ReinterpretationGate";
import DesignIdentity from "./DesignIdentity";
import Atmosphere from "./Atmosphere";
import Constraints from "./Constraints";
import PivotQuestion from "./PivotQuestion";
import MaterialIdentity from "./MaterialIdentity";
import LivingPreferences from "./LivingPreferences";
import BudgetAlignment from "./BudgetAlignment";
import AnalysisPhase from "./AnalysisPhase";
import MiniResultPreview from "./MiniResultPreview";
import LeadGatePhase from "./LeadGatePhase";
const ResultsReveal = lazy(() => import("./ResultsReveal"));
import ProgressBar from "./ProgressBar";
import DotPattern from "@/components/magicui/dot-pattern";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import DiscoveryProgressSidebar from "./DiscoveryProgressSidebar";
import { WorkspacePanel } from "@/components/patterns/WorkspacePanel";
import { DiscoveryDossier } from "./DiscoveryDossier";



interface DiscoveryEngineProps {
    config?: DiscoveryConfig;
    onComplete?: (result: { scores: AestheticScores; signals: UserSignals; aiResult?: AIAestheticResult | null }) => void;
}

export const DiscoveryEngine = ({ config, onComplete }: DiscoveryEngineProps = {}) => {
    const { data: visualPromptsData } = useFlowConfig<unknown[]>("discovery_visual_prompts");

    const [stage, setStage] = useState<Stage>(Stage.Welcome);
    const [mode, setMode] = useState<"quick" | "deep">("deep");
    const [scores, setScores] = useState<AestheticScores>(initialScores);
    const [signals, setSignals] = useState<UserSignals>(initialSignals);
    const [aiResult, setAiResult] = useState<AIAestheticResult | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const analytics = useAnalytics();
    const analyticsTrack = analytics.track.bind(analytics);

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

    const transitionToStage = useCallback((nextStage: Stage) => {
        // Preload heavy results component when getting close
        if (nextStage === Stage.MiniResult || nextStage === Stage.Analysis) {
            import("./ResultsReveal").catch(() => { });
        }

        setStage(nextStage);
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

    const handleGenericStageComplete = useCallback(
        (currentStage: Stage, stageName: string, data: Partial<UserSignals>) => {
            if (sessionId) trackQuizStepCompleted(analyticsTrack, sessionId, stageName);
            setSignals((prev) => ({ ...prev, ...data }));
            transitionToStage(getNextStage(currentStage, mode));
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

    const sidebarContent = isQuizStage ? (
        <div className="flex flex-col h-full relative z-10">
            <DiscoveryProgressSidebar
                currentStage={stage}
                archetype={stage >= Stage.MiniResult ? archetype.name : undefined}
                scores={stage >= Stage.MiniResult ? normalizedScores : undefined}
                onNavigate={handleSidebarNavigate}
            />
        </div>
    ) : null;

    const dossierContent = isQuizStage ? (
        <DiscoveryDossier signals={currentSignals} stage={stage} />
    ) : null;

    const stageContent = (
        <>
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
            <div className="flex-1 min-h-0 relative z-10 h-full w-full">
                <AnimatePresence mode="wait">
                    {stage === Stage.Welcome && <DiscoveryLanding key="welcome" onStart={handleStart} config={config} />}
                    {stage === Stage.PhysicalSpace && (
                        <PhysicalSpace key="physical-space" onComplete={(data) => handleGenericStageComplete(Stage.PhysicalSpace, "PhysicalSpace", data)} />
                    )}
                    {stage === Stage.Timeline && (
                        <Timeline key="timeline" onComplete={(data) => handleGenericStageComplete(Stage.Timeline, "Timeline", data)} />
                    )}
                    {stage === Stage.MorningRoutine && (
                        <MorningRoutine key="morning-routine" onComplete={(data) => handleGenericStageComplete(Stage.MorningRoutine, "MorningRoutine", data)} />
                    )}
                    {stage === Stage.KitchenUsage && (
                        <KitchenUsage key="kitchen-usage" onComplete={(data) => handleGenericStageComplete(Stage.KitchenUsage, "KitchenUsage", data)} />
                    )}
                    {stage === Stage.EntertainmentStyle && (
                        <EntertainmentStyle key="entertainment-style" onComplete={(data) => handleGenericStageComplete(Stage.EntertainmentStyle, "EntertainmentStyle", data)} />
                    )}
                    {stage === Stage.RoomPriority && (
                        <RoomPriority key="room-priority" signals={currentSignals} onComplete={handleRoomPriorityComplete} />
                    )}
                    {stage === Stage.VisualInstinct && (
                        <VisualInstinct key="visual" sessionId={sessionId} signals={currentSignals} onComplete={handleVisualComplete} visualPrompts={visualPromptsData as Parameters<typeof VisualInstinct>[0]["visualPrompts"]} />
                    )}
                    {stage === Stage.ReinterpretationGate && currentSignals.consultationIntelligence?.interpretationConflict.detected && (
                        <ReinterpretationGate
                            key="reinterpretation-gate"
                            conflict={currentSignals.consultationIntelligence.interpretationConflict}
                            signals={currentSignals}
                            onResolve={handleReinterpretationResolve}
                        />
                    )}
                    {stage === Stage.DesignIdentity && (
                        <DesignIdentity key="design-identity" onComplete={(data) => handleGenericStageComplete(Stage.DesignIdentity, "DesignIdentity", data)} />
                    )}
                    {stage === Stage.Atmosphere && (
                        <Atmosphere key="atmosphere" onComplete={(data) => handleGenericStageComplete(Stage.Atmosphere, "Atmosphere", data)} />
                    )}
                    {stage === Stage.Constraints && (
                        <Constraints key="constraints" onComplete={(data) => handleGenericStageComplete(Stage.Constraints, "Constraints", data)} />
                    )}
                    {stage === Stage.MaterialIdentity && (
                        <MaterialIdentity key="material-identity" onComplete={(data) => handleGenericStageComplete(Stage.MaterialIdentity, "MaterialIdentity", data)} />
                    )}
                    {stage === Stage.LivingPreferences && (
                        <LivingPreferences key="living-preferences" onComplete={(data) => handleGenericStageComplete(Stage.LivingPreferences, "LivingPreferences", data)} />
                    )}
                    {stage === Stage.PivotQuestion && (
                        <PivotQuestion key="pivot" onComplete={handlePivotComplete} />
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
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a5a] font-mono">Loading Results</p>
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
        </>
    );

    return (
        <div className={cn(
            "min-h-[100dvh] font-sans text-foreground relative",
            isQuizStage ? "bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)] h-[100dvh] overflow-hidden" : "bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]"
        )} data-environment="workspace">
            {isQuizStage ? (
                <WorkspacePanel sidebar={sidebarContent} mainContent={stageContent} dossierContent={dossierContent} />
            ) : (
                <main className={cn(
                    "flex flex-col relative z-10 mx-auto w-full transition-all duration-300",
                    (stage === Stage.Welcome || stage === Stage.Results)
                        ? "min-h-[100dvh] w-full max-w-none p-0"
                        : "p-6 sm:p-8 md:px-[56px] md:py-[48px] min-h-[100dvh] max-w-none"
                )} aria-label="Discovery quiz content">
                    {stageContent}
                </main>
            )}
        </div>
    );
};
