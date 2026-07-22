import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserSignals } from '@/types/discovery';

interface Props {
  onComplete: (data: Pick<UserSignals, 'materialChoice'>) => void;
}

const ALL_MATERIALS = [
  "Marble", "Granite", "Veneer", "Laminate", "Fluted panels",
  "Stone texture", "Concrete look", "Matte finish", "Gloss finish",
  "Brass accents", "Glass partitions", "Wooden textures"
];

export default function MaterialIdentity({ onComplete }: Props) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const handleSubmit = () => {
    onComplete({ materialChoice: selectedMaterials.join(", ") });
  };

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full flex flex-col items-center text-center"
        >
          <p className="text-xs font-bold tracking-[0.15em] text-[#5a5a5a] uppercase mb-4">MATERIALS</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] mb-2 font-serif tracking-tight">
            Which materials are you naturally drawn to?
          </h2>
          <p className="text-[#5a5a5a] mb-8 text-base font-light">
            Pick all that appeal. Your designer will balance them.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 w-full mb-10">
            {ALL_MATERIALS.map((mat) => (
              <button
                type="button"
                key={mat}
                onClick={() => toggleMaterial(mat)}
                className={`px-5 py-3 rounded-full border transition-all duration-300 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
                  selectedMaterials.includes(mat)
                    ? "bg-[#70593a]/5 border-[#70593a] text-[#1a1a1a] shadow-[0_0_10px_rgba(112,89,58,0.1)]"
                    : "bg-white/70 border-[#e8e4dd] text-[#1a1a1a] hover:bg-white hover:border-[#70593a]/30"
                }`}
              >
                {mat}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedMaterials.length === 0}
            className={`mt-4 px-10 py-4 font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-md focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
              selectedMaterials.length > 0
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
