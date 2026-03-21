import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const wordPairs = [
  { top: "Intelligence", bottom: "Decoration" },
  { top: "Execution", bottom: "Incomplete" },
  { top: "Experience", bottom: "Cold" },
];

const ServicesHero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % wordPairs.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentPair = wordPairs[index];

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-[#000000]" style={{ padding: "clamp(100px,12vh,140px) clamp(20px,5vw,80px) clamp(16px,3vh,40px)" }}>
      {/* Background Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Grid Texture */}
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
        
        {/* Powerful Radial Red Glow */}
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

        <div className="w-full max-w-[1400px] mx-auto relative z-10 flex flex-col justify-center flex-1">
          
          {/* Top Label */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 mb-6 text-[10px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A] font-label"
          >
            <div className="w-9 h-[1px] bg-[#FF2A2A] shrink-0" />
            Our Services
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-9"
          >
            <h1 className="font-display text-[clamp(2.4rem,5.8vw,6rem)] font-normal text-[#EDEDED] leading-[1.06] tracking-[-0.02em] max-w-[20ch]">
              Turnkey Interior<br />
              Projects Delivered<br />
              with <span className="text-[#FF2A2A] italic">Hospitality<br />Precision.</span>
            </h1>
          </motion.div>

          {/* Animated Word-Swap Statement */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(1.1rem,2.6vw,2rem)] font-light text-[#EDEDED]/60 italic border-l-[3px] border-[#FF2A2A] pl-5 mb-8 flex items-center flex-wrap gap-[0.25em]"
          >
            <span>Architecture Without</span>
            
            <div className="relative inline-flex overflow-hidden text-[#FF2A2A] font-normal mx-[0.1em]">
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

            <span>Is</span>

            <div className="relative inline-flex overflow-hidden text-[#FF2A2A] font-normal mx-[0.1em]">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentPair.bottom}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="whitespace-nowrap inline-block"
                >
                  {currentPair.bottom}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <span>.</span>
          </motion.div>

          {/* Vision Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.95rem,1.4vw,1.12rem)] font-light leading-[1.75] text-[#EDEDED]/55 max-w-[52ch] mb-10"
          >
            We deliver fully managed interior environments combining design intelligence, execution precision, and hospitality-grade detailing — from concept sketch to final handover.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-2.5 mb-10"
          >
            {[
              "Strategic ROI",
              "Data-Driven Design",
              "End-to-End Turnkey"
            ].map((tag, i) => (
              <span key={i} className="font-label text-[9px] font-semibold tracking-[0.18em] uppercase border border-white/10 px-[18px] py-[9px] text-[#EDEDED]/55 hover:border-[#FF2A2A] hover:text-[#FF2A2A] transition-colors duration-300 cursor-default">
                {tag}
              </span>
            ))}
          </motion.div>




        </div>


    </section>
  );
};

export default ServicesHero;

