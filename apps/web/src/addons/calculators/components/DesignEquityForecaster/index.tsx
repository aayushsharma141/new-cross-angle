"use client";

import React, { useState, useMemo } from 'react';
import { ZONES, APPRECIATION_RATES } from './data';
import { SpatialHeatmap } from './SpatialHeatmap';
import { TimelineSlider } from './TimelineSlider';
import { TrendingUp, Building2, Coins, ArrowRight, Wallet } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DesignEquityForecaster() {
    const [propertyValue, setPropertyValue] = useState(25000000); // 2.5 Cr default
    const [budget, setBudget] = useState(3000000); // 30L default
    const [timeHorizon, setTimeHorizon] = useState(5); // 5 years default
    const [activeZones, setActiveZones] = useState<string[]>(['living', 'kitchen']);

    // --- Calculations ---
    const stats = useMemo(() => {
        // 1. Calculate Weighted Recoverability based on active zones
        const selectedZoneData = ZONES.filter(z => activeZones.includes(z.id));
        const avgRecoverability = selectedZoneData.length > 0
            ? selectedZoneData.reduce((acc, curr) => acc + curr.recoverability, 0) / selectedZoneData.length
            : 0.6; // Default to 60% if nothing selected

        // 2. Initial Equity (Immediate Value Add)
        // "Design Premium" logic: Good design adds more value than the cost (1.2x - 1.5x)
        // We dampen this multiplier based on the recoverability of the zones chosen.
        const designMultiplier = 1.0 + (avgRecoverability * 0.5); // Range: 1.0 to 1.5 approx
        const initialValueAdd = budget * designMultiplier;
        const immediateEquity = initialValueAdd - budget;

        // 3. Future Value (Compound Interest)
        // Compare Standard Appreciation vs. Designed Home Appreciation
        const standardFutureValue = propertyValue * Math.pow(1 + APPRECIATION_RATES.standard, timeHorizon);

        // Designed home base value = Current Property + Initial Value Add
        const designedStartValue = propertyValue + initialValueAdd;
        const designedFutureValue = designedStartValue * Math.pow(1 + APPRECIATION_RATES.designed, timeHorizon);

        const netDesignEquity = designedFutureValue - standardFutureValue;

        return {
            initialValueAdd,
            immediateEquity,
            standardFutureValue,
            designedFutureValue,
            netDesignEquity,
            avgRecoverability
        };
    }, [propertyValue, budget, timeHorizon, activeZones]);


    return (
        <div className="w-full max-w-7xl mx-auto rounded-[2rem] bg-zinc-950 border border-white/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[850px]">

            {/* ═══ LEFT PANEL: INPUTS ═══ */}
            <div className="w-full lg:w-[40%] p-8 lg:p-10 flex flex-col bg-zinc-900 border-r border-white/5 z-20">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-white tracking-wide">Design Equity Forecaster</h2>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Wealth Creation Engine</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    {/* Property Value */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Current Valuation
                            </label>
                            <span className="font-mono text-lg text-white">{formatINR(propertyValue)}</span>
                        </div>
                        <input
                            type="range" min="10000000" max="100000000" step="1000000"
                            value={propertyValue} onChange={(e) => setPropertyValue(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            aria-label="Current Valuation"
                        />
                    </div>

                    {/* Budget */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                <Wallet className="w-3 h-3" /> Design Investment
                            </label>
                            <span className="font-mono text-lg text-white">{formatINR(budget)}</span>
                        </div>
                        <input
                            type="range" min="1000000" max="20000000" step="500000"
                            value={budget} onChange={(e) => setBudget(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            aria-label="Design Investment"
                        />
                    </div>

                    {/* Timeline Slider */}
                    <div className="pt-4 border-t border-white/5">
                        <TimelineSlider value={timeHorizon} onChange={setTimeHorizon} />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Recoverability</div>
                            <div className="text-2xl font-light text-white font-serif">{Math.round(stats.avgRecoverability * 100)}%</div>
                            <div className="text-[9px] text-white/30 mt-1">Based on zone selection</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Design Alpha</div>
                            <div className="text-2xl font-light text-emerald-400 font-serif">
                                +{(APPRECIATION_RATES.designed * 100) - (APPRECIATION_RATES.standard * 100)}%
                            </div>
                            <div className="text-[9px] text-white/30 mt-1">Annual Surplus Growth</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ═══ RIGHT PANEL: VISUALIZATION ═══ */}
            <div className="w-full lg:w-[60%] bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 w-full max-w-lg space-y-12">

                    {/* 1. Spatial Heatmap */}
                    <div>
                        <div className="text-center mb-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Zone Strategy</h3>
                            <p className="text-xs text-white/40 mt-1">Select zones to optimize investment recovery</p>
                        </div>
                        <SpatialHeatmap
                            activeZones={activeZones}
                            onToggleZone={(id) => {
                                setActiveZones(prev => prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]);
                            }}
                        />
                    </div>

                    {/* 2. Key Metric: Net Equity Gain */}
                    <div className="text-center space-y-2">
                        <div className="text-xs text-emerald-400 font-bold uppercase tracking-[0.2em]">
                            Projected Design Equity
                        </div>
                        <motion.div
                            key={timeHorizon}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl lg:text-6xl font-serif text-white flex justify-center items-center gap-3"
                        >
                            <span>+</span>
                            {formatINR(stats.netDesignEquity)}
                        </motion.div>
                        <p className="text-xs text-white/30 max-w-sm mx-auto">
                            Additional wealth generated over <span className="text-white">{timeHorizon} years</span> compared to a standard property, driven by premium aesthetics and functional upgrades.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}
