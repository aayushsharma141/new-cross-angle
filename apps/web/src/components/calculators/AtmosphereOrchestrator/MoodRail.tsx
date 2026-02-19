import React from 'react';
import { MOODS } from './data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MoodRailProps {
    activeMood: string;
    onMoodChange: (moodId: string) => void;
}

export const MoodRail: React.FC<MoodRailProps> = ({ activeMood, onMoodChange }) => {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Atmosphere Personality</label>
            <div className="grid grid-cols-4 gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                {MOODS.map((mood) => (
                    <button
                        key={mood.id}
                        onClick={() => onMoodChange(mood.id)}
                        className={cn(
                            "relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 group overflow-hidden",
                            activeMood === mood.id
                                ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10"
                                : "text-white/40 hover:bg-white/5 hover:text-white/70"
                        )}
                    >
                        {/* Active Background Glow */}
                        {activeMood === mood.id && (
                            <motion.div
                                layoutId="activeMoodBg"
                                className={cn("absolute inset-0 opacity-20", mood.color)}
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}

                        <span className="text-xs font-bold uppercase tracking-wide relative z-10">{mood.label}</span>
                        <span className="text-[9px] opacity-50 relative z-10 mt-0.5">{mood.kelvin}K</span>

                        {/* Hover Indicator */}
                        <div className={cn(
                            "absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300",
                            mood.color.replace('bg-', 'bg-'),
                            activeMood === mood.id ? "opacity-100" : "group-hover:opacity-50"
                        )} />
                    </button>
                ))}
            </div>
            <div className="flex justify-between px-2">
                <div className="text-[10px] text-white/30 uppercase tracking-widest">Psychology</div>
                <div className="text-[10px] text-white/60 font-medium italic">
                    {MOODS.find(m => m.id === activeMood)?.description}
                </div>
            </div>
        </div>
    );
};
