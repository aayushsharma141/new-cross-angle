import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

const timelineMarkers = [
  { time: "00:00", label: "Client Reality" },
  { time: "00:22", label: "Design Challenges" },
  { time: "00:45", label: "Key Decisions" },
  { time: "01:08", label: "Room Walkthrough" },
  { time: "01:30", label: "Before / After" },
];

export const ProjectVideo = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="border-t border-white/5">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-full cursor-pointer group"
        style={{ aspectRatio: "21/9" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-105"
          style={{ backgroundImage: "url('/images/projects/discovery/lifestyle-4.jpg')" }}
        />

        {/* Dark overlay — stronger to feel cinematic */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Center content — always visible */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          {/* Duration badge */}
          <span className="text-[10px] font-mono tracking-[0.3em] text-stone-400 uppercase">
            1m 30s
          </span>

          {/* Play button */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-primary/80 group-hover:border-primary transition-all duration-500">
            <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />
          </div>

          {/* Label */}
          <div className="text-center">
            <p className="text-lg md:text-2xl font-serif text-white tracking-tight">
              Watch Transformation Story
            </p>
          </div>
        </div>

        {/* Timeline — revealed on hover only */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-8 px-8 md:px-16"
            >
              <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar">
                {timelineMarkers.map((marker, idx) => (
                  <div key={idx} className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] font-mono text-primary">{marker.time}</span>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-stone-300">{marker.label}</span>
                    {idx < timelineMarkers.length - 1 && (
                      <span className="w-8 h-px bg-white/15 ml-3 hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default ProjectVideo;
