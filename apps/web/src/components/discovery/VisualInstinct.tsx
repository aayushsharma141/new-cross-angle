import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { visualImages } from "@/constants/discovery";
import { AestheticScores } from "@/types/discovery";
import { Check } from "lucide-react";
import ShimmerButton from "@/components/magicui/shimmer-button";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, selectedIds?: number[]) => void;
}

const VisualInstinct = ({ onComplete }: Props) => {
  const [selected, setSelected] = useState<number[]>([]);
  const MAX = 6;

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < MAX ? [...prev, id] : prev
    );
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
      className="h-full flex flex-col w-full max-w-6xl mx-auto overflow-hidden"
    >
      <div className="flex-none text-center pt-8 pb-6 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif-display text-4xl md:text-5xl mb-3"
        >
          Visual Instinct
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-6"
        >
          Select {MAX} images that feel most like "home" to you.
        </motion.p>

        {/* Animated counter */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-2">
            {Array.from({ length: MAX }).map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full border border-border"
                animate={{
                  background: i < selected.length ? "hsl(var(--primary))" : "transparent",
                  scale: i < selected.length ? [1, 1.3, 1] : 1,
                  boxShadow: i < selected.length ? "0 0 10px hsla(var(--primary)/0.5)" : "none"
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={remaining}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-xs uppercase tracking-widest font-bold text-primary/60"
            >
              {remaining > 0 ? `${remaining} choices remaining` : "Selection complete"}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Grid Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide scroll-smooth">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {visualImages.map((img, idx) => {
            const isSelected = selected.includes(img.id);
            const isHoverable = !isSelected && selected.length < MAX;

            return (
              <motion.button
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={isHoverable ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggle(img.id)}
                className={`
                  relative w-full overflow-hidden rounded-2xl break-inside-avoid shadow-sm transition-all duration-500
                  ${isSelected
                    ? "ring-4 ring-primary shadow-2xl z-10"
                    : "hover:shadow-xl ring-1 ring-border/30"
                  }
                `}
              >
                <div className={`relative overflow-hidden ${isSelected ? 'scale-[1.05]' : 'scale-100'} transition-transform duration-700`}>
                  <img
                    src={img.url}
                    alt=""
                    className={`w-full h-auto object-cover transition-all duration-700 
                        ${!isSelected && selected.length > 0 ? "grayscale-[0.8] opacity-40 blur-[2px]" : "grayscale-0 opacity-100 blur-0"} 
                        group-hover:grayscale-0 group-hover:opacity-100 group-hover:blur-0`}
                    loading="lazy"
                  />
                  {isSelected && <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]" />}
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-4 right-4 z-20"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-background">
                        <Check size={16} strokeWidth={4} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer Area - Fixed */}
      <div className="flex-none p-8 flex justify-center bg-gradient-to-t from-background via-background/90 to-transparent">
        <ShimmerButton
          onClick={confirm}
          disabled={selected.length < MAX}
          className={`
            font-bold tracking-[0.3em] uppercase text-xs transition-all duration-500
            ${selected.length === MAX
              ? "hover:scale-105 active:scale-95 shadow-xl"
              : "opacity-50 cursor-not-allowed"
            }
          `}
          background={selected.length === MAX ? "hsl(var(--foreground))" : "hsl(var(--muted))"}
          shimmerColor={selected.length === MAX ? "#ffffff" : "transparent"}
          borderRadius="0px"
        >
          <span className="relative z-10">
            {selected.length === MAX ? "Confirm Instinct" : `Decide ${remaining} more`}
          </span>
        </ShimmerButton>
      </div>
    </motion.div>
  );
};

export default VisualInstinct;
