import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ADJECTIVE_OPTIONS } from "@/constants/discovery";
import { AestheticScores } from "@/types/discovery";
import { Pen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { ADJECTIVE_WEIGHTS } from "../core/weights";
import { track } from "../infrastructure/analytics/tracker";

interface AdjectiveSelectionProps {
  sessionId: string | null;
  onComplete: (partial: Partial<AestheticScores>, adjectives: string[], freeText: string) => void;
}

const AdjectiveSelection = ({ sessionId, onComplete }: AdjectiveSelectionProps) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");

  const toggle = (adj: string) => {
    const isSelecting = !selected.includes(adj);
    if (isSelecting && selected.length < 5 && sessionId) {
      track("adjective_selected", { adjective: adj, sessionId });
    }
    setSelected((prev) =>
      prev.includes(adj) ? prev.filter((a) => a !== adj) : prev.length < 5 ? [...prev, adj] : prev
    );
  };

  const handleSubmit = () => {
    const combined: Partial<AestheticScores> = {};
    for (const adj of selected) {
      const s = ADJECTIVE_WEIGHTS[adj];
      if (s) {
        for (const [k, v] of Object.entries(s)) {
          if (v !== undefined) {
            const key = k as keyof AestheticScores;
            combined[key] = (combined[key] || 0) + v;
          }
        }
      }
    }
    onComplete(combined, selected, freeText);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center px-6 py-12"
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-4"
      >
        <Pen size={13} className="text-white/30" />
        <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/30">
          {t("adjective_subtitle")}
        </p>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif-display text-3xl md:text-4xl font-normal text-white/90 text-center max-w-lg leading-tight mb-3"
      >
        {t("adjective_title")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/40 text-center max-w-md text-sm mb-10"
      >
        {t("adjective_desc")}
      </motion.p>

      {/* 4-column word grid — no orphaned words */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-4 gap-2 max-w-2xl w-full mb-6"
      >
        {ADJECTIVE_OPTIONS.map((adj, i) => {
          const isActive = selected.includes(adj);
          return (
            <motion.button
              key={adj}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.03 }}
              onClick={() => toggle(adj)}
              className={`
                relative py-3 px-3 text-sm font-light tracking-wide border
                transition-all duration-300 overflow-hidden text-center
                ${isActive
                  ? "border-amber-400/60 text-white"
                  : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/75"
                }
              `}
            >
              {/* Amber ink-bleed background on select */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-amber-400/10"
                  initial={{ scale: 0, borderRadius: "50%" }}
                  animate={{ scale: 3, borderRadius: "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ transformOrigin: "center" }}
                />
              )}
              {/* Left accent line */}
              {isActive && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-400 origin-center"
                />
              )}
              <span className="relative z-10">{adj}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Your Words preview strip */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-8 py-3 px-4 border-t border-b border-white/[0.08] w-full max-w-2xl"
          >
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-white/25 mr-2 self-center">
              Your Words
            </span>
            {selected.map((adj) => (
              <motion.span
                key={adj}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-serif-display text-sm italic text-amber-200/80"
              >
                {adj}
                {selected.indexOf(adj) < selected.length - 1 && (
                  <span className="text-white/20 mx-1">·</span>
                )}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free text input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl mb-8"
      >
        <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-white/25 mb-2">
          {t("adjective_freetext")}
        </label>
        <input
          type="text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder={t("adjective_placeholder")}
          className="w-full border-b border-white/15 bg-transparent py-3 text-white/80 placeholder:text-white/20
            focus:outline-none focus:border-white/40 transition-colors font-serif-display italic text-sm"
        />
      </motion.div>

      {/* CTA — warm cream */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={handleSubmit}
        disabled={selected.length < 3 && !freeText}
        className="px-12 py-4 bg-white/90 text-[#0D0A08] text-xs font-medium tracking-[0.2em] uppercase
          hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t("adjective_continue")}
      </motion.button>

      <p className="mt-4 text-[9px] font-mono text-white/20 uppercase tracking-widest">
        {selected.length}/5 {t("adjective_count")}
      </p>
    </motion.div>
  );
};

export default AdjectiveSelection;
