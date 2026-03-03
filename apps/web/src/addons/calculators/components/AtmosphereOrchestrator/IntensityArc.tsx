import React from 'react';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';

interface IntensityArcProps {
    value: number;
    onChange: (val: number) => void;
}

export const IntensityArc: React.FC<IntensityArcProps> = ({ value, onChange }) => {
    return (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 h-[60%] flex flex-col items-center gap-4 z-20 group">
            <Sun className="w-4 h-4 text-white/40" />

            <div className="relative w-1.5 flex-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 via-amber-200 to-white transition-all duration-100"
                    style={{ height: `${value}%` }}
                />
                {/* Input range overlay for interaction */}
                <input
                    type="range"
                    min="0" max="100"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none bg-transparent [writing-mode:vertical-lr] [direction:rtl]"
                    aria-label="Light Intensity"
                />
            </div>

            <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/80 border border-white/10">
                {value}%
            </div>
        </div>
    );
};
