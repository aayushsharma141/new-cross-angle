import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Clock, Heart, Eye, Palette, Lightbulb, Sun } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Lang } from "@/i18n/translations";
import { useRef, useEffect, useState } from "react";
import BlurFade from "@/components/magicui/blur-fade";

// Background images for cycling mosaic
import lifestyle1 from "@/assets/discovery/lifestyle-1.jpg";
import lifestyle2 from "@/assets/discovery/lifestyle-2.jpg";
import lifestyle3 from "@/assets/discovery/lifestyle-3.jpg";
import lifestyle4 from "@/assets/discovery/lifestyle-4.jpg";

interface WelcomeScreenProps {
  onStart: (mode: "quick" | "deep") => void;
}

const bgImages = [lifestyle1, lifestyle2, lifestyle3, lifestyle4];

// Floating particle component
const Particle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-foreground/10"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      opacity: [0, 0.5, 0],
    }}
    transition={{
      duration: 4 + Math.random() * 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const { lang, setLang, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgIndex, setBgIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Cycle background images
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((i) => (i + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const roadmapSteps = [
    { icon: Heart, label: t("welcome_step_reflection"), desc: t("welcome_step_reflection_desc") },
    { icon: Eye, label: t("welcome_step_visual"), desc: t("welcome_step_visual_desc") },
    { icon: Palette, label: t("welcome_step_emotional"), desc: t("welcome_step_emotional_desc") },
    { icon: Lightbulb, label: t("welcome_step_material"), desc: t("welcome_step_material_desc") },
    { icon: Sun, label: t("welcome_step_identity"), desc: t("welcome_step_identity_desc") },
  ];

  const toggleLang = (l: Lang) => setLang(l);

  // Generate stable particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.4,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
  }));

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center relative w-full overflow-x-hidden"
    >
      {/* Language Toggle - Moved to be unobtrusive */}
      <div className="absolute top-4 right-4 z-20 flex items-center bg-background/50 backdrop-blur-md border border-border/50 rounded-full overflow-hidden shadow-sm">
        <button
          onClick={() => toggleLang("en")}
          className={`px-3 py-1 text-[10px] font-bold tracking-wider transition-colors ${lang === "en"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          EN
        </button>
        <button
          onClick={() => toggleLang("hi")}
          className={`px-3 py-1 text-[10px] font-bold tracking-wider transition-colors ${lang === "hi"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          HI
        </button>
      </div>

      {/* Hero Section with cycling background */}
      <div className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 w-full">
        {/* Cycling background images - Confined to Hero */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl m-4 opacity-50">
          {bgImages.map((src, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 pointer-events-none"
              style={{ y: bgY }}
              animate={{ opacity: bgIndex === i ? 0.4 : 0, scale: bgIndex === i ? 1.05 : 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transpose to-background/20 z-10" />
              <img src={src} alt="" className="w-full h-full object-cover grayscale-[0.3]" />
            </motion.div>
          ))}
        </div>

        {/* Floating particles */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        {/* Radial glow */}
        <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(circle, hsla(var(--primary) / 0.15) 0%, transparent 70%)" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="tracking-[0.2em] uppercase text-xs font-semibold text-primary mb-6 z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-primary/20"
        >
          {t("welcome_subtitle")}
        </motion.p>


        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-medium text-center max-w-2xl leading-tight mb-6 z-10"
        >
          {t("welcome_title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-muted-foreground text-center max-w-md mb-10 text-lg z-10"
        >
          {t("welcome_desc")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-muted-foreground animate-bounce z-10"
        >
          {t("welcome_scroll")}
        </motion.div>
      </div>

      {/* Divider */}
      <div className="w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent mx-auto my-0" />

      {/* What does discovering your aesthetic mean? */}
      <div className="w-full max-w-2xl px-6 py-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-border/30 -z-10" />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif-display text-2xl md:text-4xl font-medium text-center mb-8 bg-background inline-block px-4 relative z-10"
        >
          {t("welcome_what_title")}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-6 text-muted-foreground text-center leading-relaxed font-light text-lg bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-sm"
        >
          <p>{t("welcome_what_p1")}</p>
          <p>{t("welcome_what_p2")}</p>
          <p className="text-foreground font-medium">{t("welcome_what_p3")}</p>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />

      {/* Roadmap - Timeline Style */}
      <div className="w-full max-w-xl px-6 py-16">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="uppercase tracking-[0.2em] text-xs font-bold text-muted-foreground text-center mb-16"
        >
          {t("welcome_roadmap")}
        </motion.h3>

        <div className="relative">
          {/* Connecting vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute left-[27px] md:left-[27px] top-0 bottom-0 w-px origin-top bg-gradient-to-b from-primary/50 via-border to-transparent"
          />

          {roadmapSteps.map((step, i) => (
            <BlurFade key={i} delay={0.25 + i * 0.15} inView>
              <div
                className="relative flex items-start gap-6 mb-12 pl-2"
              >
                {/* Timeline dot */}
                <div className="relative z-10 w-14 h-14 shrink-0 rounded-full border border-border bg-background flex items-center justify-center shadow-sm group hover:border-primary/50 transition-colors duration-300">
                  <step.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors duration-300" />

                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full border border-primary/20 scale-0 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h4 className="text-lg font-medium text-foreground mb-1 font-serif-display">{step.label}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>

      {/* Mode Selection + CTA */}
      <div className="w-full flex flex-col items-center px-6 py-20 border-t border-border">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-serif-display text-2xl md:text-3xl font-medium text-center mb-3"
        >
          {t("welcome_begin")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center max-w-md mb-10"
        >
          {t("welcome_begin_desc")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => onStart("quick")}
            className="flex flex-col items-center gap-1.5 px-8 py-5 border border-foreground text-foreground font-medium tracking-wide text-sm hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={16} />
              {t("welcome_quick")}
            </span>
            <span className="text-xs font-normal tracking-normal text-muted-foreground">{t("welcome_quick_desc")}</span>
          </button>
          <motion.button
            onClick={() => onStart("deep")}
            className="relative flex flex-col items-center gap-1.5 px-8 py-5 bg-primary text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-all duration-300 shimmer"
            style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
          >
            <span className="flex items-center gap-2">
              <Clock size={16} />
              {t("welcome_deep")}
            </span>
            <span className="text-xs font-normal tracking-normal text-primary-foreground/60">{t("welcome_deep_desc")}</span>
          </motion.button>
        </motion.div>

        <p className="mt-8 text-xs text-muted-foreground">
          {t("welcome_trust")}
        </p>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
