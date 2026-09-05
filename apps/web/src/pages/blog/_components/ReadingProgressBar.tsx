/**
 * ReadingProgressBar.tsx — Fixed progress bar with time-remaining pill.
 * Renders via createPortal into document.body.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  totalMinutes: number;
}

const ReadingProgressBar = ({ totalMinutes }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const remaining = Math.max(0, Math.ceil(totalMinutes * (1 - progress / 100)));

  return createPortal(
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-[3px]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-primary to-primary"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.08 }}
        />
      </div>
      <AnimatePresence>
        {progress > 5 && progress < 95 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[3px] right-4 mt-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white/50 font-sans"
            style={{ background: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            ~{remaining} min left
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
};

export default ReadingProgressBar;
