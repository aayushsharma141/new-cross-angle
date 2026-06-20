import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserSignals, AIAestheticResult } from "@/types/discovery";
import { DecryptedText, GradualBlur, Squares } from "@/components/ReactBits";

interface Props {
  userSignals: UserSignals;
  onComplete: (result?: AIAestheticResult) => void;
}

const phases = [
  "Reading your aesthetic signals...",
  "Interpreting emotional patterns...",
  "Synthesizing your unique identity...",
  "Crafting your design language...",
  "Finalizing your aesthetic blueprint...",
];

const MIN_DURATION = 5000;

const AnalysisPhase = ({ userSignals, onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  const [aiDone, setAiDone] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const resultRef = useRef<AIAestheticResult | undefined>(undefined);

  // Show skip button after 8 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // Animate phases
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setPhase((p) => {
        if (p >= phases.length - 1) {
          clearInterval(interval);
          const elapsed = Date.now() - start;
          const remaining = Math.max(0, MIN_DURATION - elapsed);
          setTimeout(() => setAnimDone(true), remaining);
          return p;
        }
        return p + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Call AI edge function
  useEffect(() => {
    let cancelled = false;
    const callAI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("aesthetic-ai", { body: { signals: userSignals } });
        if (cancelled) return;
        if (error || data?.error) {
          console.error("AI error:", error || data?.error);
          // Silently fall back to classic analysis without jarring toast
          setAiDone(true);
          return;
        }
        resultRef.current = data as AIAestheticResult;
        setAiDone(true);
      } catch (e) {
        console.error("AI call failed:", e);
        if (!cancelled) {
          setAiDone(true);
        }
      }
    };
    callAI();
    return () => { cancelled = true; };
  }, [userSignals]);

  // Complete when both done
  useEffect(() => {
    if (aiDone && animDone) onComplete(resultRef.current);
  }, [aiDone, animDone, onComplete]);

  const progress = ((phase + 1) / phases.length) * 100;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-transparent"
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <Squares speed={0.2} squareSize={40} strokeColor="26, 26, 26" opacity={0.1} />
      </div>
      <div className="max-w-2xl w-full flex flex-col items-center justify-center p-8 relative z-10">
        
        {/* Clean, Elegant Progress Ring */}
        <div className="relative w-24 h-24 mb-12">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#e8e4dd" 
              strokeWidth="2" 
            />
            {/* Animated Progress Ring */}
            <motion.circle
              cx="50" cy="50" r="40" 
              fill="none"
              stroke="#233526"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[#1a1a1a] font-serif text-2xl"
            >
              {phase + 1}
            </motion.span>
          </div>
        </div>

        {/* Minimalist Phase Text */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              <DecryptedText
                text={phases[phase]}
                speed={25}
                className="text-[#1a1a1a] font-serif italic text-2xl md:text-3xl"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Subtitle */}
        <GradualBlur
          text="Curating your spatial identity"
          className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] justify-center"
          delay={40}
        />

        {/* Elegant Linear Progress Bar */}
        <div className="w-48 h-[2px] bg-[#e8e4dd] mt-16 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#233526] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

      </div>

      {/* Skip button — appears after 8s for stuck users */}
      <AnimatePresence>
        {showSkip && !aiDone && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onComplete(undefined)}
            className="absolute bottom-12 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8c8c8c] hover:text-[#1a1a1a] transition-colors"
          >
            Skip analysis &rarr;
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalysisPhase;
