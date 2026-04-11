import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Draggable } from "gsap/all";
import { Image } from "@/components/ui/image";

// Ensure GSAP plugins are registered if in a browser environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

const wordPairs = [
  { top: "Intelligence", bottom: "Decoration" },
  { top: "Execution", bottom: "Incomplete" },
  { top: "Experience", bottom: "Cold" },
];

const ServicesHero = () => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Reality and Blueprint images (Concrete Shell vs Finished Interior)
  const realityImage = "/reality_render.jpg"; 
  const blueprintImage = "/blueprint_shell.jpg";

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % wordPairs.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !revealRef.current || !handleRef.current) return;

    const container = containerRef.current;
    const reveal = revealRef.current;
    const handle = handleRef.current;

    // Set initial position
    gsap.set(reveal, { clipPath: "inset(0 0 0 50%)" });
    gsap.set(handle, { x: container.offsetWidth / 2 });

    // Draggable Logic
    const draggable = Draggable.create(handle, {
      type: "x",
      bounds: container,
      onDrag: function() {
        const percent = (this.x / container.offsetWidth) * 100;
        gsap.set(reveal, { clipPath: `inset(0 0 0 ${percent}%)` });
      }
    });

    // Intro Animation Sequence (Blueprint reveal)
    const tl = gsap.timeline();
    tl.to(handle, {
      x: container.offsetWidth * 0.35,
      duration: 1.5,
      delay: 0.5,
      ease: "expo.inOut"
    })
    .to(reveal, {
      clipPath: "inset(0 0 0 35%)",
      duration: 1.5,
      ease: "expo.inOut"
    }, "<");

    return () => {
      if (draggable[0]) draggable[0].kill();
    };
  }, []);

  const currentPair = wordPairs[index];

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[100vh] min-h-[700px] bg-[#000000] flex items-center overflow-hidden"
    >
      {/* Background Animated Grid (Original Style) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div
          animate={{
            y: [0, -40],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{
            y: { duration: 20, repeat: Infinity, ease: "linear" },
            opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, #FF2A2A 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 relative z-10">
        
        {/* Left Side: EXACTLY AS BEFORE */}
        <div className="hero-left-content space-y-8 max-w-2xl">
          {/* Top Label */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 text-[10px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A] font-label"
          >
            <div className="w-9 h-[1px] bg-[#FF2A2A] shrink-0" />
            Our Services
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-[clamp(2rem,6vw,6rem)] font-normal text-[#EDEDED] leading-[1.06] tracking-[-0.02em]">
              <span className="font-bold italic text-white underline decoration-[#FF2A2A]/80 decoration-[2px] underline-offset-[12px] drop-shadow-md">
                Turnkey Interior
              </span><br className="hidden sm:block" />
              <span className="hidden sm:inline"> </span>Projects Delivered<br />
              with <span className="text-[#FF2A2A] italic">Hospitality Precision.</span>
            </h1>
          </motion.div>

          {/* Word-Swap Statement */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(1.1rem,2.2vw,1.8rem)] font-light text-[#EDEDED]/60 italic border-l-[3px] border-[#FF2A2A] pl-5 flex items-center flex-wrap"
          >
            <span>Architecture Without&nbsp;</span>
            <div className="relative inline-flex overflow-hidden text-[#FF2A2A] font-normal align-bottom">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentPair.top}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="whitespace-nowrap inline-block"
                >
                  {currentPair.top}
                </motion.div>
              </AnimatePresence>
            </div>
            <span>&nbsp;Is&nbsp;</span>
            <div className="relative inline-flex overflow-hidden text-[#FF2A2A] font-normal align-bottom">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentPair.bottom}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="whitespace-nowrap flex items-center pr-1"
                >
                  {currentPair.bottom}<span>.</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Vision Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.95rem,1.3vw,1.1rem)] font-light leading-[1.75] text-[#EDEDED]/55 max-w-[52ch]"
          >
            We deliver fully managed interior environments combining design intelligence, 
            execution precision, and hospitality-grade detailing — from concept sketch 
            to final handover.
          </motion.p>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-2.5"
          >
            {["Strategic ROI", "Data-Driven Design", "End-to-End Turnkey"].map((tag, i) => (
              <span key={i} className="font-label text-[9px] font-semibold tracking-[0.18em] uppercase border border-white/10 px-[18px] py-[9px] text-[#EDEDED]/55 hover:border-[#FF2A2A] hover:text-[#FF2A2A] transition-colors duration-300 cursor-default">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Interactive Component (New Section) */}
        <div className="relative h-[65vh] lg:h-[80vh] rounded-2xl overflow-hidden border border-white/5 shadow-2xl group/reveal scale-95 lg:scale-100">
          
          {/* Base Layer: Blueprint (Concrete Shell) */}
          <div className="absolute inset-0 bg-[#080809] overflow-hidden">
            <Image
              src={blueprintImage} 
              alt="Concrete Shell Blueprint" 
              className="absolute inset-0 h-full w-full"
              imageClassName="opacity-90 sepia-[.2] hue-rotate-[-30deg] saturate-50"
              width={1200}
              height={900}
            />
            {/* Subtle red drafting grid overlay to maintain the 'Blueprint' technical vibe */}
            <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(to_right,#FF2A2A_1px,transparent_1px),linear-gradient(to_bottom,#FF2A2A_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute top-6 left-32 text-[10px] font-mono text-white opacity-70 tracking-wider hidden md:block bg-black/40 px-2 py-1 rounded">
              [STATE: RAW_CONCRETE_SHELL / STRUCTURAL]
            </div>
          </div>

          {/* Reveal Layer: Reality */}
          <div 
            ref={revealRef}
            className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          >
            <Image
              src={realityImage} 
              alt="Reality Render" 
              className="h-full w-full"
              width={1200}
              height={900}
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Draggable Handle */}
          <div 
            ref={handleRef}
            className="absolute top-0 bottom-0 w-[2px] bg-[#FF2A2A] z-30 cursor-ew-resize group"
            style={{ touchAction: "none" }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              <div className="relative w-12 h-12 rounded-full backdrop-blur-md bg-[#FF2A2A]/20 border border-[#FF2A2A] flex items-center justify-center shadow-[0_0_15px_rgba(255,42,42,0.5)]">
                <div className="absolute inset-0 rounded-full bg-[#FF2A2A] animate-ping opacity-30" />
                <div className="w-8 h-8 rounded-full bg-[#FF2A2A] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 group-active:scale-95">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M7 12h10M7 12l4-4M7 12l4 4" />
                  </svg>
                </div>
              </div>
              <div className="bg-[#FF2A2A]/90 backdrop-blur-sm text-white text-[9px] font-bold px-3 py-1.5 rounded-sm tracking-[0.2em] whitespace-nowrap shadow-lg border border-[#FF2A2A]/20">
                DRAG
              </div>
            </div>
          </div>

          {/* Labels (Swapped) */}
          <div className="absolute top-6 left-6 z-40 text-[9px] font-bold text-[#FF2A2A] tracking-[0.3em] uppercase bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#FF2A2A]/20">
             Blueprint
          </div>
          <div className="absolute top-6 right-6 z-40 text-[9px] font-bold text-white tracking-[0.3em] uppercase bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
             Reality
          </div>
        </div>

      </div>

      {/* Meta-Annotations */}
      <div className="absolute bottom-6 left-6 lg:left-20 z-10 flex items-center gap-6 opacity-40 pointer-events-none">
        <div className="text-[10px] font-mono text-white/70 tracking-widest">[ CONFIDENTIAL INTEL ]</div>
        <div className="w-12 h-[1px] bg-white/20" />
        <div className="text-[10px] font-mono text-[#FF2A2A] tracking-widest">PROJECT ID: CRX-8092</div>
      </div>

    </section>
  );
};

export default ServicesHero;
