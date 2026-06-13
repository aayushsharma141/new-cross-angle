import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, Calculator, Sparkles, Fingerprint, Palette, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
interface Engine {
  system: string;
  heading: string[];
  subheading: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href?: string; modalTitle?: string; modalContent?: React.ReactNode };
  icon: React.ReactNode;
  glowColor: string;
  decorNumber: string;
  credibility: string;
  reverse?: boolean;
  visual: React.ReactNode;
  useCases?: string[];
}

const DiscoveryVisual = () => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 bg-[#0a0a0a]/80 overflow-hidden backdrop-blur-xl p-6 md:p-8 flex flex-col shadow-2xl shadow-black/50"
  >
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-site-gold/10 blur-[80px] rounded-full pointer-events-none" />
    
    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
          <Fingerprint className="w-5 h-5 text-site-gold" />
        </div>
        <span className="text-white/90 font-medium text-sm tracking-wide">Spatial DNA Profile</span>
      </div>
      <div className="flex items-center gap-2 bg-site-gold/10 px-3 py-1.5 rounded-full border border-site-gold/20">
        <Sparkles className="w-3 h-3 text-site-gold" />
        <span className="text-[10px] text-site-gold uppercase tracking-widest font-bold">100% Match</span>
      </div>
    </div>

    <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
      <div>
        <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Design Archetype</span>
        <div className="text-2xl md:text-3xl font-serif text-white tracking-tight">Modern <span className="italic text-site-gold">Minimalist</span></div>
      </div>
      
      <div>
        <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3">Palette Extraction</span>
        <div className="flex gap-3">
          {['#121212', '#2A2A2A', '#D1AF6E', '#C41E3A', '#EFEFEF'].map((color, i) => (
            <motion.div 
              key={color}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#1a1a1a] shadow-lg relative group/color"
              style={{ backgroundColor: color }}
            >
              <div className="absolute inset-0 rounded-full bg-white/0 group-hover/color:bg-white/20 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
        {[
          { icon: <Layers className="w-4 h-4 text-white/40" />, label: "Texture", value: "Matte & Fluted" },
          { icon: <Palette className="w-4 h-4 text-white/40" />, label: "Contrast", value: "High / Dramatic" }
        ].map((trait, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 + 0.6 }}
            className="flex flex-col gap-2 bg-white/[0.02] p-3 md:p-4 rounded-xl border border-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              {trait.icon}
              <span className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest">{trait.label}</span>
            </div>
            <span className="text-xs md:text-sm text-white/90 font-medium">{trait.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
);

const EstimatorVisual = () => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 bg-[#0a0a0a]/80 overflow-hidden backdrop-blur-xl p-6 md:p-8 flex flex-col shadow-2xl shadow-black/50"
  >
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-site-crimson/10 blur-[80px] rounded-full pointer-events-none" />
    
    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
          <Calculator className="w-5 h-5 text-site-crimson" />
        </div>
        <span className="text-white/90 font-medium text-sm tracking-wide">Investment Projection</span>
      </div>
      <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] text-green-400 uppercase tracking-widest font-bold">Live Data</span>
      </div>
    </div>

    <div className="flex-1 flex flex-col justify-center space-y-6 relative z-10">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-black/60 p-3 md:p-4 rounded-xl border border-white/[0.04] flex flex-col gap-1">
          <span className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest">Property Scope</span>
          <span className="text-white font-medium text-sm md:text-base">3 BHK Premium</span>
        </div>
        <div className="bg-black/60 p-3 md:p-4 rounded-xl border border-white/[0.04] flex flex-col gap-1">
          <span className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest">Carpet Area</span>
          <span className="text-white font-medium text-sm md:text-base">2,500 Sq.Ft</span>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-site-gold/20 p-5 md:p-6 rounded-2xl relative overflow-hidden mt-2">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-site-gold/20 via-site-gold to-site-crimson" />
        <span className="block text-[9px] md:text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3">Calibrated Investment Range</span>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-baseline gap-3"
        >
          <span className="text-3xl md:text-5xl font-serif text-white tracking-tight">₹45L</span>
          <span className="text-white/30 text-xl md:text-2xl">—</span>
          <span className="text-3xl md:text-5xl font-serif text-site-gold tracking-tight">₹60L</span>
        </motion.div>
        
        <div className="flex items-center gap-4 mt-6 pt-5 border-t border-white/5">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "65%" }}
              transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-site-gold to-site-crimson rounded-full"
            />
          </div>
          <span className="text-[9px] md:text-[10px] text-white/50 font-mono tracking-wider">±12% Variance</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const ENGINES: Engine[] = [
  {
    system: "System 01",
    heading: ["The", "Discovery", "Engine"],
    subheading: "Know Your Style. Before You Begin.",
    description:
      "Most clients arrive with inspiration images and a vague sense of what they want. Our Discovery Engine translates that ambiguity into a precise aesthetic profile — your spatial DNA. Answer a curated set of questions and receive a design archetype, mood alignment, and a personalised brief your designer can act on from day one.",
    primaryCta: { label: "Begin Discovery", href: "/aesthetic-discovery-engine" },
    secondaryCta: { 
      label: "How It Works", 
      modalTitle: "How the Discovery Engine Works",
      modalContent: (
        <div className="space-y-5 text-white/70 text-sm leading-relaxed">
          <p>
            <strong className="text-white">1. The Questionnaire:</strong> You start by answering a carefully curated sequence of questions covering your daily routines, aesthetic leanings, and functional requirements.
          </p>
          <p>
            <strong className="text-white">2. Pattern Recognition:</strong> Our algorithm analyzes your responses to identify underlying design preferences—even ones you might not explicitly know you have.
          </p>
          <p>
            <strong className="text-white">3. The Output:</strong> We generate a comprehensive "Spatial DNA" profile, complete with a color palette, material suggestions, and architectural style guidelines.
          </p>
          <p>
            <strong className="text-white">4. Actionable Brief:</strong> This profile directly translates into a precise brief for our designers, skipping the typical trial-and-error phase.
          </p>
        </div>
      )
    },
    icon: <Compass strokeWidth={1.5} className="w-4 h-4" />,
    glowColor: "rgba(196, 30, 58, 0.12)",
    decorNumber: "01",
    credibility: "Style profiles generated in under 4 minutes",
    reverse: false,
    visual: <DiscoveryVisual />,
    useCases: [
      "Aesthetic alignment for couples and co-founders",
      "Remote briefing for international clients",
      "Zero-ambiguity design briefs to eliminate revisions"
    ]
  },
  {
    system: "System 02",
    heading: ["Project", "Cost", "Estimator"],
    subheading: "Investment Clarity Before Commitment.",
    description:
      "Great design decisions require financial clarity. Our Estimator Engine maps your property size, quality tier, and project scope to a calibrated investment range — factoring material grades, labour complexity, and regional market rates. No vague ballparks. A real number you can plan around.",
    primaryCta: { label: "Get Your Estimate", href: "/estimate" },
    secondaryCta: { 
      label: "See Methodology", 
      modalTitle: "Estimator Engine Methodology",
      modalContent: (
        <div className="space-y-5 text-white/70 text-sm leading-relaxed">
          <p>
            <strong className="text-white">1. Data Ingestion:</strong> We maintain a constantly updated database of material costs, labor rates, and premium furniture pricing across different regions.
          </p>
          <p>
            <strong className="text-white">2. Scope Mapping:</strong> You input your property size, the level of finish desired (e.g., Ultra-Luxury vs. Premium), and specific requirements.
          </p>
          <p>
            <strong className="text-white">3. Algorithmic Calculation:</strong> The engine correlates your inputs with historical project data and real-time market rates.
          </p>
          <p>
            <strong className="text-white">4. Transparent Variance:</strong> We provide an estimated range (with a ±12% variance) rather than a single misleading number, ensuring you have a realistic financial baseline.
          </p>
        </div>
      )
    },
    icon: <Calculator strokeWidth={1.5} className="w-4 h-4" />,
    glowColor: "rgba(196, 30, 58, 0.08)",
    decorNumber: "02",
    credibility: "Estimates accurate within ±12% of final project cost",
    reverse: true,
    visual: <EstimatorVisual />,
    useCases: [
      "Pre-purchase property vetting & budgeting",
      "Transparent material vs. labor cost breakdown",
      "Preventing mid-project budget creep"
    ]
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      className="relative overflow-hidden border border-white/[0.05] bg-[#050505] rounded-3xl flex flex-col group hover:border-white/[0.08] transition-colors duration-500"
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
            backgroundSize: "80px 80px",
            backgroundPosition: "center center",
            maskImage: "radial-gradient(circle at center, black, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)"
          }}
          className="absolute inset-[-10%] opacity-[0.03]"
        />

        {/* Ambient Glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[400px] h-[300px] rounded-[100%] blur-[80px] opacity-50 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, ${engine.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Giant Watermark Number */}
        <span
          className="absolute leading-none pointer-events-none top-8 right-8"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(6rem, 10vw, 8rem)",
            color: "rgba(255,255,255,0.02)",
            letterSpacing: "-0.05em",
          }}
        >
          {engine.decorNumber}
        </span>
      </div>

      {/* ── Content Grid ─────────────────────────────────── */}
      <div className="relative z-10 p-8 md:p-12 flex flex-col flex-1">
        {/* ── Narrative Top ───────────────────── */}
        <div className="mb-10">
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-full p-2 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <span className="text-site-crimson">{engine.icon}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-site-crimson" />
                <span
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  className="text-[9px] font-bold tracking-[0.3em] uppercase text-site-gold"
                >
                  [ {engine.system} ]
                </span>
              </div>
              <span className="text-[8px] text-white/60 uppercase tracking-[0.2em] font-medium mt-1">Precision Instrument</span>
            </div>
          </motion.div>

          <motion.h2
            className="leading-[1.05] tracking-[-0.03em] mb-4 text-white"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {engine.heading.map((word, i) => (
              <span key={i} className="inline-block pb-1 mr-2">
                <motion.span variants={fadeUp} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="italic text-white/55"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1rem, 1.2vw, 1.15rem)",
            }}
          >
            {engine.subheading}
          </motion.p>
        </div>

        {/* ── Visual Showcase Middle ───────────────────── */}
        <motion.div 
          variants={fadeUp}
          className="w-full max-w-[360px] mx-auto mb-10 relative"
        >
          <div className="relative w-full group/visual perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-br from-site-gold/10 to-site-crimson/10 rounded-3xl blur-2xl opacity-0 group-hover/visual:opacity-100 transition-opacity duration-700" />
            {engine.visual}
          </div>
        </motion.div>

        {/* ── Narrative Bottom ───────────────────── */}
        <div className="flex-1 flex flex-col">
          <motion.div
            variants={fadeIn}
            className="w-12 h-[1px] bg-[#C41E3A] mb-5 opacity-80"
          />

          <motion.p
            variants={fadeUp}
            className="text-[#EDEDED]/60 leading-[1.6] mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem" }}
          >
            {engine.description}
          </motion.p>

          {engine.useCases && (
            <motion.div variants={fadeUp} className="mb-8">
              <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-4">Core Applications</span>
              <div className="flex flex-col gap-2.5">
                {engine.useCases.map((useCase, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 p-[3px] rounded-full bg-white/[0.03] border border-white/10 group-hover:border-site-gold/30 transition-colors">
                      <Sparkles className="w-2 h-2 text-site-gold/70" />
                    </div>
                    <span className="text-[0.85rem] text-[#EDEDED]/80 leading-relaxed font-light">{useCase}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CTAs ── */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto pt-8 border-t border-white/[0.04]">
            <motion.div variants={fadeUp} className="w-full sm:w-auto">
              <Link
                to={engine.primaryCta.href}
                className="group relative flex items-center justify-center gap-3 px-6 py-3 bg-site-crimson text-white transition-all duration-500 hover:shadow-[0_0_30px_rgba(196,30,58,0.3)] border border-site-crimson rounded-full overflow-hidden w-full"
              >
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none" />
                <span
                  className="relative tracking-[0.15em] uppercase whitespace-nowrap"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 700 }}
                >
                  {engine.primaryCta.label}
                </span>
                <ArrowRight
                  strokeWidth={2}
                  className="relative w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            {engine.secondaryCta && (
              <motion.div variants={fadeUp} className="w-full sm:w-auto mt-2 sm:mt-0">
                {engine.secondaryCta.modalContent ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group flex items-center justify-center gap-2 text-white/60 hover:text-site-gold transition-colors duration-300 w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-site-gold rounded p-1"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 500 }}
                  >
                    <span className="w-6 h-px bg-white/20 group-hover:bg-site-gold transition-colors duration-300" />
                    <span className="tracking-[0.1em] uppercase">{engine.secondaryCta.label}</span>
                  </button>
                ) : engine.secondaryCta.href ? (
                  <Link
                    to={engine.secondaryCta.href}
                    className="group flex items-center justify-center gap-2 text-white/60 hover:text-site-gold transition-colors duration-300 w-full"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 500 }}
                  >
                    <span className="w-6 h-px bg-white/20 group-hover:bg-site-gold transition-colors duration-300" />
                    <span className="tracking-[0.1em] uppercase">{engine.secondaryCta.label}</span>
                  </Link>
                ) : null}
              </motion.div>
            )}
          </div>
          
          <motion.p
            variants={fadeIn}
            className="mt-6 text-white/30 uppercase tracking-[0.1em] text-center"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px" }}
          >
            {engine.credibility}
          </motion.p>
        </div>
      </div>

      {/* ── Modal Overlay ── */}
      <AnimatePresence>
        {isModalOpen && engine.secondaryCta?.modalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg bg-[#0d0d0c] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-site-gold/20 via-site-gold to-site-crimson" />
              
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-serif text-2xl text-white pr-8 leading-tight">
                  {engine.secondaryCta.modalTitle}
                </h3>
                <button
                  aria-label="Close modal"
                  title="Close"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 -mr-2 -mt-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative z-10">
                {engine.secondaryCta.modalContent}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Export ────────────────────────────────────────── */
export default function ServicesEngines() {
  return (
    <section
      id="engines"
      aria-label="Precision design tools — Discovery and Estimator"
      className="bg-[#020202] relative pb-12"
    >
      {/* Section prelude */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pt-16 pb-12">
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
          Plan Your Interior Before You Invest.
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/60 max-w-[600px] mt-6 text-[1.05rem] font-light leading-relaxed"
        >
          We've engineered proprietary digital instruments that eliminate the guesswork from luxury interior design. By combining deep analytical frameworks with high-end aesthetic sensibilities, these engines provide absolute clarity and control over your project before a single material is sourced.
        </motion.p>
      </div>

      {/* Engine blocks */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {ENGINES.map((engine) => (
            <EngineBlock key={engine.system} engine={engine} />
          ))}
        </div>
      </div>
      
      {/* Closing border */}
      <div className="border-b border-white/[0.04]" />
    </section>
  );
}
