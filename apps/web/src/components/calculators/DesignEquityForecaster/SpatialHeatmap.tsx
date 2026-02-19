import React from 'react';
import { motion } from 'framer-motion';
import { ZONES } from './data';
import { cn } from '@/lib/utils';

interface SpatialHeatmapProps {
    activeZones: string[];
    onToggleZone: (id: string) => void;
}

export const SpatialHeatmap: React.FC<SpatialHeatmapProps> = ({ activeZones, onToggleZone }) => {
    return (
        <div className="relative aspect-square w-full max-w-md mx-auto bg-black border border-white/10 rounded-full p-8 flex items-center justify-center overflow-hidden">

            {/* Radar / Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 border border-white/20 rounded-full scale-50" />
                <div className="absolute inset-0 border border-white/20 rounded-full scale-75" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
            </div>

            {/* Zones Layout (Abstract representation) */}
            <div className="grid grid-cols-2 gap-4 w-full h-full relative z-10">
                {ZONES.map((zone) => {
                    const isActive = activeZones.includes(zone.id);
                    return (
                        <motion.button
                            key={zone.id}
                            onClick={() => onToggleZone(zone.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col items-center justify-center p-4 text-center group",
                                isActive
                                    ? "bg-white/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                        >
                            {/* Heatmap Glow Effect */}
                            {isActive && (
                                <motion.div
                                    layoutId={`glow-${zone.id}`}
                                    className="absolute inset-0 bg-emerald-500/10 blur-xl"
                                />
                            )}

                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest relative z-10 transition-colors",
                                isActive ? "text-emerald-400" : "text-white/40"
                            )}>
                                {zone.label}
                            </span>

                            <div className="mt-2 text-[10px] text-white/30 relative z-10">
                                ROI Impact: <span className={isActive ? "text-white" : ""}>{zone.impactScore}/10</span>
                            </div>

                            {/* Recoverability Tag */}
                            <div className={cn(
                                "absolute top-2 right-2 w-1.5 h-1.5 rounded-full transition-colors",
                                zone.recoverability > 0.8 ? "bg-emerald-500" : zone.recoverability > 0.7 ? "bg-amber-500" : "bg-red-500",
                                !isActive && "opacity-20"
                            )} />

                        </motion.button>
                    );
                })}
            </div>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-black rounded-full border border-white/10 flex items-center justify-center z-20 backdrop-blur-xl">
                    <span className="text-[10px] text-white/20 font-bold">PLAN</span>
                </div>
            </div>
        </div>
    );
};
