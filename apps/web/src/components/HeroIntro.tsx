import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroIntro = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={containerRef} 
      className="relative flex items-center justify-center bg-black px-6 py-32 md:min-h-[60vh] md:py-48"
    >
      <div className="container mx-auto max-w-[900px]">
        <motion.div style={{ y: y1, opacity }} className="text-center">
          <p className="font-display text-[clamp(1.5rem,3.5vw,2.5rem)] font-light leading-[1.3] tracking-[-0.01em] text-white/90">
            Award-winning interior design for homes and commercial spaces, shaped 
            with editorial restraint, practical clarity, and execution you can trust 
            from concept to handover.
          </p>
          <div className="mt-12 flex justify-center">
            <div className="h-20 w-[1px] bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroIntro;
