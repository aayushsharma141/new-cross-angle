import { useCallback, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Check, Hammer, Home, Palette, Ruler } from "lucide-react";
import { Image } from "@/components/ui/image";
import useReducedMotion from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "C",
    icon: Home,
    title: "Consult",
    subtitle: "Private Briefing",
    description: "Share your vision, priorities, and timeline with our design team.",
    detail:
      "We begin with a precise understanding of lifestyle, site realities, and investment intent so the project starts with clarity.",
    image: "/reality_render.jpg",
    imageAlt: "Luxury living room consultation setting",
    kicker: "Stage One",
  },
  {
    id: "M",
    icon: Ruler,
    title: "Measure & Plan",
    subtitle: "Technical Mapping",
    description: "Laser-precise measurement, circulation logic, and planning discipline.",
    detail:
      "Spatial planning, dimensions, and constraints are translated into an execution-ready foundation before any major design decision.",
    image: "/blueprint_shell.jpg",
    imageAlt: "Architectural blueprint and measured planning sheet",
    kicker: "Stage Two",
  },
  {
    id: "D",
    icon: Palette,
    title: "Design",
    subtitle: "Visual Direction",
    description: "See palettes, finishes, and realistic views before execution begins.",
    detail:
      "Materials, lighting mood, and 3D visuals align taste with feasibility, allowing decisions to feel confident instead of speculative.",
    image: "/hero_reality_render_1775299733746.png",
    imageAlt: "Photorealistic interior design preview",
    kicker: "Stage Three",
  },
  {
    id: "E",
    icon: Hammer,
    title: "Execute",
    subtitle: "Craft & Install",
    description: "Specialist teams bring the approved design into built form.",
    detail:
      "Fabrication, site coordination, and finishing are managed as one controlled delivery stream to reduce friction and protect quality.",
    image: "/reality_render.jpg",
    imageAlt: "Finished interior under installation and styling",
    kicker: "Stage Four",
  },
  {
    id: "F",
    icon: Check,
    title: "Handover",
    subtitle: "Final Reveal",
    description: "Walk through a polished, ready-to-live space with full confidence.",
    detail:
      "The closing stage focuses on finishing, quality checks, and a composed reveal that feels complete rather than merely delivered.",
    image: "/hero_reality_render_1775299733746.png",
    imageAlt: "Completed premium interior ready for handover",
    kicker: "Stage Five",
  },
] as const;

type ProcessStepConfig = (typeof steps)[number];

const ProcessStepButton = ({
  step,
  index,
  totalSteps,
  isActive,
  scrollYProgress,
  onSelect,
}: {
  step: ProcessStepConfig;
  index: number;
  totalSteps: number;
  isActive: boolean;
  scrollYProgress: MotionValue<number>;
  onSelect: (index: number) => void;
}) => {
  const threshold = index / Math.max(1, totalSteps - 1);
  const startFade = Math.max(0, threshold - 0.12);
  const endFade = Math.min(1, threshold + 0.08);

  const y = useTransform(scrollYProgress, [startFade, endFade], [22, 0]);
  const opacity = useTransform(scrollYProgress, [startFade, endFade], [0.35, 1]);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(index)}
      className="relative flex min-w-0 flex-1 flex-col items-center text-center outline-none"
      style={{ opacity, y }}
      aria-current={isActive ? "step" : undefined}
      aria-label={`View ${step.title} stage`}
    >
      <div
        className={cn(
          "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border text-base transition-all duration-500 md:h-14 md:w-14 md:text-lg",
          isActive
            ? "border-site-crimson bg-site-crimson text-white shadow-[0_0_28px_rgba(232,27,57,0.28)]"
            : "border-white/18 bg-black text-white/45",
        )}
      >
        <span className="font-display font-semibold">{step.id}</span>
      </div>

      <div className="mt-7 flex items-center justify-center">
        <step.icon
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-colors duration-400 md:h-5 md:w-5",
            isActive ? "text-site-crimson" : "text-white/35",
          )}
        />
      </div>

      <div className="mt-3">
        <h3
          className={cn(
            "font-sans text-lg font-semibold transition-colors duration-400 md:text-[1.05rem]",
            isActive ? "text-white" : "text-white/42",
          )}
        >
          {step.title}
        </h3>
        <p
          className={cn(
            "mx-auto mt-2 max-w-[18ch] text-sm leading-relaxed transition-colors duration-400",
            isActive ? "text-white/72" : "text-white/28",
          )}
        >
          {step.description}
        </p>
      </div>
    </motion.button>
  );
};

const Process = () => {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const timelineProgress = useSpring(scrollYProgress, {
    stiffness: prefersReducedMotion ? 240 : 120,
    damping: prefersReducedMotion ? 38 : 26,
    mass: 0.35,
  });

  const lineScaleX = useTransform(timelineProgress, [0, 1], [0, 1]);
  const panelGlow = useTransform(
    timelineProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      "0 0 0 rgba(232,27,57,0)",
      "0 0 60px rgba(232,27,57,0.12)",
      "0 0 80px rgba(255,255,255,0.08)",
      "0 0 70px rgba(232,27,57,0.12)",
      "0 0 45px rgba(232,27,57,0.10)",
    ],
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextIndex = Math.min(steps.length - 1, Math.floor(latest * steps.length));
    setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
  });

  const handleSelect = useCallback((index: number) => {
    const node = containerRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    const normalizedIndex = steps.length <= 1 ? 0 : index / (steps.length - 1);
    const targetY = window.scrollY + rect.top + scrollableDistance * normalizedIndex;

    window.scrollTo({
      top: targetY,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  const activeStep = steps[activeIndex];

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative h-[320vh] bg-site-bg text-white"
      aria-label="How we work process section"
    >
      <div className="sticky top-0 flex min-h-screen w-full items-center overflow-hidden px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between gap-10">
          <div className="grid gap-8 pt-12 lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.75fr)] lg:items-start lg:pt-16">
            <div className="max-w-[360px] pt-8 md:pt-14 lg:pt-20">
              <span className="font-mono text-[11px] uppercase tracking-[0.42em] text-white/68">
                How We Work
              </span>
              <h2 className="mt-3 font-display text-[clamp(3rem,6vw,5.7rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-white text-balance">
                Our Process
              </h2>
              <p className="mt-5 max-w-[17ch] font-display text-[1.05rem] leading-[1.5] text-white/76 md:text-[1.2rem]">
                A connected five-stage journey designed to move from brief to final reveal with clarity.
              </p>
            </div>

            <div className="relative">
              <motion.div
                style={{ boxShadow: panelGlow }}
                className="relative min-h-[360px] overflow-hidden bg-transparent md:min-h-[430px] lg:min-h-[520px]"
              >
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700",
                      activeIndex === index ? "opacity-100" : "pointer-events-none opacity-0",
                    )}
                    {...(activeIndex !== index ? { "aria-hidden": true } : {})}
                  >
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      width={1600}
                      height={1000}
                      className="h-full w-full"
                      imageClassName="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,3,3,0.92)_0%,rgba(3,3,3,0.58)_40%,rgba(3,3,3,0.24)_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(232,27,57,0.18),transparent_38%),linear-gradient(180deg,transparent_0%,rgba(3,3,3,0.72)_100%)]" />
                  </div>
                ))}

                <div className="relative z-10 flex h-full flex-col justify-end px-0 py-4 md:py-6 lg:py-8">
                  <motion.div
                    key={activeStep.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-[580px] pl-5 md:pl-9 lg:pl-12"
                  >
                    <div className="text-[11px] uppercase tracking-[0.34em] text-white/62">
                      {activeStep.kicker}
                    </div>
                    <div className="mt-4 flex items-end gap-4 md:gap-5">
                      <span className="font-display text-[clamp(2.6rem,5.2vw,5rem)] font-semibold leading-none tracking-[-0.05em] text-white">
                        {activeStep.title}
                      </span>
                      <span className="pb-2 font-mono text-[11px] uppercase tracking-[0.28em] text-site-crimson/90">
                        {activeStep.subtitle}
                      </span>
                    </div>
                    <p className="mt-5 max-w-[46ch] text-base leading-[1.8] text-white/78 md:text-[1.03rem]">
                      {activeStep.detail}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="relative px-5 pb-10 pt-14 md:px-8 lg:px-10">
            <div className="pointer-events-none absolute left-[6%] right-[6%] top-[55px] hidden h-px bg-white/16 md:block" />
            <motion.div
              className="pointer-events-none absolute left-[6%] right-[6%] top-[55px] hidden h-px origin-left bg-site-crimson md:block"
              style={{ scaleX: lineScaleX }}
            />

            <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-4">
              {steps.map((step, index) => (
                <ProcessStepButton
                  key={step.id}
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                  isActive={index === activeIndex}
                  scrollYProgress={scrollYProgress}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Schema.org FAQPage based on Process steps */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": steps.map(step => ({
              "@type": "Question",
              "name": `What is the ${step.title} stage of the process?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${step.description} ${step.detail}`
              }
            }))
          })
        }}
      />
    </section>
  );
};

export default Process;
