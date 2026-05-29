import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

const HERO_IMAGES = [portfolioBedroom, portfolioKitchen, portfolioOffice];

const wordCycles = [
  { top: "Executed",  bottom: "Experienced" },
  { top: "Delivered", bottom: "Remembered"  },
  { top: "Refined",   bottom: "Lived In"    },
];

const captions = [
  "Bedroom Suite · Noida Residence",
  "Kitchen · Commercial Project · Gurugram",
  "Office Suite · Corporate HQ · Delhi NCR",
];

const stats = [
  { value: "₹2–20Cr+", label: "Projects Delivered" },
  { value: "95%",       label: "Execution Match"    },
  { value: "100%",      label: "Turnkey Scope"       },
];

const HubHero = () => {
  const [imgIndex, setImgIndex]   = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setImgIndex((p) => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWordIndex((p) => (p + 1) % wordCycles.length), 3500);
    return () => clearInterval(t);
  }, []);

  const pair = wordCycles[wordIndex];

  return (
    <section className="relative w-full min-h-[100vh] bg-black flex items-center pt-24 pb-16 overflow-hidden">

      {/* ── LAYOUT ── */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch relative z-10 font-sans">

        {/* ─────── LEFT ─────── */}
        <div className="w-full lg:w-[54%] xl:w-[56%] flex flex-col justify-center gap-6
                        px-6 sm:px-10 lg:pl-14 xl:pl-20 2xl:pl-28 lg:pr-12
                        py-10 lg:py-0 min-h-[60vh] lg:min-h-[calc(100vh-6rem)]">

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 text-[10px] font-bold tracking-[0.32em] uppercase text-white/80"
          >
            <div className="w-7 h-[2px] bg-[#FF2A2A] shrink-0 shadow-[0_0_8px_rgba(255,42,42,0.5)]" />
            Our Projects
          </motion.div>

          {/* H1 — 3 clear lines, controlled size */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-sans text-[clamp(2.4rem,4.8vw,5.2rem)] font-normal text-white
                           leading-[1.08] tracking-tight">
              {/* Line 1 — static */}
              Real Projects.

              {/* Line 2 */}
              <br />
              Fully{" "}
              <span
                className="relative inline-flex overflow-hidden text-[#FF2A2A] font-semibold align-bottom"
                style={{ minWidth: "5ch" }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={pair.top}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="whitespace-nowrap inline-block"
                  >
                    {pair.top}
                  </motion.span>
                </AnimatePresence>
              </span>
              .

              {/* Line 3 */}
              <br />
              Fully{" "}
              <span
                className="relative inline-flex overflow-hidden text-[#FF2A2A] font-semibold align-bottom"
                style={{ minWidth: "6ch" }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={pair.bottom}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="whitespace-nowrap inline-block"
                  >
                    {pair.bottom}
                  </motion.span>
                </AnimatePresence>
              </span>
              .
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.88rem,1vw,1rem)] leading-[1.8] text-[#5E5E5E] max-w-[42ch]"
          >
            Every project reflects our turnkey approach — design intelligence,
            execution precision, and hospitality-level detailing from concept to handover.
          </motion.p>

          {/* Data Strip */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-stretch gap-0 pt-1"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 pr-8 ${
                  i < stats.length - 1 ? "border-r border-[#222222] mr-8" : ""
                }`}
              >
                <span className="text-[clamp(1.1rem,1.6vw,1.5rem)] font-bold text-white leading-none tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#484848]">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Value Points */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2 text-[clamp(0.82rem,0.95vw,0.92rem)] text-[#757575] font-normal pt-1"
          >
            {[
              "End-to-End Turnkey Execution",
              "Residential, Commercial & Hospitality",
              "Concept to Completion — No Gaps",
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-[5px] h-[5px] rounded-full bg-[#FF2A2A] shadow-[0_0_6px_rgba(255,42,42,0.8)] shrink-0" />
                {point}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─────── RIGHT: CINEMATIC IMAGE ─────── */}
        <div className="relative lg:absolute w-full lg:w-[43%] xl:w-[41%] 2xl:w-[39%] 
                        h-[50vh] lg:h-auto lg:top-[10vh] lg:bottom-[5vh] lg:right-6 xl:right-10 
                        overflow-hidden border border-[#1C1C1C] z-20 mt-8 lg:mt-0">

          {/* Slider */}
          <AnimatePresence mode="wait">
            <motion.div
              key={imgIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.01 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: [0.43, 0.13, 0.23, 0.96] }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${HERO_IMAGES[imgIndex]})` }}
              />
              {/* Lighten overlay — let the photo breathe */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Top-left tag */}
          <div className="absolute top-4 left-4 z-20 text-[8px] font-bold text-white/60
                          tracking-[0.22em] uppercase bg-black/50 backdrop-blur-sm
                          px-2.5 py-[5px] border border-white/[0.08]">
            TURNKEY PROJECT
          </div>

          {/* Slide dots — top right */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5
                          bg-black/40 backdrop-blur-sm border border-white/[0.07]">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                aria-label={`Go to project ${i + 1}`}
                className={`h-[2px] rounded-full transition-all duration-500 ${
                  i === imgIndex ? "w-7 bg-[#FF2A2A]" : "w-3.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Bottom caption pill */}
          <AnimatePresence mode="wait">
            <motion.div
              key={imgIndex + "-cap"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute bottom-5 left-4 right-4 z-20"
            >
              <span className="inline-flex items-center gap-2 bg-black/55 backdrop-blur-sm
                               border border-white/[0.07] px-3 py-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-[#FF2A2A] shrink-0" />
                <span className="text-[9px] uppercase tracking-[0.22em] text-white/55 whitespace-nowrap">
                  {captions[imgIndex]}
                </span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Scroll cue — aligned under left content */}
      <motion.div
        className="absolute bottom-6 left-14 xl:left-20 flex items-center gap-3 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-white/30"
        />
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/25">
          Scroll to Explore
        </span>
      </motion.div>
    </section>
  );
};

export default HubHero;
