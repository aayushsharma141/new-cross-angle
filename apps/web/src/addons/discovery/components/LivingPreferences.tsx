import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserSignals } from '@/types/discovery';

interface Props {
  onComplete: (data: Pick<UserSignals, 'sliderValues' | 'lifestyleChoices'>) => void;
}

const STORAGE_OPTIONS = [
  "Hidden storage", "Loft storage", "Shoe storage",
  "Seasonal storage", "Kids storage", "Crockery display",
  "Wardrobe max", "Utility hidden", "Suitcases", "Festival items",
  "Cleaning supplies", "Bulk groceries", "Linen storage",
  "Hobby storage"
];

export default function LivingPreferences({ onComplete }: Props) {
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [storageSlider, setStorageSlider] = useState<number>(5);

  const toggleStorage = (item: string) => {
    setSelectedStorage(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    onComplete({ 
      lifestyleChoices: selectedStorage,
      sliderValues: [{ label: "Visible display vs hidden storage", value: storageSlider }] 
    });
  };

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full flex flex-col items-center text-center"
        >
          <p className="text-xs font-bold tracking-[0.15em] text-[#5a5a5a] uppercase mb-4">STORAGE INTELLIGENCE</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-8 font-serif tracking-tight">
            Where do you need storage to disappear?
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 w-full mb-12">
            {STORAGE_OPTIONS.map((item) => (
              <button
                key={item}
                onClick={() => toggleStorage(item)}
                className={`px-5 py-3 rounded-full border transition-all duration-300 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
                  selectedStorage.includes(item)
                    ? "bg-[#70593a]/5 border-[#70593a] text-[#1a1a1a] shadow-[0_0_10px_rgba(112,89,58,0.1)]"
                    : "bg-white/70 border-[#e8e4dd] text-[#1a1a1a] hover:bg-white hover:border-[#70593a]/30"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="w-full max-w-2xl mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="text-[#1a1a1a] font-medium text-sm">Visible display vs hidden storage</span>
              <span className="text-[#70593a] font-mono text-xs">{storageSlider}/10</span>
            </div>
            
            <div className="relative w-full px-2">
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-2 bg-[#70593a] rounded-l-full pointer-events-none z-0 left-2"
                style={{ width: `calc(${(storageSlider / 10) * 100}% - 16px)` }}
              />
              <input
                type="range"
                min="0"
                max="10"
                value={storageSlider}
                title="Storage Preference"
                onChange={(e) => setStorageSlider(Number(e.target.value))}
                className="w-full h-2 bg-[#e8e4dd] rounded-full appearance-none cursor-pointer relative z-10
                  focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2 focus-visible:outline-none
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#70593a] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-[#70593a] [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab bg-transparent"
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-[#5a5a5a] px-2 font-light">
              <span>Display beautiful things</span>
              <span>Hide everything</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 px-10 py-4 font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-md focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none bg-[#70593a] text-white hover:bg-[#8b6f47] hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}
