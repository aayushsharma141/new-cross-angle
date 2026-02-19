
"use client";

import React, { useState } from 'react';
import { CinematicSection } from '../shared/CinematicSection';
import { MATERIALS } from '../MaterialEstimator/data';
import { RiskBadge } from '../MaterialEstimator/RiskBadge';
import { cn, formatINR } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Layers, ArrowRight } from 'lucide-react';

export default function TactileInvestment() {
    const [selectedMaterialId, setSelectedMaterialId] = useState(MATERIALS[0].id);
    const selectedMaterial = MATERIALS.find(m => m.id === selectedMaterialId) || MATERIALS[0];
    const [showFinancials, setShowFinancials] = useState(false);

    // Hardcoded placeholder textures for now since generation failed
    // Ideally these would be the generated images
    const getTextureUrl = (id: string) => {
        // Using external placeholder services or reusing internal assets if available.
        // For now, using a solid color gradient simulation as a fallback.
        return null;
    };

    return (
        <CinematicSection className="relative bg-zinc-900" id="tactile-investment">

            {/* Background Texture (Full Screen) */}
            <div className={cn(
                "absolute inset-0 z-0 transition-colors duration-1000",
                selectedMaterial.color.replace('bg-', 'bg-').replace('text-', '') // Hacky map to bg color
            )}>
                {/* Overlay to darken the color for text readability */}
                <div className="absolute inset-0 bg-black/70" />

                {/* Texture Pattern (CSS Pattern) */}
                <div className="absolute inset-0 opacity-20 mixed-blend-overlay bg-[url('data:image/svg+xml,%3Csvg%20width=\'60\'%20height=\'60\'%20viewBox=\'0%200%2060%2060\'%20xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg%20fill=\'none\'%20fill-rule=\'evenodd\'%3E%3Cg%20fill=\'%23ffffff\'%20fill-opacity=\'0.1\'%3E%3Cpath%20d=\'M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat" />
            </div>


            {/* Content Content */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between py-20">

                {/* Header (Top Left) */}
                <div className="space-y-2 pt-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            <Coins className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Investment Longevity</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-white tracking-tight">
                        Choose your <span className="italic text-white/50">legacy.</span>
                    </h2>
                </div>


                {/* Material Selector (Center/Right Floating) */}
                <div className="self-end w-full max-w-md space-y-6">

                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
                        <div className="space-y-4">
                            {MATERIALS.map((mat) => (
                                <button
                                    key={mat.id}
                                    onClick={() => setSelectedMaterialId(mat.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-3 rounded-xl transition-all border",
                                        selectedMaterialId === mat.id
                                            ? "bg-white/10 border-white/20"
                                            : "bg-transparent border-transparent hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn("w-12 h-12 rounded-lg shadow-inner", mat.color)} />
                                    <div className="text-left flex-1">
                                        <div className="text-sm font-bold text-white">{mat.name}</div>
                                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{mat.risk.level === 'Low' ? 'High Durability' : 'High Maintenance'}</div>
                                    </div>
                                    {selectedMaterialId === mat.id && (
                                        <motion.div layoutId="selection-dot" className="w-2 h-2 rounded-full bg-emerald-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logic Insight */}
                    <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <p className="text-sm text-white/70 leading-relaxed italic">
                            "{selectedMaterial.description}"
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                            <RiskBadge level={selectedMaterial.risk.level} />
                            <button
                                onClick={() => setShowFinancials(true)}
                                className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                View 5-Year Cost Projection →
                            </button>
                        </div>
                    </div>

                </div>

            </div>

            {/* Financial Modal */}
            <AnimatePresence>
                {showFinancials && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl p-10 relative">
                            <button
                                onClick={() => setShowFinancials(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                                aria-label="Close Financials"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-3xl font-serif text-white mb-2">The True Cost</h3>
                                    <p className="text-white/50 mb-8">Base price is deceptive. Maintenance defines the reality.</p>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm text-white/60 mb-1">Base Investment</div>
                                            <div className="text-2xl font-mono text-white">{formatINR(selectedMaterial.price * 500)}</div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm text-white/60 mb-1">5-Year Maintenance</div>
                                            <div className="text-2xl font-mono text-red-400">
                                                +{formatINR(selectedMaterial.risk.level === 'High' ? 150000 : 25000)}
                                            </div>
                                            <p className="text-[10px] text-white/30 mt-1">Includes polishing, sealing, and breakage.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-lg text-white font-bold mb-2">Durability Score</div>
                                        <div className="text-6xl font-serif text-emerald-500">
                                            {selectedMaterial.risk.level === 'Low' ? '9.5' : selectedMaterial.risk.level === 'Medium' ? '7.2' : '4.8'}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-widest text-white/30 mt-2">Likelihood of Perfection in Year 5</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </CinematicSection>
    );
}

