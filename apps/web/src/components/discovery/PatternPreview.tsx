import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { AestheticScores, UserSignals } from "@/types/discovery";
import { Layers } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface PatternPreviewProps {
  scores: AestheticScores;
  signals: UserSignals;
  onComplete: () => void;
}

// Animated bar component
const AnimatedBar = ({ label, value, maxValue = 10, delay }: { label: string; value: number; maxValue?: number; delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const pct = Math.min(100, (value / maxValue) * 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group"
    >
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground group-hover:text-primary transition-colors">{label}</span>
        <span className="text-sm font-serif-display italic text-foreground/50">{value}<span className="text-[10px] opacity-30 not-italic ml-1">/ {maxValue}</span></span>
      </div>
      <div className="h-3 bg-muted/30 rounded-full overflow-hidden relative border border-white/5 backdrop-blur-sm">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: "linear-gradient(90deg, hsl(var(--primary)/0.6), hsl(var(--primary)))",
            boxShadow: "0 0 15px hsla(var(--primary)/0.3)"
          }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glossy overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-20" />

          {/* Animated gleam */}
          <motion.div
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ left: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Typing insight with cursor
const TypingInsight = ({ text, delay }: { text: string; delay: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowCursor(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 500);
        }
      }, 15);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <div className="flex items-start gap-4 py-1">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.5 }}
        className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"
      />
      <p className="text-foreground/70 text-base leading-relaxed font-light">
        {displayed}
        {showCursor && <span className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 animate-pulse" />}
      </p>
    </div>
  );
};

const PatternPreview = ({ scores, signals, onComplete }: PatternPreviewProps) => {
  const { t } = useLanguage();

  const dominantAxis = (Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1])[0];

  const axisLabels: Record<string, string> = {
    minimalism: "minimalism and restraint",
    warmth: "warmth and organic texture",
    social: "social openness and gathering",
    structure: "structure and intentional order",
    novelty: "novelty and expressive exploration",
  };

  const insights: string[] = [];
  if (scores.minimalism > 6) insights.push("You consistently chose clean, uncluttered compositions.");
  if (scores.warmth > 6) insights.push("Natural materials and warm tones appear throughout your selections.");
  if (scores.social > 6) insights.push("Openness and communal spaces resonate strongly with you.");
  if (scores.structure > 6) insights.push("Ordered, curated environments feel instinctively right.");
  if (scores.novelty > 6) insights.push("You're drawn to the unexpected — convention doesn't define you.");

  if (signals.selectedAdjectives.length > 0) {
    insights.push(`Your chosen context — ${signals.selectedAdjectives.slice(0, 2).join(" & ")} — grounds this aesthetic.`);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-full flex-col items-center justify-center p-6 lg:p-12 w-full max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start w-full">
        {/* Left Side: Summary & Insights */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-px bg-primary/50" />
              <p className="tracking-[0.3em] text-[10px] uppercase font-bold text-primary/60">{t("pattern_subtitle")}</p>
            </div>

            <h2 className="font-serif-display text-4xl md:text-6xl font-medium leading-tight">
              {t("pattern_title")}
            </h2>

            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              {t("pattern_lean")}{" "}
              <span className="text-foreground border-b border-primary/30 italic">{axisLabels[dominantAxis[0]] || dominantAxis[0]}</span>.
            </p>
          </motion.div>

          <div className="space-y-6 pt-8 border-t border-border/40">
            {insights.map((insight, i) => (
              <TypingInsight key={i} text={insight} delay={0.5 + i * 1.2} />
            ))}
          </div>
        </div>

        {/* Right Side: Score Visualization */}
        <div className="bg-muted/5 rounded-[2.5rem] p-8 md:p-12 border border-border/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="relative z-10 space-y-8">
            {(Object.entries(scores) as [string, number][]).map(([key, val], i) => (
              <AnimatedBar
                key={key}
                label={axisLabels[key]?.split(" and ")[0] || key}
                value={val}
                delay={0.3 + i * 0.1}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 pt-8 border-t border-border/20 flex flex-col items-center"
          >
            <button
              onClick={onComplete}
              className="group relative px-12 py-5 bg-foreground text-background font-bold tracking-[0.2em] text-xs uppercase overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 group-hover:text-primary-foreground transition-colors">
                {t("pattern_reveal")}
              </span>
            </button>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground/50">Finalizing Identity Profile</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatternPreview;
