import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { lifestyleQuestions } from "@/constants/discovery";
import { AestheticScores } from "@/types/discovery";

interface Props {
  onComplete: (scores: Partial<AestheticScores>) => void;
  onChoice?: (scores: Partial<AestheticScores>, label: string) => void;
}

const LifestyleReflection = ({ onComplete, onChoice }: Props) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [accumulated, setAccumulated] = useState<Partial<AestheticScores>>({});
  const question = lifestyleQuestions[currentQ];

  const handleSelect = (scores: Partial<AestheticScores>, label: string) => {
    onChoice?.(scores, label);
    const next: Partial<AestheticScores> = { ...accumulated };
    for (const [k, v] of Object.entries(scores)) {
      const key = k as keyof AestheticScores;
      next[key] = (next[key] || 0) + v;
    }
    if (currentQ < lifestyleQuestions.length - 1) {
      setAccumulated(next);
      setCurrentQ((q) => q + 1);
    } else {
      onComplete(next);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center px-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center max-w-3xl"
        >
          <h2 className="font-serif-display text-2xl md:text-4xl mb-10">
            {question.question}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {question.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.scores, opt.label)}
                className="group flex flex-col items-center"
              >
                <div className="overflow-hidden rounded-sm mb-3 aspect-square w-full max-w-[220px]">
                  <img
                    src={opt.image}
                    alt={opt.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LifestyleReflection;
