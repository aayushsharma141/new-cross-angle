import { motion } from "framer-motion";
import { TOTAL_STAGES } from "@/constants/discovery";
import { Stage } from "@/types/discovery";

interface ProgressBarProps {
  currentStage: number;
  variant?: "horizontal" | "vertical";
}

const STAGE_LABELS: Record<number, string> = {
  [Stage.Welcome]: "Introduction",
  [Stage.Reflection]: "Essence",
  [Stage.Lifestyle]: "Rituals",
  [Stage.VisualInstinct]: "Instinct",
  [Stage.AdjectiveSelection]: "Language",
  [Stage.EmotionalMapping]: "Feeling",
  [Stage.MaterialResonance]: "Touch",
  [Stage.LightCalibration]: "Atmosphere",
  [Stage.PatternPreview]: "Synthesis",
  [Stage.Analysis]: "Analysis",
  [Stage.Results]: "Identity",
};

const ProgressBar = ({ currentStage, variant = "horizontal" }: ProgressBarProps) => {
  const progress = (currentStage / TOTAL_STAGES) * 100;

  if (variant === "vertical") {
    return (
      <div className="flex flex-col gap-6 py-8">
        <div className="relative pl-4 border-l border-border/30 space-y-8">
          {Object.entries(STAGE_LABELS).map(([stageNum, label]) => {
            const s = Number(stageNum);
            if (s === Stage.Welcome || s >= Stage.Results) return null;

            const isActive = currentStage === s;
            const isCompleted = currentStage > s;

            return (
              <div key={s} className="relative flex items-center gap-4 transition-colors duration-500">
                {/* Dot Indicator */}
                <div
                  className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 transition-all duration-500 ${isActive ? "bg-primary border-primary scale-125 shadow-[0_0_10px_hsl(var(--primary)/0.5)]" :
                    isCompleted ? "bg-primary/50 border-primary/50" : "bg-transparent border-muted-foreground/30"
                    }`}
                />

                <span className={`text-xs font-medium tracking-widest uppercase transition-colors duration-300 ${isActive ? "text-primary" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/30"
                  }`}>
                  {String(s).padStart(2, '0')}. {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-foreground/5 backdrop-blur-sm">
      <motion.div
        className="h-full relative"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary)), #fff)",
          boxShadow: "0 0 15px hsla(var(--primary)/0.6), 0 0 5px #fff",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Progress Glow Head */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md opacity-50" />

        {/* Current Stage Label */}
        <motion.div
          className="absolute right-0 top-4 pr-4 whitespace-nowrap"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          key={currentStage}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/80 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-primary/10">
            {STAGE_LABELS[currentStage]}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProgressBar;
