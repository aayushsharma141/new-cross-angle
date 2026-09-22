import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";

export const Philosophy = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Crossfade backgrounds: Hero image fades out, Kitchen/Project image fades in
  const heroOpacityTransform = useTransform(scrollYProgress, [0, 0.55], [0.3, 0]);
  const project1OpacityTransform = useTransform(scrollYProgress, [0.45, 0.9], [0, 0.4]);

  const heroOpacity = shouldReduceMotion ? 0.15 : heroOpacityTransform;
  const project1Opacity = shouldReduceMotion ? 0.2 : project1OpacityTransform;

  const sentences = [
    "We believe in spaces that do not shout to be noticed.",
    "True luxury is found in quiet transitions, precise proportions, and physical details that are felt rather than explained.",
    "This journal is our portfolio — an honest publication of architectural precision, acoustic sanctuary, and spatial clarity.",
  ];

  const lineVariants = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: (idx: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 1.4,
        delay: shouldReduceMotion ? 0 : idx * 0.25,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <div
      ref={containerRef}
      id="philosophy"
      className="relative min-h-[90vh] bg-background text-white flex items-center justify-center py-[20vh] px-6 overflow-hidden z-10 select-none"
    >
      {/* Background crossfade elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Fading Hero Cover */}
        <motion.img
          src={portfolioBedroom}
          alt="Serene bedroom architectural transition preview"
          loading="lazy"
          decoding="async"
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 w-full h-full object-cover scale-[1.02] filter blur-[4px] brightness-[0.25]"
        />

        {/* Emerging Project Cover */}
        <motion.img
          src={portfolioKitchen}
          alt="Culinary kitchen space architectural transition preview"
          loading="lazy"
          decoding="async"
          style={{ opacity: project1Opacity }}
          className="absolute inset-0 w-full h-full object-cover scale-[1.02] filter blur-[4px] brightness-[0.25]"
        />

        {/* Ambient Darkener overlay */}
        <div className="absolute inset-0 bg-background/85" />
      </div>

      {/* Main Philosophy Content */}
      <div className="relative z-10 max-w-[700px] w-full text-center space-y-12">
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-px bg-primary/40" />
          <span className="text-primary font-bold uppercase tracking-[0.25em] text-[10px]">
            02 / PHILOSOPHY
          </span>
        </div>

        <div className="space-y-8">
          {sentences.map((sentence, idx) => (
            <motion.p
              key={idx}
              custom={idx}
              variants={lineVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="text-lg sm:text-xl md:text-2xl font-display font-light leading-relaxed text-[#FAFAFA] max-w-[44ch] mx-auto"
              style={{ letterSpacing: "-0.02em" }}
            >
              {sentence}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Philosophy;
