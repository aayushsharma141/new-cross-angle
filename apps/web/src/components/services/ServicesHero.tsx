import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { KineticText } from "@/components/ui/kinetic-text";

const ServicesHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const titleWords = ["You", "Dream", "It.", "We", "Design", "It."];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--secondary) / 0.1) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent) / 0.08) 0%, transparent 60%)",
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-noise" />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="h-full w-full bg-grid-pattern"
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 container mx-auto px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            OUR SERVICES
          </span>
        </motion.div>

        {/* Main Title with staggered animation */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight flex flex-wrap justify-center gap-x-4 gap-y-2">
            <KineticText preset="word-reveal" delay={0.1}>
              You Dream It.
            </KineticText>
            <span className="flex gap-x-4">
              <KineticText preset="word-reveal" delay={0.4}>
                We
              </KineticText>
              <span className="text-primary italic">
                <KineticText preset="word-reveal" delay={0.5}>
                  Design
                </KineticText>
              </span>
              <KineticText preset="word-reveal" delay={0.6}>
                It.
              </KineticText>
            </span>
          </h1>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-center leading-relaxed"
        >
          From initial concepts to stunning reality, we're your design partner.
          Every space is crafted with precision because every detail matters.
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
        >
          {[
            { label: "HUMAN CREATIVITY.", value: "" },
            { label: "AI-ENHANCED SPEED.", value: "" },
            { label: "DESIGNS THAT INSPIRE.", value: "" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm md:text-base font-medium tracking-widest text-muted-foreground">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest text-muted-foreground uppercase">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ServicesHero;
