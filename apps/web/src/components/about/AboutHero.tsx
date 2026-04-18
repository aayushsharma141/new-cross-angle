import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface AboutHeroProps {
  onPlayVideo?: () => void;
  videoUrl?: string;
}

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "500+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
];

const AboutHero = ({
  videoUrl = "https://www.youtube.com/embed/gJMCIaI7nKg",
}: AboutHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100vh] bg-black flex items-center pt-24 pb-16 overflow-hidden"
    >
      {/* Subtle bg watermark — very low opacity */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-around opacity-[0.018]">
        {[1, -1, 1].map((dir, i) => (
          <motion.div
            key={i}
            className="whitespace-nowrap font-sans text-[9vh] font-black tracking-widest text-white"
            animate={{ x: dir > 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            CROSS ANGLE INTERIOR • TURNKEY EXECUTION • ESTD 2010 • CROSS ANGLE INTERIOR • TURNKEY EXECUTION • ESTD 2010 •
          </motion.div>
        ))}
      </div>

      {/* Layout */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-0 font-sans"
      >
        {/* ─────── LEFT: TEXT ─────── */}
        <div className="w-full lg:w-[52%] xl:w-[54%] 2xl:w-[41%] flex flex-col justify-center gap-6
                        px-6 sm:px-10 lg:pl-14 xl:pl-20 2xl:pl-28 lg:pr-12
                        py-10 lg:py-0 min-h-[calc(100vh-6rem)]">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 text-[10px] font-bold tracking-[0.32em] uppercase text-white/80"
          >
            <div className="w-7 h-[2px] bg-[#FF2A2A] shrink-0 shadow-[0_0_8px_rgba(255,42,42,0.5)]" />
            About The Studio
          </motion.div>

          {/* H1 */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-sans text-[clamp(2.4rem,4.8vw,5.2rem)] font-normal text-white leading-[1.08] tracking-tight">
              We Design. We Execute.
              <br />
              We Deliver{" "}
              <span className="text-[#FF2A2A] font-semibold"> Turnkey </span> Interiors.
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.88rem,1vw,1rem)] leading-[1.8] text-[#5E5E5E] max-w-[44ch]"
          >
            For over 15 years, we've delivered fully managed interior projects —
            combining design intelligence, execution precision, and
            hospitality-level detailing from concept to final handover.
          </motion.p>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.82rem,0.9vw,0.9rem)] text-[#444444] italic"
          >
            Every project is delivered as a complete, ready-to-live environment.
          </motion.p>

          {/* Data Strip */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-stretch gap-y-4 pt-2"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1.5 pr-8 ${i < stats.length - 1 ? "border-r border-[#1E1E1E] mr-8" : ""
                  }`}
              >
                <span className="text-[clamp(1.5rem,2.2vw,2.4rem)] font-bold text-white leading-none tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#444444]">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Value points */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2 text-[clamp(0.82rem,0.95vw,0.92rem)] text-[#757575] pt-1"
          >
            {
              ([
                "Residential, Commercial & Hospitality",
                "End-to-End Turnkey — No Sub-Contracting",
                "Jamshedpur's Most-Referenced Interior Studio",
              ]).map((point, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#FF2A2A] shadow-[0_0_6px_rgba(255,42,42,0.8)] shrink-0" />
                  {point}
                </div>
              ))
            }
          </motion.div>

          {/* Hero CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2"
          >
            <Link
              to="/contact-us"
              className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#FF2A2A] text-white text-[0.82rem] font-bold uppercase tracking-[0.18em] hover:bg-[#e02020] transition-colors duration-200"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* ─────── RIGHT: VIDEO ─────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:absolute lg:right-6 xl:right-10 lg:top-[10vh] lg:bottom-[5vh]
                     w-full lg:w-[45%] xl:w-[43%] 4xl:w-[41%]
                     px-6 sm:px-10 lg:px-0
                     flex flex-col gap-4 z-20"
        >
          {/* "Hear From The Founder" label */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-[2px] bg-[#FF2A2A] shadow-[0_0_6px_rgba(255,42,42,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
              Hear From The Founder
            </span>
          </div>

          {/* Video embed */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex-1 overflow-hidden border border-[#1C1C1C]
                       shadow-[0_0_0_1px_rgba(255,42,42,0.06),0_24px_60px_rgba(0,0,0,0.7)]
                       group"
          >
            {/* Red glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                            shadow-[inset_0_0_0_1px_rgba(255,42,42,0.15)] pointer-events-none z-10" />

            <div className="aspect-video lg:absolute lg:inset-0 lg:w-full lg:h-full">
              <iframe
                src={videoUrl}
                title="Founder — CrossAngle Interior"
                className="w-full h-full lg:absolute lg:inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>

          {/* Below-video caption */}
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#3A3A3A] leading-relaxed">
            How we approach turnkey interiors — from concept to final handover.
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-6 left-14 xl:left-20 flex items-center gap-3 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
      >
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-white/25"
        />
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
          Scroll to Explore
        </span>
      </motion.div>
    </section>
  );
};

export default AboutHero;