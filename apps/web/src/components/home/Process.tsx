import { useCallback, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Check, Hammer, Home, Palette, Ruler } from "lucide-react";
import { Image } from "@/components/ui/enhanced/image";
import useReducedMotion from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FlowingCADLines } from "@/components/shared/FlowingCADLines";

const iconMap: Record<string, React.ElementType> = {
  Home,
  Ruler,
  Palette,
  Hammer,
  Check,
};

const fallbackSteps = [
  {
    id: "01",
    icon: Home,
    title: "Consult",
    subtitle: "First Meeting",
    description: "Share your ideas, budget, and timeline with our design team.",
    detail:
      "We start by understanding your daily routine, budget, and project goals to ensure we align with your needs from day one.",
    image: "/reality_render.jpg",
    imageAlt: "Luxury living room consultation setting",
    kicker: "Stage One",
  },
  {
    id: "02",
    icon: Ruler,
    title: "Measure & Plan",
    subtitle: "Technical Layout",
    description: "Laser-precise measurements and floor plan planning for optimal layout.",
    detail:
      "We measure your space carefully to design floor plans that optimize movement and make the best use of every room.",
    image: "/blueprint_shell.jpg",
    imageAlt: "Architectural blueprint and measured planning sheet",
    kicker: "Stage Two",
  },
  {
    id: "03",
    icon: Palette,
    title: "Design",
    subtitle: "3D Visuals",
    description: "Review colors, furniture, and realistic 3D views before we begin.",
    detail:
      "We choose materials, lighting, and colors, then show you realistic 3D drawings so you can decide with confidence.",
    image: "/hero_reality_render_1775299733746.png",
    imageAlt: "Photorealistic interior design preview",
    kicker: "Stage Three",
  },
  {
    id: "04",
    icon: Hammer,
    title: "Execute",
    subtitle: "Build & Install",
    description: "Our skilled installation team brings the designs to life.",
    detail:
      "We manufacture the modular cabinets and coordinate all on-site work to ensure high-quality execution without delays.",
    image: "/reality_render.jpg",
    imageAlt: "Finished interior under installation and styling",
    kicker: "Stage Four",
  },
  {
    id: "05",
    icon: Check,
    title: "Handover",
    subtitle: "Moving In",
    description: "Walk through your completed, clean, and ready-to-use home.",
    detail:
      "We perform a final quality check, clean the entire space, and hand over your keys for a stress-free move-in.",
    image: "/hero_reality_render_1775299733746.png",
    imageAlt: "Completed premium interior ready for handover",
    kicker: "Stage Five",
  },
];

export type ProcessStepConfig = {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  image: string;
  imageAlt: string;
  kicker: string;
};

/** Individual step node in the bottom timeline */
const StepNode = ({
  step,
  index,
  totalSteps,
  isActive,
  scrollYProgress,
  timelineProgress,
  onSelect,
}: {
  step: ProcessStepConfig;
  index: number;
  totalSteps: number;
  isActive: boolean;
  scrollYProgress: MotionValue<number>;
  timelineProgress: MotionValue<number>;
  onSelect: (index: number) => void;
}) => {
  const threshold = index / Math.max(1, totalSteps - 1);
  const startFade = Math.max(0, threshold - 0.15);
  const endFade = Math.min(1, threshold + 0.1);

  // Fade in the whole step node as we scroll down
  const opacity = useTransform(scrollYProgress, [startFade, endFade], [0.3, 1]);

  // Color fill based on the animated line reaching this node
  const nodeProgress = useTransform(
    timelineProgress,
    [Math.max(0, threshold - 0.05), threshold],
    [0, 1]
  );

  const backgroundColor = useTransform(nodeProgress, [0, 1], ["#0a0a0a", "#e81b39"]);
  const borderColor = useTransform(nodeProgress, [0, 1], ["rgba(255, 255, 255, 0.2)", "rgba(232, 27, 57, 1)"]);
  const textColor = useTransform(nodeProgress, [0, 1], ["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 1)"]);
  const iconColor = useTransform(nodeProgress, [0, 1], ["rgba(255, 255, 255, 0.3)", "rgba(232, 27, 57, 1)"]);
  const titleColor = useTransform(nodeProgress, [0, 1], ["rgba(255, 255, 255, 0.45)", "rgba(255, 255, 255, 1)"]);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(index)}
      className="relative flex flex-1 flex-col items-center gap-0 outline-none focus-visible:ring-1 focus-visible:ring-site-crimson/60 rounded-sm"
      style={{ opacity }}
      aria-current={isActive ? "step" : undefined}
      aria-label={`View ${step.title} stage`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Circle node — sits ON the timeline line */}
      <motion.div
        className={cn(
          "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold md:h-14 md:w-14 md:text-base transition-shadow duration-500",
          isActive ? "shadow-[0_0_30px_rgba(232,27,57,0.4)]" : "shadow-none"
        )}
        style={{
          backgroundColor,
          borderColor,
          color: textColor,
        }}
      >
        <step.icon aria-hidden="true" className="h-5 w-5 md:h-6 md:w-6" />
      </motion.div>

      {/* Title below the circle */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <motion.h3
          className="text-xs font-semibold uppercase tracking-[0.12em] md:text-sm text-center"
          style={{ color: titleColor }}
        >
          {step.title}
        </motion.h3>
      </div>
    </motion.button>
  );
};

const Process = () => {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: steps = fallbackSteps } = useQuery({
    queryKey: ['designProcessSteps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('design_process_steps')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map(step => ({
          id: step.step_number,
          icon: iconMap[step.icon_name] || Check,
          title: step.title,
          subtitle: step.subtitle,
          description: step.description,
          detail: step.detail,
          image: step.image_url || "/reality_render.jpg",
          imageAlt: step.image_alt || step.title,
          kicker: step.kicker || "",
        }));
      }
      return fallbackSteps;
    }
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const timelineProgress = useSpring(scrollYProgress, {
    stiffness: prefersReducedMotion ? 300 : 140,
    damping: prefersReducedMotion ? 40 : 28,
    mass: 0.2,
  });

  const lineScaleX = useTransform(timelineProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Perfectly sync active index by rounding to nearest segment (halfway points trigger changes)
    const next = Math.round(latest * (steps.length - 1));
    setActiveIndex((cur) => (cur === next ? cur : next));
  });

  const handleSelect = useCallback(
    (index: number) => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const t = steps.length <= 1 ? 0 : index / (steps.length - 1);
      window.scrollTo({
        top: window.scrollY + rect.top + scrollableDistance * t,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion, steps.length]
  );

  const activeStep = steps[activeIndex];

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative h-[500vh] bg-site-bg text-white"
      aria-label="How we work process section"
    >
      {/* ✦ CAD Blueprint flowing lines backdrop */}
      <FlowingCADLines />
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
        {/* ── Top content area ── */}
        <div className="flex flex-1 flex-col overflow-hidden px-5 pt-32 md:px-10 lg:px-14 lg:pt-40">
          <div className="mx-auto grid w-full max-w-[1480px] flex-1 grid-cols-1 gap-6 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] lg:gap-16">

            {/* LEFT — label + heading + body */}
            <div className="flex flex-col justify-center lg:justify-start lg:pt-10 z-10 relative">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="w-12 h-px bg-site-crimson" />
                <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">How We Work</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="mt-3 font-serif text-[clamp(2.8rem,5.5vw,5.2rem)] font-bold leading-[1.1] tracking-tight text-white"
              >
                The <br />
                <em className="text-site-crimson italic font-light serif">Methodology.</em>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16 }}
                className="mt-5 max-w-[28ch] text-[0.95rem] leading-[1.65] text-white/70 font-light md:text-[1.05rem]"
              >
                A seamless five-stage journey guiding you from initial vision to a flawless final reveal.
              </motion.p>
            </div>

            {/* RIGHT — image panel */}
            <div className="relative min-h-[220px] overflow-hidden rounded-2xl md:min-h-[320px] lg:min-h-[0]">
              {/* Background images with crossfade */}
              {steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  className="absolute inset-0 origin-center"
                  initial={false}
                  animate={{ 
                    opacity: activeIndex === i ? 1 : 0,
                    scale: activeIndex === i ? 1 : 1.05,
                  }}
                  transition={{ 
                    opacity: { duration: 0.75, ease: "easeInOut" },
                    scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
                  }}
                  aria-hidden={activeIndex !== i}
                >
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    width={1600}
                    height={1000}
                    className="h-full w-full"
                    imageClassName="object-cover"
                  />
                  {/* Overlay gradients */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                  {/* Crimson accent glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(232,27,57,0.15),transparent_55%)]" />
                </motion.div>
              ))}

              {/* Active step content */}
              <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep.id}
                    initial={prefersReducedMotion ? false : "hidden"}
                    animate="visible"
                    exit="exit"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                      exit: { opacity: 0, transition: { duration: 0.3 } },
                    }}
                    className="flex flex-col"
                  >
                    {/* Kicker & Subtitle row */}
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                        exit: { opacity: 0, y: -10, transition: { duration: 0.4 } },
                      }}
                      className="mb-4 flex items-center gap-4"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.38em] text-white/50">
                        {activeStep.kicker}
                      </span>
                      <span className="h-px w-6 bg-white/20"></span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-site-crimson/90">
                        {activeStep.subtitle}
                      </span>
                    </motion.div>

                    {/* Title row */}
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                        exit: { opacity: 0, y: -10, transition: { duration: 0.4 } },
                      }}
                      className="flex flex-wrap items-baseline gap-3"
                    >
                      <span className="font-serif text-[clamp(2.2rem,4.5vw,4.2rem)] font-bold leading-none tracking-tight text-white">
                        {activeStep.title}
                      </span>
                    </motion.div>

                    {/* Detail paragraph */}
                    <motion.p 
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                        exit: { opacity: 0, y: -10, transition: { duration: 0.4 } },
                      }}
                      className="mt-4 max-w-[50ch] text-white/70 leading-[1.7] md:text-[0.97rem]"
                    >
                      {activeStep.detail}
                    </motion.p>

                    {/* Highlighted description callout */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -8 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                        exit: { opacity: 0, x: -8, transition: { duration: 0.4 } },
                      }}
                      className="relative mt-5 flex items-start gap-3 rounded-r-xl bg-site-crimson/10 px-4 py-3 backdrop-blur-sm"
                    >
                      <motion.div
                        variants={{
                          hidden: { scaleY: 0 },
                          visible: { scaleY: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 } },
                        }}
                        className="absolute left-0 top-0 bottom-0 w-[3px] bg-site-crimson origin-top rounded-full"
                      />
                      <p className="text-sm font-medium leading-[1.7] text-white/90 md:text-[0.95rem]">
                        {activeStep.description}
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom timeline strip ── */}
        <div className="relative mx-auto w-full max-w-[1480px] px-5 pb-8 pt-6 md:px-10 lg:px-14">
          {/* Track line — vertically centered with the circle centers */}
          <div className="relative mb-6">
            {/* Track container covering the distance between first and last node centers */}
            <div className="absolute left-[10%] right-[10%] top-[24px] md:top-[28px] -translate-y-1/2">
              {/* Ghost track */}
              <div className="absolute left-0 right-0 h-[2px] rounded-full bg-white/10" />
              {/* Animated fill line — precisely fills between nodes */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] origin-left rounded-full bg-site-crimson"
                style={{ scaleX: lineScaleX }}
              />
              {/* Glowing head dot tracking the progress */}
              <motion.div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-site-crimson shadow-[0_0_12px_4px_rgba(196,18,48,0.7)]"
                style={{
                  left: useTransform(lineScaleX, [0, 1], ["0%", "100%"]),
                }}
              />
            </div>

            {/* Step nodes */}
            <div className="relative z-10 flex items-start justify-between">
              {steps.map((step, i) => (
                <StepNode
                  key={step.id}
                  step={step}
                  index={i}
                  totalSteps={steps.length}
                  isActive={i === activeIndex}
                  scrollYProgress={scrollYProgress}
                  timelineProgress={timelineProgress}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: steps.map((step) => ({
              "@type": "Question",
              name: `What is the ${step.title} stage of the process?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${step.description} ${step.detail}`,
              },
            })),
          }).replace(/<\/script/gi, '<\\/script'),
        }}
      />
    </section>
  );
};

export default Process;
