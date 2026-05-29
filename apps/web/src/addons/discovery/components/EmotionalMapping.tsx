import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AestheticScores } from "@/types/discovery";
import { SlidersHorizontal } from "lucide-react";
import { SLIDER_WEIGHTS } from "../core/weights";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, sliderValues?: { label: string; value: number }[]) => void;
}

const sliders = [
  { left: "CALM & STILL", right: "ENERGIZED & ACTIVE", ...SLIDER_WEIGHTS[0] },
  { left: "PRIVATE SANCTUARY", right: "SOCIAL HUB", ...SLIDER_WEIGHTS[1] },
  { left: "MINIMAL & CLEAN", right: "LAYERED & RICH", ...SLIDER_WEIGHTS[2] },
  { left: "ORGANIC FLOW", right: "STRUCTURED ORDER", ...SLIDER_WEIGHTS[3] },
];

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
      className="flex h-full flex-col items-center justify-center px-6 py-12 w-full"
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-4"
      >
        <SlidersHorizontal size={13} className="text-[#1a1a1a]/60" />
        <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#1a1a1a]/60">
          Tune Your Environment
        </p>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="-display text-3xl md:text-4xl font-normal text-[#1a1a1a]/90 text-center max-w-lg leading-tight mb-5"
      >
        Your Personal Space
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[#1a1a1a]/45 text-center max-w-md text-[15px] mb-8"
      >
        Move each slider to discover the balance that feels right to you.
      </motion.p>

      {/* Sliders Container */}
      <div className="w-full max-w-2xl space-y-12">
        {sliders.map((s, i) => (
          <motion.div
            key={s.key + i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="relative"
          >
            <div className="flex justify-between mb-3 px-2">
              <span className="text-[11px] text-[#1a1a1a]/70 font-semibold uppercase tracking-[0.2em] font-mono">{s.left}</span>
              <span className="text-[11px] text-[#1a1a1a]/70 font-semibold uppercase tracking-[0.2em] font-mono">{s.right}</span>
            </div>
            
            {/* Custom Range Slider Wrapper */}
            <div className="relative h-10 flex items-center group cursor-pointer">
              {/* Custom Track Background */}
              <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-[6px] bg-[#1a1a1a]/[0.06] rounded-full pointer-events-none shadow-[inset_0_1px_3px_rgba(26,26,26,0.08)]" />
              
              {/* Center Anchor Tick */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[14px] bg-[#1a1a1a]/15 rounded-full pointer-events-none z-0 transition-opacity duration-300" />

              {/* Custom Active Track */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] bg-gradient-to-r from-[#8b6f47]/80 to-[#8b6f47] rounded-full pointer-events-none transition-all duration-75 shadow-[0_0_12px_rgba(139,111,71,0.3)]"
                style={{ width: `${values[i]}%` }}
              />

              <input
                type="range"
                min={0}
                max={100}
                aria-label={`${s.left} to ${s.right}: ${getMidLabel(i, values[i])}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={values[i]}
                aria-valuetext={getMidLabel(i, values[i])}
                value={values[i]}
                onChange={(e) => handleChange(i, Number(e.target.value))}
                className="peer w-full h-full opacity-0 cursor-pointer absolute z-20 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-moz-range-thumb]:w-10 [&::-moz-range-thumb]:h-10 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-transparent"
              />
              
              {/* Custom Thumb */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 -ml-3.5 w-7 h-7 bg-white border-[2px] border-[#8b6f47] rounded-full shadow-[0_4px_16px_rgba(139,111,71,0.25)] z-10 pointer-events-none flex items-center justify-center group-hover:scale-110 group-active:scale-95 peer-focus-visible:ring-2 peer-focus-visible:ring-[#8b6f47] peer-focus-visible:ring-offset-2 transition-transform duration-300"
                style={{ left: `${values[i]}%` }}
              >
                {/* Sensory Bloom on active/hover */}
                <div className="absolute inset-0 bg-[#8b6f47]/15 rounded-full blur-[6px] scale-[1.8] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </div>
            
            {/* Dynamic mid-label */}
            <div className="relative mt-3 pointer-events-none w-full text-center h-[24px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={getMidLabel(i, values[i])}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="-display italic text-[16px] xl:text-[18px] text-[#8b6f47] font-semibold tracking-wide"
                >
                  {getMidLabel(i, values[i])}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={confirm}
        className="mt-12 px-14 py-4 bg-[#806640] text-white/95 text-[11px] xl:text-[12px] font-medium tracking-[0.25em] uppercase hover:bg-[#735c39] hover:shadow-[0_8px_24px_rgba(128,102,64,0.15)] focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-700 rounded-[6px] shadow-[0_2px_10px_rgba(128,102,64,0.08)]"
      >
        CONTINUE
      </motion.button>
    </motion.div>
  );
};

export default EmotionalMapping;
