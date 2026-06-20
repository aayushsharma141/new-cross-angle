import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, TrendingDown, Layers, Star } from 'lucide-react';
import type { UserSignals } from '@/types/discovery';

interface Props {
  signals: UserSignals;
  onComplete: (data: { budgetBracket: string; luxuryResolution?: string }) => void;
}

const BUDGET_BRACKETS = [
  { id: '₹5L–₹15L', label: '₹5 – 15 Lakhs', desc: 'Smart, value-focused execution', luxuryLevel: 1 },
  { id: '₹15L–₹30L', label: '₹15 – 30 Lakhs', desc: 'Balanced quality and finishes', luxuryLevel: 2 },
  { id: '₹30L–₹60L', label: '₹30 – 60 Lakhs', desc: 'Premium materials and custom work', luxuryLevel: 3 },
  { id: '₹60L–₹1Cr', label: '₹60L – 1 Crore', desc: 'High-end with signature pieces', luxuryLevel: 4 },
  { id: '₹1Cr+', label: '₹1 Crore+', desc: 'Bespoke, no-compromise execution', luxuryLevel: 5 },
];

// Derive sensory luxury level from signals
function getSensoryLuxuryLevel(signals: UserSignals): number {
  // premium materials + low minimalism + high novelty = high luxury expectation
  const materialScore: Record<string, number> = {
    'Polished Stone': 4, 'Matte Metal': 3, 'Warm Timber': 2, 'Woven Linen': 2, 'Brushed Concrete': 2
  };
  const matScore = materialScore[signals.materialChoice || ''] ?? 2;
  const lightScore: Record<string, number> = {
    'Dramatic Spotlight': 4, 'Golden Hour': 2, 'Cool Daylight': 2, 'Soft Candlelight': 2
  };
  const ltScore = lightScore[signals.lightPreference || ''] ?? 2;
  // average with novelty
  const noveltyBonus = (signals.scores?.novelty ?? 5) / 10;
  return Math.min(5, Math.round((matScore + ltScore) / 2 + noveltyBonus));
}

export default function BudgetAlignment({ signals, onComplete }: Props) {
  const [selected, setSelected] = useState<string>();
  const [conflictMode, setConflictMode] = useState(false);
  const [resolution, setResolution] = useState<string>();

  const sensoryLuxury = useMemo(() => getSensoryLuxuryLevel(signals), [signals]);

  const handleSelect = (bracket: typeof BUDGET_BRACKETS[0]) => {
    setSelected(bracket.id);
    const conflict = sensoryLuxury >= 3 && bracket.luxuryLevel <= 1;
    if (conflict) {
      setTimeout(() => setConflictMode(true), 500);
    } else {
      setTimeout(() => onComplete({ budgetBracket: bracket.id }), 600);
    }
  };

  if (conflictMode) {
    return (
      <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white border border-[#e8e4dd] p-8 rounded-3xl text-center shadow-lg"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#70593a]/10 flex items-center justify-center text-[#70593a]">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-normal text-[#1a1a1a] mb-4">
            Budget–Sensory Conflict
          </h2>
          <p className="text-[#5a5a5a] text-sm md:text-base mb-8 leading-relaxed max-w-lg mx-auto font-light">
            Your aesthetic instincts lean toward premium materials and dramatic lighting — but your budget bracket suggests a tighter scope. 
            Here's how we can still achieve that atmosphere:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mb-8">
            <button
              type="button"
              onClick={() => setResolution('hero-focus')}
              className={`p-5 border rounded-2xl transition-all text-left focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
                resolution === 'hero-focus' 
                  ? 'border-[#70593a] bg-[#70593a]/5 shadow-sm' 
                  : 'border-[#e8e4dd] bg-white/70 hover:bg-white hover:border-[#70593a]/30'
              }`}
            >
              <Star className="w-5 h-5 text-[#70593a] mb-3" />
              <h3 className="text-[#1a1a1a] font-serif font-medium text-sm mb-1">Focus on Hero Spaces</h3>
              <p className="text-[#5a5a5a] text-xs leading-relaxed font-light">Premium finishes only in Living Room + Master. Keep secondary rooms simple.</p>
            </button>
            
            <button
              type="button"
              onClick={() => setResolution('material-swap')}
              className={`p-5 border rounded-2xl transition-all text-left focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
                resolution === 'material-swap' 
                  ? 'border-[#70593a] bg-[#70593a]/5 shadow-sm' 
                  : 'border-[#e8e4dd] bg-white/70 hover:bg-white hover:border-[#70593a]/30'
              }`}
            >
              <Layers className="w-5 h-5 text-[#70593a] mb-3" />
              <h3 className="text-[#1a1a1a] font-serif font-medium text-sm mb-1">Smart Material Swaps</h3>
              <p className="text-[#5a5a5a] text-xs leading-relaxed font-light">Achieve the same visual luxury using engineered alternatives (e.g. laminate that looks like stone).</p>
            </button>
            
            <button
              type="button"
              onClick={() => setResolution('phased')}
              className={`p-5 border rounded-2xl transition-all text-left focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none ${
                resolution === 'phased' 
                  ? 'border-[#70593a] bg-[#70593a]/5 shadow-sm' 
                  : 'border-[#e8e4dd] bg-white/70 hover:bg-white hover:border-[#70593a]/30'
              }`}
            >
              <TrendingDown className="w-5 h-5 text-[#70593a] mb-3" />
              <h3 className="text-[#1a1a1a] font-serif font-medium text-sm mb-1">Phased Execution</h3>
              <p className="text-[#5a5a5a] text-xs leading-relaxed font-light">Design everything now, execute in 2 phases. Phase 1 today, Phase 2 in 12 months.</p>
            </button>
          </div>

          <button
            type="button"
            onClick={() => resolution && onComplete({ budgetBracket: selected!, luxuryResolution: resolution })}
            disabled={!resolution}
            className="px-10 py-4 bg-[#70593a] text-white hover:bg-[#8b6f47] font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none inline-flex items-center gap-2"
          >
            Accept This Strategy
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-5xl font-normal text-[#1a1a1a] mb-3 text-center tracking-tight"
        >
          What is your comfort budget?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base text-[#5a5a5a] mb-12 text-center max-w-xl font-light leading-relaxed"
        >
          This is the final constraint check. We'll align your sensory preferences to what's realistically achievable.
        </motion.p>

        <div className="flex flex-col gap-4.5 w-full max-w-2xl px-2">
          {BUDGET_BRACKETS.map((bracket, i) => {
            const isSelected = selected === bracket.id;
            return (
              <motion.button
                key={bracket.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                type="button"
                onClick={() => handleSelect(bracket)}
                className={`
                  flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left w-full hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none
                  ${isSelected
                    ? 'border-[#70593a] bg-[#70593a]/5 text-[#1a1a1a] shadow-[0_0_15px_rgba(112,89,58,0.08)]'
                    : 'border-[#e8e4dd] bg-white/70 text-[#2a2a2a] hover:bg-white hover:border-[#70593a]/30'
                  }
                `}
              >
                <div>
                  <span className="font-serif text-lg font-medium text-[#1a1a1a] block">{bracket.label}</span>
                  <span className="text-xs text-[#5a5a5a] leading-relaxed font-light mt-1 block">{bracket.desc}</span>
                </div>
                <div className="flex gap-1.5 ml-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div
                      key={j}
                      className={`w-1.5 h-6 rounded-full transition-all ${
                        j < bracket.luxuryLevel 
                          ? isSelected ? 'bg-[#70593a]' : 'bg-[#70593a]/70' 
                          : 'bg-[#e8e4dd]'
                      }`}
                    />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
