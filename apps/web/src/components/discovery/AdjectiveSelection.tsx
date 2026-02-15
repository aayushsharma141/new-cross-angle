import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ADJECTIVE_OPTIONS } from "@/constants/discovery";
import { AestheticScores } from "@/types/discovery";
import { Pen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface AdjectiveSelectionProps {
  onComplete: (partial: Partial<AestheticScores>, adjectives: string[], freeText: string) => void;
}

// Varying sizes for organic word cloud feel
const wordSizes: Record<string, string> = {
  Calm: "text-base", Structured: "text-sm", Bold: "text-lg", Playful: "text-base",
  Elegant: "text-lg", Moody: "text-sm", Warm: "text-lg", Minimal: "text-base",
  Eclectic: "text-sm", Soft: "text-base", Grounded: "text-sm", Luxurious: "text-lg",
  Organic: "text-base", Modern: "text-sm", Timeless: "text-lg",
};

const AdjectiveSelection = ({ onComplete }: AdjectiveSelectionProps) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");

  const toggle = (adj: string) => {
    setSelected((prev) =>
      prev.includes(adj) ? prev.filter((a) => a !== adj) : prev.length < 5 ? [...prev, adj] : prev
    );
  };

  const handleSubmit = () => {
    const scoreMap: Record<string, Partial<AestheticScores>> = {
      Calm: { warmth: 1, social: -1 }, Structured: { structure: 2 },
      Bold: { social: 1, minimalism: -1 }, Playful: { social: 1, warmth: 1 },
      Elegant: { structure: 1, minimalism: 1 }, Moody: { warmth: -1, minimalism: 1 },
      Warm: { warmth: 2 }, Minimal: { minimalism: 2 },
      Eclectic: { minimalism: -2, social: 1 }, Soft: { warmth: 1, structure: -1 },
      Grounded: { warmth: 1, structure: 1 }, Luxurious: { structure: 1, warmth: 1 },
      Organic: { warmth: 2, minimalism: -1 }, Modern: { minimalism: 1, structure: 1 },
      Timeless: { structure: 2, minimalism: 1 },
    };

    const combined: Partial<AestheticScores> = {};
    for (const adj of selected) {
      const s = scoreMap[adj];
      if (s) {
        for (const [k, v] of Object.entries(s)) {
          const key = k as keyof AestheticScores;
          combined[key] = (combined[key] || 0) + v;
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
      className="flex h-full flex-col items-center justify-center px-6 py-20"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-4">
        <Pen size={14} className="text-muted-foreground" />
        <p className="tracking-premium text-muted-foreground">{t("adjective_subtitle")}</p>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif-display text-3xl md:text-4xl font-medium text-center max-w-lg leading-tight mb-4"
      >
        {t("adjective_title")}
      </motion.h2>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-muted-foreground text-center max-w-md mb-10">
        {t("adjective_desc")}
      </motion.p>

      {/* Organic word cloud */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center items-center gap-3 max-w-xl mb-6"
      >
        {ADJECTIVE_OPTIONS.map((adj, i) => {
          const isActive = selected.includes(adj);
          const sizeClass = wordSizes[adj] || "text-sm";
          return (
            <motion.button
              key={adj}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.03 }}
              onClick={() => toggle(adj)}
              className={`relative px-5 py-2.5 ${sizeClass} font-medium tracking-wide border transition-all duration-300 overflow-hidden ${isActive
                  ? "text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-foreground/30 hover:bg-accent"
                }`}
            >
              {/* Ink bleed background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary"
                  initial={{ scale: 0, borderRadius: "50%" }}
                  animate={{ scale: 2, borderRadius: "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ transformOrigin: "center" }}
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
            className="flex flex-wrap justify-center gap-2 mb-8 py-3 px-4 border-t border-b border-border/50"
          >
            <span className="text-xs tracking-premium text-muted-foreground mr-2 self-center">YOUR WORDS</span>
            {selected.map((adj) => (
              <motion.span
                key={adj}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-serif-display text-base italic text-foreground"
              >
                {adj}
                {selected.indexOf(adj) < selected.length - 1 && <span className="text-muted-foreground mx-1">·</span>}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-full max-w-md mb-10">
        <label className="block text-sm text-muted-foreground mb-2">{t("adjective_freetext")}</label>
        <input
          type="text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder={t("adjective_placeholder")}
          className="w-full border-b border-border bg-transparent py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors font-serif-display italic"
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={handleSubmit}
        disabled={selected.length < 3 && !freeText}
        className="px-10 py-4 bg-primary text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {t("adjective_continue")}
      </motion.button>

      <p className="mt-4 text-xs text-muted-foreground">
        {selected.length}/5 {t("adjective_count")}
      </p>
    </motion.div>
  );
};

export default AdjectiveSelection;
