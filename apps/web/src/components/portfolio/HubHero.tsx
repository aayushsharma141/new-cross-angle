import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { MagneticLink } from "./MagneticLink";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";

export const HubHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Parallax and Scale effects relative to scrolling of hero
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Background scales down from 1.05 to 1.0 and drifts slightly
  const bgScaleTransform = useTransform(scrollYProgress, [0, 1], [1.05, 1.0]);
  const bgYTransform = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const bgScale = shouldReduceMotion ? 1 : bgScaleTransform;
  const bgY = shouldReduceMotion ? "0%" : bgYTransform;

  const headline = "Crafting spaces that capture silence.";
  const words = headline.split(" ");

  const wordContainerVariants = {
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const wordVariants = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 1.4,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] bg-background text-white flex flex-col justify-center items-center overflow-hidden z-10"
    >
      {/* Parallax cover background image */}
      <motion.div
        style={{ scale: bgScale, y: bgY, opacity: heroOpacity }}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      >
        <img
          src={portfolioBedroom}
          alt="Luxury Bedroom interior architectural portfolio showcase"
          loading="eager"
          {...({ fetchpriority: "high" } as any)}
          decoding="sync"
          className="w-full h-full object-cover brightness-[0.35]"
        />
        {/* Subtle vignette shade gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
      </motion.div>

      {/* Main Text Content (Centered layout as requested) */}
      <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center justify-center space-y-8 h-full pt-16">
        <div className="space-y-4">
          {/* Eyebrow marker */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-primary/40" />
            <span className="text-primary font-bold uppercase tracking-[0.25em] text-[10px]">
              01 / ARCHIVE
            </span>
          </div>

          {/* Headline Word-by-word reveal */}
          <motion.h1
            variants={wordContainerVariants}
            initial="initial"
            animate="animate"
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-normal text-[#FAFAFA] leading-[1.05]"
            style={{ letterSpacing: "-0.03em" }}
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
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.01 : 1.4,
            delay: shouldReduceMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-sm sm:text-base md:text-lg text-white/80 font-normal max-w-[44ch] leading-relaxed"
        >
          A publication of quiet architectural command, curated lifestyles, and meticulous execution details.
        </motion.p>

        {/* Explore Projects Link with magnetic hover interaction */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.01 : 1.4,
            delay: shouldReduceMotion ? 0 : 1.0,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="pt-6"
        >
          <MagneticLink
            to="#philosophy"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-primary hover:text-white uppercase transition-colors duration-300 py-3 px-6"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("philosophy")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Projects <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </MagneticLink>
        </motion.div>
      </div>

      {/* Scroll indicator cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 z-20 pointer-events-none select-none">
        <span className="text-[8px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-6 bg-white/20"
        />
      </div>
    </div>
  );
};

export default HubHero;
