import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { lightOptions } from "@/constants/discovery";
import { AestheticScores } from "@/types/discovery";
import { Moon, CloudSun, Sun, Zap } from "lucide-react";

const icons = [Moon, CloudSun, Sun, Zap];

interface Props {
  onComplete: (scores: Partial<AestheticScores>, lightName?: string) => void;
}

const LightCalibration = ({ onComplete }: Props) => {
  const [selected, setSelected] = useState(50);
  const activeIndex = Math.min(Math.floor(selected / 25), 3);
  const opt = lightOptions[activeIndex];

  // Compute light temperature for gradient layers
  const lightGradient = useMemo(() => {
    const t = selected / 100;
    const warmHue = 40 + (1 - t) * 10; // amber
    const coolHue = 200 + t * 20; // blue
    const hue = warmHue * (1 - t) + coolHue * t;
    const sat = 30 + Math.abs(t - 0.5) * 40;
    const light = 85 + (1 - Math.abs(t - 0.5)) * 10;
    return {
      bg: `radial-gradient(ellipse at 50% 30%, hsl(${hue} ${sat}% ${light}%) 0%, hsl(${hue} ${sat * 0.5}% ${light - 15}%) 100%)`,
      rayOpacity: 0.05 + t * 0.1,
      rayAngle: -30 + t * 60,
    };
  }, [selected]);

  const confirm = () => {
    onComplete(opt.scores, opt.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-full flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: lightGradient.bg, transition: "background 0.8s ease" }}
    >
      {/* Animated light rays */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: "2px",
            height: "120vh",
            top: "-10vh",
            left: `${30 + i * 20}%`,
            background: `linear-gradient(to bottom, transparent, hsl(var(--gold) / ${lightGradient.rayOpacity}), transparent)`,
            transformOrigin: "top center",
          }}
          animate={{
            rotate: lightGradient.rayAngle + i * 15,
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            rotate: { duration: 0.8, ease: "easeOut" },
            opacity: { duration: 3, repeat: Infinity, delay: i * 0.5 },
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-md p-8 md:p-12 rounded-lg shadow-lg border border-border/20 text-center">
        <div className="relative h-12 w-full mb-2 flex justify-center items-center">
          {icons.map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={false}
              animate={{
                opacity: i === activeIndex ? 1 : 0,
                scale: i === activeIndex ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            >
              <Icon size={28} className="text-foreground/70" />
            </motion.div>
          ))}
        </div>

        <motion.h2
          key={opt.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-serif-display text-2xl md:text-3xl mb-2"
        >
          {opt.name}
        </motion.h2>
        <motion.p
          key={opt.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-sm mb-8"
          style={{ textShadow: `0 0 20px hsl(var(--gold) / 0.1)` }}
        >
          {opt.description}
        </motion.p>

        <input
          type="range"
          min={0}
          max={100}
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="w-full h-[2px] bg-border/50 appearance-none cursor-pointer mb-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(var(--gold)/0.5)]"
        />

        <div className="flex justify-between px-2 mb-8">
          {icons.map((Icon, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === activeIndex ? 1.3 : 1,
                opacity: i === activeIndex ? 1 : 0.3,
              }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Icon size={18} />
            </motion.div>
          ))}
        </div>

        <button
          onClick={confirm}
          className="w-full py-4 bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-opacity shimmer"
        >
          THIS FEELS RIGHT
        </button>
      </div>
    </motion.div>
  );
};

export default LightCalibration;
