"use client";

import React, { useState } from 'react';
import { MATERIALS } from './data';
import { RiskBadge } from './RiskBadge';
import { LifecycleTimeline } from './LifecycleTimeline';
import { ZoomPanel } from './ZoomPanel';
import { Coins, AlertOctagon, Check, ArrowRight } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MaterialEstimator() {
    const [selectedMaterialId, setSelectedMaterialId] = useState(MATERIALS[0].id);
    const [area, setArea] = useState(500);

    const selectedMaterial = MATERIALS.find(m => m.id === selectedMaterialId) || MATERIALS[0];

    // Calculations
    const baseCost = selectedMaterial.price * area;
    const wastageCost = baseCost * selectedMaterial.wastage.percent;
    const transportCost = selectedMaterial.wastage.transportCost * area;
    const totalCapex = baseCost + wastageCost + transportCost;

    return (
        <div className="w-full max-w-7xl mx-auto rounded-[2rem] bg-zinc-950 border border-white/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[850px]">

            {/* ═══ LEFT PANEL: INTELLIGENCE HUB ═══ */}
            <div className="w-full lg:w-[40%] p-8 lg:p-10 flex flex-col bg-zinc-900 border-r border-white/5 relative z-20">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                            <Coins className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-white tracking-wide">Lifecycle Cost Mapping</h2>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Price vs. True Cost</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">

                    {/* 1. Dimensions */}
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5 space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                Total Surface Area
                            </label>
                            <span className="font-mono text-lg text-white">{area} <span className="text-xs text-white/30">sqft</span></span>
                        </div>
                        <input
                            type="range" min="50" max="5000" step="50" value={area} onChange={(e) => setArea(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-colors"
                            aria-label="Total Surface Area"
                        />
                    </div>

                    {/* 2. Material Selector Cards */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Material Evaluation</label>
                        <div className="space-y-3">
                            {MATERIALS.map((mat) => (
                                <button
                                    key={mat.id}
                                    onClick={() => setSelectedMaterialId(mat.id)}
                                    className={cn(
                                        "w-full p-4 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden",
                                        selectedMaterialId === mat.id
                                            ? "bg-white/10 border-white/20 shadow-xl"
                                            : "bg-transparent border-white/5 hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-lg shadow-inner", mat.color)} />
                                            <div>
                                                <div className="text-sm font-bold text-white">{mat.name}</div>
                                                <div className="text-[10px] text-white/40 font-mono">₹{mat.price}/sqft</div>
                                            </div>
                                        </div>
                                        <RiskBadge level={mat.risk.level} />
                                    </div>

                                    {selectedMaterialId === mat.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="text-[10px] text-white/60 pl-11 relative z-10"
                                        >
                                            {mat.description}
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Cost Breakdown */}
                    <div className="pt-6 border-t border-white/5 space-y-3">
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CapEx Breakdown</h3>

                        <div className="flex justify-between text-xs text-white/60">
                            <span>Base Material Cost</span>
                            <span className="font-mono">{formatINR(baseCost)}</span>
                        </div>

                        <div className="flex justify-between text-xs text-amber-500/80">
                            <span className="flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> Wastage ({selectedMaterial.wastage.percent * 100}%)</span>
                            <span className="font-mono">{formatINR(wastageCost)}</span>
                        </div>

                        <div className="flex justify-between text-xs text-white/60">
                            <span>Logistics & Handling</span>
                            <span className="font-mono">{formatINR(transportCost)}</span>
                        </div>

                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                            <span>Total Initial Investment</span>
                            <span className="font-serif text-lg">{formatINR(totalCapex)}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* ═══ RIGHT PANEL: VISUAL & LIFECYCLE ═══ */}
            <div className="w-full lg:w-[60%] bg-black flex flex-col p-6 lg:p-8 space-y-6">

                {/* 1. Zoom Visualization */}
                <div className="flex-1">
                    <ZoomPanel material={selectedMaterial} />
                </div>

                {/* 2. Lifecycle Timeline */}
                <div>
                    <LifecycleTimeline material={selectedMaterial} area={area} />
                </div>

                {/* 3. Strategic Summary */}
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 flex items-start gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-white">
                        <Check className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-1">Architect's Verdict</h4>
                        <p className="text-xs text-white/50 leading-relaxed max-w-lg">
                            You selected <strong>{selectedMaterial.name}</strong>. While the initial cost is <strong>{formatINR(totalCapex)}</strong>,
                            the {selectedMaterial.risk.level === 'High' ? 'intensive maintenance schedule' : 'superior durability'} affects the true 5-year cost.
                            {selectedMaterial.risk.level === 'High'
                                ? " Only recommended for low-traffic luxury zones."
                                : " Excellent choice for high-traffic areas."}
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
}
