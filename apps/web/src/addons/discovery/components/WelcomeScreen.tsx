import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Brain, Home, Sparkles, Target, BarChart3, Users, ChevronLeft,
  Sun, Layers, Leaf, Lamp, BookOpen
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import logoIcon from "@/assets/logo-icon.png";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";
import SoftAurora from "@/components/ReactBits/SoftAurora";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import ShimmerButton from "@/components/magicui/shimmer-button";

import type { DiscoveryConfig } from "./DiscoveryEngine";

interface WelcomeScreenProps {
  onStart: (mode: "quick" | "deep", intent?: string) => void;
  config?: DiscoveryConfig;
}

const OUTPUTS = [
  {
    icon: Brain,
    label: "Living Identity",
    desc: "Your emotional archetype, sensory needs, and lifestyle themes — decoded from how you actually live.",
    color: "from-[#8b6f47]/5 to-[#8b6f47]/2",
    border: "border-[#8b6f47]/10",
    iconColor: "text-[#80643e]",
  },
  {
    icon: Home,
    label: "Space Priorities",
    desc: "Which rooms and experiences matter most, where you can flex, and where compromise would hurt.",
    color: "from-[#354f40]/5 to-[#354f40]/2",
    border: "border-[#354f40]/10",
    iconColor: "text-[#354f40]",
  },
  {
    icon: Target,
    label: "Reality Alignment",
    desc: "How your aspirations map to your property, budget, and family structure — with honest guidance.",
    color: "from-emerald-500/5 to-emerald-500/2",
    border: "border-emerald-200/20",
    iconColor: "text-emerald-700",
  },
  {
    icon: BarChart3,
    label: "Investment Range",
    desc: "Calibrated cost estimates tied to your lifestyle goals — not generic square-foot calculators.",
    color: "from-[#80643e]/5 to-[#80643e]/2",
    border: "border-[#80643e]/10",
    iconColor: "text-[#80643e]",
  },
  {
    icon: Users,
    label: "Clarity Blueprint",
    desc: "A professional design brief ready to hand off to any architect or designer to save months of miscommunication.",
    color: "from-blue-500/5 to-blue-500/2",
    border: "border-blue-200/20",
    iconColor: "text-blue-700",
  }
];

const INTENT_OPTIONS = [
  {
    id: "drain",
    label: "My current space drains my energy, and I need a home that restores it.",
    short: "Energy Restorative",
  },
  {
    id: "invisible",
    label: "I want my home to feel 'invisible' — a silent, perfect backdrop to my life.",
    short: "Quiet Minimalism",
  },
  {
    id: "chaos",
    label: "I feel overwhelmed by choice chaos and need clarity on my true style.",
    short: "Visual Clarity",
  },
  {
    id: "pride",
    label: "I want my home to reflect who I have become and my milestones.",
    short: "Self Expression",
  },
  {
    id: "connection",
    label: "My space should be a hub for shared moments, warmth, and connection.",
    short: "Shared Warmth",
  },
  {
    id: "becoming",
    label: "I want a home that acts as a catalyst for who I am becoming.",
    short: "Identity Catalyst",
  }
];

const archetypes = [
  {
    name: "The Quiet Curator",
    desc: "Restrained, precise. Every object earns its place.",
    palette: ["#8b6f47", "#5a705e"], // Bronze / Sage
    tag: "MINIMALIST",
  },
  {
    name: "The Warm Modernist",
    desc: "Clean lines softened by organic warmth and texture.",
    palette: ["#c4855a", "#7a3f1e"], // Terracotta / Ochre
    tag: "CONTEMPORARY",
  },
  {
    name: "The Social Minimalist",
    desc: "Open, inviting. Spaces built for shared moments.",
    palette: ["#a07a9a", "#5a3563"], // Indigo / Mauve
    tag: "SOCIAL",
  },
  {
    name: "The Expressive Collector",
    desc: "Layered, eclectic. Story in every corner.",
    palette: ["#6a9a7a", "#2d5a3d"], // Moss / Emerald
    tag: "ECLECTIC",
  },
];

const InputNode = ({
  nodeRef,
  icon: Icon,
  label,
}: {
  nodeRef: React.RefObject<HTMLDivElement>;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
}) => (
  <div
    ref={nodeRef}
    className="flex items-center gap-2.5 px-4 py-2.5 border border-[#e8e4dd] bg-white/70
      backdrop-blur-sm text-[#3a3a3a] text-xs md:text-sm font-semibold tracking-wide hover:border-[#70593a]/30
      hover:text-[#1a1a1a] transition-all duration-300 rounded-xl shadow-sm"
  >
    <Icon size={14} className="text-[#70593a]/75 shrink-0" />
    {label}
  </div>
);

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const { lang, setLang, t } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  // AnimatedBeam refs
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const node1 = useRef<HTMLDivElement>(null);
  const node2 = useRef<HTMLDivElement>(null);
  const node3 = useRef<HTMLDivElement>(null);
  const node4 = useRef<HTMLDivElement>(null);
  const node5 = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const inputNodes = [
    { ref: node1, icon: Sun, label: lang === "hi" ? "Daily Habits" : "Daily Habits" },
    { ref: node2, icon: Layers, label: lang === "hi" ? "Image Picks" : "Image Picks" },
    { ref: node3, icon: Leaf, label: lang === "hi" ? "Material Sense" : "Material Sense" },
    { ref: node4, icon: Lamp, label: lang === "hi" ? "Light Calibration" : "Light Calibration" },
    { ref: node5, icon: BookOpen, label: lang === "hi" ? "Word Mapping" : "Word Mapping" },
  ];

  const handleStartQuiz = (mode: "quick" | "deep", intent?: string) => {
    onStart(mode, intent);
  };

  const handleSelectIntent = (intentId: string) => {
    setSelectedIntent(intentId);
    setStep(2);
  };

  // Mocked homeowner discoveries count
  const quizCount = 1420;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col w-full min-h-screen overflow-x-hidden bg-[#faf8f5] text-[#1a1a1a] selection:bg-[#c9a96e]/20"
    >
      {/* ── SoftAurora Living Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <SoftAurora
          speed={0.12}
          scale={1.3}
          brightness={1.1}
          color1="#c8a96e" // Gold
          color2="#5a705e" // Sage green
          color3="#faf8f5" // Cream base
          enableMouseInteraction={true}
          className="absolute inset-0 w-full h-full opacity-[0.25]"
        />
        {/* Subtle procedural paper noise overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* ── Fixed Global Top Navigation Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 pointer-events-none">
        <div className="pointer-events-auto">
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-3 z-10 shrink-0 group min-w-0 hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
            aria-label="Return to CrossAngle Home"
          >
            <img
              src={logoIcon}
              alt="Cross Angle Interior"
              className="h-11 md:h-16 w-auto transition-all duration-500 shrink-0"
            />
            <AnimatedLogo
              isScrolled={false}
              className="flex gap-1 sm:gap-1.5 font-bold tracking-tight whitespace-nowrap min-w-0 [&_span]:text-[#1a1a1a]"
            />
          </a>
        </div>

        {/* Back and Language Controls */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#e8e4dd] bg-white/70 backdrop-blur-md text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#80643e] transition-all duration-300 rounded-full text-xs font-mono uppercase tracking-widest"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center border border-[#e8e4dd] bg-white/70 backdrop-blur-md overflow-hidden rounded-full shadow-sm">
            {(["en", "hi"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                {...(lang === l ? { "aria-pressed": "true" } : { "aria-pressed": "false" })}
                aria-label={l === "en" ? "Switch to English" : "Switch to Hinglish"}
                className={`px-4 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${
                  lang === l
                    ? "bg-[#c9a96e] text-black font-semibold shadow-sm"
                    : "text-[#5a5a5a] hover:text-[#1a1a1a] hover:bg-[#c9a96e]/10"
                }`}
              >
                {l === "en" ? "EN" : "HINGLISH"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Interactive Canvas Wrapper ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-12 min-h-screen">
        <AnimatePresence mode="wait">
          {/* STEP 0: Hero Entry Section */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center max-w-5xl w-full"
            >
              {/* Eyebrow Label */}
              <div className="mb-4">
                <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#70593a] bg-[#70593a]/10 px-4 py-1.5 rounded-full font-bold shadow-sm">
                  {lang === "hi" ? "Aesthetic Discovery Engine" : "Aesthetic Discovery Engine"}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.12] mb-6 text-[#1a1a1a] max-w-3xl tracking-tight">
                {lang === "hi" ? (
                  <>
                    Zyadatar tools poochte hain kya chahiye. <br />
                    Hum decode karte hain aap kaise{' '}
                    <em className="not-italic text-[#70593a] font-serif font-medium">jeena chahte hain.</em>
                  </>
                ) : (
                  <>
                    Most tools ask what you want. <br />
                    We decode how you{' '}
                    <em className="not-italic text-[#70593a] font-serif font-medium">want to live.</em>
                  </>
                )}
              </h1>

              {/* Psychology Subtitle Statement */}
              <p className="text-lg md:text-xl text-[#3a3a3a] max-w-2xl leading-relaxed mb-4 font-light">
                {lang === "hi" ? (
                  <>Aapka ghar ek design problem nahi hai. Yeh ek <strong className="text-[#1a1a1a] font-semibold">psychology ka sawal</strong> hai.</>
                ) : (
                  <>Your home is not a design problem. It's a <strong className="text-[#1a1a1a] font-semibold">psychology question</strong>.</>
                )}
              </p>

              <p className="text-sm md:text-base text-[#5a5a5a] max-w-2xl leading-relaxed mb-6 font-light">
                {lang === "hi" ? (
                  "Hum aapke emotional needs, lifestyle patterns aur space reality ko map karte hain — fir use cost estimation aur space layout blueprint me badalte hain."
                ) : (
                  "We map your emotional needs, lifestyle patterns, and spatial reality — then translate that into a feasibility analysis and investment blueprint."
                )}
              </p>

              {/* Aesthetic Micro-indicators */}
              <div className="text-xs md:text-sm font-mono tracking-[0.25em] text-[#70593a] mb-10 flex items-center justify-center gap-2 font-bold uppercase">
                <span>Open.</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#70593a]/30" />
                <span>Curated.</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#70593a]/30" />
                <span>Alive.</span>
                <span className="w-1 h-3.5 bg-[#70593a] animate-pulse rounded-full" />
              </div>

              {/* Premium Dual CTA Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md mb-16 z-20">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="relative group overflow-hidden w-full sm:w-auto px-10 py-4 bg-[#c9a96e] hover:bg-[#b5955a] text-black font-semibold text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {lang === "hi" ? "Apna Style Discover Karein" : "Discover My Style"}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStartQuiz("quick")}
                  className="w-full sm:w-auto px-10 py-4 text-xs font-mono font-bold tracking-[0.25em] uppercase border border-[#70593a] text-[#70593a] hover:bg-[#70593a]/5 transition-all duration-300 rounded-full focus-visible:ring-2 focus-visible:ring-[#70593a] focus-visible:outline-none"
                >
                  {lang === "hi" ? "Quick Quiz · 3 Min" : "Quick Quiz · 3 Min"}
                </button>
              </div>

              {/* Tally / Social Proof */}
              <div className="mb-14 flex items-center justify-center gap-3 bg-white/50 backdrop-blur-sm border border-[#e8e4dd] px-6 py-2.5 rounded-full shadow-sm">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-[#354f40] border border-white flex items-center justify-center text-[7px] font-bold text-white">C</div>
                  <div className="w-5 h-5 rounded-full bg-[#80643e] border border-white flex items-center justify-center text-[7px] font-bold text-white">A</div>
                  <div className="w-5 h-5 rounded-full bg-[#354f40] border border-white flex items-center justify-center text-[7px] font-bold text-white">P</div>
                </div>
                <span className="text-[11px] font-mono tracking-wide text-[#3a3a3a] font-medium">
                  <strong className="text-[#1a1a1a]">{quizCount.toLocaleString()}+</strong>{" "}
                  {lang === "hi" ? "homeowners ne discovery complete ki" : "homeowners completed aesthetic discovery"}
                </span>
              </div>

              {/* ── Section 2: Single Row Stats Boxes (Readability Optimized) ── */}
              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {[
                    {
                      stat: "73%",
                      label: lang === "hi"
                        ? "log naye ghar me shift hone ke baad design mistakes ko regret karte hain."
                        : "of homeowners regret design decisions after moving in."
                    },
                    {
                      stat: "₹2.4L",
                      label: lang === "hi"
                        ? "ki average cost aati hai move-in hone ke baad design mistakes ko theek karne me."
                        : "average cost of correcting spatial misalignments post-occupancy."
                    },
                    {
                      stat: "7 min",
                      label: lang === "hi"
                        ? "ki quiet discovery aapko mahino ki space design confusion se bacha sakti hai."
                        : "of quiet introspection prevents months of expensive revision cycles."
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-6 md:p-8 bg-white border border-[#e8e4dd]/80 rounded-2xl shadow-sm hover:shadow-md hover:border-[#70593a]/30 transition-all duration-300 text-left group flex flex-col justify-between"
                    >
                      <h3 className="text-4xl md:text-5xl font-serif italic text-[#70593a] mb-3 group-hover:scale-105 origin-left transition-transform duration-300">
                        {item.stat}
                      </h3>
                      <p className="text-xs md:text-sm text-[#3a3a3a] leading-relaxed font-semibold">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section 2: AnimatedBeam How It Works ── */}
              <div className="w-full max-w-5xl mt-24 flex flex-col items-center justify-center py-16 relative overflow-hidden rounded-3xl bg-[#faf8f5]/40 border border-[#e8e4dd]/60">
                {/* Dot pattern background */}
                <div 
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(112,89,58,0.3) 1.5px, transparent 1.5px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Section Header */}
                <div className="relative z-10 mb-14 text-center px-4">
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#70593a] block mb-3 font-bold">
                    {lang === "hi" ? "WHAT SHAPES YOUR STYLE" : "WHAT SHAPES YOUR STYLE"}
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#1a1a1a] max-w-xl leading-tight">
                    {lang === "hi" ? "Five inputs. One precise profile." : "Five inputs. One precise profile."}
                  </h2>
                </div>

                {/* AnimatedBeam Diagram Container */}
                <div
                  ref={containerRef}
                  className="relative z-10 w-full max-w-4xl mx-auto flex flex-row items-center justify-between gap-4 md:gap-12 px-6"
                  style={{ minHeight: 360 }}
                >
                  {/* SVG Beams */}
                  {[node1, node2, node3, node4, node5].map((ref, i) => (
                    <AnimatedBeam
                      key={i}
                      containerRef={containerRef}
                      fromRef={ref}
                      toRef={centerRef}
                      curvature={-40 + i * 20}
                      delay={i * 0.4}
                      duration={2.5 + i * 0.3}
                      gradientStartColor="#70593a"
                      gradientStopColor="#c9a96e"
                    />
                  ))}
                  <AnimatedBeam
                    containerRef={containerRef}
                    fromRef={centerRef}
                    toRef={outputRef}
                    delay={2}
                    duration={2}
                    gradientStartColor="#c9a96e"
                    gradientStopColor="#70593a"
                  />

                  {/* Left: Input Nodes */}
                  <div className="flex flex-col gap-3.5 shrink-0 z-10">
                    {inputNodes.map(({ ref, icon, label }) => (
                      <InputNode key={label} nodeRef={ref} icon={icon} label={label} />
                    ))}
                  </div>

                  {/* Center: YOU Node */}
                  <div
                    ref={centerRef}
                    className="relative z-10 shrink-0 w-20 h-20 md:w-24 md:h-24 border border-[#70593a]/30 bg-[#70593a]/5 rounded-full
                      flex flex-col items-center justify-center gap-1 shadow-[0_0_40px_rgba(112,89,58,0.06)]"
                  >
                    <span className="text-[#70593a] text-2xl font-serif">✦</span>
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#70593a]/60">You</span>
                  </div>

                  {/* Right: Output Node */}
                  <div
                    ref={outputRef}
                    className="relative z-10 shrink-0 flex flex-col items-center gap-2 px-4 py-4 md:px-6 md:py-5
                      border border-[#70593a]/20 bg-white/90 backdrop-blur-md shadow-sm rounded-2xl"
                  >
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#70593a] mb-1">Result</span>
                    <span className="font-serif text-sm md:text-base text-[#1a1a1a] text-center leading-tight">Your Style<br />Profile</span>
                  </div>
                </div>

                {/* Section 2.5: Literary Quote */}
                <p className="relative z-10 mt-12 text-center max-w-lg font-serif text-lg md:text-xl text-[#3a3a3a] italic font-light leading-relaxed px-6">
                  {lang === "hi" ? "\"Har choice batati hai aap kaise jeete hain.\"" : "\"Every choice reveals something about how you live.\""}
                </p>
              </div>

              {/* ── Section 3: Possible Results / Archetypes ── */}
              <div className="w-full max-w-5xl mt-24">
                {/* Section Header */}
                <div className="relative z-10 mb-12 text-center px-4">
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#70593a] block mb-3 font-bold">
                    {lang === "hi" ? "YOUR POSSIBLE RESULTS" : "YOUR POSSIBLE RESULTS"}
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#1a1a1a]">
                    {lang === "hi" ? "What Style Might You Be?" : "What Style Might You Be?"}
                  </h2>
                </div>

                {/* Archetype Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
                  {archetypes.map((arch) => (
                    <div
                      key={arch.name}
                      className="relative bg-white border border-[#e8e4dd] p-7 rounded-2xl flex flex-col justify-between min-h-[220px] transition-all duration-500 shadow-sm hover:shadow-lg hover:border-[#70593a]/30 group overflow-hidden"
                    >
                      {/* Sub-hover ambient pastel glow */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${arch.palette[0]}, ${arch.palette[1]})`
                        }}
                      />
                      {/* Top thin line archetype identity gradient */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 opacity-60 group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(90deg, ${arch.palette[0]}, ${arch.palette[1]})`
                        }}
                      />

                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#70593a]/70 font-bold">
                          {arch.tag}
                        </span>
                        <h3 className="font-serif text-xl text-[#1a1a1a] leading-snug group-hover:translate-x-0.5 transition-transform duration-300">
                          {arch.name}
                        </h3>
                        <p className="text-xs md:text-sm text-[#5a5a5a] leading-relaxed font-light">
                          {arch.desc}
                        </p>
                      </div>

                      {/* Micro interaction bullet on hover */}
                      <div className="mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[10px] font-mono uppercase tracking-widest text-[#70593a] font-bold">
                        <span>Details</span>
                        <ArrowRight size={10} className="translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Spatial DNA concept graphic */}
                <div className="mt-14 flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full border border-[#70593a]/25 flex items-center justify-center
                      shadow-[0_0_60px_rgba(112,89,58,0.06),inset_0_0_30px_rgba(112,89,58,0.03)]"
                    style={{
                      background: "radial-gradient(circle at 35% 35%, rgba(112,89,58,0.04) 0%, transparent 70%)",
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border border-[#70593a]/15"
                      style={{
                        background: "radial-gradient(circle at 35% 35%, rgba(112,89,58,0.02) 0%, transparent 70%)",
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#70593a]/50 font-bold">
                    Spatial DNA
                  </span>
                </div>
              </div>

              {/* ── Section 4: Visual CTA with Background Image ── */}
              <section className="relative w-full min-h-[50vh] flex justify-center items-center py-24 px-6 overflow-hidden rounded-3xl mt-24 max-w-5xl mx-auto shadow-lg">
                {/* Background Image */}
                <img
                  src="/images/projects/discovery/visual-2.webp" 
                  alt="Premium Curated Interior" 
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 z-0 backdrop-blur-[2px]" />

                <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4">
                  <h2 className="text-3xl md:text-5xl font-serif text-white font-light tracking-tight mb-4">
                    {lang === "hi" ? "Ready to find your style?" : "Ready to find your style?"}
                  </h2>
                  <p className="text-sm md:text-base text-zinc-300 italic font-light mb-10 max-w-md leading-relaxed">
                    {lang === "hi" ? "\"Koi sahi ya galat jawab nahi hai. Apne sath sachhein rahein.\"" : "\"No right answers. Be honest with yourself.\""}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                    {/* Shimmer Button for Full Journey */}
                    <ShimmerButton 
                      className="shadow-2xl hover:bg-[#b5955a] transition-colors border border-transparent hover:border-[#c9a96e]/30 w-full sm:w-auto px-10 py-4 text-xs font-mono uppercase tracking-[0.2em]" 
                      background="#c9a96e" 
                      shimmerColor="#ffffff"
                      onClick={() => handleStartQuiz("deep")}
                    >
                      <span className="text-center text-xs leading-none font-semibold whitespace-pre-wrap text-black">
                        {lang === "hi" ? "Full Journey · 9 Steps" : "Full Journey · 9 Steps"}
                      </span>
                    </ShimmerButton>
                    
                    {/* Ghost Button for Quick Version */}
                    <button
                      type="button"
                      onClick={() => handleStartQuiz("quick")}
                      className="w-full sm:w-auto px-10 py-4 text-xs font-mono font-bold tracking-[0.25em] uppercase border border-white/40 text-white hover:bg-white/10 hover:border-white transition-all duration-300 rounded-full focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      {lang === "hi" ? "Quick Quiz · 3 Min" : "Quick Quiz · 3 Min"}
                    </button>
                  </div>
                  
                  <p className="mt-12 text-[10px] md:text-[11px] text-white/50 tracking-[0.2em] uppercase">
                    {lang === "hi" ? "Aapka data kabhi share nahi hota · No account required" : "Your data is never shared · No account required"}
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {/* STEP 1: Intent Selection Section (Focused Immersive Overlay) */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 overflow-y-auto pt-28 pb-12 px-6 flex flex-col items-center justify-center bg-[#faf8f5]/90 backdrop-blur-md w-full"
            >
              {/* Inner Content Wrapper */}
              <div className="flex flex-col items-center text-center max-w-4xl w-full mx-auto">
                <div className="mb-4">
                  <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#70593a] bg-[#70593a]/10 px-4 py-1.5 rounded-full font-bold shadow-sm">
                    {lang === "hi" ? "STAGE 01 — INTENT" : "STAGE 01 — INTENT"}
                  </span>
                </div>

                <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight mb-4 text-[#1a1a1a] max-w-2xl tracking-tight">
                  {lang === "hi" ? "Aapke naye space ka primary driving force kya hai?" : "What is the primary driving force behind your new space?"}
                </h2>

                <p className="text-sm md:text-base text-[#5a5a5a] max-w-lg mb-10 leading-relaxed font-light">
                  {lang === "hi" ? "Woh chunein jo aapke emotional state aur spatial aspirations se sabse zyada match karta hai." : "Select the sentiment that best encapsulates your core emotional state and spatial aspirations."}
                </p>

                {/* Grid of 6 Intents */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl mb-8">
                  {INTENT_OPTIONS.map((intent) => (
                    <button
                      key={intent.id}
                      type="button"
                      onClick={() => handleSelectIntent(intent.id)}
                      className="p-6 md:p-8 bg-white border border-[#e8e4dd] hover:border-[#70593a] text-left hover:scale-[1.03] transition-all duration-300 hover:shadow-md group flex flex-col gap-4 text-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none rounded-2xl"
                    >
                      <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#70593a] font-bold group-hover:translate-x-1 transition-transform">
                        {intent.short}
                      </span>
                      <p className="text-base text-[#2a2a2a] group-hover:text-[#1a1a1a] leading-relaxed font-serif font-semibold">
                        "{intent.label}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Value Output Preview Section (Focused Immersive Overlay) */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 overflow-y-auto pt-28 pb-12 px-6 flex flex-col items-center justify-center bg-[#faf8f5]/90 backdrop-blur-md w-full"
            >
              {/* Inner Content Wrapper */}
              <div className="flex flex-col items-center text-center max-w-5xl w-full mx-auto">
                <div className="mb-4">
                  <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#70593a] bg-[#70593a]/10 px-4 py-1.5 rounded-full font-bold shadow-sm">
                    {lang === "hi" ? "STAGE 02 — THE BLUEPRINT" : "STAGE 02 — THE BLUEPRINT"}
                  </span>
                </div>

                <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight mb-4 text-[#1a1a1a] max-w-3xl tracking-tight">
                  {lang === "hi" ? "Hum aapke liye kya decode karenge" : "What we will decode for you"}
                </h2>

                <p className="text-sm md:text-base text-[#5a5a5a] max-w-2xl mb-10 leading-relaxed font-light">
                  {lang === "hi" ? "Aapka customized Aesthetic DNA report koi simple design recommendations nahi hai. Yeh ek complete spatial aur investment guide hai." : "Your customized Aesthetic DNA blueprint is a comprehensive psychological and investment compilation."}
                </p>

                {/* 5 Outputs Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-10 text-left">
                  {OUTPUTS.map((out, idx) => {
                    const Icon = out.icon;
                    return (
                      <div
                        key={idx}
                        className="p-6 border border-[#e8e4dd] bg-white hover:border-[#70593a]/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 bg-[#faf8f5] border border-[#e8e4dd] rounded-xl ${out.iconColor}`}>
                            <Icon size={18} />
                          </div>
                          <h4 className="font-serif text-lg font-medium text-[#1a1a1a]">
                            {out.label}
                          </h4>
                        </div>
                        <p className="text-xs md:text-sm text-[#5a5a5a] leading-relaxed font-light">
                          {out.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Primary Call-to-action button */}
                <button
                  type="button"
                  onClick={() => handleStartQuiz("deep", selectedIntent || undefined)}
                  className="relative group overflow-hidden w-full sm:w-auto px-12 py-5 bg-[#c9a96e] hover:bg-[#b5955a] text-black font-semibold text-xs font-mono uppercase tracking-[0.25em] transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {lang === "hi" ? "Discover My Style Shuru Karein" : "Discover My Style"}
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default WelcomeScreen;

