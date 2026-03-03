import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { materialOptions } from "@/constants/discovery";
import { MATERIAL_WEIGHTS } from "../core/weights";
import { AestheticScores } from "@/types/discovery";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, materialName?: string) => void;
}

// CSS texture patterns for each material
const texturePatterns: Record<string, React.CSSProperties> = {
  "Brushed Concrete": {
    background: `
      repeating-linear-gradient(45deg, transparent, transparent 2px, hsl(0 0% 70% / 0.1) 2px, hsl(0 0% 70% / 0.1) 4px),
      linear-gradient(135deg, hsl(0 0% 78%) 0%, hsl(0 0% 72%) 100%)
    `,
  },
  "Warm Timber": {
    background: `
      repeating-linear-gradient(90deg, transparent, transparent 8px, hsl(25 40% 35% / 0.15) 8px, hsl(25 40% 35% / 0.15) 9px),
      linear-gradient(180deg, hsl(28 55% 42%) 0%, hsl(25 50% 35%) 100%)
    `,
  },
  "Polished Stone": {
    background: `
      radial-gradient(ellipse at 20% 50%, hsl(30 8% 70% / 0.3) 0%, transparent 50%),
      linear-gradient(135deg, hsl(30 6% 68%) 0%, hsl(28 5% 60%) 100%)
    `,
  },
  "Woven Linen": {
    background: `
      repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(40 15% 82% / 0.3) 3px, hsl(40 15% 82% / 0.3) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 3px, hsl(40 15% 82% / 0.3) 3px, hsl(40 15% 82% / 0.3) 4px),
      hsl(40 20% 88%)
    `,
  },
  "Matte Metal": {
    background: `
      linear-gradient(135deg, hsl(210 5% 58%) 0%, hsl(210 6% 50%) 50%, hsl(210 5% 55%) 100%)
    `,
  },
};

const MaterialResonance = ({ onComplete }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (i: number, e: React.MouseEvent) => {
    setSelected(i);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);
  };

  const confirm = () => {
    if (selected === null) return;
    const name = materialOptions[selected].name;
    onComplete(MATERIAL_WEIGHTS[name] || {}, name);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center px-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif-display text-3xl md:text-4xl mb-2 text-center"
      >
        Material Feel
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground mb-12 text-center text-sm"
      >
        Which texture feels most natural and appealing to you?
      </motion.p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mb-8">
        {materialOptions.map((mat, i) => (
          <motion.button
            key={mat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleClick(i, e)}
            className="relative flex flex-col items-center group"
          >
            <motion.div
              className={`relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden transition-all duration-500 ${selected === i
                ? "scale-110 ring-2 ring-[hsl(var(--gold))] ring-offset-2 ring-offset-background"
                : "opacity-70 group-hover:opacity-100 group-hover:scale-105"
                }`}
              style={texturePatterns[mat.name]}
              animate={selected === i ? { boxShadow: "0 8px 30px hsl(var(--gold) / 0.3)" } : { boxShadow: "none" }}
            >
              {/* Ripple effect */}
              {ripple && selected === i && (
                <motion.div
                  className="absolute rounded-full bg-foreground/10"
                  style={{ left: ripple.x, top: ripple.y, width: 10, height: 10 }}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 8, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.div>

            {/* Typewriter-style text reveal */}
            <AnimatePresence>
              {selected === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 text-center overflow-hidden"
                >
                  <p className="text-sm font-medium">{mat.name}</p>
                  <motion.p
                    className="text-xs text-muted-foreground"
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {mat.description}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={confirm}
        disabled={selected === null}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`px-10 py-4 text-sm font-medium tracking-wide transition-all duration-300 ${selected !== null
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "text-muted-foreground cursor-not-allowed"
          }`}
      >
        THIS IS MY CHOICE
      </motion.button>
    </motion.div>
  );
};

export default MaterialResonance;
