import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useCallback, useRef, useState, useEffect } from "react";
import { AestheticScores, Archetype, AIAestheticResult } from "@/types/discovery";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Download, RotateCcw, Sun, Layers, LayoutGrid, Zap, Lightbulb, Palette, Move, Wind, ArrowRight, Share2 } from "lucide-react";
import { toast } from "sonner";
import MoodBoard from "./MoodBoard";
import { useLanguage } from "@/hooks/useLanguage";
import WordRotate from "@/components/magicui/word-rotate";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";
import { Button } from "@/components/ui/button";

interface Props {
  scores: AestheticScores;
  archetype: Archetype;
  aiResult?: AIAestheticResult | null;
  onRetake?: () => void;
}

// Count-up animation hook
const useCountUp = (target: number, duration = 1200, delay = 0) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      const start = Date.now();
      const step = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
        setVal(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [isInView, target, duration, delay]);

  return { val, ref };
};

// Animated progress ring with gradient and count-up
const ProgressRing = ({ value, label, desc, delay = 0 }: { value: number; label: string; desc: string; delay?: number }) => {
  const { val, ref } = useCountUp(value, 1200, delay);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 10) * circumference;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000 }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
          <defs>
            <linearGradient id={`ring-grad-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--gold-dark))" />
              <stop offset="100%" stopColor="hsl(var(--gold-light))" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="40" cy="40" r="36" fill="none"
            stroke={`url(#ring-grad-${label})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.5, ease: "easeOut", delay: delay / 1000 + 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif-display text-xl font-medium">{val}</span>
          <span className="text-xs text-muted-foreground mt-1">/10</span>
        </div>
      </div>
      <p className="tracking-premium text-muted-foreground mb-1">{label}</p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay / 1000 + 1.5 }}
        className="text-xs text-muted-foreground leading-relaxed max-w-[140px]"
      >
        {desc}
      </motion.p>
    </motion.div>
  );
};

// Animated liquid-fill sensory bar
const SensoryBar = ({ label, value, icon: Icon, delay }: { label: string; value: string; icon: any; delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotateY: 90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      style={{ perspective: 800 }}
      className="glass-card p-4 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-foreground" />
      </div>
      <div className="flex-1">
        <p className="tracking-premium text-muted-foreground text-[0.65rem] mb-1">{label}</p>
        <p className="text-sm font-medium leading-snug">{value}</p>
        <motion.div
          className="h-0.5 rounded-full mt-2 origin-left"
          style={{ background: "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold)))" }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        />
      </div>
    </motion.div>
  );
};

const strategyIcons: Record<string, any> = {
  LIGHTING: Lightbulb, MATERIALS: Layers, "COLOR PALETTE": Palette, LAYOUT: Move, ATMOSPHERE: Wind,
};

const ResultsReveal = ({ scores, archetype, aiResult, onRetake }: Props) => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const displayName = aiResult?.identityName || archetype.name;
  const displayTagline = aiResult?.tagline || archetype.tagline;
  const displayTraits = aiResult?.traits || archetype.traits;
  const displayMaterialBias = aiResult?.materialBias || archetype.materialBias;

  const radarData = [
    { subject: "Warmth", value: scores.warmth },
    { subject: "Minimalism", value: scores.minimalism },
    { subject: "Social", value: scores.social },
    { subject: "Structure", value: scores.structure },
    { subject: "Novelty", value: scores.novelty },
  ];

  const sensoryMap = aiResult?.sensoryMap
    ? [
      { label: "LIGHT", value: aiResult.sensoryMap.light, icon: Sun },
      { label: "MATERIAL", value: aiResult.sensoryMap.material, icon: Layers },
      { label: "LAYOUT", value: aiResult.sensoryMap.layout, icon: LayoutGrid },
      { label: "ENERGY", value: aiResult.sensoryMap.energy, icon: Zap },
    ]
    : [
      { label: "LIGHT", value: scores.warmth > 6 ? "Soft & Indirect" : scores.warmth > 3 ? "Balanced & Natural" : "Crisp & Direct", icon: Sun },
      { label: "MATERIAL", value: archetype.materialBias === "Wood" ? "Textile & Wood" : archetype.materialBias === "Linen" ? "Linen & Textile" : `${archetype.materialBias} & Stone`, icon: Layers },
      { label: "LAYOUT", value: scores.social > 6 ? "Open & Flowing" : scores.structure > 6 ? "Structured & Zoned" : "Intimate & Zoned", icon: LayoutGrid },
      { label: "ENERGY", value: scores.warmth > 6 ? "Warm & Intentional" : scores.minimalism > 6 ? "Calm & Focused" : "Dynamic & Bold", icon: Zap },
    ];

  const displayStrategy = aiResult?.designStrategy
    ? `${aiResult.designStrategy.lighting} ${aiResult.designStrategy.materials} ${aiResult.designStrategy.colorPalette} ${aiResult.designStrategy.layout} ${aiResult.designStrategy.atmosphere}`
    : archetype.strategy;

  const handleDownload = useCallback(() => {
    const text = `
═══════════════════════════════════════
  YOUR SPATIAL PERSONALITY
  ${displayName}
═══════════════════════════════════════

"${displayTagline}"
${aiResult?.narrative ? `\n${aiResult.narrative}\n` : ""}
AESTHETIC DNA
─────────────
Warmth:     ${"█".repeat(scores.warmth)}${"░".repeat(10 - scores.warmth)} ${scores.warmth}/10
Minimalism: ${"█".repeat(scores.minimalism)}${"░".repeat(10 - scores.minimalism)} ${scores.minimalism}/10
Social:     ${"█".repeat(scores.social)}${"░".repeat(10 - scores.social)} ${scores.social}/10
Structure:  ${"█".repeat(scores.structure)}${"░".repeat(10 - scores.structure)} ${scores.structure}/10
Novelty:    ${"█".repeat(scores.novelty)}${"░".repeat(10 - scores.novelty)} ${scores.novelty}/10

KEY TRAITS
──────────
${displayTraits.map((t) => `• ${t}`).join("\n")}

MATERIAL BIAS: ${displayMaterialBias}

DESIGN STRATEGY
───────────────
${displayStrategy}
    `.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aesthetic-profile-${displayName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Profile downloaded!");
  }, [scores, displayName, displayTagline, displayTraits, displayMaterialBias, displayStrategy, aiResult]);

  // Typewriter tagline
  const [taglineText, setTaglineText] = useState("");
  useEffect(() => {
    const delay = 0.6 + displayName.length * 0.05;
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setTaglineText(displayTagline.slice(0, i + 1));
        i++;
        if (i >= displayTagline.length) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [displayTagline, displayName.length]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full noise-overlay">
      {/* ═══ HERO SECTION with parallax ═══ */}
      <div ref={heroRef} className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden" style={{ background: "hsl(var(--result-bg))", color: "hsl(var(--result-fg))" }}>
        {/* Decorative floating elements */}
        <motion.div
          className="absolute pointer-events-none"
          style={{ y: heroY }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.12) 0%, transparent 60%)" }} />
        </motion.div>

        {/* Floating geometric decorations */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-px pointer-events-none"
            style={{
              height: "80px",
              background: `linear-gradient(to bottom, transparent, hsl(var(--gold) / 0.2), transparent)`,
              left: `${20 + i * 30}%`,
              top: `${15 + i * 20}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Small diamond shapes */}
        {[0, 1].map((i) => (
          <motion.div
            key={`diamond-${i}`}
            className="absolute w-2 h-2 rotate-45 pointer-events-none"
            style={{
              border: "1px solid hsl(var(--gold) / 0.2)",
              right: `${15 + i * 15}%`,
              bottom: `${20 + i * 25}%`,
            }}
            animate={{ y: [0, -10, 0], rotate: [45, 50, 45] }}
            transition={{ duration: 5, delay: i * 2, repeat: Infinity }}
          />
        ))}

        <WordRotate
          words={[t("results_identity"), "YOUR SPATIAL SOUL", "YOUR DESIGN DNA"]}
          className="tracking-premium mb-6 text-sm font-medium"
          framerProps={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.2 },
            style: { color: "hsl(var(--gold) / 0.7)" }
          }}
        />

        {/* Gold unveil line + letter-by-letter name */}
        <div className="relative mb-6">
          <div className="flex flex-wrap justify-center gap-x-[0.08em]">
            {displayName.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-medium"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
          {/* Gold sweep line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 + displayName.length * 0.05, ease: "easeInOut" }}
            className="absolute -bottom-2 left-0 right-0 h-px origin-left"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)" }}
          />
        </div>

        {/* Typewriter tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-xl mx-auto italic font-serif-display text-lg md:text-xl text-center"
          style={{ color: "hsl(var(--result-fg) / 0.7)" }}
        >
          "{taglineText}"
          {taglineText.length < displayTagline.length && (
            <span className="inline-block w-0.5 h-5 bg-current ml-0.5 animate-pulse" />
          )}
        </motion.p>

        {/* Animated gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
          className="w-24 h-px mt-8"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)" }}
        />
      </div>

      {/* ═══ AI NARRATIVE ═══ */}
      {aiResult?.narrative && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6 py-16 text-center"
        >
          <p className="text-foreground/80 leading-relaxed italic font-serif-display text-base md:text-lg">
            {aiResult.narrative}
          </p>
        </motion.div>
      )}

      {/* ═══ SENSORY BLUEPRINT + MOOD BOARD ═══ */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-4">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-serif-display text-2xl mb-6"
          >
            {t("results_sensory")}
          </motion.h3>
          {sensoryMap.map((item, i) => (
            <SensoryBar key={item.label} label={item.label} value={item.value} icon={item.icon} delay={i * 0.15} />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-5 mt-6"
          >
            <h4 className="font-serif-display text-base font-medium mb-2">{t("results_why")}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("results_why_text")}</p>
          </motion.div>
        </div>

        <div className="md:col-span-3">
          <MoodBoard scores={scores} archetype={archetype} />
        </div>
      </div>

      {/* ═══ AESTHETIC DNA + DESIGN STRATEGY ═══ */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Radar */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif-display text-2xl mb-1 border-b border-border pb-2">{t("results_dna")}</h3>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%">
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(35 50% 55%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(24 10% 10%)" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="hsl(24 6% 88%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(24 5% 45%)" }} />
                <Radar dataKey="value" stroke="hsl(35 50% 55%)" fill="url(#radarGrad)" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="tracking-premium text-muted-foreground mb-2">{t("results_traits")}</p>
              <ul className="space-y-1.5">
                {displayTraits.map((tr) => (
                  <li key={tr} className="text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--gold))" }} />
                    {tr}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="tracking-premium text-muted-foreground mb-2">{t("results_material")}</p>
              <p className="text-sm font-medium">{displayMaterialBias}</p>
            </div>
          </div>
        </motion.div>

        {/* Strategy - alternating slide-in */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif-display text-2xl mb-1 border-b border-border pb-2">{t("results_strategy")}</h3>
          <div className="mt-4 space-y-3">
            {aiResult?.designStrategy ? (
              [
                { label: "LIGHTING", value: aiResult.designStrategy.lighting },
                { label: "MATERIALS", value: aiResult.designStrategy.materials },
                { label: "COLOR PALETTE", value: aiResult.designStrategy.colorPalette },
                { label: "LAYOUT", value: aiResult.designStrategy.layout },
                { label: "ATMOSPHERE", value: aiResult.designStrategy.atmosphere },
              ].map((item, i) => {
                const Icon = strategyIcons[item.label] || Lightbulb;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-4 border-l-2 transition-all duration-300 hover:shadow-md group"
                    style={{ borderLeftColor: "hsl(var(--gold) / 0.3)" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <motion.div
                        initial={{ rotate: 0 }}
                        whileInView={{ rotate: 360 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                      >
                        <Icon size={14} className="text-muted-foreground" />
                      </motion.div>
                      <p className="tracking-premium text-muted-foreground text-[0.65rem]">{item.label}</p>
                    </div>
                    <p className="text-sm leading-relaxed">{item.value}</p>
                    {/* Gold bottom border on hover */}
                    <motion.div
                      className="h-px mt-3 origin-left"
                      style={{ background: "hsl(var(--gold) / 0.3)" }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                );
              })
            ) : (
              <div className="glass-card p-5 border-l-2" style={{ borderLeftColor: "hsl(var(--gold) / 0.3)" }}>
                <p className="text-sm leading-relaxed text-foreground">{archetype.strategy}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ LEARNING PROFILE ═══ */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-serif-display text-2xl mb-10 text-center"
        >
          {t("results_learning")}
        </motion.h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <ProgressRing
            value={scores.novelty}
            label={t("results_novelty")}
            desc={scores.novelty > 6 ? "High — you seek the unexpected" : scores.novelty > 3 ? "Moderate — open with anchors" : "Low — you prefer the familiar"}
            delay={0}
          />
          <ProgressRing
            value={10 - scores.minimalism}
            label={t("results_density")}
            desc={scores.minimalism > 6 ? "Low — clarity over complexity" : scores.minimalism > 3 ? "Moderate — curated layers" : "High — rich maximalism"}
            delay={200}
          />
          <ProgressRing
            value={scores.warmth}
            label={t("results_tone")}
            desc={scores.warmth > 6 ? "Warm — organic and inviting" : scores.warmth > 3 ? "Balanced — adaptable warmth" : "Cool — precise and crisp"}
            delay={400}
          />
          <ProgressRing
            value={scores.structure}
            label={t("results_depth")}
            desc={scores.structure > 6 ? "Deep — intentional and symbolic" : scores.structure > 3 ? "Moderate — functional beauty" : "Light — intuitive and fluid"}
            delay={600}
          />
        </div>
      </div>

      {/* Confidence */}
      {aiResult?.confidence != null && (
        <div className="max-w-5xl mx-auto px-6 text-center pb-8">
          <p className="text-xs text-muted-foreground">Analysis confidence: {Math.round(aiResult.confidence * 100)}%</p>
        </div>
      )}

      {/* ═══ CTA FOOTER ═══ */}
      <div className="relative overflow-hidden" style={{ background: "hsl(var(--result-bg))", color: "hsl(var(--result-fg))" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at bottom, hsl(var(--gold) / 0.15) 0%, transparent 70%)" }} />
        <div className="relative py-20 px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif-display text-2xl md:text-3xl italic mb-4"
          >
            {t("results_conscious")}
          </motion.h2>
          <p className="max-w-lg mx-auto text-sm mb-10" style={{ color: "hsl(var(--result-fg) / 0.6)" }}>
            {t("results_conscious_text")}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <LeadCaptureDialog
              source="Aesthetic Discovery"
              metadata={{
                archetype: archetype.name,
                scores: scores,
                aiCalculated: !!aiResult,
                identity: displayName
              }}
              title="Get Your Full Design Blueprint"
              description="Receive a detailed PDF of your spatial identity, including custom material specifications and a lighting guide."
              defaultMessage={`I just discovered my aesthetic is ${displayName}! I'd love to get the full blueprint and discuss a project.`}
            >
              <Button size="lg" className="h-14 px-8 text-base shadow-2xl shadow-primary/20 gap-3 group">
                Request Full Blueprint
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </LeadCaptureDialog>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center w-14 h-14 border transition-all duration-300 hover:bg-foreground/5"
                style={{ borderColor: "hsl(var(--result-fg) / 0.2)", color: "hsl(var(--result-fg))" }}
                title={t("results_download")}
              >
                <Download size={20} />
              </button>

              {onRetake && (
                <button
                  onClick={onRetake}
                  className="flex items-center gap-2 px-6 py-3 border text-sm font-medium tracking-wide transition-colors duration-300 hover:bg-[hsl(var(--result-fg)/0.1)]"
                  style={{ borderColor: "hsl(var(--result-fg) / 0.2)", color: "hsl(var(--result-fg))" }}
                >
                  <RotateCcw size={16} />
                  {t("results_retake")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsReveal;
