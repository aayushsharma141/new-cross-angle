import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, Calculator, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
interface Engine {
  system: string;
  heading: string[];
  subheading: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  icon: React.ReactNode;
  glowColor: string;
  decorNumber: string;
  credibility: string;
  reverse?: boolean;
}

const ENGINES: Engine[] = [
  {
    system: "System 01",
    heading: ["The", "Discovery", "Engine"],
    subheading: "Know Your Style. Before You Begin.",
    description:
      "Most clients arrive with inspiration images and a vague sense of what they want. Our Discovery Engine translates that ambiguity into a precise aesthetic profile — your spatial DNA. Answer a curated set of questions and receive a design archetype, mood alignment, and a personalised brief your designer can act on from day one.",
    primaryCta: { label: "Begin Discovery", href: "/aesthetic-discovery-engine" },
    secondaryCta: { label: "How It Works", href: "/services#discovery" },
    icon: <Compass strokeWidth={1.5} className="w-4 h-4" />,
    glowColor: "rgba(196, 30, 58, 0.12)",
    decorNumber: "01",
    credibility: "Style profiles generated in under 4 minutes",
    reverse: false,
  },
  {
    system: "System 02",
    heading: ["The", "Estimator", "Engine"],
    subheading: "Investment Clarity Before Commitment.",
    description:
      "Great design decisions require financial clarity. Our Estimator Engine maps your property size, quality tier, and project scope to a calibrated investment range — factoring material grades, labour complexity, and regional market rates. No vague ballparks. A real number you can plan around.",
    primaryCta: { label: "Get Your Estimate", href: "/estimate" },
    secondaryCta: { label: "See Methodology", href: "/services#estimator" },
    icon: <Calculator strokeWidth={1.5} className="w-4 h-4" />,
    glowColor: "rgba(196, 30, 58, 0.08)",
    decorNumber: "02",
    credibility: "Estimates accurate within ±12% of final project cost",
    reverse: true,
  },
];

/* ─── Animation variants ─────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
} as const;

const charVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
} as const;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
} as const;

/* ─── Engine Block ───────────────────────────────────────── */
function EngineBlock({ engine }: { engine: Engine }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 40);
    mouseY.set(y * 40);
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      onMouseMove={handleMouseMove}
      variants={containerVariants}
      className="relative overflow-hidden border-t border-white/[0.04] bg-black"
    >
      {/* ── Faded Background Art & Grid ───────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none flex items-center justify-center">
        {/* Subtle grid pattern with Parallax */}
        <motion.div
          style={{ 
            x: springX, 
            y: springY,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: "120px 120px",
            backgroundPosition: "center center",
            maskImage: "radial-gradient(circle at center, black, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)"
          }}
          className="absolute inset-[-10%] opacity-[0.04]"
        />

        {/* Ambient Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[600px] h-[400px] rounded-[100%] blur-[100px] opacity-70 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, ${engine.glowColor} 0%, transparent 70%)`,
            transform: engine.reverse ? "translate(35%, 0)" : "translate(-35%, 0)",
          }}
        />

        {/* Giant Watermark Number */}
        <span
          className="absolute leading-none pointer-events-none"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(8rem, 15vw, 14rem)",
            color: "rgba(255,255,255,0.015)",
            letterSpacing: "-0.05em",
            [engine.reverse ? "left" : "right"]: "clamp(1rem, 5vw, 4rem)",
          }}
        >
          {engine.decorNumber}
        </span>
      </div>

      {/* ── Content Grid ─────────────────────────────────── */}
      <div
        className={`relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24
          flex flex-col md:flex-row gap-12 md:gap-16 items-center justify-between
          ${engine.reverse ? "md:flex-row-reverse" : ""}`}
      >
        {/* ── Narrative Column ───────────────────── */}
        <div className="flex-1 max-w-[500px]">
          {/* System badge with Magnetic effect (simplified through motion) */}
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-full p-2 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <span className="text-site-crimson">{engine.icon}</span>
            </div>
            <div className="flex flex-col">
              <span
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                className="text-[9px] font-bold tracking-[0.3em] uppercase text-site-crimson"
              >
                [ {engine.system} ]
              </span>
              <span className="text-[8px] text-white/60 uppercase tracking-[0.2em] font-medium">Precision Instrument</span>
            </div>
          </motion.div>

          {/* Heading with Character Stagger */}
          <motion.h2
            className="leading-[1.05] tracking-[-0.03em] mb-6 text-white"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
            }}
          >
            {engine.heading.map((word, i) => (
              <span key={i} className="block overflow-hidden pb-1">
                <motion.span
                  variants={fadeUp}
                  className="block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="italic text-white/55 mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.05rem, 1.5vw, 1.3rem)",
            }}
          >
            {engine.subheading}
          </motion.p>

          {/* Crimson rule */}
          <motion.div
            variants={fadeIn}
            className="w-16 h-[1px] bg-[#C41E3A] mb-5 opacity-80"
          />

          {/* Body copy */}
          <motion.p
            variants={fadeUp}
            className="text-[#EDEDED]/45 leading-[1.7] max-w-[440px]"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem" }}
          >
            {engine.description}
          </motion.p>
        </div>

        {/* ── Right / CTA column ───────────────────────── */}
        <div
          className={`flex flex-col gap-6 items-start md:items-center flex-1 max-w-[340px]
            ${engine.reverse ? "md:items-start" : "md:items-end"}`}
        >
          {/* Decorative vertical accent (desktop only) */}
          <motion.div
            variants={fadeIn}
            className="hidden md:flex w-px h-16 bg-gradient-to-b from-transparent via-[#C41E3A]/40 to-transparent mb-2"
          />

          {/* Primary CTA */}
          <motion.div variants={fadeUp} className="w-full sm:w-auto">
            <Link
              to={engine.primaryCta.href}
              className="group relative flex items-center justify-between sm:justify-center gap-6 px-10 py-5 bg-site-crimson text-white transition-all duration-500 hover:shadow-[0_0_40px_rgba(196,18,48,0.3)] border border-site-crimson w-full rounded-full"
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none" />
              <span
                className="relative tracking-[0.2em] uppercase whitespace-nowrap"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 700 }}
              >
                {engine.primaryCta.label}
              </span>
              <div className="relative">
                <ArrowRight
                  strokeWidth={2}
                  className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-2"
                />
                <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-white/0 group-hover:text-white/80 transition-all duration-500 delay-100 group-hover:animate-pulse" />
              </div>
            </Link>
          </motion.div>

          {/* Secondary CTA */}
          {engine.secondaryCta && (
            <motion.div variants={fadeUp} className="w-full sm:w-auto flex justify-start sm:justify-center">
              <Link
                to={engine.secondaryCta.href}
                className="group flex items-center justify-center gap-3 text-white/60 hover:text-[#C41E3A] transition-colors duration-300"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 500 }}
              >
                <span className="w-6 h-px bg-current transition-all duration-300 group-hover:w-8" />
                <span className="tracking-[0.15em] uppercase">{engine.secondaryCta.label}</span>
              </Link>
            </motion.div>
          )}

          {/* Credibility micro-copy */}
          <motion.p
            variants={fadeIn}
            className="mt-2 text-white/25 uppercase tracking-[0.1em] text-left sm:text-center w-full"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", lineHeight: "1.6" }}
          >
            {engine.credibility}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Export ────────────────────────────────────────── */
export default function ServicesEngines() {
  return (
    <section
      id="engines"
      aria-label="Precision design tools — Discovery and Estimator"
      className="bg-[#020202] relative"
    >
      {/* Section prelude */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pt-16 pb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[#C41E3A] uppercase tracking-[0.3em] mb-2 font-semibold"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px" }}
        >
          Precision Instruments
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#EDEDED] leading-tight"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
          }}
        >
          Tools That Think Before You Spend.
        </motion.h2>
      </div>

      {/* Engine blocks */}
      {ENGINES.map((engine) => (
        <EngineBlock key={engine.system} engine={engine} />
      ))}
      
      {/* Closing border */}
      <div className="border-b border-white/[0.04]" />
    </section>
  );
}

