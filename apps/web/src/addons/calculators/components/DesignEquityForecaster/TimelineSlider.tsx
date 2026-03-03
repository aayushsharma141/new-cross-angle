import React from 'react';
import { cn } from '@/lib/utils';
import { TIME_HORIZONS } from './data';
import { motion } from 'framer-motion';

interface TimelineSliderProps {
    value: number;
    onChange: (value: number) => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({ value, onChange }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    Investment Horizon
                </label>
                <div className="text-xl font-serif text-white">
                    {value === 0 ? 'Immediate Impact' : `${value} Year Projection`}
                </div>
            </div>

            <div className="relative h-12 bg-white/5 rounded-xl flex items-center px-2 border border-white/5">
                {/* Track Line */}
                <div className="absolute left-4 right-4 h-0.5 bg-white/10" />

                <div className="relative z-10 w-full flex justify-between px-2">
                    {TIME_HORIZONS.map((horizon) => (
                        <button
                            key={horizon.value}
                            onClick={() => onChange(horizon.value)}
                            className="group relative focus:outline-none"
                        >
                            {/* Dot */}
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 transition-all duration-300 relative z-10",
                                value === horizon.value
                                    ? "bg-emerald-500 border-emerald-500 scale-125 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                    : "bg-black border-white/20 hover:border-white/50"
                            )} />

                            {/* Label */}
                            <span className={cn(
                                "absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase whitespace-nowrap transition-colors duration-300",
                                value === horizon.value ? "text-emerald-400" : "text-white/30 group-hover:text-white/50"
                            )}>
                                {horizon.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Active Fill Line */}
                {/* Note: This is tricky with discrete steps, keeping it simple for now or could implement with width calculation */}
            </div>
        </div>
    );
};
