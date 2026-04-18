import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Draggable } from "gsap/all";
import { Image } from "@/components/ui/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Ensure GSAP plugins are registered if in a browser environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

const wordPairs = [
  { top: "Intelligence", bottom: "Decoration" },
  { top: "Execution", bottom: "Incomplete" },
  { top: "Experience", bottom: "Forgettable" },
];

const ServicesHero = () => {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  // Separate ref for the interactive image box — used for Draggable bounds & percent calc
  const imageBoxRef = useRef<HTMLDivElement>(null);

  const realityImage = "/reality_render.jpg";
  const blueprintImage = "/blueprint_shell.jpg";

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % wordPairs.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const imageBox = imageBoxRef.current;
    const reveal = revealRef.current;
    const handle = handleRef.current;

    if (!imageBox || !reveal || !handle) return;

    // All coordinates are relative to the image box itself
    const boxWidth = imageBox.offsetWidth;

    // Start handle at 50% of the image box
    gsap.set(handle, { x: boxWidth * 0.5 });
    gsap.set(reveal, { clipPath: "inset(0 0 0 50%)" });

    const draggable = Draggable.create(handle, {
      type: "x",
      bounds: imageBox,            // ← constrained to the image box, not the full page
      onDragStart: () => setIsDragging(true),
      onDragEnd: () => setIsDragging(false),
      onDrag: function () {
        // percent relative to the image box width — this is what clipPath needs
        const percent = Math.min(100, Math.max(0, (this.x / boxWidth) * 100));
        gsap.set(reveal, { clipPath: `inset(0 0 0 ${percent}%)` });
      },
    });

    // Intro animation: sweep from 50% → 35%
    const tl = gsap.timeline();
    tl.to(handle, {
      x: boxWidth * 0.35,
      duration: 1.5,
      delay: 0.8,
      ease: "expo.inOut",
    }).to(
      reveal,
      { clipPath: "inset(0 0 0 35%)", duration: 1.5, ease: "expo.inOut" },
      "<"
    );

    return () => {
      if (draggable[0]) draggable[0].kill();
    };
  }, []);

  const currentPair = wordPairs[index];

  return (
    <section
      className="relative w-full min-h-[100vh] bg-[#000000] flex items-center pt-28 lg:pt-24 pb-20 overflow-hidden"
    >
      {/* Layout wrapper */}
      <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-0 relative z-10 font-sans h-full">

        {/* ───────── LEFT CONTENT ───────── */}
        <div className="hero-left-content w-full lg:w-[55%] xl:w-[58%] flex flex-col justify-center gap-7 px-6 sm:px-10 lg:pl-14 xl:pl-20 2xl:pl-28 lg:pr-10 py-10 lg:py-0">

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 text-[11px] font-bold tracking-[0.3em] uppercase text-[#FFFFFF]"
          >
            <div className="w-8 h-[2px] bg-[#FF2A2A] shrink-0 shadow-[0_0_8px_rgba(255,42,42,0.6)]" />
            OUR SERVICES
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-sans text-[clamp(2.4rem,4.8vw,5.2rem)] font-normal text-[#FFFFFF] leading-[1.08] tracking-tight">
              Turnkey Interior Projects
              <br />
              Delivered with{" "}
              <span className="text-[#FF2A2A] font-semibold">Precision.</span>
            </h1>
          </motion.div>

          {/* Word-Swap inline — no box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans text-[clamp(1.15rem,2vw,1.75rem)] font-light text-[#CCCCCC] leading-[1.4]"
          >
            Architecture Without{" "}
            <span
              className="relative inline-flex overflow-hidden text-[#FF2A2A] font-semibold align-bottom"
              style={{ minWidth: "4.5ch" }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentPair.top + "-top"}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="whitespace-nowrap inline-block"
                >
                  {currentPair.top}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            Is{" "}
            <span
              className="relative inline-flex overflow-hidden text-[#FF2A2A] font-semibold align-bottom"
              style={{ minWidth: "6ch" }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentPair.bottom + "-bot"}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="whitespace-nowrap inline-block"
                >
                  {currentPair.bottom}.
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.9rem,1.1vw,1.05rem)] font-normal leading-[1.75] text-[#6B6B6B] max-w-[44ch]"
          >
            We deliver fully managed interior environments combining design intelligence,
            execution precision, and premium detailing — from concept sketch to final handover.
          </motion.p>

          {/* Value Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2.5 text-[clamp(0.85rem,1vw,1rem)] text-[#888888] font-normal"
          >
            {["End-to-End Execution", "Material Engineering", "Time-Bound Delivery"].map(
              (point, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-1 h-1 rounded-full bg-[#FF2A2A] shadow-[0_0_6px_rgba(255,42,42,0.9)] shrink-0" />
                  {point}
                </div>
              )
            )}
          </motion.div>


        </div>

        {/* ───────── RIGHT: DRAG-TO-REVEAL ───────── */}
        {/*
          Positioned absolute so it can bleed to the right edge.
          Margin-right (mr-6 xl:mr-10) = breathing room from browser border.
          Top/bottom inset = vertical breathing room from section edges.
        */}
        <div
          ref={imageBoxRef}
          className="absolute right-6 xl:right-10 top-[12vh] bottom-[6vh] w-[42%] xl:w-[40%] 2xl:w-[38%] rounded-none overflow-hidden border border-[#1E1E1E] z-20"
        >
          {/* Base Layer: Blueprint / Structural */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[#050505] overflow-hidden"
          >
            <Image
              src={blueprintImage}
              alt="Concrete Shell Blueprint"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover opacity-55 grayscale w-full h-full"
              width={1200}
              height={900}
            />
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#FFFFFF_1px,transparent_1px),linear-gradient(to_bottom,#FFFFFF_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </motion.div>

          {/* Reveal Layer: Finished Interior */}
          <motion.div
            ref={revealRef}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          >
            <Image
              src={realityImage}
              alt="Finished Interior"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover w-full h-full"
              width={1200}
              height={900}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </motion.div>

          {/* Draggable Handle */}
          <div
            ref={handleRef}
            className={cn(
              "absolute top-0 bottom-0 w-[3px] z-30 cursor-ew-resize transition-colors duration-200",
              isDragging ? "bg-[#FF2A2A] shadow-[0_0_12px_rgba(255,42,42,0.6)]" : "bg-white/70"
            )}
            style={{ touchAction: "none", left: 0 }}
          >
            {/* Hit Area — wider invisible zone for easier grabbing */}
            <div className="absolute inset-y-0 -left-4 -right-4" />

            {/* Handle UI */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-none">
              <div
                className={cn(
                  "w-12 h-12 bg-black border flex items-center justify-center transition-colors duration-200",
                  isDragging
                    ? "border-[#FF2A2A] shadow-[0_0_16px_rgba(255,42,42,0.5)]"
                    : "border-white/40"
                )}
              >
                <div
                  className={cn(
                    "flex items-center transition-colors duration-200",
                    isDragging ? "text-[#FF2A2A]" : "text-white"
                  )}
                >
                  <ChevronLeft className="w-4 h-4 -mr-0.5" />
                  <ChevronRight className="w-4 h-4 -ml-0.5" />
                </div>
              </div>

              <motion.div
                animate={isDragging ? { opacity: 0, scale: 0.85 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-black/90 backdrop-blur-sm text-white text-[9px] font-bold px-3 py-1 tracking-[0.22em] whitespace-nowrap border border-white/10 uppercase"
              >
                DRAG TO REVEAL
              </motion.div>
            </div>
          </div>

          {/* Corner Labels */}
          <div className="absolute top-5 left-5 z-40 text-[9px] font-bold text-white/70 tracking-[0.2em] uppercase bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-white/10">
            STRUCTURAL
          </div>
          <div className="absolute top-5 right-5 z-40 text-[9px] font-bold text-[#FF2A2A] tracking-[0.2em] uppercase bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-[#FF2A2A]/40">
            FURNISHED
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesHero;
