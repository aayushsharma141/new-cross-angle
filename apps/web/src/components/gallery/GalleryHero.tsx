import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { galleryItems } from "@/data/galleryData";

const stats = [
  { value: 150, label: "Projects Completed", suffix: "+" },
  { value: 8, label: "Years of Excellence", suffix: "+" },
  { value: 200, label: "Happy Clients", suffix: "+" },
  { value: 5, label: "Design Awards", suffix: "" },
];

// Pick a selection of images for the mosaic background
const mosaicImages = [
  galleryItems[1].image,  // Bedroom
  galleryItems[16].image, // Living Room
  galleryItems[0].image,  // Kitchen
  galleryItems[18].image, // Commercial
  galleryItems[20].image, // Exterior
  galleryItems[5].image,  // Bedroom
];

interface GalleryHeroProps {
  totalCount: number;
  categoryCount: number;
}

const GalleryHero = ({ totalCount, categoryCount }: GalleryHeroProps) => {
  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timers = stats.map((stat, index) => {
      let step = 0;
      return setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCounters((prev) => {
          const nc = [...prev];
          nc[index] = Math.round(stat.value * easeOut);
          return nc;
        });
        if (step >= steps) clearInterval(timers[index]);
      }, interval);
    });

    return () => timers.forEach((t) => clearInterval(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleText = "Our Works";

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* ── Mosaic Background ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-30">
        {mosaicImages.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            <motion.img
              src={src}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6 + i * 0.5, ease: "linear" }}
            />
          </div>
        ))}
      </div>

      {/* ── Deep Obsidian Overlay ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/80 to-[#0a0a0a]" />

      {/* ── Grain Texture ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── Thin vertical right scroll marker ────────────────────────────── */}
      <motion.div
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 [writing-mode:vertical-rl]">
          Scroll
        </span>
        <motion.div
          className="w-px h-20 bg-gradient-to-b from-[#D1AF6E]/40 to-transparent"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-4 text-center">

        {/* Overline label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-[#D1AF6E]/70 font-light">
            <span className="w-8 h-px bg-[#D1AF6E]/40" />
            Portfolio Gallery
            <span className="w-8 h-px bg-[#D1AF6E]/40" />
          </span>
        </motion.div>

        {/* Main title — letter-by-letter */}
        <motion.h1
          className="font-['Cormorant_Garamond',serif] text-7xl md:text-9xl lg:text-[10rem] font-light text-white mb-6 tracking-[-0.02em] leading-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {titleText.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 80, rotateX: -45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block"
              style={{ transformOrigin: "bottom" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Gold rule + category info */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-12"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.8, ease: "easeInOut" }}
        >
          <span className="flex-1 max-w-[80px] h-px bg-[#D1AF6E]/30" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#D1AF6E]/60 font-light whitespace-nowrap">
            {totalCount} Projects &nbsp;·&nbsp; {categoryCount} Categories
          </p>
          <span className="flex-1 max-w-[80px] h-px bg-[#D1AF6E]/30" />
        </motion.div>

        {/* Stats row — editorial */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-0 border-t border-white/5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[140px] px-8 py-8 text-center border-r border-white/5 last:border-r-0"
            >
              <div className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl font-light text-white mb-1">
                <span className="text-[#D1AF6E]">
                  {counters[index]}{stat.suffix}
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/35 font-light">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryHero;
