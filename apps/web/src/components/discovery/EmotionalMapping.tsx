import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { AestheticScores } from "@/types/discovery";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, sliderValues?: { label: string; value: number }[]) => void;
}

const sliders = [
  { left: "CALM & STILL", right: "ENERGIZED & ACTIVE", key: "warmth" as keyof AestheticScores, invert: false },
  { left: "PRIVATE SANCTUARY", right: "SOCIAL HUB", key: "social" as keyof AestheticScores, invert: false },
  { left: "MINIMAL & CLEAN", right: "LAYERED & RICH", key: "minimalism" as keyof AestheticScores, invert: true },
  { left: "ORGANIC FLOW", right: "STRUCTURED ORDER", key: "structure" as keyof AestheticScores, invert: false },
];

// Dynamic mid-labels based on slider position
const getMidLabel = (index: number, value: number): string => {
  const labels: string[][] = [
    ["Deep stillness", "Quietly present", "Balanced energy", "Actively engaged", "Full momentum"],
    ["Complete solitude", "Selective company", "Adaptable space", "Open to visitors", "Always gathering"],
    ["Bare essentials", "Clean simplicity", "Curated balance", "Textured layers", "Rich maximalism"],
    ["Intuitive flow", "Gentle rhythm", "Flexible structure", "Clear systems", "Precise order"],
  ];
  const idx = Math.min(4, Math.floor(value / 20));
  return labels[index]?.[idx] || "";
};

const EmotionalMapping = ({ onComplete }: Props) => {
  const [values, setValues] = useState<number[]>([50, 50, 50, 50]);

  const handleChange = (index: number, val: number) => {
    setValues((prev) => prev.map((v, i) => (i === index ? val : v)));
  };

  // Compute ambient warmth based on first slider
  const ambientHue = useMemo(() => {
    const warmth = values[0];
    // Shift from cool blue (220) to warm amber (30)
    return 220 - (warmth / 100) * 190;
  }, [values[0]]);

  const confirm = () => {
    const scores: Partial<AestheticScores> = {};
    const sliderData = sliders.map((s, i) => {
      const normalized = Math.round((values[i] / 100) * 10);
      scores[s.key] = (scores[s.key] || 0) + (s.invert ? 10 - normalized : normalized);
      return { label: `${s.left} — ${s.right}`, value: values[i] };
    });
    onComplete(scores, sliderData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-full flex-col items-center justify-center px-6"
    >
      {/* Dynamic ambient background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, hsl(${ambientHue} 20% 93% / 0.6) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-lg bg-card/90 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-sm border border-border/30">
        <h2 className="font-serif-display text-2xl md:text-3xl mb-2 text-center">Emotional Environment</h2>
        <p className="text-muted-foreground mb-10 text-center text-sm">
          Adjust the atmosphere to match your ideal state of being.
        </p>

        <div className="space-y-10">
          {sliders.map((s, i) => (
            <motion.div
              key={s.key + i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex justify-between mb-1">
                <span className="tracking-premium text-muted-foreground">{s.left}</span>
                <span className="tracking-premium text-muted-foreground">{s.right}</span>
              </div>
              {/* Dynamic mid-label */}
              <p className="text-center text-xs text-foreground/60 font-serif-display italic mb-2">
                {getMidLabel(i, values[i])}
              </p>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={values[i]}
                  onChange={(e) => handleChange(i, Number(e.target.value))}
                  className="w-full h-[2px] bg-border appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--gold)/0.4)]
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-0"
                />
              </div>
              {/* Thin animated divider */}
              {i < sliders.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  className="gold-divider mt-6 origin-left"
                />
              )}
            </motion.div>
          ))}
        </div>

        <button
          onClick={confirm}
          className="mt-10 w-full py-4 bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
        >
          LOCK IN ATMOSPHERE
        </button>
      </div>
    </motion.div>
  );
};

export default EmotionalMapping;
