
"use client";

import React from 'react';
import { useStudio } from '../context/StudioContext';
import { motion } from 'framer-motion';
import { formatINR, cn } from '@/lib/utils';
import { TimelineSlider } from '@/components/calculators/DesignEquityForecaster/TimelineSlider';
import { TrendingUp, Activity } from 'lucide-react';

export const StrategyControls = () => {
    const { timeHorizon, setTimeHorizon, propertyValue, setPropertyValue } = useStudio();

    return (
        <div className="space-y-8">

            {/* Input: Property Value */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base Property Value</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-serif">₹</span>
                    <input
                        type="number"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(parseInt(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-8 text-white font-mono text-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                        aria-label="Base Property Value"
                    />
                </div>
            </div>

            {/* Timeline Slider */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Investment Horizon</label>
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold">{timeHorizon} Years</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <TimelineSlider value={timeHorizon} onChange={setTimeHorizon} />
                </div>
            </div>

            {/* Insight Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 p-5 rounded-xl">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-purple-500/10 text-purple-400 mt-1">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Compound Growth Effect</h4>
                        <p className="text-[11px] text-white/60 leading-relaxed">
                            Expanding your horizon from 3 to 10 years increases the design multiplier from <strong>1.35x</strong> to <strong>2.1x</strong>. Strategic architecture is a long-term compounder.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};
