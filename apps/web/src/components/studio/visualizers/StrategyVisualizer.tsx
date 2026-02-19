
"use client";

import React from 'react';
import { useStudio } from '../context/StudioContext';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export const StrategyVisualizer = () => {
    const { timeHorizon, propertyValue } = useStudio();

    // Recalculate derivative values for visualization
    const appreciation = timeHorizon === 3 ? 1.35 : timeHorizon === 5 ? 1.6 : 2.1;
    const futureValue = propertyValue * appreciation;
    const designAlpha = futureValue * 0.12;

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#050505] flex items-center justify-center">
            {/* Background - Grid/Blueprint */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[size:40px_40px]" />
                {/* Radial Glow based on Time Horizon */}
                <motion.div
                    className="absolute inset-0 bg-purple-900/20 blur-[100px]"
                    animate={{ scale: 0.8 + (timeHorizon * 0.05), opacity: 0.2 + (timeHorizon * 0.02) }}
                    transition={{ duration: 1 }}
                />
            </div>

            {/* Central Graph/Visualization */}
            <div className="relative z-10 w-full max-w-5xl px-12 flex items-end justify-between h-[60%] border-b border-white/10 pb-12">

                {/* Year Markers */}
                {[0, 3, 5, 10].map((year, index) => {
                    const isActive = timeHorizon >= year;
                    return (
                        <div key={year} className="flex flex-col items-center gap-4 relative">
                            {/* Bar */}
                            <motion.div
                                className="w-1 bg-white/10 rounded-t-full relative overflow-hidden"
                                style={{ height: 200 + (year * 30) }}
                            >
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 bg-purple-500"
                                    initial={{ height: 0 }}
                                    animate={{ height: isActive ? '100%' : '0%' }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                />
                            </motion.div>

                            <span className={`text-xs font-mono tracking-widest ${isActive ? 'text-white' : 'text-white/20'}`}>
                                {year === 0 ? 'Now' : `Year ${year}`}
                            </span>
                        </div>
                    )
                })}

                {/* Floating Big Data Point */}
                <div className="absolute top-0 right-24 text-right">
                    <div className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
                        <ArrowUpRight className="w-3 h-3" /> Design Premium (Alpha)
                    </div>
                    <motion.div
                        key={timeHorizon}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-serif text-white underline decoration-emerald-500/30 decoration-2 underline-offset-8"
                    >
                        +{formatINR(designAlpha)}
                    </motion.div>
                    <p className="text-white/40 text-sm mt-2">Value created above standard market appreciation.</p>
                </div>

            </div>
        </div>
    );
};
