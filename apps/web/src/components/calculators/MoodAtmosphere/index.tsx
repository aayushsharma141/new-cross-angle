
"use client";

import React, { useState } from 'react';
import { CinematicSection } from '../shared/CinematicSection';
import { MoodRail } from '../AtmosphereOrchestrator/MoodRail'; // Reuse existing logic for now
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Maximize2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAtmosphere } from '../AtmosphereOrchestrator/useAtmosphere'; // Reuse logic
import { VisualizerCanvas } from '../AtmosphereOrchestrator/VisualizerCanvas'; // Reuse logic

export default function MoodAtmosphere() {
    const { inputs, setInputs, stats } = useAtmosphere();
    const [showInsights, setShowInsights] = useState(false);

    // Dynamic background based on mood could be cool, but for now fixed cinematic.
    // We will use the VisualizerCanvas as the background!

    return (
        <CinematicSection className="relative" id="mood-atmosphere">

            {/* Background Visualizer (Full Screen) */}
            <div className="absolute inset-0 z-0 opacity-80">
                <VisualizerCanvas
                    roomType={inputs.roomType}
                    kelvin={stats.kelvin}
                    dimmerLevel={inputs.intensity}
                    isDoubleHeight={inputs.height === 'double'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
            </div>

            {/* Floating Content */}
            <div className="relative z-10 flex flex-col justify-end h-full pb-20">

                {/* 1. Title & Value Prop (Top Left - Absolute) */}
                <div className="absolute top-32 left-0 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="p-1 rounded-full bg-orange-500/20 text-orange-400">
                            <Lightbulb className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Atmosphere Calibration</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-white tracking-tight">
                        How should the room <span className="italic text-white/60">feel?</span>
                    </h2>
                </div>

                {/* 2. Floating Controls (Bottom Center) */}
                <div className="w-full max-w-3xl mx-auto space-y-8">

                    {/* Mood Rail - Floating Glass */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <MoodRail
                            activeMood={inputs.mood}
                            onMoodChange={(mood) => setInputs({ ...inputs, mood })}
                        />
                    </div>

                    {/* Footer / Insights Trigger */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowInsights(true)}
                            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                                View Technical Impact
                            </span>
                            <div className="w-px h-3 bg-white/20" />
                            <span className="text-xs font-mono text-white/40">
                                {stats.wattage}W • {stats.kelvin}K
                            </span>
                        </button>
                    </div>

                </div>

            </div>

            {/* Insights Modal (Overlay) */}
            <AnimatePresence>
                {showInsights && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-8 relative">
                            <button
                                onClick={() => setShowInsights(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                                aria-label="Close Insights"
                            >
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.1929 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.1929 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </button>

                            <h3 className="text-2xl font-serif text-white mb-6">Technical Impact</h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Energy Load</div>
                                    <div className="text-3xl font-mono text-white">{stats.wattage}<span className="text-sm text-white/40">W</span></div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Monthly Cost</div>
                                    <div className="text-3xl font-mono text-white">₹{Math.round(stats.costs.annualEnergy / 12)}</div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <p className="text-sm text-white/60 leading-relaxed">
                                    This mood configuration uses <strong>{inputs.intensity}%</strong> of system capacity.
                                    {inputs.intensity > 80
                                        ? " High energy consumption. Consider dimming for casual use."
                                        : " Optimized for energy efficiency."}
                                </p>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </CinematicSection>
    );
}
