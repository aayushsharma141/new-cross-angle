import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";

export const ClientPerspective = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const quote =
    "Their attention to detail transformed our space from a simple room into our daily sanctuary.";
  const author = "Mrs. Sharma";
  const projectName = "Serene Master Suite";
  const projectMeta = "450 sq ft · Private Residence · Jamshedpur";

  const words = quote.split(" ");

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const wordVariants = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
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
    <section
      ref={containerRef}
      className="relative min-h-[60vh] flex items-center justify-center bg-background py-[22vh] px-6 overflow-hidden border-t border-white/5 select-none"
    >
      <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-px bg-primary/40" />
          <span className="text-primary font-bold uppercase tracking-[0.25em] text-[10px]">
            06 / CLIENT PERSPECTIVE
          </span>
        </div>

        {/* Testimonial Quote */}
        <motion.p
          variants={containerVariants}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="text-2xl sm:text-3xl md:text-4xl font-display font-normal leading-[1.35] text-[#FAFAFA] max-w-[38ch] mx-auto"
          style={{ letterSpacing: "-0.02em" }}
        >
          &ldquo;
          {words.map((word, idx) => (
            <motion.span
              key={idx}
              variants={wordVariants}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
          &rdquo;
        </motion.p>

        {/* Project Thumbnail */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1.4, delay: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <div className="w-28 h-20 rounded-lg overflow-hidden border border-white/10 shadow-lg">
            <img
              src={portfolioBedroom}
              alt="Serene Master Suite client residence interior thumbnail"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover brightness-90"
            />
          </div>
        </motion.div>

        {/* Author Details */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1.4, delay: shouldReduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-1.5"
        >
          <span className="text-xs font-bold tracking-[0.25em] text-[#FAFAFA] uppercase block">
            {author}
          </span>
          <span className="text-[10px] font-mono tracking-[0.2em] text-primary uppercase block">
            {projectName}
          </span>
          {/* Real metadata — makes the quote feel grounded */}
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase block mt-0.5">
            {projectMeta}
          </span>
        </motion.div>

      </div>
    </section>
  );
};
