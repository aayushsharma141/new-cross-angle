import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  Sun,
  Layers,
  Zap,
  Lightbulb,
  Paintbrush,
  Layout as LayoutIcon,
  Plus,
  Minus,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';

import { AestheticScores, Archetype, AIAestheticResult, UserSignals } from '@/types/discovery';
import { visualImages } from '@/constants/discovery';
import { trackResultLoaded } from '../infrastructure/analytics/tracker';
import { MediaSlot } from '@/components/ui/enhanced/MediaSlot';
import { useAnalytics } from '@/analytics/AnalyticsProvider';
import { FallingText, BlurText, ScrollVelocity } from '@/components/ReactBits';

interface Props {
  scores: AestheticScores;
  archetype: Archetype;
  aiResult?: AIAestheticResult | null;
  sessionId?: string | null;
  signals?: UserSignals;
  onRetake?: () => void;
  onComplete?: () => void;
}

const SCORE_LABELS: Record<keyof AestheticScores, string> = {
  minimalism: 'Minimalism',
  warmth: 'Warmth',
  social: 'Social Energy',
  structure: 'Structure',
  novelty: 'Novelty',
};

const GOLD = '#E35336';

const AXIS_INTERPRETATIONS: Record<keyof AestheticScores, (v: number) => string> = {
  minimalism: (v) => v >= 7 ? 'Strong preference for edited, uncluttered environments.' : v >= 4 ? 'Balanced approach — selective about what you keep.' : 'You embrace layering and a richness of objects.',
  warmth: (v) => v >= 7 ? 'Warmth is your dominant axis. You gravitate toward materials and light that feel human and inviting.' : v >= 4 ? 'A moderate warmth — comfort balanced with clarity.' : 'You lean cool and precise over cozy and textural.',
  social: (v) => v >= 7 ? 'You design for shared, communal experience.' : v >= 4 ? 'A mix of social and private spaces suits you.' : 'You design primarily for private, intimate experience.',
  structure: (v) => v >= 7 ? 'You crave deliberate organisation and architectural clarity.' : v >= 4 ? 'Moderate structure — organic but not chaotic.' : 'Spontaneity and flow over rigid composition.',
  novelty: (v) => v >= 7 ? 'You actively seek the new and experimental.' : v >= 4 ? 'Open to novelty when it serves the space.' : 'You value the timeless and proven over the trend-driven.',
};

const ScoreBar: React.FC<{ label: string; value: number; delay: number }> = ({ label, value, delay }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase mb-2">
        <span className="text-white/60">{label}</span>
        <span style={{ color: GOLD }}>{value}/10</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / 10) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          className="h-full bg-site-crimson"
        />
      </div>
    </div>
  );
};

const RadarChart: React.FC<{ scores: AestheticScores }> = ({ scores }) => {
  const [hoveredKey, setHoveredKey] = useState<keyof AestheticScores | null>(null);
  const size = 280;
  const center = size / 2;
  const radius = 100;
  const keys = Object.keys(scores) as (keyof AestheticScores)[];

  const getPoint = (index: number, r: number) => {
    const angle = (index * (2 * Math.PI)) / keys.length - Math.PI / 2;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const scorePath = keys
    .map((k, i) => {
      const p = getPoint(i, (scores[k] / 10) * radius);
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    })
    .join(' ') + ' Z';

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible mx-auto">
        {/* Grid rings */}
        {gridLevels.map((level, li) => {
          const pts = keys.map((_, i) => getPoint(i, level * radius));
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return <path key={li} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}

        {/* Axis lines */}
        {keys.map((_, i) => {
          const p = getPoint(i, radius);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
        })}

        {/* Score polygon */}
        <motion.path
          d={scorePath}
          fill={`${GOLD}22`}
          stroke={GOLD}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />

        {/* Axis labels */}
        {keys.map((k, i) => {
          const p = getPoint(i, radius + 26);
          return (
            <text
              key={k}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill={hoveredKey === k ? GOLD : 'rgba(255,255,255,0.35)'}
              fontFamily="'Syne', sans-serif"
              letterSpacing="0.1em"
              style={{ transition: 'fill 0.2s' }}
            >
              {SCORE_LABELS[k].toUpperCase()}
            </text>
          );
        })}

        {/* Interactive score dots */}
        {keys.map((k, i) => {
          const p = getPoint(i, (scores[k] / 10) * radius);
          return (
            <g key={k}
              onMouseEnter={() => setHoveredKey(k)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={hoveredKey === k ? 5 : 3.5}
                fill={hoveredKey === k ? '#fff' : GOLD}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + i * 0.1, duration: 0.2 }}
                style={{ transition: 'r 0.2s' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredKey && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 w-64 p-4 rounded-none border text-center pointer-events-none"
            style={{ background: '#0F0F10', borderColor: `${GOLD}30`, zIndex: 10 }}
          >
            <p className="text-[9px] font-mono tracking-[0.3em] uppercase mb-1.5" style={{ color: GOLD }}>
              {SCORE_LABELS[hoveredKey]} · {scores[hoveredKey].toFixed(1)}
            </p>
            <p className="text-[11px] text-white/60 leading-relaxed">
              {AXIS_INTERPRETATIONS[hoveredKey](scores[hoveredKey])}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Cognitive Profile ────────────────────────────────────────────────────────

const COGNITIVE_TRAITS = (scores: AestheticScores) => [
  {
    name: 'Openness',
    score: Math.min(10, ((scores.novelty * 0.6) + ((10 - scores.minimalism) * 0.4))),
    summary: 'How experimental vs. classic your spatial preferences run.',
    interpretation: (v: number) =>
      v >= 7
        ? 'Your design sensibility is genuinely experimental. You are drawn to spaces that challenge convention and evolve.'
        : v >= 4
          ? 'You balance tradition with curiosity — open to new directions when they feel considered and intentional.'
          : 'You favour the timeless and established. Your spaces age beautifully because you design with conviction, not trend.',
  },
  {
    name: 'Detail',
    score: Math.min(10, ((scores.structure * 0.6) + (scores.minimalism * 0.4))),
    summary: 'How much you attend to fine materiality vs. overall composition.',
    interpretation: (v: number) =>
      v >= 7
        ? 'You notice what others miss — grain direction, hardware finish, the gap between skirting and wall. Spaces reveal themselves to you slowly.'
        : v >= 4
          ? 'You appreciate quality craftsmanship and rewarding details, but composition and atmosphere guide you first.'
          : 'You experience a room as a whole before you notice its parts. Bold composition and atmosphere resonate more than granular craft.',
  },
  {
    name: 'Emotion',
    score: Math.min(10, ((scores.warmth * 0.7) + (scores.social * 0.3))),
    summary: 'How emotionally driven vs. functionally driven your design decisions are.',
    interpretation: (v: number) =>
      v >= 7
        ? 'You design how a space makes you feel first. Functionality follows emotional resonance — always.'
        : v >= 4
          ? 'A balance — spaces must feel good and work well. Neither dominates the other.'
          : 'You design from logic outward. A space that functions perfectly is already beautiful to you.',
  },
  {
    name: 'Thinking',
    score: Math.min(10, (scores.structure * 0.5 + (10 - scores.novelty) * 0.5)),
    summary: 'How you process spatial choices — intuitive vs. deliberate.',
    interpretation: (v: number) =>
      v >= 7
        ? 'You are a deliberate decision-maker. Every object earns its place. You research, compare, and commit with conviction.'
        : v >= 4
          ? 'You move between intuition and analysis depending on the decision at hand.'
          : 'Your best design decisions come quickly. Instinct outperforms deliberation for you — trust it.',
  },
];

const CognitiveProfile: React.FC<{ scores: AestheticScores }> = ({ scores }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const traits = COGNITIVE_TRAITS(scores);

  return (
    <section className="px-6 py-24 max-w-5xl mx-auto border-t border-white/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-[9px] font-mono tracking-[0.4em] uppercase mb-4" style={{ color: GOLD }}>
          04 — Cognitive Profile
        </p>
        <h2 className="text-3xl md:text-4xl font-light mb-12 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          How You <em>Process Space</em>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {traits.map((trait, i) => {
            const isOpen = expanded === i;
            const barPct = (trait.score / 10) * 100;
            return (
              <motion.div
                key={trait.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-site-border rounded-none cursor-pointer overflow-hidden transition-all duration-300"
                style={{
                  background: isOpen ? 'rgba(227, 83, 54,0.05)' : 'rgba(26,26,26,0.2)',
                  borderColor: isOpen ? `${GOLD}50` : 'var(--site-border)'
                }}
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/80 tracking-wide">{trait.name}</span>
                    <span className="text-[9px] font-mono" style={{ color: GOLD }}>{trait.score.toFixed(1)} / 10</span>
                  </div>
                  {/* Score bar */}
                  <div className="h-px bg-white/5 relative overflow-hidden mb-3">
                    <motion.div
                      className="absolute inset-y-0 left-0"
                      style={{ background: `linear-gradient(90deg, ${GOLD}60, ${GOLD})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed">{trait.summary}</p>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="text-sm text-white/60 leading-relaxed mt-4 italic overflow-hidden"
                      >
                        {trait.interpretation(trait.score)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="px-5 pb-3">
                  <span className="text-[9px] font-mono tracking-wider" style={{ color: `${GOLD}60` }}>
                    {isOpen ? '— less' : '+ read more'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

// ── Transformation Readiness ──────────────────────────────────────────────────

const READINESS_NARRATIVE = (score: number) => {
  if (score >= 85) return 'You have a clear vision and are ready to move. This is the optimal moment to begin.';
  if (score >= 65) return 'Your vision is forming. A strategy consultation will crystallise the next steps.';
  if (score >= 45) return "You're in an exploratory phase. Your instincts are strong — they just need a design framework.";
  return "You're building clarity. Start with one room. Let the result inform the rest.";
};

const TransformationReadiness: React.FC<{ scores: AestheticScores }> = ({ scores }) => {
  // Derive sub-dimension scores (all 0–100)
  const visionClarity = Math.round(((scores.structure + scores.minimalism) / 2) * 10);
  const investmentReadiness = Math.round(((scores.warmth + scores.social) / 2) * 10);
  const decisionMomentum = Math.round((scores.novelty / 10) * 100);
  const lifestyleAlignment = Math.round(((scores.minimalism + scores.warmth + scores.novelty) / 3) * 10);
  const overall = Math.round((visionClarity + investmentReadiness + decisionMomentum + lifestyleAlignment) / 4);

  const circumference = 2 * Math.PI * 52;
  const strokeDash = (overall / 100) * circumference;

  const subDimensions = [
    { label: 'Vision Clarity', value: visionClarity },
    { label: 'Investment Readiness', value: investmentReadiness },
    { label: 'Decision Momentum', value: decisionMomentum },
    { label: 'Lifestyle Alignment', value: lifestyleAlignment },
  ];

  return (
    <section className="px-6 py-24 max-w-5xl mx-auto border-t border-white/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-[9px] font-mono tracking-[0.4em] uppercase mb-4" style={{ color: GOLD }}>
          05 — Transformation Readiness
        </p>
        <h2 className="text-3xl md:text-4xl font-light mb-12 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          How Close You Are to <em>Your Vision</em>
        </h2>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Circular ring */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Track */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                {/* Fill */}
                <motion.circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset: circumference - strokeDash }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-light" style={{ color: GOLD, fontFamily: "'Cormorant Garamond', serif" }}>{overall}%</span>
                <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-white/30 mt-1">Ready</span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed text-center max-w-xs italic">
              "{READINESS_NARRATIVE(overall)}"
            </p>
          </div>

          {/* Sub-dimensions */}
          <div className="space-y-6">
            {subDimensions.map((dim, i) => (
              <div key={dim.label} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-white/50">{dim.label}</span>
                  <span className="text-[11px] font-mono" style={{ color: GOLD }}>{dim.value}%</span>
                </div>
                <div className="h-px bg-white/5 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ background: `linear-gradient(90deg, ${GOLD}50, ${GOLD})` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${dim.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const ResultsReveal: React.FC<Props> = ({ scores, archetype, aiResult, sessionId, signals, onRetake }) => {
  const { track } = useAnalytics();

  const displayName = aiResult?.identityName || archetype.name;
  const displayTagline = aiResult?.tagline || archetype.tagline;
  const displayNarrative = aiResult?.narrative || archetype.strategy;
  const displayTraits = aiResult?.traits || archetype.traits;

  const sensoryMap = aiResult?.sensoryMap;
  const designStrategy = aiResult?.designStrategy;

  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadShareCard = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, // high res
        backgroundColor: '#040404',
        logging: false,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `my-aesthetic-dna.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      trackResultLoaded(track, sessionId, displayName);
    }
  }, [sessionId, displayName, track]);

  const topImages = useMemo(() => {
    return [...visualImages]
      .map((img) => {
        let relevance = 0;
        for (const [k, v] of Object.entries(img.tags)) {
          relevance += (v || 0) * (scores[k as keyof AestheticScores] / 10);
        }
        return { ...img, relevance };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }, [scores]);

  const visualMirrorImages = useMemo(() => {
    if (signals?.selectedImageIds && signals.selectedImageIds.length > 0) {
      return signals.selectedImageIds
        .map(id => visualImages.find(img => img.id === id))
        .filter(Boolean) as typeof visualImages;
    }
    return topImages;
  }, [signals, topImages]);

  return (
    <div
      className="min-h-screen w-full bg-site-bg text-site-text-heading font-sans"
    >
      {/* ── S1: IDENTITY REVEAL ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden bg-site-bg">
        {/* Cinematic Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${GOLD}15 0%, transparent 60%)`,
          }}
        />

        {/* Animated grid/lines for structure */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '100px 100px', backgroundPosition: 'center center' }} />

        <div className="text-center max-w-4xl relative z-10 flex flex-col items-center w-full">
          {/* Rarity & Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="px-4 py-1.5 border border-site-crimson/40 rounded-full text-[9px] font-mono tracking-[0.4em] uppercase shadow-[0_0_15px_rgba(227, 83, 54,0.15)] bg-site-bg-card/40 backdrop-blur-md text-site-crimson">
              Aesthetic Identity
            </div>
          </motion.div>

          {/* Archetype Name */}
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-light italic mb-8 leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 w-full flex justify-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <FallingText text={displayName} className="inline-flex justify-center w-full justify-center" delay={20} />
          </h1>

          {/* Tagline */}
          <BlurText
            text={`"${displayTagline}"`}
            delay={25}
            className="text-lg md:text-2xl text-white/50 font-light leading-relaxed max-w-2xl mx-auto mb-12 tracking-wide justify-center"
            animateBy="words"
            direction="bottom"
          />

          {/* Traits Ticker */}
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-16 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-site-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-site-bg to-transparent z-10 pointer-events-none" />
            <ScrollVelocity
              texts={[`${displayTraits.join('  ✦  ')}  ✦  `]}
              velocity={20}
              scrollerClassName="text-sm tracking-[0.2em] uppercase font-mono text-[#F0EDE8]/60"
            />
          </div>

          {/* Free Text Reflection Hook (if provided) */}
          <AnimatePresence>
            {signals?.freeTextReflection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 2.5 }}
                className="max-w-xl mx-auto p-6 border-l border-site-crimson/50 text-left bg-gradient-to-r from-site-crimson/[0.02] to-transparent relative w-full"
              >
                <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${GOLD}, transparent)` }}></div>
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase mb-3" style={{ color: `${GOLD}80` }}>Your Words, Reflected</p>
                <p className="text-sm md:text-base text-white/70 italic leading-relaxed font-light">
                  "{signals.freeTextReflection}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[8px] font-mono tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Explore the Blueprint
          </span>
          <motion.div
            animate={{ height: ['0%', '100%', '0%'], y: ['-100%', '0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-px h-16 origin-top"
            style={{ background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.5), transparent)` }}
          />
        </motion.div>
      </section>

      {/* ── S2: EMOTIONAL MIRROR ────────────────────────────────── */}
      {visualMirrorImages.length > 0 && (
        <section className="px-6 py-32 max-w-6xl mx-auto relative border-t border-white/5">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col items-center text-center mb-20">
              <span className="text-[9px] font-mono tracking-[0.4em] uppercase mb-4" style={{ color: GOLD }}>
                02 — Emotional Mirror
              </span>
              <h2 className="text-4xl md:text-5xl font-light leading-tight text-site-text-heading">
                Visions That <em className="text-site-crimson/80 italic">Resonate</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
              {/* Image 1 - Large Left */}
              {visualMirrorImages[0] && (
                <div className="md:col-span-7 relative group">
                  <div className="aspect-[4/3] overflow-hidden rounded-sm border border-white/5 relative bg-white/5">
                    <MediaSlot
                      assetKey={visualMirrorImages[0].assetKey || `discovery_visual-${visualMirrorImages[0].id}`}
                      fallbackUrl={visualMirrorImages[0].url}
                      alt="Selected visual resonance 1"
                      className="h-full w-full absolute inset-0 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs text-site-text-muted italic leading-relaxed backdrop-blur-md bg-site-bg-card/60 p-4 border-l border-site-crimson/50">
                      "A space that breathes. The interplay of light and form here speaks to your desire for structure without rigidity."
                    </p>
                  </div>
                </div>
              )}

              {/* Images 2 & 3 - Stacked Right */}
              <div className="md:col-span-5 flex flex-col gap-8 mt-12 md:mt-0">
                {visualMirrorImages[1] && (
                  <div className="relative group">
                    <div className="aspect-[3/4] md:aspect-square overflow-hidden rounded-sm border border-white/5 relative bg-white/5">
                      <MediaSlot
                        assetKey={visualMirrorImages[1].assetKey || `discovery_visual-${visualMirrorImages[1].id}`}
                        fallbackUrl={visualMirrorImages[1].url}
                        alt="Selected visual resonance 2"
                        className="h-full w-full absolute inset-0 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 z-10">
                      <p className="text-[11px] text-site-text-muted italic leading-relaxed backdrop-blur-md bg-site-bg-card/40 p-3 border-l border-site-crimson/30">
                        "Rich textures and depth anchor your spatial experience, grounding the ephemeral in the tactile."
                      </p>
                    </div>
                  </div>
                )}
                {visualMirrorImages[2] && (
                  <div className="relative group md:ml-12 mt-4 md:mt-0">
                    <div className="aspect-video overflow-hidden rounded-sm border border-white/5 relative bg-white/5">
                      <MediaSlot
                        assetKey={visualMirrorImages[2].assetKey || `discovery_visual-${visualMirrorImages[2].id}`}
                        fallbackUrl={visualMirrorImages[2].url}
                        alt="Selected visual resonance 3"
                        className="h-full w-full absolute inset-0 opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out grayscale-[30%] hover:grayscale-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── DNA RADAR ──────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[9px] font-mono tracking-[0.4em] uppercase mb-4" style={{ color: GOLD }}>
              03 — Aesthetic DNA
            </p>
            <h2 className="text-3xl md:text-4xl font-light mb-6 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Your Spatial<br />
              <em>Signature</em>
            </h2>
            <BlurText
              text={displayNarrative}
              delay={15}
              animateBy="words"
              className="text-white/40 leading-relaxed text-sm mb-8"
            />

            {/* Score Bars */}
            <div className="space-y-4">
              {(Object.keys(scores) as (keyof AestheticScores)[]).map((k, i) => (
                <ScoreBar key={k} label={SCORE_LABELS[k]} value={scores[k]} delay={0.3 + i * 0.1} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <RadarChart scores={scores} />
          </motion.div>
        </div>
      </section>

      {/* ── DIVIDER ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* ── S4: COGNITIVE PROFILE ───────────────────────────────── */}
      <CognitiveProfile scores={scores} />

      {/* ── S5: TRANSFORMATION READINESS ────────────────────────── */}
      <TransformationReadiness scores={scores} />

      {/* ── S8: SENSORY BLUEPRINT (Inspired by Aura Synthesizer) ────────────────── */}
      <section className="px-6 py-32 max-w-6xl mx-auto relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-site-crimson/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-site-crimson/5 blur-[150px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-12 bg-site-crimson/30" />
            <p className="text-[10px] font-mono tracking-[0.5em] uppercase text-site-crimson/80">
              08 — Sensory Configuration
            </p>
          </div>
          <h2 className="text-4xl md:text-6xl font-light leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            The Sensory <br /><em className="text-white/80 italic">Blueprint</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              label: 'Ambient Light',
              value: sensoryMap?.light || (scores.warmth >= 7 ? 'Golden Hour' : scores.novelty >= 7 ? 'Digital Clarity' : 'Soft Diffusion'),
              desc: 'The fundamental frequency of your spatial atmosphere.',
              icon: <Sun className="w-5 h-5 text-site-crimson" />,
              delay: 0.1
            },
            {
              label: 'Tactile Base',
              value: sensoryMap?.material || (scores.minimalism >= 7 ? 'Honest Origin' : scores.warmth >= 7 ? 'Deep Texture' : 'Natural Grain'),
              desc: 'Physical elements that ground your sensory experience.',
              icon: <Layers className="w-5 h-5" />,
              delay: 0.2
            },
            {
              label: 'Spatial Flow',
              value: sensoryMap?.layout || 'Unified Continuity',
              desc: 'How energy moves through your intended environment.',
              icon: <LayoutIcon className="w-5 h-5" />,
              delay: 0.3
            },
            {
              label: 'Resonant Energy',
              value: sensoryMap?.energy || (scores.social >= 7 ? 'Serene Pulse' : 'Focused Vibration'),
              desc: 'The psychological impact and emotional resonance of the room.',
              icon: <Zap className="w-5 h-5" />,
              delay: 0.4
            }
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: item.delay, duration: 0.8 }}
              className="group p-8 rounded-none border border-site-border bg-site-bg-card/20 hover:bg-site-bg-card/40 transition-all duration-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 group-hover:text-site-crimson transition-all duration-500 transform group-hover:scale-110">
                {item.icon}
              </div>
              <p className="text-[9px] font-mono tracking-[0.3em] uppercase mb-10 text-site-text-meta/30 group-hover:text-site-crimson/50 transition-colors">
                {item.label}
              </p>
              <p className="text-2xl font-light mb-4 tracking-tight group-hover:translate-x-1 transition-transform duration-500" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.value}</p>
              <p className="text-[11px] text-white/40 leading-relaxed font-light">{item.desc}</p>

              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-site-crimson group-hover:w-full transition-all duration-1000" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── S9: DESIGN STRATEGY (Poetic Strategy Pillars) ───────────────────── */}
      <section className="px-6 py-32 bg-site-bg-section relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-12 gap-16 items-start"
          >
            <div className="md:col-span-5 sticky top-32">
              <p className="text-[10px] font-mono tracking-[0.5em] uppercase text-site-crimson/80 mb-6">
                09 — Core Strategy
              </p>
              <h2 className="text-5xl md:text-7xl font-light leading-[0.9] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Strategic <br /><em className="italic text-white/90">Intervention</em>
              </h2>
              <p className="text-lg text-white/40 leading-relaxed font-light mb-12">
                A refined methodology for transforming your current spatial reality into your decoded identity. No detail is arbitrary; every choice is a calculated resonance.
              </p>

              <div className="flex flex-col gap-6">
                {[
                  { label: 'Precision', icon: <Plus className="w-4 h-4" /> },
                  { label: 'Complexity', icon: <Layers className="w-4 h-4" /> },
                  { label: 'Reductive Care', icon: <Minus className="w-4 h-4" /> }
                ].map(badge => (
                  <div key={badge.label} className="flex items-center gap-4 text-white/20">
                    <span className="p-2 border border-white/10 rounded-full">{badge.icon}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-mono">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col gap-16">
              {[
                {
                  title: 'Atmospheric Lighting',
                  strategy: designStrategy?.lighting || 'Utilize layered indirect illumination to create sanctuary-like depth.',
                  icon: <Lightbulb className="w-6 h-6" />,
                  num: 'I'
                },
                {
                  title: 'Material Integrity',
                  strategy: designStrategy?.materials || 'Prioritize honest, raw materials that age with dignity and narrate a story of origin.',
                  icon: <Paintbrush className="w-6 h-6" />,
                  num: 'II'
                },
                {
                  title: 'Curated Arrangement',
                  strategy: designStrategy?.layout || 'Balance void and volume to ensure every interaction with the room feels intentional.',
                  icon: <LayoutIcon className="w-6 h-6" />,
                  num: 'III'
                }
              ].map((pillar, idx) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="group"
                >
                  <div className="flex items-end gap-6 mb-6">
                    <span className="text-6xl font-light text-site-crimson/10 leading-none transition-colors group-hover:text-site-crimson/20" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{pillar.num}</span>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-site-bg-card/50 rounded-none text-site-crimson/60 group-hover:text-site-crimson transition-colors border border-site-border">
                        {pillar.icon}
                      </div>
                      <h3 className="text-2xl font-light tracking-tight">{pillar.title}</h3>
                    </div>
                  </div>
                  <div className="pl-24">
                    <p className="text-xl text-site-text-heading/60 font-light leading-relaxed italic border-l border-site-crimson/20 pl-8 group-hover:border-site-crimson transition-colors duration-700" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      "{pillar.strategy}"
                    </p>
                    <div className="mt-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 text-site-crimson/60 text-[10px] font-mono uppercase tracking-widest">
                      <span>Implementation Required</span>
                      <div className="h-px w-24 bg-site-crimson/20" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── S6: CINEMATIC UPGRADE CTA ────────────────────────────────────── */}
      <section className="px-6 py-40 text-center relative overflow-hidden bg-site-bg">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#BFA27A10_0%,_transparent_70%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/[0.02] rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-white/[0.03] rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <p className="text-[11px] font-mono tracking-[0.6em] uppercase mb-8 text-site-crimson/60">
            Final Step
          </p>
          <h2 className="text-5xl md:text-8xl font-light mb-12 leading-none" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            The Physical <br /><em>Manifestation</em>
          </h2>
          <p className="text-xl text-white/40 mb-16 leading-relaxed max-w-2xl mx-auto font-light">
            Your results are a guide. Our designers are the architects. Let us bridge the gap between your decoded digital DNA and the sanctuary you deserve.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.a
              href="/contact-us"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-5 bg-site-crimson text-site-bg text-xs font-bold tracking-[0.3em] uppercase rounded-none hover:bg-site-crimson/90 transition-colors shadow-[0_0_30px_rgba(227, 83, 54,0.2)] relative group overflow-hidden"
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              Book Final Design Review
            </motion.a>
            <a
              href="/system-blueprint"
              className="px-12 py-5 border border-white/10 text-white/60 text-xs font-semibold tracking-[0.3em] uppercase rounded-sm hover:border-white/30 hover:text-white transition-all"
            >
              Explore System Blueprint
            </a>
          </div>

          <p className="mt-16 text-[10px] font-mono uppercase tracking-[0.4em] text-white/20">
            Limited slots open for Q2 2026 Manifestations
          </p>
        </motion.div>
      </section>

      {/* ── S7: EXPORT & SOCIAL ACTIONS ───────────────────────────────────────── */}
      <section className="px-6 py-12 bg-[#040404] border-y border-white/5 backdrop-blur-md sticky bottom-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Identity Export</p>
            <p className="text-sm font-light text-white/70 italic">Blueprint Version 1.0.4 - Decoded</p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-3 px-8 py-3 border border-white/10 rounded-sm transition-all hover:bg-white/5 text-[10px] font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white"
            >
              <Download className="w-4 h-4 opacity-50" />
              Export PDF Blueprint
            </button>

            <button
              type="button"
              onClick={handleDownloadShareCard}
              disabled={isGenerating}
              className="flex items-center gap-3 px-8 py-3 border border-amber-500/20 bg-amber-500/5 rounded-sm transition-all hover:bg-amber-500/10 text-[10px] font-mono tracking-[0.2em] uppercase text-amber-500"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating DNA Card...' : 'Generate Share Card'}
            </button>

            {onRetake && (
              <button
                type="button"
                onClick={onRetake}
                className="px-8 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors"
              >
                Retake Discovery
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="px-6 py-16 bg-site-bg-section border-t border-site-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-xl font-mono tracking-[0.4em] text-site-crimson mb-2">CROSSANGLE</p>
              <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-site-text-meta/30">The Interior Intelligence OS</p>
            </div>
            <div className="flex gap-12 font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
              <button type="button" className="hover:text-site-crimson transition-colors bg-transparent border-0 p-0 font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 cursor-pointer">Vision</button>
              <button type="button" className="hover:text-site-crimson transition-colors bg-transparent border-0 p-0 font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 cursor-pointer">Manifesto</button>
              <button type="button" className="hover:text-site-crimson transition-colors bg-transparent border-0 p-0 font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 cursor-pointer">Legal</button>
            </div>
          </div>
          <div className="pt-8 border-t border-site-border flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono text-site-text-meta/20 tracking-[0.3em] uppercase">
            <span>Copyright 2026 Crossangle Interior. All rights reserved.</span>
            <span>Grounding Identity in Physical Space.</span>
          </div>
        </div>
      </footer>

      {/* ── SHARE CARD TEMPLATE (Fixed & Enhanced High-Res) ─────────────────────────────────────── */}
      <div
        className="fixed top-[-9999px] left-[-9999px] w-[1080px] h-[1920px] bg-[#040404] text-white flex flex-col justify-between p-24"
        style={{ fontFamily: "'Syne', sans-serif" }}
        ref={shareCardRef}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-site-crimson/20 via-site-bg to-site-bg pointer-events-none" />

        {/* Artistic Background Text */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[22rem] font-bold text-white/[0.02] tracking-tighter whitespace-nowrap pointer-events-none uppercase">
          {displayName}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center mt-32">
          <div className="px-8 py-3 border border-site-crimson/40 rounded-full text-2xl font-mono tracking-[0.5em] uppercase mb-16 text-site-crimson">
            Aesthetic DNA Certificate
          </div>
          <h2 className="text-[10rem] font-light mb-12 leading-[0.85] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {displayName}
          </h2>
          <div className="h-px w-24 bg-site-crimson/30 mb-12" />
          <p className="text-4xl text-white/60 font-light leading-relaxed max-w-4xl italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            "{displayTagline}"
          </p>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center -my-12">
          <div className="relative w-full aspect-square scale-[2.2] flex items-center justify-center">
            {/* Custom SVG Radar for High Res Share Card to avoid canvas nesting issues */}
            <div className="p-12 bg-white/[0.02] rounded-full border border-white/5 backdrop-blur-3xl">
              <RadarChart scores={scores} />
            </div>

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-site-crimson/5 rounded-full" />
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-20 flex flex-col items-center w-full gap-20">
          <div className="flex gap-8">
            {displayTraits.slice(0, 4).map(trait => (
              <span key={trait} className="px-8 py-4 text-xl tracking-[0.3em] uppercase font-mono border rounded-sm border-white/10 text-white/50 bg-white/[0.02]">
                {trait}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-end w-full border-t border-white/10 pt-16">
            <div className="text-left">
              <p className="text-sm font-mono tracking-[0.4em] text-white/20 uppercase mb-2">Authenticated By</p>
              <p className="text-3xl font-mono tracking-[0.4em] text-site-crimson">CROSSANGLE</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono tracking-[0.4em] text-white/20 uppercase mb-2">Blueprint Type</p>
              <p className="text-xl font-mono tracking-[0.3em] text-white/60 uppercase">Discovery OS v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsReveal;
