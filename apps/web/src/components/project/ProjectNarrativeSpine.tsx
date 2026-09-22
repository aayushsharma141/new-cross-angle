import { motion, useSpring, useTransform, MotionValue } from "framer-motion";

interface ProjectNarrativeSpineProps {
  scrollYProgress: MotionValue<number>;
  activeStage: number;
}

// Chapter tick marks along the spine path — positions as % of total path length
const CHAPTER_TICKS = [
  { pct: 0.00, label: "ARRIVAL",        stage: 0 },
  { pct: 0.11, label: "CONTEXT",        stage: 1 },
  { pct: 0.22, label: "CONSTRAINTS",    stage: 2 },
  { pct: 0.33, label: "DESIGN",         stage: 3 },
  { pct: 0.44, label: "MATERIALS",      stage: 4 },
  { pct: 0.55, label: "PROCESS",        stage: 5 },
  { pct: 0.66, label: "TRANSFORM",      stage: 6 },
  { pct: 0.77, label: "OUTCOME",        stage: 7 },
  { pct: 0.88, label: "REFLECTION",     stage: 8 },
  { pct: 1.00, label: "NEXT",           stage: 9 },
];

export const ProjectNarrativeSpine = ({
  scrollYProgress,
  activeStage,
}: ProjectNarrativeSpineProps) => {
  // Smoothed spring for the draw progress
  const smoothed = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // SVG height = 600 (viewBox units). strokeDashoffset goes 600 → 0 as page scrolls
  const TOTAL_LEN = 600;
  const strokeDash = useTransform(smoothed, [0, 1], [TOTAL_LEN, 0]);

  return (
    <div
      className="fixed left-6 md:left-12 lg:left-16 top-1/4 bottom-1/4 z-40 hidden lg:flex flex-col items-center select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* SVG spine */}
      <svg
        className="absolute top-0 left-0 w-[2px] h-full overflow-visible"
        viewBox={`0 0 2 ${TOTAL_LEN}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Ghost track */}
        <line
          x1="1" y1="0"
          x2="1" y2={TOTAL_LEN}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        {/* Animated gold draw */}
        <motion.line
          x1="1" y1="0"
          x2="1" y2={TOTAL_LEN}
          stroke="var(--primary, #C5A880)"
          strokeWidth="1.5"
          strokeDasharray={TOTAL_LEN}
          style={{ strokeDashoffset: strokeDash }}
          strokeLinecap="round"
          filter="url(#narrative-spine-glow)"
        />
        {/* Glow filter */}
        <defs>
          <filter id="narrative-spine-glow" x="-200%" y="-10%" width="500%" height="120%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Chapter tick marks + labels */}
      <div className="absolute top-0 bottom-0 left-4 flex flex-col justify-between py-4">
        {CHAPTER_TICKS.map((tick) => {
          const isActive = activeStage === tick.stage;
          const isPast = activeStage > tick.stage;
          return (
            <div key={tick.label} className="flex items-center gap-3">
              {/* Crosshair indicator */}
              <div className="relative flex items-center justify-center w-5 h-5">
                {isActive && (
                  <motion.div
                    layoutId="spineActiveCrosshair"
                    className="absolute inset-0 border border-primary/30 rounded-full"
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />
                )}
                <div
                  className={[
                    "w-1.5 h-1.5 rounded-full border relative z-10 transition-all duration-700",
                    isActive
                      ? "bg-primary border-primary scale-125 shadow-[0_0_8px_2px_rgba(197,168,128,0.6)]"
                      : isPast
                      ? "bg-primary/40 border-primary/40 scale-100"
                      : "bg-neutral-900 border-white/15",
                  ].join(" ")}
                />
              </div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.3,
                  x: isActive ? 0 : -2,
                  color: isActive ? "var(--primary, #C5A880)" : "rgb(87,83,78)",
                }}
                transition={{ duration: 0.5 }}
                className="text-[8px] font-mono tracking-[0.25em] font-medium whitespace-nowrap"
              >
                {tick.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectNarrativeSpine;
