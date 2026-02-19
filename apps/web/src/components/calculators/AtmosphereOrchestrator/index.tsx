"use client";

import React from 'react';
import { useAtmosphere } from './useAtmosphere';
import { VisualizerCanvas } from './VisualizerCanvas';
import { MoodRail } from './MoodRail';
import { IntensityArc } from './IntensityArc';
import { DecisionImpactStrip } from './DecisionImpactStrip';
import { ROOM_STANDARDS, LIGHTING_MARKET_DATA } from './data';
import { Lightbulb, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function AtmosphereOrchestrator() {
    const { inputs, setInputs, stats } = useAtmosphere();

    // Helper Handlers
    const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, area: parseInt(e.target.value) });
    };

    return (
        <div className="w-full max-w-7xl mx-auto rounded-[2rem] bg-zinc-950 border border-white/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[850px]">

            {/* ═══ LEFT PANEL: COMMAND CENTER ═══ */}
            <div className="w-full lg:w-[40%] p-8 lg:p-10 flex flex-col bg-zinc-900 border-r border-white/5 relative z-20">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/10">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-white tracking-wide">Atmosphere Calibration</h2>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Will my room feel right?</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">

                    {/* 1. Zone Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Zone Configuration</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(ROOM_STANDARDS).map(([key, data]) => (
                                <button
                                    key={key}
                                    onClick={() => setInputs({ ...inputs, roomType: key })}
                                    className={cn(
                                        "px-4 py-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group",
                                        inputs.roomType === key
                                            ? "bg-white/10 text-white border-white/20"
                                            : "bg-transparent text-white/40 border-white/5 hover:bg-white/5 hover:text-white/60"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-medium relative z-10",
                                        inputs.roomType === key ? "text-white" : "text-white/60"
                                    )}>
                                        {data.label}
                                    </span>
                                    {inputs.roomType === key && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white/5"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Dimensions */}
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5 space-y-5">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                <Maximize2 className="w-3 h-3" />
                                Floor Area
                            </label>
                            <span className="font-mono text-lg text-white">{inputs.area} <span className="text-xs text-white/30">sqft</span></span>
                        </div>
                        <input
                            type="range" min="100" max="2000" step="50" value={inputs.area} onChange={handleAreaChange}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-orange-400 transition-colors"
                            aria-label="Floor Area"
                        />

                        <div className="flex items-center justify-between pt-2">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Ceiling Height</label>
                            <div className="flex bg-white/5 p-1 rounded-lg">
                                <button
                                    onClick={() => setInputs({ ...inputs, height: 'standard' })}
                                    className={cn("px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all", inputs.height === 'standard' ? "bg-white/10 text-white shadow-sm" : "text-white/30")}
                                >
                                    Standard (10ft)
                                </button>
                                <button
                                    onClick={() => setInputs({ ...inputs, height: 'double' })}
                                    className={cn("px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all", inputs.height === 'double' ? "bg-white/10 text-white shadow-sm" : "text-white/30")}
                                >
                                    Double (18ft+)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Mood Rail */}
                    <MoodRail
                        activeMood={inputs.mood}
                        onMoodChange={(mood) => setInputs({ ...inputs, mood })}
                    />

                    {/* 4. Tier Selection */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Hardware Grade</label>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.values(LIGHTING_MARKET_DATA).map((tier) => (
                                <button
                                    key={tier.id}
                                    onClick={() => setInputs({ ...inputs, tier: tier.id })}
                                    className={cn(
                                        "px-4 py-3 rounded-xl border text-left transition-all duration-300 flex justify-between items-center group",
                                        inputs.tier === tier.id
                                            ? "bg-white/10 border-white/20 shadow-lg text-white"
                                            : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"
                                    )}
                                >
                                    <span className="text-xs font-bold uppercase tracking-wide">{tier.label}</span>
                                    <span className={cn(
                                        "text-[10px] font-mono px-2 py-0.5 rounded border",
                                        inputs.tier === tier.id ? "border-white/20 bg-white/10" : "border-transparent text-white/20"
                                    )}>{tier.priceTier}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* ═══ RIGHT PANEL: VISUAL CANVAS ═══ */}
            <div className="w-full lg:w-[60%] flex flex-col bg-black relative">

                {/* Visualizer */}
                <div className="relative flex-1 min-h-[500px]">
                    <VisualizerCanvas
                        roomType={inputs.roomType}
                        kelvin={stats.kelvin}
                        dimmerLevel={inputs.intensity}
                        isDoubleHeight={inputs.height === 'double'}
                    />

                    {/* Intensity Arc Overlay */}
                    <IntensityArc
                        value={inputs.intensity}
                        onChange={(val) => setInputs({ ...inputs, intensity: val })}
                    />

                    {/* Current Reality Bar (Overlaid at bottom) */}
                    <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex justify-between items-center shadow-2xl">
                        <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Requirements</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-mono text-white">{stats.fixtureCount}</span>
                                <span className="text-xs text-white/50">Fixtures</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Load</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-mono text-white">{stats.wattage}</span>
                                <span className="text-xs text-white/50">Watts</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Monthly Cost</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-mono text-white">₹{Math.round(stats.costs.annualEnergy / 12)}</span>
                                <span className="text-xs text-white/50">/mo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decision Strip (Bottom Fixed Panel) */}
                <div className="bg-zinc-950 border-t border-white/10 p-6 lg:p-8">
                    <DecisionImpactStrip
                        impact={stats.impact}
                        marketScenario={inputs.marketScenario}
                        onScenarioChange={(val) => setInputs({ ...inputs, marketScenario: val })}
                        fiveYearCost={stats.costs.fiveYearTotal}
                        initialCost={stats.costs.total}
                    />
                </div>
            </div>

        </div>
    );
}
