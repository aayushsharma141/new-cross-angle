import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useReducedMotion from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/** Cycle an index 0..length-1 on an interval; frozen under reduced motion. */
export function useWordCycle(length: number, intervalMs = 3500): number {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    if (prefersReducedMotion || length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs, prefersReducedMotion]);
  return index;
}

interface WordSwapProps {
  /** The word currently shown; changing it rolls the old one out and the new one in. */
  word: string;
  /** Reserve width so surrounding copy doesn't reflow as words change. */
  minWidth?: string;
  className?: string;
}

/**
 * One rolling word: the outgoing word slides up and out while the incoming
 * one rises from below. Drive it with `useWordCycle` so several instances
 * on the same line change together.
 */
export const WordSwap = ({ word, minWidth = "12ch", className }: WordSwapProps) => (
  <span className={cn("relative inline-flex overflow-hidden align-bottom", className)} style={{ minWidth }}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={word}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="whitespace-nowrap inline-block"
      >
        {word}
      </motion.span>
    </AnimatePresence>
  </span>
);

export default WordSwap;
