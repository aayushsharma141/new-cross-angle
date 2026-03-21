import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Compass, Calculator } from "lucide-react";

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
    primaryCta: { label: "Begin Discovery", href: "/style-quiz" },
    secondaryCta: { label: "How It Works", href: "/services#discovery" },
    icon: <Compass strokeWidth={1} className="w-5 h-5" />,
    glowColor: "rgba(196, 30, 58, 0.18)",
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
    icon: <Calculator strokeWidth={1} className="w-5 h-5" />,
    glowColor: "rgba(196, 30, 58, 0.14)",
    decorNumber: "02",
    credibility: "Estimates accurate within ±12% of final project cost",
    reverse: true,
  },
];

/* ─── Animation variants ─────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.74, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

/* ─── Engine Block ───────────────────────────────────────── */
function EngineBlock({ engine }: { engine: Engine }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      className="relative overflow-hidden border-t border-white/[0.07]"
    >
      {/* ── Faded Background Art ─────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
        {/* Radial glow emanating from top */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[480px] rounded-full blur-[110px] opacity-80"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${engine.glowColor} 0%, transparent 68%)`,
          }}
        />

        {/* Large watermark number */}
        <span
          aria-hidden="true"
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 leading-none pointer-events-none"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(8rem, 20vw, 18rem)",
            color: "rgba(255,255,255,0.025)",
            letterSpacing: "-0.04em",
          }}
        >
          {engine.decorNumber}
        </span>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* Mid horizontal line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.03]" />
      </div>

      {/* ── Content Grid ─────────────────────────────────── */}
      <div
        className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28
          grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center
          ${engine.reverse ? "md:[direction:rtl]" : ""}`}
      >
        {/* ── Left / Narrative column ───────────────────── */}
        <div className={engine.reverse ? "md:[direction:ltr]" : ""}>
          {/* System badge */}
          <motion.div variants={fadeIn} className="flex items-center gap-2.5 mb-8">
            <span className="text-[#C41E3A]">{engine.icon}</span>
            <span
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              className="text-[9.5px] font-medium tracking-[0.26em] uppercase text-[#C41E3A]"
            >
              [ {engine.system} ]
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="leading-[0.93] tracking-[-0.025em] mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(2.8rem, 6.5vw, 4.8rem)",
            }}
          >
            {engine.heading.map((word, i) => (
              <span key={i} className="block">
                {i === 1 ? (
                  <span className="text-white">{word}</span>
                ) : (
                  <span className="text-white/40">{word}</span>
                )}
              </span>
            ))}
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="italic text-white/55 mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
            }}
          >
            {engine.subheading}
          </motion.p>

          {/* Crimson rule */}
          <motion.div
            variants={fadeIn}
            className="w-12 h-[1.5px] bg-[#C41E3A] mb-7 opacity-75"
          />

          {/* Body copy */}
          <motion.p
            variants={fadeUp}
            className="text-white/45 leading-[1.75] max-w-[460px]"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem" }}
          >
            {engine.description}
          </motion.p>
        </div>

        {/* ── Right / CTA column ───────────────────────── */}
        <div
          className={`flex flex-col gap-5 items-start
            ${engine.reverse ? "md:[direction:ltr] md:items-start" : "md:items-end"}`}
        >
          {/* Decorative vertical accent */}
          <motion.div
            variants={fadeIn}
            className="hidden md:flex flex-col items-center gap-2 mb-2 opacity-15"
          >
            <div className="w-px h-14 bg-white/50" />
            <div className="w-[3px] h-[3px] rounded-full bg-white/70" />
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={fadeUp}>
            <Link
              to={engine.primaryCta.href}
              className="group relative inline-flex items-center gap-3 px-8 py-[14px] bg-[#C41E3A] text-white overflow-hidden transition-all duration-300 hover:bg-[#a71830] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {/* Shine sweep */}
              <span className="absolute inset-0 translate-x-[-115%] group-hover:translate-x-[115%] transition-transform duration-650 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none" />

              <span
                className="relative tracking-[0.13em] uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}
              >
                {engine.primaryCta.label}
              </span>
              <ArrowRight
                strokeWidth={1.5}
                className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          {/* Secondary CTA */}
          {engine.secondaryCta && (
            <motion.div variants={fadeUp}>
              <Link
                to={engine.secondaryCta.href}
                className="group inline-flex items-center gap-2.5 text-white/35 hover:text-white/70 transition-colors duration-300"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem" }}
              >
                <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
                <span className="tracking-[0.1em] uppercase">{engine.secondaryCta.label}</span>
              </Link>
            </motion.div>
          )}

          {/* Credibility micro-copy */}
          <motion.p
            variants={fadeIn}
            className="mt-3 text-white/18 uppercase tracking-[0.09em]"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.66rem" }}
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
      className="bg-[#050505]"
    >
      {/* Section prelude */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-20 pb-10 border-t border-white/[0.07]">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-white/25 uppercase tracking-[0.3em] mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9.5px" }}
        >
          Precision Instruments
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/70 leading-tight"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
          }}
        >
          Tools That Think Before You Spend.
        </motion.h2>
      </div>

      {/* Engine blocks */}
      {ENGINES.map((engine) => (
        <EngineBlock key={engine.system} engine={engine} />
      ))}

      {/* Closing rule */}
      <div className="border-b border-white/[0.07]" />
    </section>
  );
}
