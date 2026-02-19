
"use client";

import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MoodRail } from '../../calculators/AtmosphereOrchestrator/MoodRail';
import { Slider } from '@/components/ui/slider'; // Assuming we have a slider component or use primitive
import { Sun, Maximize, Zap, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists

export const AtmosphereControls = () => {
    const { atmosphere } = useStudio();
    const { inputs, setInputs, stats } = atmosphere;

    return (
        <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Load
                    </div>
                    <div className="text-xl font-mono text-white">{stats.wattage}W</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" /> Est. Cost
                    </div>
                    <div className="text-xl font-mono text-white">₹{(stats.costs.total / 1000).toFixed(1)}k</div>
                </div>
            </div>

            {/* Intensity Slider */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Intensity</label>
                    <span className="text-xs font-mono text-white">{inputs.intensity}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.intensity}
                    onChange={(e) => setInputs({ ...inputs, intensity: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125"
                    aria-label="Intensity"
                />
            </div>

            {/* Room Type & Height */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Room Type</label>
                    <select
                        value={inputs.roomType}
                        onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-white/30"
                        aria-label="Room Type"
                    >
                        <option value="living">Living Room</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="bedroom">Bedroom</option>
                        <option value="office">Office</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <Maximize className="w-3 h-3" /> Height
                    </label>
                    <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setInputs({ ...inputs, height: 'standard' })}
                            className={cn(
                                "flex-1 text-[10px] py-1.5 rounded transition-colors",
                                inputs.height === 'standard' ? "bg-white/20 text-white" : "text-white/40 hover:text-white"
                            )}
                        >
                            Std
                        </button>
                        <button
                            onClick={() => setInputs({ ...inputs, height: 'double' })}
                            className={cn(
                                "flex-1 text-[10px] py-1.5 rounded transition-colors",
                                inputs.height === 'double' ? "bg-white/20 text-white" : "text-white/40 hover:text-white"
                            )}
                        >
                            Dbl
                        </button>
                    </div>
                </div>
            </div>

            {/* Mood Rail (Reused) */}
            <div className="pt-2 border-t border-white/5">
                <MoodRail
                    activeMood={inputs.mood}
                    onMoodChange={(mood) => setInputs({ ...inputs, mood })}
                />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <p className="text-[10px] text-blue-200 leading-relaxed">
                    <strong>Concierge Note:</strong> {stats.tierLabel} configuration selected. {stats.recommendation} levels achieved.
                </p>
            </div>
        </div>
    );
};
