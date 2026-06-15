import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticLink } from "./MagneticLink";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";

export const HubHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax and Scale effects relative to scrolling of hero
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Background scales down from 1.05 to 1.0 and drifts slightly
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.0]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headline = "Crafting spaces that capture silence.";
  const words = headline.split(" ");

  const wordContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.3,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] bg-[#0B0B0B] text-white flex flex-col justify-center items-center overflow-hidden z-10"
    >
      {/* Parallax cover background image */}
      <motion.div
        style={{ scale: bgScale, y: bgY, opacity: heroOpacity }}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      >
        <img
          src={portfolioBedroom}
          alt="Luxury Bedroom interior"
          className="w-full h-full object-cover brightness-[0.35]"
        />
        {/* Subtle vignette shade gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0B0B0B]" />
      </motion.div>

      {/* Main Text Content (Centered layout as requested) */}
      <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center justify-center space-y-8 h-full pt-16">
        <div className="space-y-4">
          {/* Eyebrow marker */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-site-gold/40" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              01 / ARCHIVE
            </span>
          </div>

          {/* Headline Word-by-word reveal */}
          <motion.h1
            variants={wordContainerVariants}
            initial="initial"
            animate="animate"
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-tight text-[#FAFAFA] leading-[1.05]"
          >
            {words.map((word, index) => (
              <motion.span
                key={index}
                variants={wordVariants}
                className="inline-block mr-[0.2em] last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        {/* Supporting sentence */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.4, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg text-white/65 font-light max-w-xl leading-relaxed"
        >
          A publication of quiet architectural command, curated lifestyles, and meticulous execution details.
        </motion.p>

        {/* Explore Projects Link with magnetic hover interaction */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.6, ease: "easeOut" }}
          className="pt-6"
        >
          <MagneticLink
            to="#philosophy"
            className="text-xs font-semibold tracking-[0.3em] text-site-gold hover:text-white uppercase transition-colors duration-300 py-3 px-6"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("philosophy")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Projects
          </MagneticLink>
        </motion.div>
      </div>

      {/* Scroll indicator cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 z-20 pointer-events-none select-none">
        <span className="text-[8px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-6 bg-white/20"
        />
      </div>
    </div>
  );
};

export default HubHero;
