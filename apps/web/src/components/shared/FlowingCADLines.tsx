import { motion } from "framer-motion";

export const FlowingCADLines = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden opacity-[0.25]">
      {/* CAD technical coordinate watermark */}
      <div className="absolute bottom-6 right-8 font-mono text-[9px] tracking-[0.25em] text-[#D1AF6E]/40 uppercase hidden md:block">
        CAD_SYS // LATENCY: 0.12ms // BUFFER: ACTIVE
      </div>
      <div className="absolute top-10 left-8 font-mono text-[9px] tracking-[0.25em] text-[#C41230]/40 uppercase hidden md:block">
        SCALE: 1:50 // GRID_SNAP: ON
      </div>

      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Glowing gradients for the flowing dots */}
          <radialGradient id="gold-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D1AF6E" stopOpacity="1" />
            <stop offset="50%" stopColor="#D1AF6E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D1AF6E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="crimson-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C41230" stopOpacity="1" />
            <stop offset="50%" stopColor="#C41230" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C41230" stopOpacity="0" />
          </radialGradient>

          {/* Grid background matching CAD environment */}
          <pattern id="cad-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.012)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        {/* CAD Grid Backdrop */}
        <rect width="100%" height="100%" fill="url(#cad-grid)" />

        {/* GUIDELINE 1: Horizontal gridline with right-angle bends */}
        <path
          d="M 50 120 L 400 120 L 400 350 L 950 350 L 950 680 L 1380 680"
          fill="none"
          stroke="rgba(209, 175, 110, 0.08)"
          strokeWidth="0.8"
          strokeDasharray="4 4"
        />

        {/* GUIDELINE 2: Staggered parallel guide */}
        <path
          d="M 120 700 L 650 700 L 650 480 L 1150 480 L 1150 150 L 1300 150"
          fill="none"
          stroke="rgba(196, 18, 48, 0.06)"
          strokeWidth="0.8"
          strokeDasharray="6 3"
        />

        {/* FLOWING PULSE 1: Gold dot tracing Guideline 1 */}
        <motion.circle
          r="4"
          fill="url(#gold-glow)"
          animate={{
            pathOffset: [0, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <animateMotion
            path="M 50 120 L 400 120 L 400 350 L 950 350 L 950 680 L 1380 680"
            dur="14s"
            repeatCount="indefinite"
          />
        </motion.circle>

        {/* FLOWING PULSE 2: Crimson dot tracing Guideline 2 (delayed and faster) */}
        <motion.circle
          r="5"
          fill="url(#crimson-glow)"
          animate={{
            pathOffset: [0, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <animateMotion
            path="M 120 700 L 650 700 L 650 480 L 1150 480 L 1150 150 L 1300 150"
            dur="11s"
            repeatCount="indefinite"
            begin="2s"
          />
        </motion.circle>

        {/* CAD Technical Anchor Intersect Points */}
        <circle cx="400" cy="120" r="1.5" fill="#D1AF6E" opacity="0.4" />
        <circle cx="400" cy="350" r="1.5" fill="#D1AF6E" opacity="0.4" />
        <circle cx="950" cy="350" r="1.5" fill="#D1AF6E" opacity="0.4" />
        <circle cx="950" cy="680" r="1.5" fill="#D1AF6E" opacity="0.4" />

        <circle cx="650" cy="700" r="1.5" fill="#C41230" opacity="0.3" />
        <circle cx="650" cy="480" r="1.5" fill="#C41230" opacity="0.3" />
        <circle cx="1150" cy="480" r="1.5" fill="#C41230" opacity="0.3" />
        <circle cx="1150" cy="150" r="1.5" fill="#C41230" opacity="0.3" />
      </svg>
    </div>
  );
};

export default FlowingCADLines;
