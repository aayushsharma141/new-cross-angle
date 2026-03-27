import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Home, Ruler, Palette, Hammer, Check } from "lucide-react";

const steps = [
  {
    id: "C",
    icon: Home,
    title: "Consult",
    subtitle: "Free Meeting",
    description: "Share your vision with our expert designers",
  },
  {
    id: "M",
    icon: Ruler,
    title: "Measure & Plan",
    subtitle: "Blueprint",
    description: "Precise measurements and detailed planning",
  },
  {
    id: "D",
    icon: Palette,
    title: "Design",
    subtitle: "3D Views",
    description: "Review realistic 3D visualizations",
  },
  {
    id: "E",
    icon: Hammer,
    title: "Execute",
    subtitle: "Craftsmanship",
    description: "Expert craftsmen bring your design to life",
  },
  {
    id: "F",
    icon: Check,
    title: "Handover",
    subtitle: "Final Reveal",
    description: "Walk through your transformed space",
  },
];

type ProcessStepConfig = typeof steps[number];

const TimelineStep = ({
  step,
  index,
  totalSteps,
  scrollYProgress,
}: {
  step: ProcessStepConfig;
  index: number;
  totalSteps: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const threshold = index / (totalSteps - 1);
  const startFade = Math.max(0, threshold - 0.1);
  const endFade = threshold;

  const opacity = useTransform(scrollYProgress, [startFade, endFade], [0.2, 1]);
  const y = useTransform(scrollYProgress, [startFade, endFade], [30, 0]);
  const color = useTransform(
    scrollYProgress,
    [startFade, endFade],
    ["rgba(255,255,255,0.2)", "rgba(255,255,255,1)"]
  );
  const bgNode = useTransform(
    scrollYProgress,
    [startFade, endFade],
    ["rgba(0,0,0,1)", "#E81B39"]
  );

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-site-crimson flex items-center justify-center font-display font-bold text-sm md:text-lg z-10"
        style={{
          backgroundColor: bgNode,
          color,
        }}
      >
        {step.id}
      </motion.div>

      <motion.div
        className="absolute top-16 md:top-20 w-32 md:w-48 text-center"
        style={{ opacity, y }}
      >
        <div className="flex items-center justify-center mb-2">
          <step.icon className="w-5 h-5 text-site-crimson" />
        </div>
        <h3 className="text-white font-bold text-base md:text-xl mb-1">
          {step.title}
        </h3>
        <p className="text-[#A3A09C] text-xs md:text-sm font-light leading-relaxed hidden sm:block">
          {step.description}
        </p>
      </motion.div>
    </div>
  );
};

const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // We make the container 300vh so user scrolls for a while
  // The scroll progress 0 -> 1 represents the user scrolling through this 300vh block
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // The horizontal red line width is exactly tied to scroll progress
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} id="process" className="relative h-[300vh] bg-site-bg">
      {/* Sticky container that stays on screen while user scrolls through the 300vh target */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden py-20 px-4 md:px-12">
        
        {/* Header */}
        <div className="absolute top-20 left-4 md:left-12">
          <span className="text-site-crimson font-mono text-sm tracking-[0.3em] uppercase block mb-2">
            How We Work
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white">
            Our Process
          </h2>
        </div>

        {/* Timeline Area */}
        <div className="relative mt-20 md:mt-0 w-full max-w-7xl mx-auto h-64 flex items-center">
          
          {/* Base gray line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10" />

          {/* Animated red line (grows as you scroll) */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-site-crimson origin-left"
            style={{ width: lineWidth }}
          />

          {/* Nodes */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
            {steps.map((step, index) => {
              return (
                <TimelineStep
                  key={step.id}
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                  scrollYProgress={scrollYProgress}
                />
              );
            })}
          </div>
        </div>

        {/* Scroll Mouse Visual Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center p-1">
            <motion.div 
              className="w-1 h-1.5 bg-site-crimson rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
            Scroll to advance
          </span>
        </motion.div>

      </div>
    </section>
  );
};

export default Process;
