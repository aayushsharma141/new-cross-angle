import { motion } from "framer-motion";
import { useState } from "react";
import { lightOptions } from "@/constants/discovery";
import { LIGHT_WEIGHTS } from "../core/weights";
import { AestheticScores } from "@/types/discovery";
import { Moon, CloudSun, Sun, Zap } from "lucide-react";

const icons = [Moon, CloudSun, Sun, Zap];

interface Props {
  onComplete: (scores: Partial<AestheticScores>, lightName?: string) => void;
}

// Warm ambient glow colours per light level (dark-on-dark, no mint)
const ambientGlows = [
  "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(20,12,4,0.98) 0%, #0D0A08 80%)", // low light – deep amber ember
  "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(28,18,8,0.97) 0%, #0D0A08 80%)", // soft light
  "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(24,20,14,0.97) 0%, #0D0A08 80%)", // bright natural
  "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(12,14,20,0.97) 0%, #0D0A08 80%)", // crisp cool
];

// Warm tint on card per level (subtle, never mint)
const cardTints = [
  "rgba(255, 160, 60, 0.06)",   // ember
  "rgba(255, 200, 120, 0.04)",  // warm soft
  "rgba(255, 255, 240, 0.03)",  // clean daylight
  "rgba(160, 200, 255, 0.04)",  // cool clear
];

const LightCalibration = ({ onComplete }: Props) => {
  const [selected, setSelected] = useState(50);
  const activeIndex = Math.min(Math.floor(selected / 25), 3);
  const opt = lightOptions[activeIndex];

  const confirm = () => {
    onComplete(LIGHT_WEIGHTS[opt.name] || {}, opt.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-full w-full flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: ambientGlows[activeIndex], transition: "background 0.8s ease" }}
    >
      {/* Subtle animated ambient orb — matches the light temperature */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: activeIndex < 2
            ? "radial-gradient(ellipse 45% 35% at 50% 55%, rgba(255,165,60,0.08) 0%, transparent 70%)"
            : activeIndex === 2
              ? "radial-gradient(ellipse 45% 35% at 50% 55%, rgba(255,240,200,0.07) 0%, transparent 70%)"
              : "radial-gradient(ellipse 45% 35% at 50% 55%, rgba(160,200,255,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md p-10 md:p-14 text-center border border-white/[0.07] backdrop-blur-md shadow-2xl"
        style={{
          background: `rgba(16,12,10,0.88)`,
          boxShadow: `0 0 80px ${cardTints[activeIndex]}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Animated icon */}
        <div className="relative h-12 w-full mb-4 flex justify-center items-center">
          {icons.map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={false}
              animate={{ opacity: i === activeIndex ? 1 : 0, scale: i === activeIndex ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon size={26} className={i === activeIndex ? "text-white/70" : "text-white/20"} />
            </motion.div>
          ))}
        </div>

        {/* Light name */}
        <motion.h2
          key={opt.name}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif-display text-2xl md:text-3xl text-white/90 mb-2"
        >
          {opt.name}
        </motion.h2>

        {/* Description */}
        <motion.p
          key={opt.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-white/40 text-sm mb-10 italic"
        >
          {opt.description}
        </motion.p>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          title="Light preference slider"
          aria-label="Light preference slider"
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="w-full h-[1px] bg-white/10 appearance-none cursor-pointer mb-6
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(255,255,255,0.3)]"
        />

        {/* Icon strip */}
        <div className="flex justify-between px-1 mb-10">
          {icons.map((Icon, i) => (
            <motion.div
              key={i}
              animate={{ scale: i === activeIndex ? 1.25 : 1, opacity: i === activeIndex ? 0.9 : 0.2 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Icon size={16} className="text-white" />
            </motion.div>
          ))}
        </div>

        {/* CTA — warm cream, not red */}
        <button
          onClick={confirm}
          className="w-full py-4 bg-white/90 text-[#0D0A08] text-xs font-medium tracking-[0.2em] uppercase hover:bg-white transition-colors"
        >
          This is my choice
        </button>
      </div>
    </motion.div>
  );
};

export default LightCalibration;
