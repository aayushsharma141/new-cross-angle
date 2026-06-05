import { useState } from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";

type LightMode = "day" | "evening" | "night" | "ambient";

interface ModeConfig {
  label: string;
  overlayClass: string;
  overlayOpacity: string;
  blendMode: string;
}

const MODES: Record<LightMode, ModeConfig> = {
  day: {
    label: "Day",
    overlayClass: "bg-transparent",
    overlayOpacity: "opacity-0",
    blendMode: "",
  },
  evening: {
    label: "Evening",
    overlayClass: "bg-orange-900",
    overlayOpacity: "opacity-50",
    blendMode: "mix-blend-multiply",
  },
  night: {
    label: "Night",
    overlayClass: "bg-blue-950",
    overlayOpacity: "opacity-80",
    blendMode: "mix-blend-multiply",
  },
  ambient: {
    label: "Ambient",
    overlayClass: "bg-stone-900",
    overlayOpacity: "opacity-60",
    blendMode: "mix-blend-multiply",
  },
};

const LIGHT_BUTTONS: LightMode[] = ["day", "evening", "night", "ambient"];

const HubLightExperience = () => {
  const [activeMode, setActiveMode] = useState<LightMode>("ambient");
  const mode = MODES[activeMode];

  return (
    <div className="px-6 max-w-6xl mx-auto w-full py-24">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">The Science of Light</span>
          </div>
          <h2 className="text-2xl md:text-3xl text-white tracking-tight font-serif font-normal mb-3">
            Experience Different Lights
          </h2>
          <p className="text-sm text-stone-400 font-light">
            Imagine living in the space at different times of day.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-950"
      >
        {/* Base Image */}
        <Image
          src="/images/projects/discovery/lifestyle-5.jpg"
          alt="Interior lighting preview"
          className="absolute inset-0 h-full w-full"
          imageClassName="brightness-110"
          width={1800}
          height={772}
        />

        {/* Overlay blend layer — transitions between modes */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all ease-in-out ${mode.overlayClass} ${mode.overlayOpacity} ${mode.blendMode}`}
          style={{ transitionDuration: '1500ms' }}
        />

        {/* Mode Pill Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex gap-1 z-20">
          {LIGHT_BUTTONS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-5 py-2 rounded-full text-[10px] font-medium tracking-widest uppercase transition-all duration-300
                ${activeMode === m
                  ? "bg-white text-black"
                  : "text-stone-400 hover:text-white"
                }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HubLightExperience;
