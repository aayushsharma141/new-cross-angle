import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserSignals } from '@/types/discovery';

interface Props {
  onComplete: (data: Pick<UserSignals, 'designIdentity'>) => void;
}

const DESIGN_LANGUAGES = [
  { name: "Modern Indian", desc: "Contemporary with Indian warmth" },
  { name: "Contemporary", desc: "Clean, current, timeless" },
  { name: "Minimal", desc: "Less is more, breathing space" },
  { name: "Luxury Modern", desc: "Premium materials, statement pieces" },
  { name: "Warm Earthy", desc: "Natural tones, organic textures" },
  { name: "Japandi", desc: "Japanese minimalism + Scandinavian warmth" },
  { name: "Industrial", desc: "Raw materials, urban edge" },
  { name: "Traditional Indian", desc: "Heritage, carved wood, rich colors" },
  { name: "Hotel Luxury", desc: "Polished, curated, impressive" },
  { name: "Modern Royal", desc: "Grand but not old-fashioned" },
];

export default function DesignIdentity({ onComplete }: Props) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(style)) return prev.filter(s => s !== style);
      if (prev.length >= 3) return prev;
      return [...prev, style];
    });
  };

  const handleSubmit = () => {
    onComplete({ designIdentity: selectedStyles });
  };

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full flex flex-col items-center text-center"
        >
          <p className="text-xs font-bold tracking-[0.15em] text-[#5a5a5a] uppercase mb-4">STYLE DIRECTION</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-2 font-serif tracking-tight">
            Which design language feels closest?
          </h2>
          <p className="text-[#5a5a5a] mb-8 text-base font-light">
            Pick up to 3. Most homes are hybrids.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6" role="group" aria-label="Design language selection (pick up to 3)">
            {DESIGN_LANGUAGES.map((style) => (
              <button
                type="button"
                key={style.name}
                onClick={() => toggleStyle(style.name)}
                {...{"aria-pressed": selectedStyles.includes(style.name)}}
                className={`flex flex-col items-center justify-center text-center p-5 rounded-2xl border transition-all duration-300 w-full focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none
                  ${selectedStyles.includes(style.name)
                    ? "bg-[#70593a]/5 border-[#70593a] text-[#1a1a1a] shadow-[0_0_15px_rgba(112,89,58,0.08)]"
                    : "bg-white/70 border-[#e8e4dd] hover:bg-white hover:border-[#70593a]/30"
                  }
                `}
              >
                <span className="text-[#1a1a1a] font-medium text-[15px] mb-1 font-serif">{style.name}</span>
                <span className="text-[#5a5a5a] text-xs font-light">{style.desc}</span>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-[#5a5a5a] mb-8">{selectedStyles.length}/3 selected</p>

          <button
            onClick={handleSubmit}
            disabled={selectedStyles.length === 0}
            className={`mt-4 px-10 py-4 font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-md focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
              selectedStyles.length > 0
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
