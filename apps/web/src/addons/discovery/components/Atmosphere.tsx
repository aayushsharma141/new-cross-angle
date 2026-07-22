import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserSignals } from '@/types/discovery';

interface Props {
  onComplete: (data: Pick<UserSignals, 'atmosphere'>) => void;
}

const COLOR_MOODS = [
  { name: "Warm beige", color: "#d6c9b3" },
  { name: "White minimal", color: "#f4f4f2", border: true },
  { name: "Dark moody", color: "#2a2a2a" },
  { name: "Earthy clay", color: "#b05e3b" },
  { name: "Wood-heavy", color: "#8c7023" },
  { name: "Black luxury", color: "#101010" },
  { name: "Neutral luxury", color: "#c8bead" },
  { name: "Bold colors", color: "#8a1a41" },
  { name: "Pastel calm", color: "#c3d8cd" },
];

export default function Atmosphere({ onComplete }: Props) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const handleSubmit = () => {
    onComplete({ atmosphere: selectedMoods });
  };

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full flex flex-col items-center text-center"
        >
          <p className="text-xs font-bold tracking-[0.15em] text-[#5a5a5a] uppercase mb-4">ATMOSPHERE</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-2 font-serif tracking-tight">
            Which color moods feel liveable?
          </h2>
          <p className="text-[#5a5a5a] mb-8 text-base font-light">
            Select the palettes that evoke the emotional response you want.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 w-full mb-10">
            {COLOR_MOODS.map((mood) => (
              <button
                key={mood.name}
                onClick={() => toggleMood(mood.name)}
                className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all duration-300 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
                  selectedMoods.includes(mood.name)
                    ? "bg-[#70593a]/5 border-[#70593a] text-[#1a1a1a] shadow-[0_0_10px_rgba(112,89,58,0.1)]"
                    : "bg-white/70 border-[#e8e4dd] text-[#1a1a1a] hover:bg-white hover:border-[#70593a]/30"
                }`}
              >
                <span 
                  className={`w-4 h-4 rounded-full ${mood.border ? 'border border-[#e8e4dd]' : ''}`} 
                  style={{ backgroundColor: mood.color }} 
                />
                <span className="font-serif">{mood.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedMoods.length === 0}
            className={`mt-4 px-10 py-4 font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-md focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
              selectedMoods.length > 0
                ? "bg-[#70593a] text-white hover:bg-[#8b6f47] hover:shadow-lg hover:scale-105 active:scale-95"
                : "bg-[#e8e4dd] text-[#a0a0a0] cursor-not-allowed shadow-none"
            }`}
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}
