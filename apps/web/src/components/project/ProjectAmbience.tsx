import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AmbienceMode = "Day" | "Evening" | "Night";

const ambienceData: Record<AmbienceMode, { label: string; sublabel: string; image: string; tag: string }> = {
  Day: {
    label: "Morning Clarity",
    sublabel: "Natural daylight reveals every curated detail",
    image: "/images/projects/discovery/reflect-morning-silence.jpg",
    tag: "07:30 AM",
  },
  Evening: {
    label: "Golden Hour",
    sublabel: "Warm amber tones transform the entire atmosphere",
    image: "/images/projects/discovery/reflect-evening-dinner.jpg",
    tag: "06:45 PM",
  },
  Night: {
    label: "Nocturnal Elegance",
    sublabel: "A sanctuary of light against the evening darkness",
    image: "/images/projects/discovery/reflect-night-crisp.jpg",
    tag: "10:00 PM",
  },
};

const modes: AmbienceMode[] = ["Day", "Evening", "Night"];

interface ProjectAmbienceProps {
  dayImage?: string;
  eveningImage?: string;
  nightImage?: string;
}

const ProjectAmbience = ({ dayImage, eveningImage, nightImage }: ProjectAmbienceProps) => {
  const [active, setActive] = useState<AmbienceMode>("Day");

  const images: Record<AmbienceMode, string> = {
    Day: dayImage || ambienceData.Day.image,
    Evening: eveningImage || ambienceData.Evening.image,
    Night: nightImage || ambienceData.Night.image,
  };

  return (
    <section className="border-y border-white/5 bg-black/50 py-24 md:py-32 relative overflow-hidden group">
      {/* Background Image layers */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`Room in ${active} lighting`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        
        {/* Gradient overlays for cinematic effect */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 h-[60vh] md:h-[70vh] flex flex-col justify-between pointer-events-none">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="pointer-events-auto"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary flex items-center gap-4 mb-6">
            <span className="w-8 h-px bg-primary/50" /> Time & Light
          </span>
          <h3 className="text-4xl md:text-5xl text-white tracking-tight font-serif font-normal">
            Living Atmospheres
          </h3>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap gap-2 md:gap-4 backdrop-blur-md bg-black/40 p-2 rounded-2xl w-max border border-white/10 pointer-events-auto"
        >
          {modes.map((mode) => {
            const isActive = active === mode;
            return (
              <button
                key={mode}
                onClick={() => setActive(mode)}
                className={`relative px-6 py-3 rounded-xl text-sm font-medium tracking-wide transition-all border ${
                  isActive 
                    ? "text-white bg-white/10 border-white/20" 
                    : "text-stone-400 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                {ambienceData[mode].label}
              </button>
            )
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectAmbience;
