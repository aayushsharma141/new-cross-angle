import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { visualImages } from "@/constants/discovery";
import { AestheticScores, UserSignals } from "@/types/discovery";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";
import { TiltedCard } from "@/components/ReactBits";
import { useDiscoveryAsset } from "@/hooks/useDiscoveryAsset";
import { toEntityId } from "@/lib/discovery-utils";

interface Props {
  sessionId: string | null;
  signals?: UserSignals;
  onComplete: (scores: Partial<AestheticScores>, selectedIds?: number[]) => void;
  visualPrompts?: {
    id: number;
    url: string;
    assetKey?: string;
    tags: Partial<AestheticScores>;
  }[];
}

const INTENT_PROMPT: Record<string, string> = {
  Peace: "Which environments make you feel truly calm and at ease?",
  Warmth: "Which spaces feel inviting and full of human warmth?",
  Organization: "Which spaces feel efficiently designed and mentally clear?",
  Pride: "Which spaces feel aspirational and deeply impressive?",
};

const VisualInstinct = ({ sessionId, signals, onComplete, visualPrompts }: Props) => {
  const prompts = visualPrompts ?? visualImages;
  const intentPrompt = signals?.intent ? (INTENT_PROMPT[signals.intent] || `Pick ${6} images that feel like "home" to you.`) : `Pick ${6} images that feel like "home" to you.`;
  const [selected, setSelected] = useState<number[]>([]);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const analytics = useAnalytics();
  const MAX = 6;

  const toggle = (id: number) => {
    const isSelecting = !selected.includes(id);
    if (isSelecting && selected.length < MAX && sessionId) {
      const img = prompts.find(i => i.id === id);
      track(analytics, "image_selected", {
        imageId: id,
        tags: img?.tags || {},
        sessionId
      });
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < MAX ? [...prev, id] : prev
    );
  };

  const markLoaded = (id: number) => {
    setLoaded((prev) => new Set([...prev, id]));
  };

  const confirm = () => {
    const scores: Partial<AestheticScores> = {};
    for (const id of selected) {
      const img = prompts.find(i => i.id === id);
      const weights = img?.tags;
      if (weights) {
        for (const [k, v] of Object.entries(weights)) {
          if (v !== undefined) {
            const key = k as keyof AestheticScores;
            scores[key] = (scores[key] || 0) + v;
          }
        }
      }
    }
    onComplete(scores, selected);
  };

  const remaining = MAX - selected.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col w-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex-none text-center pt-8 pb-5 px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-display text-4xl md:text-5xl text-[#1a1a1a] mb-2 font-normal"
        >
          {signals?.intent ? `${signals.intent} Spaces` : "Visual Preferences"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#1a1a1a]/70 text-sm mb-5"
        >
          {intentPrompt}
        </motion.p>

        {/* Progress counter */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-1.5">
            {Array.from({ length: MAX }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-[#1a1a1a]/15 bg-white"
                animate={{
                  background: i < selected.length ? "#8b6f47" : "#ffffff",
                  borderColor: i < selected.length ? "#8b6f47" : "rgba(26,26,26,0.15)",
                  scale: i < selected.length ? [1, 1.25, 1] : 1,
                }}
                transition={{ duration: 0.35 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={remaining}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#8b6f47] font-semibold"
            >
              {remaining > 0 ? `${remaining} more to pick` : "All done!"}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Uniform 4-col grid — predictable, all images same aspect ratio */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {prompts.map((img, idx) => {
            const isSelected = selected.includes(img.id);
            const isMaxed = selected.length >= MAX && !isSelected;

            return (
              <VisualCard
                key={img.id}
                img={img}
                idx={idx}
                isSelected={isSelected}
                isMaxed={isMaxed}
                isLoaded={loaded.has(img.id)}
                toggle={toggle}
                markLoaded={markLoaded}
              />
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex-none py-4 px-8 flex justify-center border-t border-[#e8e4dd] bg-[#ffffff]/85 backdrop-blur-md">
        <button
          type="button"
          onClick={confirm}
          disabled={selected.length < MAX}
          className={`
            px-12 py-3 text-[11px] xl:text-[12px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 rounded-[4px] shadow-sm
            focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2
            ${selected.length === MAX
              ? "bg-[#8b6f47] text-white hover:bg-[#8b6f47]/90 cursor-pointer"
              : "bg-[#1a1a1a]/5 text-[#1a1a1a]/30 cursor-not-allowed"
            }
          `}
        >
          {selected.length === MAX ? "Confirm My Picks" : `Pick ${remaining} more`}
        </button>
      </div>
    </motion.div>
  );
};

export default VisualInstinct;

// ── Visual Card Subcomponent ──────────────────────────────────────────────────

function VisualCard({
  img,
  idx,
  isSelected,
  isMaxed,
  isLoaded,
  toggle,
  markLoaded,
}: {
  img: import("@/types/discovery").VisualImage;
  idx: number;
  isSelected: boolean;
  isMaxed: boolean;
  isLoaded: boolean;
  toggle: (id: number) => void;
  markLoaded: (id: number) => void;
}) {
  const { url } = useDiscoveryAsset("discovery_visual", toEntityId(`visual-${img.id}`), "visual", img.url);

  // Preload image when DAM URL resolves, then mark as loaded
  useEffect(() => {
    if (!url) return;
    const image = new Image();
    image.src = url;
    image.onload = () => markLoaded(img.id);
  }, [url, img.id, markLoaded]);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.025 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => toggle(img.id)}
      aria-pressed={isSelected ? "true" : "false"}
      aria-label={`Image option ${idx + 1}`}
      className={`
        relative w-full aspect-[4/3] rounded-[6px] border overflow-hidden
        transition-all duration-500 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2
        ${isSelected
          ? "border-[#8b6f47] shadow-[0_0_16px_rgba(139,111,71,0.25)] scale-[1.02]"
          : "border-[#1a1a1a]/15 hover:border-[#1a1a1a]/35"
        }
        ${isMaxed ? "opacity-70 cursor-default" : "cursor-pointer"}
      `}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#1a1a1a]/[0.04] animate-pulse" />
      )}

      <div className="absolute inset-0">
        <TiltedCard
          imageSrc={url}
          altText={`Visual option ${idx + 1}`}
          containerHeight="100%"
          containerWidth="100%"
          imageHeight="100%"
          imageWidth="100%"
          scaleOnHover={isMaxed ? 1 : 1.04}
          rotateAmplitude={isMaxed ? 0 : 12}
          showMobileWarning={false}
          showTooltip={false}
        />
      </div>

      {/* Subtle gold tint on selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-[#8b6f47]/10 pointer-events-none" />
      )}

      {/* Gold corner tick */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute top-2 right-2 z-20"
          >
            <div className="w-5 h-5 bg-[#8b6f47] rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
