import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Sun, Layers, Fingerprint, Palette, BarChart3, Compass, X, BatteryCharging, Circle, Eye, Sparkles, Users, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoIcon from "@/assets/logo-icon.png";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";
import SoftAurora from "@/components/ReactBits/SoftAurora";
import CountUp from "@/components/ReactBits/CountUp";

import BlurText from "@/components/ReactBits/BlurText";
import ShinyText from "@/components/ReactBits/ShinyText";
import type { DiscoveryConfig } from "@/types/discovery";


/* ─── Intent Options (from WelcomeScreen) ─────────────────── */
const INTENT_OPTIONS = [
  { id: "drain", label: "My current space drains my energy, and I need a home that restores it.", short: "Energy Restorative", icon: BatteryCharging },
  { id: "invisible", label: "I want my home to feel 'invisible' — a silent, perfect backdrop to my life.", short: "Quiet Minimalism", icon: Circle },
  { id: "chaos", label: "I feel overwhelmed by choice chaos and need clarity on my true style.", short: "Visual Clarity", icon: Eye },
  { id: "pride", label: "I want my home to reflect who I have become and my milestones.", short: "Self Expression", icon: Sparkles },
  { id: "connection", label: "My space should be a hub for shared moments, warmth, and connection.", short: "Shared Warmth", icon: Users },
  { id: "becoming", label: "I want a home that acts as a catalyst for who I am becoming.", short: "Identity Catalyst", icon: Flame },
];

/* ─── Unified Dashboard View ─────────────────────────────── */
function UnifiedDashboard() {
  const bars = [
    { label: "Visual Calm", score: 85 },
    { label: "Warmth", score: 70 },
    { label: "Social Energy", score: 60 },
    { label: "Material Depth", score: 90 },
    { label: "Structure", score: 75 },
  ];

  const deliverables = [
    { title: "Psychological Profile", icon: Fingerprint, desc: "Your aesthetic DNA" },
    { title: "Archetype Match", icon: Compass, desc: "1 of 10 design personas" },
    { title: "Color Strategy", icon: Palette, desc: "Your core palette" },
    { title: "Material Bias", icon: Layers, desc: "Textures & finishes" },
    { title: "Spatial Flow", icon: Sun, desc: "Layout psychology" },
    { title: "Investment Roadmap", icon: BarChart3, desc: "Budget feasibility" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const barVariants: Variants = {
    hidden: { width: "0%" },
    show: (score: number) => ({
      width: `${score}%`,
      transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.3 }
    })
  };

  return (
    <div className="flex flex-col gap-10 pb-24 max-w-xl mx-auto w-full">
      {/* Top Zone: DNA Bars */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white border border-[#e8e4dd] p-8 rounded-2xl shadow-sm">
        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest text-[#70593a] uppercase font-bold">01 / The Science</span>
          <h2 className="text-2xl font-serif text-[#1a1a1a] mt-2">Your Aesthetic DNA</h2>
        </div>
        <div className="flex flex-col gap-5">
          {bars.map((bar, i) => (
            <motion.div key={i} variants={itemVariants} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#5a5a5a]">
                <span>{bar.label}</span>
                <span>{bar.score}%</span>
              </div>
              <div className="h-2 w-full bg-[#faf8f5] rounded-full overflow-hidden">
                <motion.div
                  custom={bar.score}
                  variants={barVariants}
                  className="h-full bg-[#c9a96e] rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Middle Zone: Archetype Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#1a1a1a] text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a96e]/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-mono tracking-widest text-[#c9a96e] uppercase font-bold mb-4 block">02 / The Outcome</span>
          <h3 className="text-3xl font-serif mb-2">The Warm Modernist</h3>
          <p className="text-sm text-zinc-400 font-light mb-8 max-w-sm">"I want clean lines that don't feel cold, and minimalism that still feels human."</p>
          
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-3 block">Core Palette</span>
              <div className="flex gap-2">
                {["#e5e0d8", "#c2b4a3", "#80643e", "#2a2825"].map(hex => (
                  <div key={hex} className="w-8 h-8 rounded-full border border-white/10" style={{ backgroundColor: hex }} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-1 block">Material Bias</span>
              <span className="text-xs font-medium text-zinc-300">Walnut & Boucle</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Zone: Deliverables Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest text-[#70593a] uppercase font-bold">03 / The Blueprint</span>
          <h2 className="text-2xl font-serif text-[#1a1a1a] mt-2">What You Receive</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {deliverables.map((item, i) => (
            <div key={i} className="bg-white border border-[#e8e4dd] p-5 rounded-xl hover:shadow-sm transition-shadow group cursor-default">
              <item.icon size={20} className="text-[#c9a96e] mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-medium text-[#1a1a1a] mb-1">{item.title}</h4>
              <p className="text-[11px] text-[#5a5a5a] font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Intent Overlay ──────────────────────────────────────── */
function IntentOverlay({
  lang,
  onSelect,
  onClose,
}: {
  lang: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf8f5]/95 backdrop-blur-md"
    >
      <div className="max-w-3xl w-full mx-auto px-6 py-12 flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="self-end mb-4 p-2 text-[#5a5a5a] hover:text-[#1a1a1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80643e] rounded-full"
          aria-label="Close intent selection"
        >
          <X size={18} />
        </button>

        <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#70593a] bg-[#70593a]/10 px-4 py-1.5 rounded-full font-bold shadow-sm mb-6">
          {lang === "hi" ? "STAGE 01 — INTENT" : "STAGE 01 — INTENT"}
        </span>

        <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight mb-4 text-[#1a1a1a] max-w-2xl tracking-tight">
          {lang === "hi" ? "Aapke naye space ka primary driving force kya hai?" : "What is the primary driving force behind your new space?"}
        </h2>

        <p className="text-sm text-[#5a5a5a] max-w-lg mb-10 leading-relaxed font-light">
          {lang === "hi" ? "Woh chunein jo aapke emotional state aur spatial aspirations se sabse zyada match karta hai." : "Select the sentiment that best encapsulates your core emotional state and spatial aspirations."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-8">
          {INTENT_OPTIONS.map((intent) => {
            const Icon = intent.icon;
            return (
            <button
              key={intent.id}
              onClick={() => onSelect(intent.id)}
              className="p-5 bg-white border border-[#e8e4dd] hover:border-[#c9a96e] text-left hover:scale-[1.03] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group flex flex-col gap-3 text-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9a96e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#70593a] font-bold group-hover:translate-x-1 transition-transform mt-1">
                  {intent.short}
                </span>
                <div className="p-1.5 bg-[#faf8f5] rounded-full group-hover:bg-white group-hover:shadow-sm transition-all duration-300 text-[#70593a]/70 group-hover:text-[#70593a]">
                  <Icon size={14} />
                </div>
              </div>
              <p className="text-sm text-[#2a2a2a] group-hover:text-[#1a1a1a] leading-relaxed font-serif font-semibold relative z-10">
                "{intent.label}"
              </p>
            </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
interface DiscoveryLandingProps {
  onStart: (mode: "quick" | "deep", intent?: string) => void;
  config?: DiscoveryConfig;
}

export default function DiscoveryLanding({ onStart }: DiscoveryLandingProps) {
  const { settings } = useSiteSettings();
  const logoUrl = settings?.company_logo_url || settings?.logo_light_url || logoIcon;
  const { lang, setLang } = useLanguage();
  const [showIntent, setShowIntent] = useState(false);

  const quizCount = 1420;

  const handleStartDeep = () => setShowIntent(true);
  const handleStartQuick = () => onStart("quick");
  const handleIntentSelect = (id: string) => {
    setShowIntent(false);
    onStart("deep", id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full min-h-screen bg-[#faf8f5] text-[#1a1a1a] selection:bg-[#c9a96e]/20 overflow-x-hidden"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <SoftAurora
          speed={0.12}
          scale={1.3}
          brightness={1.1}
          color1="#c8a96e"
          color2="#5a705e"
          color3="#faf8f5"
          enableMouseInteraction={true}
          className="absolute inset-0 w-full h-full opacity-[0.2]"
        />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Fixed Header ── */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 md:px-10 pointer-events-none">
        <div className="pointer-events-auto">
          <a href="/" className="flex items-center gap-2 sm:gap-3 z-10 shrink-0 group min-w-0 hover:opacity-75 transition-all duration-300 rounded-lg focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none" aria-label="Return to CrossAngle Home">
            <img src={logoUrl} alt="Cross Angle Interior" className="h-10 md:h-12 w-auto transition-all duration-500 shrink-0" />
            <AnimatedLogo isScrolled={false} className="flex gap-1 sm:gap-1.5 font-bold tracking-tight whitespace-nowrap min-w-0 [&_span]:text-[#1a1a1a]" />
          </a>
        </div>
        <div className="pointer-events-auto">
          <div className="flex items-center border border-[#e8e4dd] bg-white/70 backdrop-blur-md overflow-hidden rounded-full shadow-sm">
            {(["en", "hi"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-current={lang === l ? "true" : undefined}
                className={`px-4 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${
                  lang === l ? "bg-[#c9a96e] text-black font-semibold shadow-sm" : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-[#c9a96e]/10"
                }`}
              >
                {l === "en" ? "EN" : "Hinglish"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:flex h-screen overflow-hidden relative z-10 pt-[72px]">
        {/* Left Panel (45%) */}
        <div className="w-[45%] flex flex-col justify-center px-10 xl:px-16 2xl:px-20 py-12">
          <div className="mb-3">
            <ShinyText
              text="Aesthetic Discovery Engine"
              className="text-[9px] font-mono tracking-[0.35em] uppercase text-[#70593a] font-bold"
              color="#70593a"
              shineColor="#c9a96e"
              speed={4}
              spread={60}
            />
          </div>

          <h1 className="font-serif text-[clamp(2.2rem,3.2vw,3.6rem)] font-normal leading-[1.12] mb-5 text-[#1a1a1a] tracking-tight max-w-xl">
            Most tools ask what you want.
            <br />
            We decode how you{" "}
            <em className="not-italic text-[#70593a] font-serif font-medium">want to live.</em>
          </h1>

          <BlurText
            text="Your home is not a design problem. It's a psychology question. Take a 3-minute discovery and receive your interior archetype, palette direction, material focus, and a practical design roadmap."
            className="text-sm text-[#4a4a4a] max-w-lg leading-relaxed mb-8 font-light"
            delay={80}
            animateBy="words"
            direction="top"
            stepDuration={0.4}
          />

          <div className="flex flex-col gap-4 mb-10 w-fit">
            <div className="flex items-center gap-4">
              <button
                onClick={handleStartDeep}
                className="group relative overflow-hidden px-8 py-3.5 bg-[#c9a96e] hover:bg-[#b5955a] text-black font-semibold text-[11px] font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Full Discovery
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
              </button>

              <button
                onClick={handleStartQuick}
                className="px-8 py-3.5 text-[11px] font-mono font-bold tracking-[0.25em] uppercase border border-[#70593a]/30 text-[#70593a] hover:bg-[#70593a]/5 hover:border-[#70593a] transition-all duration-300 rounded-full focus-visible:ring-2 focus-visible:ring-[#70593a] focus-visible:outline-none"
              >
                Take 3-Min Quiz
              </button>
            </div>
            <p className="text-xs text-[#5a5a5a] font-light pl-2">No payment required. Get your first design direction instantly.</p>
          </div>

          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-[#e8e4dd] px-5 py-2.5 rounded-full shadow-sm w-fit">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-[#354f40] border border-white flex items-center justify-center text-[7px] font-bold text-white">C</div>
              <div className="w-5 h-5 rounded-full bg-[#80643e] border border-white flex items-center justify-center text-[7px] font-bold text-white">A</div>
              <div className="w-5 h-5 rounded-full bg-[#354f40] border border-white flex items-center justify-center text-[7px] font-bold text-white">P</div>
            </div>
            <span className="text-[11px] font-mono tracking-wide text-[#3a3a3a] font-medium">
              <strong className="text-[#1a1a1a]"><CountUp to={quizCount} duration={2.5} separator="," />+</strong> homeowners discovered their style
            </span>
          </div>
        </div>

        {/* Right Panel (55%) */}
        <div className="w-[55%] flex flex-col h-screen overflow-y-auto px-10 xl:px-14 py-20 pb-32 hide-scrollbar">
          <UnifiedDashboard />
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="block lg:hidden relative z-10 pt-16">
        {/* Hero */}
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4">
            <ShinyText
              text="Aesthetic Discovery Engine"
              className="text-[9px] font-mono tracking-[0.35em] uppercase text-[#70593a] font-bold"
              color="#70593a"
              shineColor="#c9a96e"
              speed={4}
              spread={60}
            />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal leading-[1.12] mb-5 text-[#1a1a1a] tracking-tight max-w-xl">
            Most tools ask what you want. We decode how you{" "}
            <em className="not-italic text-[#70593a] font-serif font-medium">want to live.</em>
          </h1>
          <p className="text-sm text-[#4a4a4a] max-w-md leading-relaxed mb-8 font-light">
            Your home is not a design problem. It's a psychology question. Take a 3-minute discovery and receive your interior archetype, palette direction, material focus, and a practical design roadmap.
          </p>
          <div className="flex flex-col items-center gap-3 w-full max-w-xs mb-4">
            <button
              onClick={handleStartDeep}
              className="w-full group relative overflow-hidden px-8 py-3.5 bg-[#c9a96e] hover:bg-[#b5955a] text-black font-semibold text-[11px] font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Full Discovery
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
            </button>
            <button
              onClick={handleStartQuick}
              className="w-full px-8 py-3.5 text-[11px] font-mono font-bold tracking-[0.25em] uppercase border border-[#70593a]/30 text-[#70593a] hover:bg-[#70593a]/5 hover:border-[#70593a] transition-all duration-300 rounded-full"
            >
              Take 3-Min Quiz
            </button>
          </div>
          <p className="text-xs text-[#5a5a5a] font-light mb-8">No payment required. Get your first design direction instantly.</p>
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-[#e8e4dd] px-5 py-2.5 rounded-full shadow-sm">
            <span className="text-[11px] font-mono tracking-wide text-[#3a3a3a] font-medium">
              <strong className="text-[#1a1a1a]"><CountUp to={quizCount} duration={2.5} separator="," />+</strong> homeowners discovered their style
            </span>
          </div>
        </section>

        {/* Mobile Unified Dashboard */}
        <section className="px-6 py-12 border-t border-[#e8e4dd]/60 bg-[#faf8f5]">
          <UnifiedDashboard />
        </section>

        {/* Mobile Final CTA */}
        <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-6 overflow-hidden">
          <img
            src="/images/projects/discovery/visual-2.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 z-0 backdrop-blur-[3px]" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            <h2 className="text-3xl font-serif text-white font-light tracking-tight mb-4">
              Ready to find your style?
            </h2>
            <p className="text-sm text-zinc-300 italic font-light mb-8 max-w-sm">
              "No right answers. Be honest with yourself."
            </p>
            <button
              onClick={handleStartDeep}
              className="group relative overflow-hidden px-10 py-4 bg-[#c9a96e] hover:bg-[#b5955a] text-black font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Full Discovery
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
            </button>
          </div>
        </section>
      </div>

      {/* ── Intent Overlay ── */}
      <AnimatePresence>
        {showIntent && (
          <IntentOverlay lang={lang} onSelect={handleIntentSelect} onClose={() => setShowIntent(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
