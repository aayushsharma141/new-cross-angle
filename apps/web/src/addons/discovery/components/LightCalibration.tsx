import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AestheticScores } from "@/types/discovery";

interface Props {
  onComplete: (scores: Partial<AestheticScores>, lightName?: string) => void;
}

const LIGHTING_OPTIONS = [
  { name: "Warm Ambient", description: "Golden, inviting", color: "#dca750", scores: { warmth: 3, novelty: 0 } },
  { name: "Cool Daylight", description: "Bright & energetic", color: "#95c2df", scores: { minimalism: 2, structure: 1 } },
  { name: "Candlelight", description: "Intimate & cozy", color: "#d58e48", scores: { warmth: 3, social: -1 } },
  { name: "Dramatic", description: "Bold & luxurious", color: "#363148", scores: { structure: 2, novelty: 3 } },
  { name: "Cove / Hidden", description: "Soft indirect glow", color: "#dec29a", scores: { minimalism: 3, warmth: 1 } },
  { name: "Layered", description: "Multiple moods", color: "#b68a5c", scores: { social: 2, structure: 2 } },
];

const LightCalibration = ({ onComplete }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  const confirm = () => {
    if (!selected) return;
    const opt = LIGHTING_OPTIONS.find(o => o.name === selected);
    onComplete(opt?.scores || {}, selected);
  };

  const selectedOpt = LIGHTING_OPTIONS.find(o => o.name === selected);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col w-full h-full min-h-screen overflow-hidden bg-black"
    >
      {/* ── FULL SCREEN VISUALIZER ─────────────────────────── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Base Image */}
        <img 
          src="/common_bedroom_base.png" 
          alt="Bedroom Canvas" 
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
        
        {/* Multi-layer Light Tint Mixing */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-80 mix-blend-multiply pointer-events-none"
          style={{ 
            backgroundColor: selectedOpt ? selectedOpt.color : "transparent"
          }}
        />
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-50 mix-blend-color pointer-events-none"
          style={{ 
            backgroundColor: selectedOpt ? selectedOpt.color : "transparent"
          }}
        />

        {/* Ambient Gradients for Text Legibility only at the very top and very bottom */}
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none h-48" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
      </div>

      {/* ── TOP HEADER (TITLE & PROGRESS) ──────────────────── */}
      <div className="relative z-50 w-full px-6 py-8 md:px-10 md:py-12 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full">
          {/* Top Progress Line */}
          <div className="w-full h-[3px] bg-white/20 rounded-full mb-6 overflow-hidden max-w-sm pointer-events-auto">
            <div className="h-full bg-white w-[70%]" />
          </div>

          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase mb-2 drop-shadow-md font-sans">
            ATMOSPHERE CALIBRATION
          </p>
          <h2 className="text-[28px] md:text-4xl font-serif text-white font-semibold leading-tight drop-shadow-lg max-w-2xl">
            How should your home feel in the evening?
          </h2>
        </div>
      </div>

      {/* ── BOTTOM SELECTION PANEL (SINGLE ROW) ────── */}
      <div className="relative z-50 mt-auto w-full px-4 pb-6 pt-12 md:px-10 md:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col w-full">
          
          <div className="flex items-center justify-between mb-4 px-2">
             <p className="text-white/80 text-xs md:text-sm font-light drop-shadow">
               Select a mood to visualize its effect on the space
             </p>
             {selectedOpt && (
                <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white shadow-lg">
                  <div className="w-2 h-2 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: selectedOpt.color }} />
                  <span className="text-[10px] tracking-widest uppercase font-mono">{selectedOpt.name}</span>
                </div>
             )}
          </div>

          {/* Swatches Container - Single Row Scrollable */}
          <div className="flex flex-row overflow-x-auto w-full gap-3 pb-4 scrollbar-hide snap-x items-center" role="radiogroup" aria-label="Lighting mood selection">
            {LIGHTING_OPTIONS.map((opt) => {
              const isCurrent = selected === opt.name;
              return (
                <button
                  type="button"
                  key={opt.name}
                  onClick={() => setSelected(opt.name)}
                  className={`snap-center shrink-0 group flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 border focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2 focus-visible:outline-none backdrop-blur-md ${
                    isCurrent
                      ? "border-white/50 bg-white/20 text-white shadow-xl scale-[1.02]"
                      : "border-white/10 bg-black/20 text-white/90 hover:bg-black/40 hover:border-white/30"
                  }`}
                  {...(isCurrent ? { "aria-pressed": "true" } : { "aria-pressed": "false" })}
                >
                  <div
                    className={`w-8 h-8 rounded-full shadow-inner border border-white/20 transition-transform duration-300 relative shrink-0 ${
                      isCurrent ? "scale-110 shadow-lg ring-2 ring-white/50" : "group-hover:scale-110"
                    }`}
                    style={{ backgroundColor: opt.color }}
                  >
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border border-white opacity-60 animate-ping" />
                    )}
                  </div>
                  <div className="flex flex-col items-start justify-center text-left pr-2">
                    <span className={`text-[13px] md:text-[14px] font-semibold tracking-wide transition-colors ${
                      isCurrent ? "text-white drop-shadow-md" : "text-white/90"
                    }`}>
                      {opt.name}
                    </span>
                    <span className={`text-[10px] md:text-[11px] font-light transition-colors ${
                      isCurrent ? "text-white/80" : "text-white/60"
                    }`}>
                      {opt.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/20">
            <button 
              className="px-6 py-3 rounded-xl border border-white/30 bg-black/20 backdrop-blur-md text-white text-xs font-semibold hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-colors"
              type="button"
            >
              &larr; Back
            </button>
            <button
              onClick={confirm}
              disabled={!selected}
              className={`px-10 py-3 rounded-xl text-xs font-semibold tracking-widest uppercase focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-all duration-300 text-center backdrop-blur-md ${
                selected
                  ? "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
                  : "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
              }`}
              type="button"
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LightCalibration;
