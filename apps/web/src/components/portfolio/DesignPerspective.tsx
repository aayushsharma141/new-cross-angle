import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";

interface PillarCardProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  num: string;
}

const PillarCard = ({ title, subtitle, description, image, num }: PillarCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [hoverDirection, setHoverDirection] = useState<"left" | "right" | "top" | "bottom">("left");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX > absY) {
      setHoverDirection(x > 0 ? "right" : "left");
    } else {
      setHoverDirection(y > 0 ? "bottom" : "top");
    }
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX > absY) {
      setHoverDirection(x > 0 ? "right" : "left");
    } else {
      setHoverDirection(y > 0 ? "bottom" : "top");
    }
    setIsHovered(false);
  };

  const overlayVariants = {
    initial: (dir: string) => {
      if (shouldReduceMotion) return { opacity: 0 };
      switch (dir) {
        case "left": return { x: "-100%", y: 0, opacity: 1 };
        case "right": return { x: "100%", y: 0, opacity: 1 };
        case "top": return { x: 0, y: "-100%", opacity: 1 };
        case "bottom": return { x: 0, y: "100%", opacity: 1 };
        default: return { x: 0, y: 0, opacity: 1 };
      }
    },
    hover: { x: 0, y: 0, opacity: 1 },
    exit: (dir: string) => {
      if (shouldReduceMotion) return { opacity: 0 };
      switch (dir) {
        case "left": return { x: "-100%", y: 0, opacity: 1 };
        case "right": return { x: "100%", y: 0, opacity: 1 };
        case "top": return { x: 0, y: "-100%", opacity: 1 };
        case "bottom": return { x: 0, y: "100%", opacity: 1 };
        default: return { x: 0, y: 0, opacity: 1 };
      }
    },
  };

  return (
    <div
      // Focusable on purpose: the focus ring reveals what hover reveals for
      // mouse users. Dropping tabIndex would be the accessibility regression.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className="relative w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[30vw] h-[52vh] md:h-[56vh] max-h-[520px] min-h-[380px] rounded-2xl overflow-hidden group shrink-0 border border-white/5 bg-white/[0.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rotating Conic Border effect */}
      <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl border border-white/5 group-hover:border-transparent transition-colors duration-300">
        <div className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
          <div
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_40%,#D1AF6E_50%,transparent_60%)] pointer-events-none"
            style={{
              animation: shouldReduceMotion ? "none" : "rotateConic 24s linear infinite",
            }}
          />
        </div>
      </div>

      {/* Image container */}
      <div className="absolute inset-[1px] overflow-hidden rounded-2xl bg-neutral-950 z-0">
        <img
          src={image}
          alt={`${title} - ${subtitle} interior design perspective`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-[0.85] transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Glass Caption Panel */}
      <div className="absolute bottom-6 left-6 right-6 z-20 bg-background/60 backdrop-blur-xl border border-white/10 p-6 rounded-xl conic-border-content space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase">{subtitle}</span>
          <span className="text-xs font-mono tracking-[0.2em] text-white/40">{num}</span>
        </div>
        <h4 
          className="text-xl md:text-2xl font-display font-normal text-[#FAFAFA] leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h4>
        <p className="text-xs text-white/75 font-normal leading-relaxed max-w-[38ch]">
          {description}
        </p>
      </div>

      {/* Directional Hover overlay */}
      <AnimatePresence custom={hoverDirection}>
        {isHovered && (
          <motion.div
            custom={hoverDirection}
            variants={overlayVariants}
            initial="initial"
            animate="hover"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-[1px] bg-white/[0.03] backdrop-blur-xl flex items-center justify-center z-30"
          >
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-white uppercase border border-white/20 px-5 py-2.5 bg-background/50 hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
              Explore Concept <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DesignPerspective = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [maxTranslate, setMaxTranslate] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const calculateTranslate = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        if (trackRef.current) {
          const trackWidth = trackRef.current.scrollWidth;
          const viewportWidth = window.innerWidth;
          const overflow = Math.max(0, trackWidth - viewportWidth);
          setMaxTranslate(overflow);
        }
      });
    };

    calculateTranslate();
    window.addEventListener("resize", calculateTranslate, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && trackRef.current) {
      resizeObserver = new ResizeObserver(() => {
        calculateTranslate();
      });
      resizeObserver.observe(trackRef.current);
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", calculateTranslate);
      resizeObserver?.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: shouldReduceMotion ? 400 : 120,
    damping: shouldReduceMotion ? 40 : 26,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Dynamic pixel-measured horizontal translation
  const x = useTransform(smoothProgress, (latest) =>
    shouldReduceMotion ? 0 : -latest * maxTranslate
  );

  const pillars = [
    {
      num: "01",
      subtitle: "Atmosphere",
      title: "Science of Light",
      description: "Harnessing daylight, architectural depth, and 2700K twilight calibration.",
      image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop",
    },
    {
      num: "02",
      subtitle: "Tactile",
      title: "Honest Materiality",
      description: "Raw stone, brushed oak, and tactile surfaces that age gracefully.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    },
    {
      num: "03",
      subtitle: "Volume",
      title: "Spatial Clarity",
      description: "Dissolving partition barriers to maximize clean, functional volume.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    },
    {
      num: "04",
      subtitle: "Handover",
      title: "Execution Detail",
      description: "Concealed joints, flush margins, and flawless custom joinery.",
      image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-background my-[10vh]">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center select-none pt-16 md:pt-20 pb-6">
        
        {/* Title layer */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 mb-6 md:mb-8 shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-px bg-primary/50" />
            <span className="text-primary font-bold uppercase tracking-[0.25em] text-[10px]">
              04 / PHILOSOPHY IN FORM
            </span>
          </div>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-display font-normal text-[#FAFAFA] leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Design <span className="italic text-stone-400 font-light">Perspective</span>
          </h2>
        </div>

        {/* Sliding Card Container */}
        <div className="w-full flex items-center overflow-hidden relative">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-8 px-6 md:px-12 lg:px-28 w-fit"
          >
            {pillars.map((pillar) => (
              <PillarCard
                key={pillar.num}
                num={pillar.num}
                subtitle={pillar.subtitle}
                title={pillar.title}
                description={pillar.description}
                image={pillar.image}
              />
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
};
