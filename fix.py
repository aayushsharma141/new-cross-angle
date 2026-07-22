import os

file_path = r'c:\Users\aayus\Desktop\main\apps\web\src\addons\discovery\components\DiscoveryEngine.tsx'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import LiquidEther from "@/components/ReactBits/LiquidEther";',
    'import LiquidEther from "@/components/ReactBits/LiquidEther";\nimport { WorkspacePanel } from "@/components/patterns/WorkspacePanel";'
)

# 2. Main structural rewrite
old_render_start = '''    const currentSignals: UserSignals = { ...signals, scores: normalizedScores };

    const isQuizStage = stage > Stage.Welcome && stage < Stage.Results;

    return (
        <div className={cn(
            "min-h-[100dvh] grid font-sans text-[#1a1a1a] relative",
            isQuizStage ? "grid-cols-1 md:grid-cols-[280px_1fr] bg-[#faf8f5] h-[100dvh] overflow-hidden" : "grid-cols-1 bg-[#faf8f5]"
        )}>'''

new_render_start = '''    const currentSignals: UserSignals = { ...signals, scores: normalizedScores };

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
        )} aria-label="Discovery quiz content">'''

content = content.replace(old_render_start, new_render_start)

# 3. Remove the original sidebar block (since it's now in sidebarContent)
old_sidebar_block = '''            {/* ✧・ﾟ LUXURY PROGRESS SIDEBAR (260px) ✧・ﾟ */}
            {isQuizStage && (
                <DiscoveryProgressSidebar
                    currentStage={stage}
                    archetype={stage >= Stage.PatternPreview ? archetype.name : undefined}
                    scores={stage >= Stage.PatternPreview ? normalizedScores : undefined}
                    onNavigate={handleSidebarNavigate}
                />
            )}

            {/* ✧・ﾟ MAIN CONTENT AREA ✧・ﾟ */}
            <main className={cn(
                "flex flex-col relative z-10 mx-auto w-full transition-all duration-300",
                (stage === Stage.Welcome || stage === Stage.Results)
                    ? "min-h-[100dvh] w-full max-w-none p-0"
                    : (!isQuizStage)
                        ? "p-6 sm:p-8 md:px-[56px] md:py-[48px] min-h-[100dvh] max-w-none"
                        : "h-[100dvh] overflow-hidden max-w-none"
            )} aria-label="Discovery quiz content">'''

content = content.replace(old_sidebar_block, '')

# 4. End the mainContent and wrap the return
old_end = '''                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};'''

new_end = '''                        </div>
                    </motion.div>
                )}
            </main>
    );

    return (
        <div className={cn(
            "min-h-[100dvh] font-sans text-foreground relative",
            isQuizStage ? "bg-[#faf8f5] h-[100dvh] overflow-hidden" : "bg-[#faf8f5]"
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

            {isQuizStage ? (
                <WorkspacePanel sidebar={sidebarContent} mainContent={mainContent} dossierContent={dossierContent} />
            ) : (
                mainContent
            )}
        </div>
    );
};'''

content = content.replace(old_end, new_end)

# Also remove the original overlays from mainContent
old_overlays = '''            {/* Cinematic wipe overlay */}
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
            </div>'''
content = content.replace(old_overlays, '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
