
"use client";

import React, { useState } from 'react';
import { CinematicSection } from '../shared/CinematicSection';
import { TimelineSlider } from '../DesignEquityForecaster/TimelineSlider';
import { formatINR } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function LongTermStrategy() {
    const [timeHorizon, setTimeHorizon] = useState(5);

    // Quick math for demo
    const propertyValue = 25000000;
    const appreciation = timeHorizon === 3 ? 1.35 : timeHorizon === 5 ? 1.6 : 2.1;
    const futureValue = propertyValue * appreciation;
    const designAlpha = futureValue * 0.12; // 12% premium for design

    return (
        <CinematicSection className="relative bg-[#050505]" id="long-term-strategy">

            {/* Background - Grid/Blueprint */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-16">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="p-1 rounded-full bg-purple-500/20 text-purple-400">
                            <TrendingUp className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Long-Term Strategy</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-white tracking-tight">
                        Architecture as <span className="italic text-purple-400">Asset.</span>
                    </h2>
                </div>


                {/* Central Widget */}
                <div className="w-full max-w-4xl bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-12 rounded-[3rem] text-center space-y-12">

                    {/* Timeline Control */}
                    <div className="w-full max-w-md mx-auto">
                        <TimelineSlider value={timeHorizon} onChange={setTimeHorizon} />
                    </div>

                    {/* Big Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-right border-r border-white/10 pr-12">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Projected Market Value</div>
                            <motion.div
                                key={futureValue}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-mono text-white"
                            >
                                {formatINR(futureValue)}
                            </motion.div>
                        </div>

                        <div className="text-left pl-0">
                            <div className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ArrowUpRight className="w-3 h-3" /> Design Premium (Alpha)
                            </div>
                            <motion.div
                                key={designAlpha}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl font-serif text-white underline decoration-emerald-500/30 decoration-2 underline-offset-8"
                            >
                                +{formatINR(designAlpha)}
                            </motion.div>
                            <p className="text-xs text-white/40 mt-3 max-w-xs">
                                Additional equity generated purely through strategic design interventions over standard market growth.
                            </p>
                        </div>
                    </div>

                </div>

            </div>

        </CinematicSection>
    );
}
