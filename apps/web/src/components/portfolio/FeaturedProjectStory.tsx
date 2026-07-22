import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface FeaturedProjectStoryProps {
  title: string;
  category: string;
  location: string;
  area: string;
  narrative: string;
  coverImage: string;
  slug: string;
  index: number;
}

export const FeaturedProjectStory = ({
  title,
  category,
  location,
  area,
  narrative,
  coverImage,
  slug,
  index,
}: FeaturedProjectStoryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverDirection, setHoverDirection] = useState<"left" | "right" | "top" | "bottom">("left");
  const [isHovered, setIsHovered] = useState(false);

  // Parallax scroll effect for image
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

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

  // Determine layout based on index (Alternating)
  // Index 0: Image Left, Text Right
  // Index 1: Text Left, Image Right
  // Index 2: Image Full Width, Text Overlay
  const layoutType = index % 3;

  const contentElement = (
    <div className="flex flex-col justify-center h-full p-8 md:p-12 lg:p-16 space-y-6 select-none">
      <div className="space-y-2">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">
          {category}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif font-light text-[#FAFAFA] tracking-tight leading-tight">
          {title}
        </h3>
      </div>
      <p className="text-sm md:text-base text-white/65 font-light leading-relaxed max-w-md">
        {narrative}
      </p>
      <div className="flex gap-6 text-[10px] font-mono tracking-widest text-white/40 uppercase">
        <span>{location}</span>
        <span>{area}</span>
      </div>
      <div className="pt-4 space-y-1.5">
        <span className="block text-[10px] font-mono text-white/25 tracking-[0.2em]">
          [{String(index + 1).padStart(2, "0")}]
        </span>
        <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] font-semibold text-primary uppercase group-hover:text-white transition-colors duration-300">
          View Story <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
        </span>
      </div>
    </div>
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden"
    >
      <style>{`
        @keyframes rotateConic {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .conic-border {
          position: relative;
        }
        .conic-border::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent 40%, #D1AF6E 50%, transparent 60%);
          animation: rotateConic 28s linear infinite;
          opacity: 0.12;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        .conic-border:hover::before {
          opacity: 0.45;
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {layoutType === 0 && (
          <>
            {/* Image Column */}
            <div className="lg:col-span-7 h-[50vh] lg:h-[75vh] w-full overflow-hidden relative rounded-2xl group border border-white/5 shadow-2xl">
              <div
                className="w-full h-full relative overflow-hidden cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to={`/portfolio/${slug}`}>
                  <motion.div
                    className="absolute -top-[10%] left-0 w-full h-[120%]"
                    style={{ y: imageY }}
                  >
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-1000 group-hover:scale-[1.03]"
                    />
                  </motion.div>

                  <AnimatePresence custom={hoverDirection}>
                    {isHovered && (
                      <motion.div
                        custom={hoverDirection}
                        variants={overlayVariants}
                        initial="initial"
                        animate="hover"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 bg-background/30 backdrop-blur-[2px] flex items-center justify-center z-30"
                      >
                        <span className="text-xs font-semibold tracking-[0.3em] text-white uppercase border border-white/20 px-6 py-3 bg-background/40 hover:bg-[#FAFAFA] hover:text-black transition-colors duration-300">
                          View Story →
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </div>
            </div>

            {/* Text Column */}
            <div className="lg:col-span-5">
              <div className="conic-border rounded-2xl overflow-hidden p-[1px]">
                <div className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl h-full conic-border-content">
                  {contentElement}
                </div>
              </div>
            </div>
          </>
        )}

        {layoutType === 1 && (
          <>
            {/* Text Column (on left) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="conic-border rounded-2xl overflow-hidden p-[1px]">
                <div className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl h-full conic-border-content">
                  {contentElement}
                </div>
              </div>
            </div>

            {/* Image Column (on right) */}
            <div className="lg:col-span-7 h-[50vh] lg:h-[75vh] w-full overflow-hidden relative rounded-2xl group border border-white/5 shadow-2xl order-1 lg:order-2">
              <div
                className="w-full h-full relative overflow-hidden cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to={`/portfolio/${slug}`}>
                  <motion.div
                    className="absolute -top-[10%] left-0 w-full h-[120%]"
                    style={{ y: imageY }}
                  >
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-1000 group-hover:scale-[1.03]"
                    />
                  </motion.div>

                  <AnimatePresence custom={hoverDirection}>
                    {isHovered && (
                      <motion.div
                        custom={hoverDirection}
                        variants={overlayVariants}
                        initial="initial"
                        animate="hover"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 bg-background/30 backdrop-blur-[2px] flex items-center justify-center z-30"
                      >
                        <span className="text-xs font-semibold tracking-[0.3em] text-white uppercase border border-white/20 px-6 py-3 bg-background/40 hover:bg-[#FAFAFA] hover:text-black transition-colors duration-300">
                          View Story →
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </div>
            </div>
          </>
        )}

        {layoutType === 2 && (
          <div className="lg:col-span-12 relative w-full h-[60vh] lg:h-[80vh] rounded-2xl overflow-hidden group border border-white/5 shadow-2xl">
            <div
              className="w-full h-full relative overflow-hidden cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link to={`/portfolio/${slug}`}>
                <motion.div
                  className="absolute -top-[10%] left-0 w-full h-[120%]"
                  style={{ y: imageY }}
                >
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-1000 group-hover:scale-[1.03]"
                  />
                </motion.div>

                {/* Always-on gradient overlay to ensure text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none z-10" />

                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 lg:p-16 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-4 max-w-xl">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">
                      {category}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-serif font-light text-[#FAFAFA] tracking-tight leading-none">
                      {title}
                    </h3>
                    <p className="text-sm text-white/65 font-light leading-relaxed">
                      {narrative}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <div className="flex gap-4 text-[10px] font-mono tracking-widest text-white/50 uppercase">
                      <span>{location}</span>
                      <span>{area}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-mono text-white/25 tracking-[0.2em]">
                        [{String(index + 1).padStart(2, "0")}]
                      </span>
                      <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] font-semibold text-primary uppercase">
                        View Story <span>→</span>
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence custom={hoverDirection}>
                  {isHovered && (
                    <motion.div
                      custom={hoverDirection}
                      variants={overlayVariants}
                      initial="initial"
                      animate="hover"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-background/30 backdrop-blur-[2px] flex items-center justify-center z-30"
                    >
                      <span className="text-xs font-semibold tracking-[0.3em] text-white uppercase border border-white/20 px-6 py-3 bg-background/40 hover:bg-[#FAFAFA] hover:text-black transition-colors duration-300">
                        View Story →
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
