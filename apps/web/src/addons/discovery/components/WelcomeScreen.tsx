import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { Lang } from "@/i18n/translations";
import { useRef, useState } from "react";
import { Home, Lamp, Leaf, BookOpen, Layers, Sun } from "lucide-react";

// MagicUI Components
import { Meteors } from "@/components/magicui/meteors";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { RetroGrid } from "@/components/magicui/retro-grid";

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
    className="flex items-center gap-2.5 px-4 py-2.5 border border-site-border bg-site-bg-card/50
      backdrop-blur-sm text-site-text-muted text-sm font-light tracking-wide hover:border-site-crimson/30
      hover:text-site-text transition-all duration-300"
  >
    <Icon size={14} className="text-site-crimson/60 shrink-0" />
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
      className="flex flex-col w-full overflow-x-hidden bg-site-bg text-site-text"
    >
      {/* ── Global Nav ───────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <a
          href="/"
          className="flex items-center justify-center w-9 h-9 border border-white/10 bg-white/[0.03]
            backdrop-blur-md text-white/50 hover:text-white hover:border-white/25 transition-all duration-300"
          aria-label="Return to Home"
        >
          <Home size={15} />
        </a>
        <div className="flex items-center border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden">
          {(["en", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => toggleLang(l)}
              className={`px-3.5 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-colors ${lang === l ? "bg-white text-[#0D0A08]" : "text-white/35 hover:text-white/60"
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
        <RetroGrid className="opacity-[0.15]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(212,168,83,0.06)_0%,transparent_70%)] pointer-events-none" />
        <Meteors number={14} />

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
              className="text-[11px] font-mono tracking-[0.35em] uppercase text-site-crimson/70"
            />
          </div>

          {/* Main title */}
          <h1 className="font-serif-display text-5xl md:text-7xl lg:text-8xl font-normal leading-none mb-8 text-white/95">
            {t("welcome_title")}
          </h1>

          {/* TypingAnimation subtitle */}
          <div className="mb-10 text-xl md:text-2xl text-white/40 font-light italic font-serif-display h-8">
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
          <div className="flex flex-col items-center gap-4">
            <ShimmerButton
              onClick={() => handleStart("deep")}
              background="rgba(255,255,255,0.06)"
              shimmerColor="rgba(227, 83, 54,0.6)"
              shimmerDuration="2.5s"
              borderRadius="0px"
              className="px-12 py-4 text-xs font-medium tracking-[0.25em] uppercase text-site-text/90 border-site-border"
            >
              Begin the Journey
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
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
          <span className="text-[9px] font-mono text-white/15 tracking-widest uppercase">Scroll</span>
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
          <h2 className="font-serif-display text-4xl md:text-5xl font-normal text-white/90 max-w-xl leading-tight">
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
          className="relative z-10 w-full max-w-3xl mx-auto flex items-center justify-between gap-6"
          style={{ minHeight: 320 }}
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
              gradientStartColor="#E35336"
              gradientStopColor="#E3C488"
            />
          ))}
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={centerRef as React.RefObject<HTMLElement>}
            toRef={outputRef as React.RefObject<HTMLElement>}
            delay={2}
            duration={2}
            gradientStartColor="#FDE68A"
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
            className="relative z-10 shrink-0 w-24 h-24 border border-site-crimson/30 bg-site-crimson/[0.04]
              flex flex-col items-center justify-center gap-1 shadow-[0_0_40px_rgba(227, 83, 54,0.08)]"
          >
            <span className="text-site-crimson/80 text-2xl font-serif-display">✦</span>
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-site-text-meta/30">You</span>
          </div>

          {/* Right: Output node */}
          <div
            ref={outputRef}
            className="relative z-10 shrink-0 flex flex-col items-center gap-2 px-6 py-5
              border border-site-border bg-site-bg-card/50"
          >
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-site-crimson/50 mb-1">Result</span>
            <span className="font-serif-display text-lg text-site-text-heading text-center leading-tight">Your Style<br />Profile</span>
          </div>
        </motion.div>

        {/* TextReveal quote */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative z-10 mt-20 text-center max-w-lg font-serif-display text-xl md:text-2xl
            text-white/35 italic font-light leading-relaxed"
        >
          "Every choice reveals something about how you live."
        </motion.p>
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
          <h2 className="font-serif-display text-4xl md:text-5xl font-normal text-white/90">
            {t("welcome_archetypes_title") || "What Style Might You Be?"}
          </h2>
        </motion.div>

        {/* Neon Gradient Cards — 4 archetypes */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px w-full max-w-5xl mb-16 border border-white/5">
          {archetypes.map((arch, i) => (
            <motion.div
              key={arch.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <NeonGradientCard
                neonColors={{ firstColor: arch.palette[0], secondColor: arch.palette[1] }}
                borderSize={1}
                borderRadius={0}
              >
                <div className="p-7 flex flex-col gap-3 min-h-[200px]">
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase opacity-40">
                    {arch.tag}
                  </span>
                  <h3 className="font-serif-display text-xl text-white/90 leading-snug">
                    {arch.name}
                  </h3>
                  <p className="text-sm text-white/35 leading-relaxed font-light">
                    {arch.desc}
                  </p>
                </div>
              </NeonGradientCard>
            </motion.div>
          ))}
        </div>

        {/* Decorative orb — represents spatial DNA concept */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 mb-14 flex flex-col items-center gap-3"
        >
          <div
            className="w-20 h-20 rounded-full border border-site-crimson/20 flex items-center justify-center
              shadow-[0_0_60px_rgba(227, 83, 54,0.08),inset_0_0_30px_rgba(227, 83, 54,0.04)]"
            style={{
              background: "radial-gradient(circle at 35% 35%, rgba(227, 83, 54,0.06) 0%, transparent 70%)",
            }}
          >
            <div className="w-10 h-10 rounded-full border border-site-crimson/15"
              style={{
                background: "radial-gradient(circle at 35% 35%, rgba(227, 83, 54,0.04) 0%, transparent 70%)",
              }}
            />
          </div>
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/15">
            Spatial DNA
          </span>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative z-10 flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Full Journey — primary shimmer */}
          <div className="group relative">
            <ShimmerButton
              onClick={() => handleStart("deep")}
              background="rgba(255,255,255,0.90)"
              shimmerColor="rgba(227, 83, 54,0.5)"
              shimmerDuration="2s"
              borderRadius="0px"
              className="px-10 py-4 text-xs font-medium tracking-[0.2em] uppercase text-site-bg"
            >
              Full Journey · 9 Steps
            </ShimmerButton>
          </div>

          {/* Quick Quiz — ghost style */}
          <button
            onClick={() => handleStart("quick")}
            className="px-10 py-4 text-xs font-medium tracking-[0.2em] uppercase
              border border-white/15 text-white/50 hover:border-white/30 hover:text-white/80
              transition-all duration-300"
          >
            Quick Quiz · 3 min
          </button>
        </motion.div>

        {/* Trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-8 text-[11px] text-white/20 tracking-widest"
        >
          {t("welcome_trust") || "Your data is never shared · No account required"}
        </motion.p>
      </section>
    </motion.div>
  );
};

export default WelcomeScreen;
