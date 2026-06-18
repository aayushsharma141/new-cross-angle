import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";

export const ClientPerspective = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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
        staggerChildren: 0.04,
      },
    },
  };

  const wordVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[50vh] flex items-center justify-center bg-[#0B0B0B] py-20 px-6 overflow-hidden border-t border-white/5 select-none"
    >
      <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-px bg-site-gold/40" />
          <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
            05 / CLIENT PERSPECTIVE
          </span>
        </div>

        {/* Testimonial Quote */}
        <motion.p
          variants={containerVariants}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="text-2xl sm:text-3xl md:text-4xl font-serif font-light leading-[1.35] text-[#FAFAFA] tracking-tight"
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
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.0, delay: 0.9, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div className="w-28 h-20 rounded-lg overflow-hidden border border-white/10 shadow-lg">
            <img
              src={portfolioBedroom}
              alt="Serene Master Suite"
              className="w-full h-full object-cover brightness-90"
            />
          </div>
        </motion.div>

        {/* Author Details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.1, ease: "easeOut" }}
          className="space-y-1.5"
        >
          <span className="text-sm font-semibold tracking-widest text-[#FAFAFA] uppercase block">
            {author}
          </span>
          <span className="text-[10px] font-mono tracking-[0.2em] text-site-gold uppercase block">
            {projectName}
          </span>
          {/* Real metadata — makes the quote feel grounded */}
          <span className="text-[9px] font-mono tracking-[0.15em] text-white/30 uppercase block mt-0.5">
            {projectMeta}
          </span>
        </motion.div>

      </div>
    </section>
  );
};
