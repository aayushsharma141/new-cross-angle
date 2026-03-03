import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { visualImages } from "@/constants/discovery";
import { AestheticScores } from "@/types/discovery";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, selectedIds?: number[]) => void;
}

const VisualInstinct = ({ onComplete }: Props) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const MAX = 6;

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < MAX ? [...prev, id] : prev
    );
  };

  const markLoaded = (id: number) => {
    setLoaded((prev) => new Set([...prev, id]));
  };

  const confirm = () => {
    const scores: Partial<AestheticScores> = {};
    for (const id of selected) {
      const img = visualImages.find((i) => i.id === id);
      if (img) {
        for (const [k, v] of Object.entries(img.tags)) {
          const key = k as keyof AestheticScores;
          scores[key] = (scores[key] || 0) + v;
        }
      }
    }
    onComplete(scores, selected);
  };

  const remaining = MAX - selected.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col w-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex-none text-center pt-8 pb-5 px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif-display text-4xl md:text-5xl text-white/90 mb-2"
        >
          Visual Preferences
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-sm mb-5"
        >
          Pick {MAX} images that feel like &#34;home&#34; to you.
        </motion.p>

        {/* Progress counter */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-1.5">
            {Array.from({ length: MAX }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-white/20"
                animate={{
                  background: i < selected.length ? "rgb(251 191 36)" : "transparent",
                  borderColor: i < selected.length ? "rgb(251 191 36)" : "rgba(255,255,255,0.15)",
                  scale: i < selected.length ? [1, 1.25, 1] : 1,
                }}
                transition={{ duration: 0.35 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={remaining}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-[9px] uppercase tracking-[0.2em] font-mono text-white/30"
            >
              {remaining > 0 ? `${remaining} more to pick` : "All done!"}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Uniform 4-col grid — predictable, all images same aspect ratio */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visualImages.map((img, idx) => {
            const isSelected = selected.includes(img.id);
            const isLoaded = loaded.has(img.id);
            const isMaxed = selected.length >= MAX && !isSelected;

            return (
              <motion.button
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.025 }}
                whileHover={!isMaxed ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggle(img.id)}
                className={`
                  relative w-full aspect-[4/3] overflow-hidden
                  transition-all duration-500 focus:outline-none
                  ${isSelected
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0D0A08]"
                    : "ring-1 ring-white/10 hover:ring-white/25"
                  }
                  ${isMaxed ? "opacity-30 cursor-default" : "cursor-pointer"}
                `}
              >
                {/* Skeleton loader */}
                {!isLoaded && (
                  <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
                )}

                <img
                  src={img.url}
                  alt=""
                  className={`
                    w-full h-full object-cover transition-all duration-700
                    ${isLoaded ? "opacity-100" : "opacity-0"}
                    ${!isSelected && selected.length > 0 && !isMaxed
                      ? "grayscale-[0.6] opacity-60"
                      : "grayscale-0 opacity-100"
                    }
                    ${isSelected ? "scale-[1.04]" : "scale-100"}
                  `}
                  loading="eager"
                  onLoad={() => markLoaded(img.id)}
                />

                {/* Subtle amber tint on selected */}
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-400/8 pointer-events-none" />
                )}

                {/* Gold corner tick — replaces heavy red circle */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="absolute top-2 right-2 z-20"
                    >
                      <div className="w-5 h-5 bg-amber-400 flex items-center justify-center shadow-lg">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#0D0A08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex-none py-5 px-8 flex justify-center border-t border-white/[0.06] bg-[#0D0A08]/80 backdrop-blur-sm">
        <button
          onClick={confirm}
          disabled={selected.length < MAX}
          className={`
            px-12 py-4 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300
            ${selected.length === MAX
              ? "bg-white/90 text-[#0D0A08] hover:bg-white cursor-pointer"
              : "bg-white/10 text-white/30 cursor-not-allowed"
            }
          `}
        >
          {selected.length === MAX ? "Confirm My Picks" : `Pick ${remaining} more`}
        </button>
      </div>
    </motion.div>
  );
};

export default VisualInstinct;
