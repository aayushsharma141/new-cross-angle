import { motion } from "framer-motion";
import { useState } from "react";
import { lifestyleQuestions } from "@/constants/discovery";
import { AestheticScores } from "@/types/discovery";
import { ArrowRight, Check } from "lucide-react";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, labels?: string[]) => void;
}

const LifestyleReflection = ({ onComplete }: Props) => {
  const [selections, setSelections] = useState<Record<number, number>>({});

  const handleSelect = (qIndex: number, optIndex: number) => {
    setSelections((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleNext = () => {
    const finalScores: Partial<AestheticScores> = {};
    const finalLabels: string[] = [];

    Object.entries(selections).forEach(([qIndexStr, optIndex]) => {
      const qIndex = parseInt(qIndexStr);
      const opt = lifestyleQuestions[qIndex].options[optIndex];
      finalLabels.push(opt.label);
      for (const [k, v] of Object.entries(opt.scores)) {
        const key = k as keyof AestheticScores;
        finalScores[key] = (finalScores[key] || 0) + v;
      }
    });

    onComplete(finalScores, finalLabels);
  };

  const allSelected = Object.keys(selections).length === lifestyleQuestions.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 pt-6 pb-3 px-8 xl:px-16 text-center"
      >
        <p className="text-[9px] xl:text-[10px] text-muted-foreground/60 uppercase tracking-[0.25em] font-mono mb-1">
          Step 2 of 4
        </p>
        <h2 className="font-serif-display text-xl xl:text-2xl text-foreground mb-1">
          Your Daily Habits
        </h2>
        <p className="text-[10px] xl:text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Choose what feels closest to how you actually live. There are no wrong answers.
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {["🌅", "☀️", "🌆", "🌙"].map((emoji, i) => (
            <div key={i} className={`flex items-center gap-2 ${i === 0 ? "opacity-100" : "opacity-30"}`}>
              {i > 0 && <div className="w-5 h-px bg-border/40" />}
              <span className="text-[11px]">{emoji}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main grid — two questions side by side */}
      <div className="flex-1 overflow-hidden px-6 xl:px-12 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-10 h-full">
          {lifestyleQuestions.map((q, qIndex) => {
            const isAnswered = selections[qIndex] !== undefined;
            return (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + qIndex * 0.1 }}
                className="flex flex-col"
              >
                {/* Question label */}
                <div className="mb-3 flex items-center gap-2">
                  {isAnswered && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary shrink-0">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                    </span>
                  )}
                  <h3 className="text-xs xl:text-sm font-medium text-foreground/90 leading-snug">
                    {q.question}
                  </h3>
                </div>

                {/* 2×2 image options */}
                <div className="grid grid-cols-2 gap-2.5 xl:gap-3 flex-1">
                  {q.options.slice(0, 4).map((opt, optIndex) => {
                    const isSelected = selections[qIndex] === optIndex;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleSelect(qIndex, optIndex)}
                        className="group relative flex flex-col text-left transition-all duration-200 focus:outline-none"
                      >
                        <div
                          className={`relative w-full overflow-hidden rounded-sm transition-all duration-300 ${isSelected
                              ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                              : "ring-1 ring-border/20 hover:ring-border/60"
                            }`}
                          style={{ aspectRatio: "4/3" }}
                        >
                          <img
                            src={opt.image}
                            alt={opt.label}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isSelected ? "scale-105 brightness-95" : "group-hover:brightness-90"
                              }`}
                          />
                          {/* Dark gradient overlay at bottom for text */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Selected checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary shadow-md">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </span>
                            </div>
                          )}

                          {/* Caption at bottom of image */}
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className={`text-[9px] xl:text-[10px] leading-tight font-medium ${isSelected ? "text-white" : "text-white/80"
                              }`}>
                              {opt.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA button — fixed at bottom right */}
      <motion.div
        className="absolute bottom-0 right-0 left-0 flex justify-end items-center px-8 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleNext}
          disabled={!allSelected}
          className={`flex items-center gap-2 px-5 py-2 text-[10px] font-medium uppercase tracking-widest transition-all duration-300 ${allSelected
              ? "bg-[#D32F2F] text-white hover:bg-[#B71C1C]"
              : "bg-muted/40 text-muted-foreground/40 cursor-not-allowed"
            }`}
        >
          Next <ArrowRight className="w-3 h-3" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LifestyleReflection;
