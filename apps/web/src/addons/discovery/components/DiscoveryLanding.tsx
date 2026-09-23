import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Layers, Fingerprint, Palette, BarChart3, Compass, X, BatteryCharging, Circle, Eye, Sparkles, Users, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import CountUp from "@/components/ReactBits/CountUp";
import { ECOSYSTEM_COPY, ECOSYSTEM_ROUTES } from "@/addons/_shared/ecosystemCopy";
import {
  WorkspaceShell, wsEyebrow, wsRule, wsDisplay, wsBody, wsMeta,
  wsPrimaryCta, wsSecondaryCta, wsTextLink, wsArrow,
} from "@/addons/_shared/WorkspaceShell";
import { EntryChoice, type EntryDoor } from "@/addons/_shared/EntryChoice";
import { cn } from "@/lib/utils";
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

const EASE = [0.16, 1, 0.3, 1] as const;

const DEEP_OUTPUTS = [
  "Your interior archetype, named",
  "Colour and material direction",
  "Light and spatial preferences",
  "A practical design roadmap",
];

const QUICK_OUTPUTS = [
  "Your top archetype match",
  "A starting palette direction",
  "Enough to calibrate an estimate",
];

export default function DiscoveryLanding({ onStart }: DiscoveryLandingProps) {
  const { lang, setLang } = useLanguage();
  const [showIntent, setShowIntent] = useState(false);

  const quizCount = 1420;

  const handleStartDeep = () => setShowIntent(true);
  const handleStartQuick = () => onStart("quick");
  const handleIntentSelect = (id: string) => {
    setShowIntent(false);
    onStart("deep", id);
  };

  const doors: EntryDoor[] = [
    {
      id: "deep",
      index: "01",
      eyebrow: "Full discovery",
      title: <>Decode how you want to live.</>,
      description:
        "A guided read of instinct, emotion and texture. The longer route, and the one that produces a blueprint precise enough to design from.",
      duration: "About 6 minutes",
      outputs: DEEP_OUTPUTS,
      featured: true,
      action: (
        <button type="button" onClick={handleStartDeep} className={wsPrimaryCta}>
          Start full discovery {wsArrow}
        </button>
      ),
    },
    {
      id: "quick",
      index: "02",
      eyebrow: "Quick read",
      title: <>Just show me my style.</>,
      description:
        "A short version for a first direction. You can always come back and go deeper — nothing you answer here is wasted.",
      duration: "About 3 minutes",
      outputs: QUICK_OUTPUTS,
      action: (
        <button type="button" onClick={handleStartQuick} className={wsSecondaryCta}>
          Take the 3-minute quiz {wsArrow}
        </button>
      ),
    },
  ];

  const languageToggle = (
    <div className="flex items-center overflow-hidden rounded-full border border-[var(--ws-line)] bg-[var(--ws-paper)]/70">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-current={lang === l ? "true" : undefined}
          className={cn(
            "px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
            lang === l
              ? "bg-[var(--ws-gold)] text-black"
              : "text-[var(--ws-muted)] hover:text-[var(--ws-ink)]",
          )}
        >
          {l === "en" ? "EN" : "Hinglish"}
        </button>
      ))}
    </div>
  );

  return (
    <WorkspaceShell headerAside={languageToggle}>
      <main className="mx-auto w-full max-w-[1280px] px-6 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
        {/* Statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-3xl"
        >
          <span className={cn(wsEyebrow, "mb-8")}>
            <span aria-hidden="true" className={wsRule} />
            Aesthetic Discovery Engine
          </span>
          <h1 className={cn(wsDisplay, "mb-6 text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02]")}>
            Most tools ask what you want. We decode how you{" "}
            <span className="italic font-light text-[var(--ws-bronze)]">want to live.</span>
          </h1>
          <p className={cn(wsBody, "max-w-xl")}>
            Your home is not a design problem — it is a psychology question. Answer honestly and receive your interior
            archetype, palette direction, material focus and a practical roadmap.
          </p>
        </motion.div>

        {/* Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--ws-line)] pt-6"
        >
          <span className={wsMeta}>No payment required</span>
          <span className="text-sm font-light text-[var(--ws-ink)]/80">
            <strong className="font-medium text-[var(--ws-bronze)]">
              <CountUp to={quizCount} duration={2.5} separator="," />+
            </strong>{" "}
            homeowners have discovered their style here.
          </span>
        </motion.div>

        {/* The two doors */}
        <div className="mt-16 md:mt-24">
          <EntryChoice doors={doors} />
        </div>

        {/* What the blueprint contains */}
        <div className="mt-24 md:mt-32">
          <UnifiedDashboard />
        </div>

        {/* Route across to the estimator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--ws-line)] pt-8"
        >
          <span className={wsMeta}>Only after a number?</span>
          <Link to={ECOSYSTEM_ROUTES.estimator} className={wsTextLink}>
            {ECOSYSTEM_COPY.ctas.startEstimator} {wsArrow}
          </Link>
        </motion.div>
      </main>

      <AnimatePresence>
        {showIntent && (
          <IntentOverlay lang={lang} onSelect={handleIntentSelect} onClose={() => setShowIntent(false)} />
        )}
      </AnimatePresence>
    </WorkspaceShell>
  );
}
