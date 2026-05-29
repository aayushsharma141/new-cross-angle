import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { InterpretationConflict, UserSignals } from '@/types/discovery';

interface Props {
  conflict: InterpretationConflict;
  signals: UserSignals;
  onResolve: (resolution: 'emotionally-quiet' | 'visually-luxurious' | 'balanced') => void;
}

const RESOLUTION_OPTIONS = [
  {
    id: 'emotionally-quiet' as const,
    headline: 'Emotionally quiet',
    detail: 'Design for how you want to feel — calm, decompressed, free from stimulation. Visual drama takes a back seat to psychological peace.',
    color: '#4a7c59',
    bgGlow: 'rgba(74,124,89,0.08)',
  },
  {
    id: 'visually-luxurious' as const,
    headline: 'Visually luxurious',
    detail: 'Design for what moves you visually — rich, atmospheric, intentionally impressive. The emotion comes through visual depth.',
    color: '#70593a',
    bgGlow: 'rgba(112,89,58,0.08)',
  },
  {
    id: 'balanced' as const,
    headline: 'Balanced — quiet luxury',
    detail: 'A curated middle ground: luxury that whispers rather than shouts. Rich materials in restrained compositions. The best of both.',
    color: '#6b7fb0',
    bgGlow: 'rgba(107,127,176,0.08)',
  },
];

const ReinterpretationGate: React.FC<Props> = ({ conflict, signals, onResolve }) => {
  const [selected, setSelected] = React.useState<'emotionally-quiet' | 'visually-luxurious' | 'balanced' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-[90vh] w-full flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#8b6f47]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8b6f47] font-mono font-bold">
            Insight Detected
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-6 text-center leading-snug"
        >
          We noticed something<br />
          <em className="text-[#8b6f47] not-italic font-semibold">interesting about you.</em>
        </motion.h2>

        {/* Conflict statement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full bg-white border border-[#e8e4dd] rounded-2xl p-6 mb-10 text-center shadow-sm"
        >
          <p className="text-[#5a5a5a] leading-relaxed text-[15px]">
            {conflict.conflictSummary}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#8c8c8c] block mb-1">You said</span>
              <span className="text-[#1a1a1a] font-semibold text-sm">"{signals.intent}"</span>
            </div>
            <div className="w-12 h-px bg-[#e8e4dd]" />
            <div className="text-center">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#8c8c8c] block mb-1">You chose</span>
              <span className="text-[#8b6f47] font-semibold text-sm capitalize">{conflict.visualSignal}</span>
            </div>
          </div>
        </motion.div>

        {/* Resolution question */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#5a5a5a] text-sm mb-6 text-center font-light"
        >
          Would you prefer your home to feel:
        </motion.p>

        {/* Resolution options */}
        <div className="flex flex-col gap-3 w-full mb-10">
          {RESOLUTION_OPTIONS.map((opt, i) => (
            <motion.button
              type="button"
              key={opt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.1 }}
              onClick={() => setSelected(opt.id)}
              className={`
                relative w-full text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none
                ${selected === opt.id
                  ? 'bg-white shadow-md'
                  : 'border-[#e8e4dd] bg-white hover:border-[#1a1a1a]/25 hover:bg-[#faf8f5]'
                }
              `}
              style={{
                borderColor: selected === opt.id ? opt.color : undefined,
              }}
            >
              {selected === opt.id && (
                <motion.div
                  layoutId="gate-glow"
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 30% 50%, ${opt.bgGlow}, transparent 70%)` }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 transition-all"
                    style={{ background: selected === opt.id ? opt.color : '#e8e4dd' }}
                  />
                  <span className="font-semibold text-[#1a1a1a] text-sm">{opt.headline}</span>
                </div>
                <p className="text-[#5a5a5a] text-xs leading-relaxed pl-5 font-light">{opt.detail}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Confirm */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <AnimatePresence>
            {selected && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                onClick={() => onResolve(selected)}
                className="px-8 py-3 bg-[#70593a] text-white font-medium rounded-full hover:bg-[#5e4b31] transition-colors inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none"
              >
                This feels right
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default ReinterpretationGate;
