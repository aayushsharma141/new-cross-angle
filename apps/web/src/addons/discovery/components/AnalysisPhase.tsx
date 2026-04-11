import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserSignals, AIAestheticResult, Archetype } from "@/types/discovery";
import { visualImages } from "@/constants/discovery";
import { toast } from "sonner";
import { Image } from "@/components/ui/image";

interface Props {
  userSignals: UserSignals;
  fallbackArchetype: Archetype;
  onComplete: (result?: AIAestheticResult) => void;
}

const phases = [
  "Reading your aesthetic signals…",
  "Interpreting emotional patterns…",
  "Synthesizing your unique identity…",
  "Crafting your design language…",
  "Finalizing your aesthetic DNA…",
];

const MIN_DURATION = 5000;

// Constellation node positions (normalized 0-1)
const constellationNodes = [
  { x: 0.2, y: 0.3 }, { x: 0.4, y: 0.15 }, { x: 0.6, y: 0.25 },
  { x: 0.8, y: 0.35 }, { x: 0.3, y: 0.55 }, { x: 0.5, y: 0.5 },
  { x: 0.7, y: 0.6 }, { x: 0.25, y: 0.75 }, { x: 0.55, y: 0.8 },
  { x: 0.75, y: 0.7 }, { x: 0.15, y: 0.5 }, { x: 0.85, y: 0.5 },
];

const constellationEdges = [
  [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6],
  [4, 7], [7, 8], [8, 9], [5, 2], [10, 0], [11, 3],
  [10, 4], [11, 6], [7, 10], [9, 11], [5, 8],
];

const AnalysisPhase = ({ userSignals, fallbackArchetype, onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  const [aiDone, setAiDone] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const resultRef = useRef<AIAestheticResult | undefined>(undefined);

  const ghostImages = useMemo(() => {
    const ids = userSignals.selectedImageIds || [];
    return ids.slice(0, 4).map((id) => visualImages.find((i) => i.id === id)).filter(Boolean).map((i) => i!.url);
  }, [userSignals.selectedImageIds]);

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
          toast("Using classic analysis — AI couldn't be reached right now.", { duration: 4000 });
          setAiDone(true);
          return;
        }
        resultRef.current = data as AIAestheticResult;
        setAiDone(true);
      } catch (e) {
        console.error("AI call failed:", e);
        if (!cancelled) {
          toast("Using classic analysis — AI couldn't be reached right now.", { duration: 4000 });
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
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "hsl(var(--result-bg))" }}
    >
      {/* Ghost images with Ken Burns */}
      {ghostImages.map((src, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.07, 0.04, 0],
          }}
          transition={{
            duration: 8,
            delay: i * 1.5,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="absolute w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden pointer-events-none"
          style={{
            top: i < 2 ? `${15 + i * 25}%` : `${55 + (i - 2) * 15}%`,
            left: i % 2 === 0 ? "8%" : "auto",
            right: i % 2 !== 0 ? "8%" : "auto",
          }}
        >
          <Image
            src={src}
            alt=""
            className="h-full w-full"
            width={720}
            height={540}
            style={{ animation: "ken-burns 20s ease-in-out infinite" }}
          />
        </motion.div>
      ))}

      {/* Constellation SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1 1" preserveAspectRatio="none">
        {/* Edges */}
        {constellationEdges.map(([a, b], i) => (
          <motion.line
            key={`edge-${i}`}
            x1={constellationNodes[a].x}
            y1={constellationNodes[a].y}
            x2={constellationNodes[b].x}
            y2={constellationNodes[b].y}
            stroke="hsl(var(--result-fg) / 0.06)"
            strokeWidth="0.001"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.15, 0.08] }}
            transition={{ duration: 3, delay: i * 0.15, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
        {/* Nodes */}
        {constellationNodes.map((node, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={node.x}
            cy={node.y}
            r="0.004"
            fill="hsl(var(--result-fg) / 0.2)"
            animate={{ r: [0.003, 0.006, 0.003], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2 + Math.random() * 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </svg>

      {/* Pulsing glow behind ring */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, hsl(var(--gold) / 0.2) 0%, transparent 70%)` }}
      />

      {/* Concentric rings on phase change */}
      <AnimatePresence>
        <motion.div
          key={`ring-${phase}`}
          className="absolute w-32 h-32 rounded-full border pointer-events-none"
          style={{ borderColor: "hsl(var(--gold) / 0.3)" }}
          initial={{ scale: 0.3, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </AnimatePresence>

      {/* SVG Progress Ring */}
      <div className="relative w-32 h-32 md:w-36 md:h-36 mb-10 z-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--result-fg) / 0.08)" strokeWidth="1.5" />
          <motion.circle
            cx="60" cy="60" r="52" fill="none"
            stroke="hsl(var(--gold) / 0.7)"
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-serif-display text-2xl md:text-3xl"
            style={{ color: "hsl(var(--result-fg) / 0.8)" }}
          >
            {phase + 1}
          </motion.span>
        </div>
      </div>

      {/* Phase text with staggered letters */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap justify-center gap-x-[0.15em] mb-10 px-6 z-10"
        >
          {phases[phase].split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="text-sm md:text-base tracking-wide"
              style={{ color: "hsl(var(--result-fg) / 0.7)" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Signal bars */}
      <div className="flex items-end gap-2 h-12 z-10">
        {phases.map((_, i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full"
            style={{ background: i <= phase ? "hsl(var(--gold) / 0.6)" : "hsl(var(--result-fg) / 0.15)" }}
            initial={{ height: 8 }}
            animate={{
              height: i <= phase ? [8, 28 + i * 6, 20 + i * 4] : 8,
              opacity: i <= phase ? 1 : 0.3,
            }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          />
        ))}
      </div>

      {/* Floating particles */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={`p${i}`}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            backgroundColor: "hsl(var(--gold) / 0.15)",
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
          }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: 3 + Math.random() * 3, delay: Math.random() * 4, repeat: Infinity }}
        />
      ))}
    </motion.div>
  );
};

export default AnalysisPhase;
