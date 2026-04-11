import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { TactileMaterial } from "@/components/ui/TactileMaterial";

interface Hotspot {
  id: string;
  x: number; // percentage width
  y: number; // percentage height
  title: string;
  description: React.ReactNode;
  angle: "angle01" | "angle02";
}

const hotspots: Hotspot[] = [
  {
    id: "h1",
    x: 45,
    y: 55,
    title: "Fluted Wall Paneling",
    description: (<>Custom fluted <TactileMaterial name="wood paneling" texture="wood" /> adds acoustic warmth and tactile depth to the living area, creating a continuous visual rhythm.</>),
    angle: "angle01",
  },
  {
    id: "h2",
    x: 65,
    y: 75,
    title: "Seamless Flooring",
    description: (<>Large format <TactileMaterial name="Italian marble" texture="marble" /> creates an unbroken visual flow, reflecting the ambient light and expanding the sense of space.</>),
    angle: "angle01",
  },
  {
    id: "h3",
    x: 35,
    y: 40,
    title: "Strategic Lighting",
    description: "Recessed ambient profiles wash the walls without harsh glare, setting a cinematic mood for the entire entryway.",
    angle: "angle02",
  },
  {
    id: "h4",
    x: 55,
    y: 65,
    title: "Hidden Storage",
    description: "Flush, handle-less push-to-open cabinetry keeps the entry clutter-free while maximizing utility.",
    angle: "angle02",
  }
];

// Placeholder high-quality images 
const IMG_ANGLE_01 = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2000"; 
const IMG_ANGLE_02 = "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000";

export const CrossAngleShowcase = () => {
  const [activeAngle, setActiveAngle] = useState<"angle01" | "angle02">("angle01");
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Close panel if angle changes
  useEffect(() => {
    setActiveHotspot(null);
  }, [activeAngle]);

  const activeHotspots = hotspots.filter(h => h.angle === activeAngle);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] bg-site-bg overflow-hidden flex flex-col justify-end pb-[10vh]">
      {/* Cinematic Backgrounds */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          src={IMG_ANGLE_01} 
          alt="Angle 01"
          className="absolute inset-0 w-full h-full object-cover"
          initial={false}
          animate={{ 
            opacity: activeAngle === "angle01" ? 1 : 0, 
            scale: activeAngle === "angle01" ? 1 : 1.05,
            filter: activeHotspot ? "brightness(0.6) blur(2px)" : "brightness(1) blur(0px)"
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.img 
          src={IMG_ANGLE_02} 
          alt="Angle 02"
          className="absolute inset-0 w-full h-full object-cover"
          initial={false}
          animate={{ 
            opacity: activeAngle === "angle02" ? 1 : 0, 
            scale: activeAngle === "angle02" ? 1 : 1.05,
            filter: activeHotspot ? "brightness(0.6) blur(2px)" : "brightness(1) blur(0px)"
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Hotspots */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence>
          {activeHotspots.map((hotspot) => (
            <motion.button
              key={hotspot.id}
              onClick={() => setActiveHotspot(hotspot)}
              className="absolute group flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-pointer"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="absolute inline-flex w-full h-full rounded-full bg-site-gold opacity-30 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-transform group-hover:scale-150" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Slide-out Side Panel (The Design Move) */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 z-50 w-full max-w-[400px] h-full bg-site-bg-section/80 backdrop-blur-3xl border-l border-white/5 hidden md:flex flex-col pt-24 px-8 pb-8"
          >
            <button 
              onClick={() => setActiveHotspot(null)}
              aria-label="Close panel"
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-site-gold mb-4 block">The Design Move</span>
            <h3 className="font-display text-3xl text-white mb-6">{activeHotspot.title}</h3>
            <p className="text-white/70 leading-relaxed text-sm">
              {activeHotspot.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Hotspot Override (Bottom Sheet) */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-50 w-full bg-site-bg-section border-t border-white/5 p-6 md:hidden rounded-t-[32px] shadow-2xl"
          >
            <button 
              onClick={() => setActiveHotspot(null)}
              aria-label="Close panel"
              className="absolute top-5 right-6 text-white/50"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-site-gold mb-2 block text-center">Design Detail</span>
            <h3 className="font-display text-2xl text-white mb-3 text-center">{activeHotspot.title}</h3>
            <p className="text-white/70 leading-relaxed text-sm text-center mb-6">
              {activeHotspot.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Perspective Toggle Switch */}
      <div className="relative z-20 flex justify-center w-full px-4 text-center pb-[env(safe-area-inset-bottom)]">
        <div className="inline-flex items-center p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl mx-auto">
          <button
            onClick={() => setActiveAngle("angle01")}
            className={`relative px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium transition-colors z-10 ${
              activeAngle === "angle01" ? "text-black" : "text-white/40 hover:text-white"
            }`}
          >
            01. The Lounge
            {activeAngle === "angle01" && (
              <motion.div
                layoutId="activeAngleBg"
                className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                transition={{ type: "spring", duration: 0.6 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveAngle("angle02")}
            className={`relative px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium transition-colors z-10 ${
              activeAngle === "angle02" ? "text-black" : "text-white/40 hover:text-white"
            }`}
          >
            02. The Entry
            {activeAngle === "angle02" && (
              <motion.div
                layoutId="activeAngleBg"
                className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                transition={{ type: "spring", duration: 0.6 }}
              />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
