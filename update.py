import os

file_path = r'c:\Users\aayus\Desktop\main\apps\web\src\addons\discovery\components\DiscoveryEngine.tsx'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace 1: imports
old_imports = '''import ProgressBar from "./ProgressBar";
import DotPattern from "@/components/magicui/dot-pattern";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import DiscoveryProgressSidebar from "./DiscoveryProgressSidebar";
import LiquidEther from "@/components/ReactBits/LiquidEther";'''

new_imports = '''import ProgressBar from "./ProgressBar";
import DotPattern from "@/components/magicui/dot-pattern";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import DiscoveryProgressSidebar from "./DiscoveryProgressSidebar";
import LiquidEther from "@/components/ReactBits/LiquidEther";
import { WorkspacePanel } from "@/components/patterns/WorkspacePanel";'''

content = content.replace(old_imports, new_imports)

# Replace 2: return layout
old_layout_start = '''    const currentSignals: UserSignals = { ...signals, scores: normalizedScores };

    const isQuizStage = stage > Stage.Welcome && stage < Stage.Results;

    return (
        <div className={cn(
            "min-h-[100dvh] grid font-sans text-[#1a1a1a] relative",
            isQuizStage ? "grid-cols-1 md:grid-cols-[280px_1fr] bg-[#faf8f5] h-[100dvh] overflow-hidden" : "grid-cols-1 bg-[#faf8f5]"
        )}>
            {/* Cinematic wipe overlay */}'''

new_layout_start = '''    const currentSignals: UserSignals = { ...signals, scores: normalizedScores };

    const isQuizStage = stage > Stage.Welcome && stage < Stage.Results;

    const sidebarContent = isQuizStage ? (
        <div className="flex flex-col h-full relative z-10">
            <DiscoveryProgressSidebar
                currentStage={stage}
                archetype={stage >= Stage.PatternPreview ? archetype.name : undefined}
                scores={stage >= Stage.PatternPreview ? normalizedScores : undefined}
                onNavigate={handleSidebarNavigate}
            />
        </div>
    ) : null;

    const dossierContent = isQuizStage ? (
        <div className="flex flex-col p-6 md:p-8 h-full relative z-10">
            <h3 className="text-[12px] font-mono tracking-wider uppercase text-muted-foreground mb-4">Discovery Dossier</h3>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
                As you answer, we synthesize your aesthetic genome and lifestyle signals.
            </p>
        </div>
    ) : null;

    const mainContent = (
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
                    {stage === Stage.Welcome && <DiscoveryLanding key="welcome" onStart={handleStart} config={config} />}
                    {stage === Stage.PropertyReality && (
                        <PropertyReality key="property" onComplete={handlePropertyRealityComplete} />
                    )}
                    {stage === Stage.Lifestyle && (
                        <LifestyleReflection key="lifestyle" onComplete={handleLifestyleComplete} />
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
                    {stage === Stage.AdjectiveSelection && (
                        <AdjectiveSelection key="adjectives" sessionId={sessionId} onComplete={handleAdjectiveComplete} questionsData={questionsData as Parameters<typeof AdjectiveSelection>[0]["questionsData"]} />
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
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a5a] font-mono">Loading Results.</p>
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
    );

    return (
        <div className={cn(
            "min-h-[100dvh] font-sans text-foreground relative",
            isQuizStage ? "bg-[#faf8f5] h-[100dvh] overflow-hidden" : "bg-[#faf8f5]"
        )}>
            {/* Cinematic wipe overlay */}'''

content = content.replace(old_layout_start, new_layout_start)

# Now remove the old sidebar and main content wrappers
import re

pattern = r'\{/\* ✧・ﾟ LUXURY PROGRESS SIDEBAR \(260px\) ✧・ﾟ \*/\}.*?(?=</div>\s*\);\s*};)'
replacement = '''            {isQuizStage ? (
                <WorkspacePanel sidebar={sidebarContent} mainContent={mainContent} dossierContent={dossierContent} />
            ) : (
                mainContent
            )}
'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DiscoveryEngine.tsx")
