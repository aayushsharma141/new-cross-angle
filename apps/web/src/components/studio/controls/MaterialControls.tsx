
"use client";

import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MATERIALS } from '../../calculators/MaterialEstimator/data';
import { cn, formatINR } from '@/lib/utils';
import { motion } from 'framer-motion';
import { RiskBadge } from '@/components/calculators/MaterialEstimator/RiskBadge';
import { ShieldAlert, Info } from 'lucide-react';

export const MaterialControls = () => {
    const { selectedMaterialId, setSelectedMaterialId } = useStudio();
    const selectedMaterial = MATERIALS.find(m => m.id === selectedMaterialId) || MATERIALS[0];

    return (
        <div className="space-y-8">

            {/* Material List */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Material Palette</label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {MATERIALS.map((mat) => (
                        <button
                            key={mat.id}
                            onClick={() => setSelectedMaterialId(mat.id)}
                            className={cn(
                                "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border text-left group",
                                selectedMaterialId === mat.id
                                    ? "bg-white/10 border-white/20"
                                    : "bg-transparent border-transparent hover:bg-white/5"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-lg shadow-inner", mat.color)} />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{mat.name}</div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                    <span>{formatINR(mat.price)}/sqft</span>
                                    <span className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                                    <span>{mat.risk.level} Maint.</span>
                                </div>
                            </div>
                            {selectedMaterialId === mat.id && (
                                <motion.div layoutId="mat-dot" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Insight */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Durability Score</div>
                        <div className="text-2xl font-mono text-white">{selectedMaterial.lifecycle.durabilityScore}/100</div>
                    </div>
                    <RiskBadge level={selectedMaterial.risk.level} />
                </div>

                <div className="h-px w-full bg-white/5" />

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-widest">
                        <ShieldAlert className="w-3 h-3" /> Risk Factors
                    </div>
                    <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
                        {selectedMaterial.risk.factors.map((factor, i) => (
                            <li key={i}>{factor}</li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};
