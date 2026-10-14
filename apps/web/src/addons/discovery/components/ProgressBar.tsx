import { motion } from "framer-motion";
import { TOTAL_STAGES } from "@/constants/discovery";
import { Stage } from "@/types/discovery";

interface ProgressBarProps {
  currentStage: number;
  variant?: "horizontal" | "vertical";
}

const STAGE_LABELS: Record<number, string> = {
  [Stage.Welcome]: "Introduction",
  [Stage.PhysicalSpace]: "Reality",
  [Stage.Timeline]: "Horizon",
  [Stage.MorningRoutine]: "Rituals",
  [Stage.KitchenUsage]: "Nourishment",
  [Stage.EntertainmentStyle]: "Gathering",
  [Stage.RoomPriority]: "Space",
  [Stage.VisualInstinct]: "Instinct",
  [Stage.ReinterpretationGate]: "Essence",
  [Stage.DesignIdentity]: "Language",
  [Stage.Atmosphere]: "Atmosphere",
  [Stage.Constraints]: "Boundaries",
  [Stage.MaterialIdentity]: "Touch",
  [Stage.LivingPreferences]: "Living",
  [Stage.PivotQuestion]: "Pivot",
  [Stage.BudgetAlignment]: "Budget",
  [Stage.Analysis]: "Analysis",
  [Stage.MiniResult]: "Synthesis",
  [Stage.LeadCapture]: "Details",
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
                    isCompleted ? "bg-primary/50 border-primary/50" : "bg-transparent border-[#5a5a5a]/30"
                    }`}
                />

                <span className={`text-[12px] font-medium tracking-widest uppercase transition-colors duration-300 ${isActive ? "text-primary" : isCompleted ? "text-[#5a5a5a]" : "text-kiro-inkSoft/60"
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
    <div
      role="progressbar"
      aria-label="Quiz progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-valuetext={STAGE_LABELS[currentStage]}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="h-[3px] bg-kiro-ink/10">
        <motion.div
          className="h-full bg-kiro-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {/* Label sits at a fixed edge, so it never clips against a short fill */}
      <span
        key={currentStage}
        className="absolute right-4 top-4 text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-kiro-accent animate-in fade-in duration-300 motion-reduce:animate-none"
      >
        {STAGE_LABELS[currentStage]}
      </span>
    </div>
  );
};

export default ProgressBar;
