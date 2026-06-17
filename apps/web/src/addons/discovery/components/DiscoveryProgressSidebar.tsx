import { motion, AnimatePresence } from "framer-motion";
import { Stage } from "@/types/discovery";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoIcon from "@/assets/logo-icon.png";

const SIDEBAR_STAGES: { stage: Stage; label: string; eyebrow: string }[] = [
    { stage: Stage.PropertyReality, label: "Reality", eyebrow: "01" },
    { stage: Stage.Lifestyle, label: "Rituals", eyebrow: "02" },
    { stage: Stage.RoomPriority, label: "Space", eyebrow: "03" },
    { stage: Stage.VisualInstinct, label: "Instinct", eyebrow: "04" },
    { stage: Stage.AdjectiveSelection, label: "Language", eyebrow: "05" },
    { stage: Stage.PivotQuestion, label: "What Matters", eyebrow: "06" },
    { stage: Stage.MaterialResonance, label: "Touch", eyebrow: "07" },
    { stage: Stage.LightCalibration, label: "Atmosphere", eyebrow: "08" },
    { stage: Stage.BudgetAlignment, label: "Investment", eyebrow: "09" },
    { stage: Stage.Analysis, label: "Analysis", eyebrow: "10" },
    { stage: Stage.MiniResult, label: "Preview", eyebrow: "11" },
];

interface DiscoveryProgressSidebarProps {
    currentStage: Stage;
    archetype?: string;
    scores?: {
        warmth: number;
        minimalism: number;
        novelty: number;
        social: number;
        structure: number;
    };
    onNavigate?: (stage: Stage) => void;
}

const getProgress = (currentStage: Stage): number => {
    const idx = SIDEBAR_STAGES.findIndex((s) => s.stage === currentStage);
    if (idx < 0) return 0;
    return Math.round(((idx) / SIDEBAR_STAGES.length) * 100);
};

export const DiscoveryProgressSidebar = ({
    currentStage,
    archetype,
    onNavigate,
}: DiscoveryProgressSidebarProps) => {
    const { settings } = useSiteSettings();
    const logoUrl = settings?.company_logo_url || settings?.logo_light_url || logoIcon;
    const progress = getProgress(currentStage);

    return (
        <aside aria-label="Discovery progress" className="hidden md:flex flex-col bg-[#ffffff] border-r border-[#e8e4dd] p-8 sticky top-0 h-[100dvh] overflow-y-auto w-[280px] shrink-0">
            <div className="flex items-center gap-2 text-[14px] tracking-[0.08em] uppercase text-[#8b6f47] font-semibold mb-8">
                <img src={logoUrl} alt="CrossAngle Logo" className="h-6 w-6 object-contain shrink-0 animate-in fade-in duration-300" />
                <span>Aesthetic Discovery</span>
            </div>
            
            {/* Progress bar */}
            <div className="mb-6 relative">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#5a5a5a]">Journey</span>
                    <motion.span
                        key={progress}
                        aria-live="polite"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-mono text-[#8b6f47] font-semibold"
                    >
                        {progress}%
                    </motion.span>
                </div>
                <div className="h-[2px] bg-[#e8e4dd] relative overflow-hidden rounded-full">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-[#8b6f47]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                </div>
            </div>

            <nav aria-label="Quiz steps">
            <div className="relative">
                {/* Base vertical line */}
                <div className="absolute left-[10px] top-[21px] bottom-[21px] w-[2px] bg-[#e8e4dd] -z-10" aria-hidden="true" />
                {/* Active vertical line */}
                <motion.div 
                    className="absolute left-[10px] top-[21px] w-[2px] bg-[#8b6f47] shadow-[0_0_8px_rgba(209,175,110,0.4)] origin-top -z-10"
                    initial={{ scaleY: 0 }}
                    animate={{ 
                        scaleY: (() => {
                            const idx = SIDEBAR_STAGES.findIndex((s) => s.stage === currentStage);
                            return idx >= 0 ? idx / (SIDEBAR_STAGES.length - 1) : 0;
                        })()
                    }}
                    style={{ bottom: "21px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden="true"
                />
                <ol className="space-y-1 relative z-10 m-0 p-0 list-none flex-1">
                {SIDEBAR_STAGES.map(({ stage, label, eyebrow }) => {
                    const isActive = currentStage === stage;
                    const isCompleted = currentStage > stage;
                    const isClickable = isCompleted && !!onNavigate;

                    return (
                        <li 
                            key={stage}
                            {...(isClickable ? { role: "button" } : {})}
                            tabIndex={isClickable ? 0 : undefined}
                            aria-current={isActive ? "step" : undefined}
                            aria-label={`Step ${parseInt(eyebrow, 10)}: ${label}${isCompleted ? " (completed)" : isActive ? " (current)" : ""}`}
                            onClick={() => isClickable && onNavigate(stage)}
                            onKeyDown={(e) => {
                                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    onNavigate(stage);
                                }
                            }}
                            className={cn(
                                "flex items-center gap-3 py-2.5 text-[14px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2 rounded-md px-2 -mx-2",
                                isActive ? "text-[#1a1a1a] font-semibold" : isCompleted ? "text-[#8b6f47]" : "text-[#5a5a5a]/40",
                                isClickable ? "cursor-pointer hover:text-[#8b6f47] hover:bg-[#8b6f47]/[0.04]" : "cursor-default"
                            )}
                        >
                            <div className={cn(
                                "w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-semibold shrink-0 transition-all duration-300 bg-white",
                                isActive 
                                    ? "border-[#8b6f47] bg-[#8b6f47] text-white shadow-[0_0_8px_rgba(209,175,110,0.4)]" 
                                    : isCompleted 
                                        ? "border-[#8b6f47] text-[#8b6f47]" 
                                        : "border-[#e8e4dd] text-[#5a5a5a]/40"
                            )} aria-hidden="true">
                                {isCompleted ? "✓" : parseInt(eyebrow, 10)}
                            </div>
                            <span>{label}</span>
                        </li>
                    );
                })}
                </ol>
                </div>
            </nav>

            <AnimatePresence>
                {archetype && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        aria-live="polite"
                        className="shrink-0 mt-6 p-4 border border-[#e8e4dd] bg-kiro-accentSoft rounded-[8px] relative overflow-hidden"
                    >
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8b6f47] font-semibold block mb-1">
                            Emerging Profile
                        </span>
                        <span className="text-[14px] font-semibold text-[#1a1a1a] block font-serif">
                            {archetype}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 pt-4 border-t border-[#e8e4dd]">
                <p className="text-[10px] text-[#5a5a5a] leading-relaxed tracking-wide">
                    Progress saved automatically.<br />
                    You can leave and return anytime.
                </p>
            </div>
        </aside>
    );
};

export default DiscoveryProgressSidebar;
