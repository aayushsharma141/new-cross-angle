import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

interface PillarCardProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  num: string;
}

const PillarCard = ({ title, subtitle, description, image, num }: PillarCardProps) => {
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
      switch (dir) {
        case "left": return { x: "-100%", y: 0 };
        case "right": return { x: "100%", y: 0 };
        case "top": return { x: 0, y: "-100%" };
        case "bottom": return { x: 0, y: "100%" };
        default: return { x: 0, y: 0 };
      }
    },
    hover: { x: 0, y: 0 },
    exit: (dir: string) => {
      switch (dir) {
        case "left": return { x: "-100%", y: 0 };
        case "right": return { x: "100%", y: 0 };
        case "top": return { x: 0, y: "-100%" };
        case "bottom": return { x: 0, y: "100%" };
        default: return { x: 0, y: 0 };
      }
    },
  };

  return (
    <div
      className="relative w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[32vw] h-[60vh] md:h-[65vh] rounded-2xl overflow-hidden group shrink-0 border border-white/5 bg-white/[0.02]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rotating Conic Border effect */}
      <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl border border-white/5 group-hover:border-transparent transition-colors duration-300">
        <div className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
          <div
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_40%,#D1AF6E_50%,transparent_60%)] pointer-events-none"
            style={{
              animation: "rotateConic 24s linear infinite",
            }}
          />
        </div>
      </div>

      {/* Image container */}
      <div className="absolute inset-[1px] overflow-hidden rounded-2xl bg-neutral-950 z-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-[0.85] transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Glass Caption Panel */}
      <div className="absolute bottom-6 left-6 right-6 z-20 bg-[#0B0B0B]/60 backdrop-blur-xl border border-white/10 p-6 rounded-xl conic-border-content space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-bold tracking-[0.3em] text-site-gold uppercase">{subtitle}</span>
          <span className="text-xs font-mono text-white/30">{num}</span>
        </div>
        <h4 className="text-xl md:text-2xl font-serif font-light text-[#FAFAFA] tracking-tight leading-none">
          {title}
        </h4>
        <p className="text-xs text-white/60 font-light leading-relaxed">
          {description}
        </p>
      </div>

      {/* Directional Hover overlay containing ONLY View Story (or in this case, "Explore Concept →") */}
      <AnimatePresence custom={hoverDirection}>
        {isHovered && (
          <motion.div
            custom={hoverDirection}
            variants={overlayVariants}
            initial="initial"
            animate="hover"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-[1px] bg-white/[0.03] backdrop-blur-xl flex items-center justify-center z-30"
          >
            <span className="text-[10px] font-semibold tracking-[0.3em] text-white uppercase border border-white/20 px-5 py-2.5 bg-[#0B0B0B]/35 hover:bg-[#FAFAFA] hover:text-black transition-colors duration-300">
              Explore Concept →
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DesignPerspective = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  // Slide translation for horizontal scroll
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-52%"]);

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
    <div ref={containerRef} className="relative h-[250vh] bg-[#0B0B0B]">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center select-none">
        
        {/* Title layer */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 mb-10 shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-px bg-site-gold/50" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              04 / PHILOSOPHY IN FORM
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-[#FAFAFA] tracking-tight leading-tight">
            Design <span className="italic text-stone-400 font-light">Perspective</span>
          </h2>
        </div>

        {/* Sliding Card Container */}
        <div className="w-full flex items-center overflow-hidden relative">
          <motion.div
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
