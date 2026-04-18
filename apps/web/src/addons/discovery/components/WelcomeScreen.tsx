import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { Lang } from "@/i18n/translations";
import { useRef, useState } from "react";
import { Home, Lamp, Leaf, BookOpen, Layers, Sun } from "lucide-react";

// MagicUI Components
import { Meteors } from "@/components/magicui/meteors";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import logoIcon from "@/assets/logo-icon.png";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { Image } from "@/components/ui/enhanced/image";

import type { DiscoveryConfig } from "./DiscoveryEngine";

interface WelcomeScreenProps {
  onStart: (mode: "quick" | "deep") => void;
  config?: DiscoveryConfig;
}

// ── Section 2 nodes ───────────────────────────────────────────────
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
    className="flex items-center gap-3 px-6 py-3 border border-white/10 bg-black/40
      backdrop-blur-sm text-white text-sm font-light tracking-wide hover:border-[#c9a96e]/50
      hover:text-[#c9a96e] transition-all duration-300 rounded-md"
  >
    <Icon size={16} className="text-[#c9a96e] shrink-0" />
    {label}
  </div>
);

// ── Archetype card data ───────────────────────────────────────────
const archetypes = [
  {
    name: "The Quiet Curator",
    desc: "Restrained, precise. Every object earns its place.",
    palette: ["#d4a853", "#8b5e1a"],
    tag: "MINIMALIST",
  },
  {
    name: "The Warm Modernist",
    desc: "Clean lines softened by organic warmth and texture.",
    palette: ["#c4855a", "#7a3f1e"],
    tag: "CONTEMPORARY",
  },
  {
    name: "The Social Minimalist",
    desc: "Open, inviting. Spaces built for shared moments.",
    palette: ["#a07a9a", "#5a3563"],
    tag: "SOCIAL",
  },
  {
    name: "The Expressive Collector",
    desc: "Layered, eclectic. Story in every corner.",
    palette: ["#6a9a7a", "#2d5a3d"],
    tag: "ECLECTIC",
  },
];

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const { lang, setLang, t } = useLanguage();
  const [confettiActive, setConfettiActive] = useState(false);

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
    { ref: node1, icon: Sun, label: "Daily Habits" },
    { ref: node2, icon: Layers, label: "Image Picks" },
    { ref: node3, icon: Leaf, label: "Material Sense" },
    { ref: node4, icon: Lamp, label: "Light Calibration" },
    { ref: node5, icon: BookOpen, label: "Word Mapping" },
  ];

  const toggleLang = (l: Lang) => setLang(l);

  const handleStart = (mode: "quick" | "deep") => {
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
      onStart(mode);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full min-h-screen overflow-x-hidden bg-background text-foreground"
    >
      {/* ── Global Nav ───────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <a
          href="/"
          className="flex items-center gap-3 border border-white/10 bg-black/20
            backdrop-blur-md px-4 py-2 text-[#c9a96e] hover:text-[#c9a96e]/80 hover:border-[#c9a96e]/30 transition-all duration-300 rounded-full"
          aria-label="Return to Home"
        >
          <img src={logoIcon} alt="CrossAngle Logo" className="h-5 w-auto" />
          <span className="text-[11px] font-mono tracking-widest uppercase">Home</span>
        </a>
        <div className="flex items-center border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden rounded-full">
          {(["en", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => toggleLang(l)}
              className={`px-3.5 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-colors ${lang === l ? "bg-white text-black" : "text-[#c9a96e]/50 hover:text-[#c9a96e]"
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — HERO (full viewport)
          ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Backgrounds */}
        <RetroGrid className="opacity-[0.1]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(201,169,110,0.08)_0%,transparent_70%)] pointer-events-none" />
        <Meteors number={12} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center max-w-3xl"
        >
          {/* Eyebrow with sparkles */}
          <div className="mb-6">
            <SparklesText
              text={t("welcome_subtitle") || "DESIGN DISCOVERY"}
              className="text-[11px] font-mono tracking-[0.35em] uppercase text-[#c9a96e]"
            />
          </div>

          {/* Main title */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal leading-tight mb-8 text-white max-w-4xl tracking-tight">
            {t("welcome_title")}
          </h1>

          {/* TypingAnimation subtitle */}
          <div className="mb-10 text-xl md:text-2xl text-[#c9a96e] font-light italic font-serif h-8">
            <TypingAnimation
              texts={[
                "Calm. Minimal. Warm.",
                "Bold. Layered. Eclectic.",
                "Quiet. Textured. Timeless.",
                "Open. Curated. Alive.",
              ]}
              typingSpeed={55}
              deletingSpeed={30}
              pauseDuration={2200}
            />
          </div>

          {/* CTA block */}
          <div className="flex flex-col items-center gap-5 mt-4">
            <ShimmerButton 
              className="shadow-2xl hover:bg-[#b8944f] transition-colors border border-transparent hover:border-[#c9a96e]/30" 
              background="#c9a96e" 
              shimmerColor="#ffffff"
              onClick={() => handleStart("deep")}
            >
              <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-[#0d0e10] lg:text-lg">
                Begin the Journey
              </span>
            </ShimmerButton>
            <button
              onClick={() => handleStart("quick")}
              className="text-[11px] font-mono tracking-widest text-white/25 hover:text-white/50 transition-colors uppercase"
            >
              {t("welcome_quick") || "Quick Version"} · 3 min
            </button>
            <p className="text-[10px] text-white/20 tracking-wide mt-1">
              3 minutes · No wrong answers
            </p>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-[#c9a96e]/50 to-transparent animate-pulse" />
          <span className="text-[9px] font-mono text-[#c9a96e]/50 tracking-widest uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — HOW IT WORKS (AnimatedBeam diagram)
          ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-site-bg via-transparent to-site-bg pointer-events-none" />

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mb-16 text-center"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 block mb-4">
            What shapes your style
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-white max-w-xl leading-tight mx-auto">
            Five inputs. One precise profile.
          </h2>
        </motion.div>

        {/* AnimatedBeam diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          ref={containerRef as React.RefObject<HTMLDivElement>}
          className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12"
          style={{ minHeight: 420 }}
        >
          {/* SVG Beams */}
          {[node1, node2, node3, node4, node5].map((ref, i) => (
            <AnimatedBeam
              key={i}
              containerRef={containerRef as React.RefObject<HTMLElement>}
              fromRef={ref as React.RefObject<HTMLElement>}
              toRef={centerRef as React.RefObject<HTMLElement>}
              curvature={-30 + i * 15}
              delay={i * 0.4}
              duration={2.5 + i * 0.3}
              gradientStartColor="#c9a96e"
              gradientStopColor="#FFFFFF"
            />
          ))}
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={centerRef as React.RefObject<HTMLElement>}
            toRef={outputRef as React.RefObject<HTMLElement>}
            delay={2}
            duration={2}
            gradientStartColor="#c9a96e"
            gradientStopColor="#FFFFFF"
          />

          {/* Left: Input nodes */}
          <div className="flex flex-col gap-3 shrink-0 z-10">
            {inputNodes.map(({ ref, icon, label }) => (
              <InputNode key={label} nodeRef={ref} icon={icon} label={label} />
            ))}
          </div>

          {/* Center: YOU node */}
          <div
            ref={centerRef}
            className="relative z-10 shrink-0 w-24 h-24 border border-[#c9a96e]/30 bg-[#c9a96e]/5 rounded-full
              flex flex-col items-center justify-center gap-1 shadow-[0_0_40px_rgba(201,169,110,0.1)]"
          >
            <span className="text-[#c9a96e] text-2xl font-serif">✦</span>
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/40">You</span>
          </div>

          {/* Right: Output node */}
          <div
            ref={outputRef}
            className="relative z-10 shrink-0 flex flex-col items-center gap-2 px-6 py-5
              border border-[#c9a96e] bg-black/40 backdrop-blur-md shadow-[0_0_20px_rgba(201,169,110,0.2)] rounded-lg"
          >
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#c9a96e] mb-1">Result</span>
            <span className="font-serif text-lg text-white text-center leading-tight">Your Style<br />Profile</span>
          </div>
        </motion.div>

      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2.5 — QUOTE
          ════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center px-6 py-20 md:py-32 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative z-10 text-center max-w-2xl"
        >
          <span className="absolute -top-16 -left-12 text-9xl text-[#c9a96e] opacity-20 font-serif leading-none select-none">"</span>
          <p className="relative z-10 font-serif text-2xl md:text-3xl text-zinc-300 italic font-light leading-relaxed px-4">
            Every choice reveals something about how you live.
          </p>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — RESULTS PREVIEW + CTA
          ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        {/* Warp/gradient background */}
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,168,83,0.04) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_-10%,rgba(255,255,255,0.02)_0%,transparent_60%)] pointer-events-none" />

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mb-14 text-center"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 block mb-4">
            Your possible results
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-white max-w-2xl mx-auto">
            {t("welcome_archetypes_title") || "What Style Might You Be?"}
          </h2>
        </motion.div>

        {/* Cards — 4 archetypes */}
        <div className="w-12 h-px bg-[#c9a96e] mx-auto mb-10" />
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-16">
          {archetypes.map((arch, i) => (
            <motion.div
              key={arch.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 flex flex-col gap-3 min-h-[220px] bg-zinc-900 border border-zinc-700 hover:border-[#c9a96e] hover:bg-zinc-800 transition-all duration-300 rounded-lg cursor-default group shadow-lg"
            >
              <span className="text-xs font-mono tracking-widest uppercase text-[#c9a96e]">
                {arch.tag}
              </span>
              <h3 className="font-serif text-2xl text-white leading-snug font-light">
                {arch.name}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {arch.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 4 — IMAGE CTA
          ════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[400px] flex justify-center items-center py-20 px-6 overflow-hidden">
        <Image
          src="/images/projects/discovery/visual-2.jpg" 
          alt="Interior" 
          className="absolute inset-0 h-full w-full"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-black/70 z-0" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-serif text-white font-light tracking-tight mb-3">
            Ready to find your style?
          </h2>
          <p className="text-sm text-zinc-300 italic font-light mb-10">
            "No right answers. Be honest with yourself."
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <ShimmerButton 
              className="shadow-2xl hover:bg-[#b8944f] transition-colors border border-transparent hover:border-[#c9a96e]/30 w-full sm:w-auto" 
              background="#c9a96e" 
              shimmerColor="#ffffff"
              onClick={() => handleStart("deep")}
            >
              <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-[#0d0e10] lg:text-lg">
                Full Journey · 9 Steps
              </span>
            </ShimmerButton>
            
            <button
              onClick={() => handleStart("quick")}
              className="px-10 py-4 text-xs font-medium tracking-[0.2em] uppercase
                border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e]/10
                transition-all duration-300 w-full sm:w-auto mt-2 sm:mt-0"
            >
              Quick Quiz · 3 min
            </button>
          </div>
          
          <p className="mt-12 text-[11px] text-white/50 tracking-widest uppercase pb-6">
            {t("welcome_trust") || "Your data is never shared · No account required"}
          </p>
        </div>
      </section>
    </motion.div>
  );
};

export default WelcomeScreen;
