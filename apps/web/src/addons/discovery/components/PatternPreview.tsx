import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { AestheticScores, UserSignals } from "@/types/discovery";
import { useLanguage } from "@/hooks/useLanguage";

interface PatternPreviewProps {
  scores: AestheticScores;
  signals: UserSignals;
  onComplete: () => void;
}

// Animated bar component - Kiro P1 style (clean, flat, premium)
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
        <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">{label}</span>
        <span className="text-sm font-serif text-[#1a1a1a]">{value}<span className="text-[10px] text-[#8c8c8c] ml-1 font-sans">/ {maxValue}</span></span>
      </div>
      <div className="h-1.5 bg-[#f0ede6] rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full relative bg-[#233526]"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
};

// Typing insight with cursor - Kiro P1 style
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
        className="mt-2 w-1.5 h-1.5 rounded-full bg-[#c9a96e] shrink-0"
      />
      <p className="text-[#5a5a5a] text-sm leading-relaxed font-light">
        {displayed}
        {showCursor && <span className="inline-block w-0.5 h-4 bg-[#c9a96e] ml-0.5 animate-pulse" />}
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

  // ALCS brief cards
  const alcsCards = [
    signals.propertyType && { label: "Property", value: `${signals.propertyType}${signals.carpetArea ? `, ${signals.carpetArea} sqft` : ''}` },
    signals.projectScope && { label: "Scope", value: signals.projectScope },
    signals.familyStructure && { label: "Household", value: signals.familyStructure },
    signals.cookingRole && { label: "Kitchen Use", value: signals.cookingRole },
    signals.hostingFrequency && { label: "Hosting", value: `${signals.hostingFrequency}` },
    signals.roomConflictResolution && { label: "Space Strategy", value: signals.roomConflictResolution },
    signals.budgetBracket && { label: "Budget", value: signals.budgetBracket },
    signals.luxuryResolution && { label: "Luxury Strategy", value: signals.luxuryResolution.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
  ].filter(Boolean) as { label: string; value: string }[];

  const mustHaveRooms = signals.roomPriorities
    ? Object.entries(signals.roomPriorities).filter(([, v]) => v === 'Must-Have').map(([k]) => k)
    : [];

  const intelligence = signals.consultationIntelligence;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-full flex-col items-center justify-start p-6 lg:p-12 w-full max-w-5xl mx-auto overflow-y-auto"
    >
      {/* ALCS Blueprint Summary */}
      {alcsCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-px bg-[#c9a96e]" />
            <p className="tracking-[0.15em] text-[10px] uppercase font-bold text-[#5a5a5a]">Your Living Brief</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {alcsCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-white border border-[#e8e4dd] rounded-xl p-3"
              >
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1">{card.label}</p>
                <p className="text-sm font-medium text-[#1a1a1a]">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {mustHaveRooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-3 bg-white border border-[#e8e4dd] rounded-xl p-3"
            >
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-2">Must-Have Rooms</p>
              <div className="flex flex-wrap gap-2">
                {mustHaveRooms.map(r => (
                  <span key={r} className="px-3 py-1 text-[10px] font-medium bg-[#233526]/8 text-[#233526] rounded-full border border-[#233526]/15">{r}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Consultation Intelligence Preview Panel */}
          {intelligence && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 border border-[#c9a96e]/25 bg-[#fdf9f2] rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#c9a96e] font-bold">Intelligence Summary</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-0">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#8c8c8c] mb-0.5">Aspiration Alignment</p>
                  <p className="text-sm font-medium text-[#1a1a1a] capitalize">
                    {intelligence.confidence.realism}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#8c8c8c] mb-0.5">Property Fit</p>
                  <p className="text-sm font-medium text-[#1a1a1a] capitalize">
                    {intelligence.propertySuitability.tier.replace(/-/g, ' ')}
                  </p>
                </div>
              </div>
              {intelligence.propertySuitability.softWarning && (
                <p className="mt-3 text-[11px] text-[#5a5a5a] leading-relaxed italic border-t border-[#e8e4dd] pt-3">
                  {intelligence.propertySuitability.softWarning}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start w-full">
        {/* Left Side: Summary & Insights */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-px bg-[#c9a96e]" />
              <p className="tracking-[0.15em] text-[10px] uppercase font-bold text-[#5a5a5a]">{t("pattern_subtitle")}</p>
            </div>

            <h2 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] font-serif leading-tight">
              {t("pattern_title")}
            </h2>

            <p className="text-lg text-[#5a5a5a] font-light leading-relaxed">
              {t("pattern_lean")}{" "}
              <span className="text-[#1a1a1a] border-b border-[#c9a96e] italic">{axisLabels[dominantAxis[0]] || dominantAxis[0]}</span>.
            </p>
          </motion.div>

          <div className="space-y-5 pt-8 border-t border-[#e8e4dd]">
            {insights.map((insight, i) => (
              <TypingInsight key={i} text={insight} delay={0.5 + i * 1.2} />
            ))}
          </div>
        </div>

        {/* Right Side: Score Visualization */}
        <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-sm relative overflow-hidden flex flex-col">
          <div className="relative z-10 space-y-7">
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
            className="mt-10 pt-8 border-t border-[#e8e4dd] flex flex-col items-center"
          >
            <button
              onClick={onComplete}
              className="w-full px-12 py-4 bg-[#233526] text-white rounded-xl text-sm font-medium transition-all duration-300 hover:bg-[#1a281c] shadow-md flex items-center justify-center gap-2"
            >
              {t("pattern_reveal")} &rarr;
            </button>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-[#8c8c8c]">Set Your Budget</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatternPreview;
