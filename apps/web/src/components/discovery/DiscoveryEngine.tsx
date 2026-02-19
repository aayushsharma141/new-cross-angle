import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Stage, AestheticScores, UserSignals, AIAestheticResult } from "@/types/discovery";
import { getArchetype, visualImages } from "@/constants/discovery";
import ProgressBar from "./ProgressBar";
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
import ResultsReveal from "./ResultsReveal";
import DotPattern from "@/components/magicui/dot-pattern";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";

const initialScores: AestheticScores = {
    minimalism: 5, warmth: 5, social: 5, structure: 5, novelty: 5,
};

const initialSignals: UserSignals = {
    reflectionAnswers: [], lifestyleChoices: [], selectedImageIds: [], selectedImageTags: [],
    selectedAdjectives: [], freeTextReflection: "", sliderValues: [], materialChoice: "", lightPreference: "",
    scores: initialScores,
};

// Cinematic wipe transition
const wipeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const DiscoveryEngine = () => {
    const [stage, setStage] = useState<Stage>(Stage.Welcome);
    const [mode, setMode] = useState<"quick" | "deep">("deep");
    const [scores, setScores] = useState<AestheticScores>(initialScores);
    const [signals, setSignals] = useState<UserSignals>(initialSignals);
    const [aiResult, setAiResult] = useState<AIAestheticResult | null>(null);
    const [showWipe, setShowWipe] = useState(false);

    const handleRetake = useCallback(() => {
        setScores(initialScores);
        setSignals(initialSignals);
        setAiResult(null);
        setMode("deep");
        setStage(Stage.Welcome);
    }, []);

    // Stage transition with wipe effect
    const transitionToStage = useCallback((nextStage: Stage) => {
        setShowWipe(true);
        setTimeout(() => {
            setStage(nextStage);
            setTimeout(() => setShowWipe(false), 300);
        }, 250);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [stage]);

    const addScores = useCallback((partial: Partial<AestheticScores>) => {
        setScores((prev) => {
            const next = { ...prev };
            for (const [k, v] of Object.entries(partial)) {
                const key = k as keyof AestheticScores;
                next[key] = Math.max(0, Math.min(10, next[key] + v));
            }
            return next;
        });
    }, []);

    const handleStart = useCallback((m: "quick" | "deep") => {
        setMode(m);
        transitionToStage(m === "quick" ? Stage.Lifestyle : Stage.Reflection);
    }, [transitionToStage]);

    const handleReflectionComplete = useCallback(
        (answers: { question: string; answer: string }[]) => {
            setSignals((prev) => ({ ...prev, reflectionAnswers: answers }));
            transitionToStage(Stage.Lifestyle);
        }, [transitionToStage]
    );

    const handleLifestyle = useCallback(
        (partial: Partial<AestheticScores>, choiceLabel?: string) => {
            addScores(partial);
            if (choiceLabel) setSignals((prev) => ({ ...prev, lifestyleChoices: [...prev.lifestyleChoices, choiceLabel] }));
        }, [addScores]
    );

    const handleLifestyleComplete = useCallback(
        (partial: Partial<AestheticScores>) => {
            addScores(partial);
            transitionToStage(Stage.VisualInstinct);
        }, [addScores, transitionToStage]
    );

    const handleVisualComplete = useCallback(
        (partial: Partial<AestheticScores>, selectedIds?: number[]) => {
            addScores(partial);
            if (selectedIds) {
                const tags = selectedIds.map((id) => visualImages.find((i) => i.id === id)?.tags).filter(Boolean) as Partial<AestheticScores>[];
                setSignals((prev) => ({ ...prev, selectedImageIds: selectedIds, selectedImageTags: tags }));
            }
            transitionToStage(mode === "quick" ? Stage.LightCalibration : Stage.AdjectiveSelection);
        }, [addScores, mode, transitionToStage]
    );

    const handleAdjectiveComplete = useCallback(
        (partial: Partial<AestheticScores>, adjectives: string[], freeText: string) => {
            addScores(partial);
            setSignals((prev) => ({ ...prev, selectedAdjectives: adjectives, freeTextReflection: freeText }));
            transitionToStage(Stage.EmotionalMapping);
        }, [addScores, transitionToStage]
    );

    const handleEmotionalComplete = useCallback(
        (partial: Partial<AestheticScores>, sliderValues?: { label: string; value: number }[]) => {
            addScores(partial);
            if (sliderValues) setSignals((prev) => ({ ...prev, sliderValues }));
            transitionToStage(Stage.MaterialResonance);
        }, [addScores, transitionToStage]
    );

    const handleMaterialComplete = useCallback(
        (partial: Partial<AestheticScores>, materialName?: string) => {
            addScores(partial);
            if (materialName) setSignals((prev) => ({ ...prev, materialChoice: materialName }));
            transitionToStage(Stage.LightCalibration);
        }, [addScores, transitionToStage]
    );

    const handleLightComplete = useCallback(
        (partial: Partial<AestheticScores>, lightName?: string) => {
            addScores(partial);
            if (lightName) setSignals((prev) => ({ ...prev, lightPreference: lightName }));
            transitionToStage(mode === "quick" ? Stage.Analysis : Stage.PatternPreview);
        }, [addScores, mode, transitionToStage]
    );

    const handlePatternComplete = useCallback(() => {
        transitionToStage(Stage.Analysis);
    }, [transitionToStage]);

    const handleAnalysisComplete = useCallback(
        (result?: AIAestheticResult) => {
            if (result) setAiResult(result);
            setStage(Stage.Results);
        }, []
    );

    const normalizeScore = (raw: number): number => {
        const centered = (raw - 5) / 5;
        const compressed = centered * 0.7;
        return Math.round(Math.max(1, Math.min(9, 5 + compressed * 5)));
    };

    const normalizedScores: AestheticScores = {
        minimalism: normalizeScore(scores.minimalism),
        warmth: normalizeScore(scores.warmth),
        social: normalizeScore(scores.social),
        structure: normalizeScore(scores.structure),
        novelty: normalizeScore(scores.novelty),
    };

    const currentSignals: UserSignals = { ...signals, scores: normalizedScores };
    const archetype = getArchetype(scores);

    return (
        <div className={cn(
            "w-full bg-background text-foreground relative flex flex-col lg:flex-row",
            stage > Stage.Welcome && stage < Stage.Results ? "h-screen overflow-hidden" : "min-h-screen"
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

            {/* Left Panel - Fixed on Desktop */}
            {stage > Stage.Welcome && stage < Stage.Results && (
                <div className="hidden lg:flex lg:w-[30%] xl:w-[25%] h-full flex-col border-r border-border/50 bg-muted/30 backdrop-blur-xl relative overflow-hidden">
                    {/* Background Detail */}
                    <div className="absolute inset-0 -z-10">
                        <DotPattern
                            width={20}
                            height={20}
                            className="opacity-20 text-neutral-400"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-primary/5" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between p-12">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-1"
                            >
                                <AnimatedShinyText className="text-[10px] uppercase tracking-[0.6em] font-light mx-0 text-left">
                                    Discovery Engine
                                </AnimatedShinyText>
                                <h2 className="font-serif-display text-3xl font-medium">
                                    {stage < Stage.Analysis ? "Creative Identity" : "Synthesis"}
                                </h2>
                            </motion.div>

                            <ProgressBar currentStage={stage} variant="vertical" />
                        </div>

                        <div className="space-y-4">
                            <div className="w-12 h-[1px] bg-primary/30" />
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-relaxed max-w-[200px]">
                                We are analyzing your spatial DNA to curate a personalized aesthetic blueprint.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Panel / Main Area */}
            <main className={cn(
                "flex-1 relative flex flex-col",
                stage > Stage.Welcome && stage < Stage.Results ? "lg:h-full overflow-hidden" : "w-full min-h-screen"
            )}>
                {/* Magic UI Background Pattern (Full screen behind main content) */}
                <DotPattern
                    width={20}
                    height={20}
                    cx={1}
                    cy={1}
                    cr={1}
                    className="absolute inset-0 -z-10 opacity-30 text-neutral-300 dark:text-neutral-700 h-full w-full"
                />

                {/* Mobile/Horizontal Progress Bar */}
                {stage > Stage.Welcome && stage < Stage.Results && (
                    <div className="lg:hidden absolute top-0 left-0 right-0 z-50">
                        <ProgressBar currentStage={stage} variant="horizontal" />
                    </div>
                )}

                {/* Scrollable Stage Content */}
                <div className={cn(
                    "flex-1",
                    stage > Stage.Welcome && stage < Stage.Results ? "overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide" : ""
                )}>
                    <div className={cn(
                        "min-h-full flex flex-col items-center",
                        stage === Stage.Welcome || stage === Stage.Results ? "justify-center" : "justify-start py-20 lg:py-32"
                    )}>
                        <div className={cn(
                            "w-full relative z-10 transition-all duration-500 mx-auto",
                            // Remove max-width and padding for Welcome/Results to allow full-width designs
                            stage === Stage.Welcome || stage === Stage.Results ? "max-w-none px-0" : "max-w-7xl px-6"
                        )}>
                            <AnimatePresence mode="wait">
                                {stage === Stage.Welcome && <WelcomeScreen key="welcome" onStart={handleStart} />}
                                {stage === Stage.Reflection && <ReflectionPrompt key="reflection" onComplete={handleReflectionComplete} />}
                                {stage === Stage.Lifestyle && <LifestyleReflection key="lifestyle" onComplete={handleLifestyleComplete} onChoice={handleLifestyle} />}
                                {stage === Stage.VisualInstinct && <VisualInstinct key="visual" onComplete={handleVisualComplete} />}
                                {stage === Stage.AdjectiveSelection && <AdjectiveSelection key="adjective" onComplete={handleAdjectiveComplete} />}
                                {stage === Stage.EmotionalMapping && <EmotionalMapping key="emotional" onComplete={handleEmotionalComplete} />}
                                {stage === Stage.MaterialResonance && <MaterialResonance key="material" onComplete={handleMaterialComplete} />}
                                {stage === Stage.LightCalibration && <LightCalibration key="light" onComplete={handleLightComplete} />}
                                {stage === Stage.PatternPreview && <PatternPreview key="pattern" scores={scores} signals={currentSignals} onComplete={handlePatternComplete} />}
                                {stage === Stage.Analysis && <AnalysisPhase key="analysis" userSignals={currentSignals} fallbackArchetype={archetype} onComplete={handleAnalysisComplete} />}
                                {stage === Stage.Results && <ResultsReveal key="results" scores={normalizedScores} archetype={archetype} aiResult={aiResult} onRetake={handleRetake} />}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Subtle Fixed Branding (Only on Welcome/Results or Mobile) */}
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
