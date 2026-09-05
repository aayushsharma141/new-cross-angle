import { motion } from "framer-motion";
import { Target, Lightbulb, Award, Users, LucideIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const values = [
  {
    icon: Target,
    title: "Execution-First Planning",
    description: "Every project begins with a detailed scope, timeline, and budget framework — delivered before a single wall is touched.",
  },
  {
    icon: Lightbulb,
    title: "Design Intelligence",
    description: "We blend function with aesthetic rigor — creating spaces built for everyday use, not just photographs.",
  },
  {
    icon: Award,
    title: "Turnkey Accountability",
    description: "No sub-contracting surprises. We own the full project — materials, labour, timelines, and final handover.",
  },
  {
    icon: Users,
    title: "Client Transparency",
    description: "Real-time progress updates, clear milestones, and zero hidden costs. You always know where your project stands.",
  },
];

const ValueCard = ({ icon: Icon, title, description, index }: ValueCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-pointer perspective-1000"
    >
      <div className="relative h-full p-8 md:p-10 rounded-[2.5rem] bg-[var(--s-canvas-secondary)] backdrop-blur-3xl border border-[var(--s-border-subtle)] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(209,175,110,0.12)] hover:border-primary/40 transition-all duration-700 overflow-hidden">
        {/* Internal reflection */}
        <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/5 pointer-events-none" />
        
        {/* Architectural corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-primary/0 group-hover:border-primary/40 rounded-tr-[2.5rem] transition-all duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-primary/0 group-hover:border-primary/40 rounded-bl-[2.5rem] transition-all duration-700 pointer-events-none" />

        {/* Huge Number */}
        <div className="absolute -bottom-6 -right-2 text-[140px] leading-none font-serif font-bold text-white/[0.02] pointer-events-none select-none group-hover:text-primary/[0.04] transition-colors duration-700 z-0">
          0{index + 1}
        </div>

        {/* Spotlight gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: isHovered
              ? `radial-gradient(500px circle at ${(mouseX.get() + 0.5) * 100}% ${(mouseY.get() + 0.5) * 100}%, rgba(209, 175, 110, 0.08), transparent 40%)`
              : "none",
          }}
        />

        {/* Icon */}
        <motion.div
          className="relative z-10 w-14 h-14 rounded-2xl bg-black/50 border border-[var(--s-border-subtle)] group-hover:border-primary/40 group-hover:bg-primary/10 flex items-center justify-center mb-8 transition-all duration-700 shadow-inner group-hover:shadow-[0_0_20px_rgba(209,175,110,0.2)]"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="w-7 h-7 text-white/50 group-hover:text-primary transition-colors duration-500" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-4 h-[1px] bg-primary/40 group-hover:w-8 group-hover:bg-primary transition-all duration-500" />
            <h3 className="font-serif text-lg font-semibold text-white group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300 font-light">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const AboutValues = () => {
  return (
    <section className="relative py-24 md:py-32 bg-[var(--s-canvas-primary)] overflow-hidden border-b border-[var(--s-border-subtle)]">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20 px-4"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-4 flex items-center justify-center gap-2">
            <span className="inline-block w-5 h-[2px] bg-primary" /> Our Principles
          </span>
          <h2 className="font-serif font-bold text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-white mb-5">
            Designed for aesthetics.<br />
            <span className="text-primary italic font-light">Built for everyday use.</span>
          </h2>
          <p className="text-[clamp(0.85rem,0.95vw,0.95rem)] text-white/60 font-light leading-[1.8] max-w-[44ch] mx-auto">
            Every project is delivered fully executed — not just designed.
            Our principles drive every decision from brief to final handover.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <ValueCard
              key={index}
              icon={value.icon}
              title={value.title}
              description={value.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutValues;
