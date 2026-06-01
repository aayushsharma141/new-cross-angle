import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Image } from "@/components/ui/enhanced/image";

/* ─── Types ─── */
type AnimationEffect = "none" | "ken-burns-in" | "ken-burns-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down" | "zoom-pan";

interface HeroMediaItem {
  id: string;
  media_url: string;
  media_type: "video" | "image";
  title: string | null;
  display_order: number;
  is_active: boolean;
  duration_ms: number;
  animation_effect?: AnimationEffect;
}

/* ─── Animation effect → CSS class mapping ─── */
const EFFECT_CLASS: Record<AnimationEffect, string> = {
  none: "",
  "ken-burns-in": "hero-anim-kb-in",
  "ken-burns-out": "hero-anim-kb-out",
  "pan-left": "hero-anim-pan-left",
  "pan-right": "hero-anim-pan-right",
  "pan-up": "hero-anim-pan-up",
  "pan-down": "hero-anim-pan-down",
  "zoom-pan": "hero-anim-zoom-pan",
};

/* ─── Preload a single image URL, resolves when fully decoded ─── */
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = url;
    if (img.complete && img.naturalWidth > 0) { resolve(); return; }
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

/* ─────────────────────────────────────────────────────────────
   Slide state machine
   Each slide sits at one of three positions along the x-axis:
     "left"   → translateX(-100%)  off-screen left
     "center" → translateX(0)      fully visible
     "right"  → translateX(100%)   off-screen right
   On transition, the outgoing slide moves to "left" and the
   incoming slide moves in from "right" (or vice-versa).
──────────────────────────────────────────────────────────────*/
type SlidePos = "left" | "center" | "right";

function getTranslateX(pos: SlidePos): string {
  if (pos === "left") return "translateX(-100%)";
  if (pos === "right") return "translateX(100%)";
  return "translateX(0)";
}

const Hero = () => {
  const [mediaItems, setMediaItems] = useState<HeroMediaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  /* scroll-based scroll-hint fade */
  const { scrollY } = useScroll();
  const scrollHintOpacity = useTransform(scrollY, [0, 300], [0.55, 0]);

  /* ─── Fetch hero media from Supabase ─── */
  const fetchMedia = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("hero_media")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      let items = (data as HeroMediaItem[] | null) || [];

      items = items.map(item => {
        if (item.media_url && item.media_url.includes('11630727')) {
          return { ...item, media_type: 'image', media_url: '/hero_reality_render_1775299733746.png' };
        }
        return item;
      });

      setMediaItems(items);
    } catch {
      setMediaItems([]);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
    return () => { isMountedRef.current = false; };
  }, [fetchMedia]);

  /* ─── Core transition: preload → slide in ─── */
  const transitionTo = useCallback(async (nextIdx: number, dir: 1 | -1) => {
    if (!isMountedRef.current || transitioning) return;
    const nextItem = mediaItems[nextIdx];

    setTransitioning(true);

    // Preload before any visual change
    if (nextItem && nextItem.media_type === "image") {
      await preloadImage(nextItem.media_url);
    }
    if (!isMountedRef.current) return;

    // RAF ensures the browser has painted the preloaded img offscreen
    requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      setDirection(dir);
      setPrevIndex((prev) => {
        // carry old active to prev so it can slide out
        void prev;
        return activeIndex;
      });
      setActiveIndex(nextIdx);
      // After the CSS transition duration (800ms), mark done
      setTimeout(() => {
        if (isMountedRef.current) {
          setPrevIndex(null);
          setTransitioning(false);
        }
      }, 900);
    });
  }, [activeIndex, mediaItems, transitioning]);

  /* ─── Auto-rotate ─── */
  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const currentItem = mediaItems[activeIndex];
    const duration = currentItem?.duration_ms || 5000;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const nextIdx = (activeIndex + 1) % mediaItems.length;
      transitionTo(nextIdx, 1);
    }, duration);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex, mediaItems, transitionTo]);

  /* ─── Manual dot navigation ─── */
  const goToSlide = useCallback((idx: number) => {
    if (idx === activeIndex || transitioning) return;
    const dir = idx > activeIndex ? 1 : -1;
    transitionTo(idx, dir);
  }, [activeIndex, transitioning, transitionTo]);

  /* ─── Per-slide CSS transform ─── */
  const getSlideStyle = (i: number): React.CSSProperties => {
    // Active slide: center
    if (i === activeIndex) {
      return {
        transform: "translateX(0)",
        zIndex: 3,
        transition: transitioning
          ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)"
          : "none",
      };
    }
    // Exiting slide: slide out in opposite direction
    if (i === prevIndex && prevIndex !== null) {
      return {
        transform: direction === 1 ? "translateX(-100%)" : "translateX(100%)",
        zIndex: 2,
        transition: "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)",
      };
    }
    // All other slides wait off-screen in their entry direction
    // (the incoming slide starts off-screen and animates to 0, which is handled by activeIndex case above on next render)
    return {
      transform: direction === 1 ? "translateX(100%)" : "translateX(-100%)",
      zIndex: 1,
      transition: "none",
    };
  };

  /* ─── Framer Motion Animation Variants ─── */
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemUp = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const } },
  };
  const popIn = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
  };
  const slideLeft = {
    hidden: { x: 50, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const, delay: 0.8 } },
  };

  return (
    <section
      id="home"
      className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-black"
    >
      {/* Noise grain overlay */}
      <div className="absolute inset-0 home-noise pointer-events-none opacity-[0.03] mix-blend-mode-soft-light z-10" />

      {/* ═══ Background slides — permanent stack with slide transforms ═══ */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static fallback while CMS loads */}
        {mediaItems.length === 0 && (
          <Image
            src="/hero_reality_render_1775299733746.png"
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full"
            imageClassName="object-cover"
            loading="eager"
            fetchPriority="high"
          />
        )}

        {/* ALL slides always in DOM — position set via transform */}
        {mediaItems.map((item, i) => (
          <div
            key={item.id}
            className="absolute inset-0 will-change-transform"
            style={getSlideStyle(i)}
          >
            {item.media_type === "video" ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/hero_reality_render_1775299733746.png"
                className="w-full h-full object-cover"
              >
                <source src={item.media_url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={item.media_url}
                alt={item.title || "Hero background"}
                className={`w-full h-full object-cover ${EFFECT_CLASS[item.animation_effect || "none"]}`}
                loading={i <= 1 ? "eager" : "lazy"}
                decoding="async"
                style={
                  item.animation_effect && item.animation_effect !== "none"
                    ? { animationDuration: `${(item.duration_ms || 6500) / 1000}s` }
                    : undefined
                }
              />
            )}
          </div>
        ))}

        {/* ── Overlays — always on top of slides ── */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(182,24,38,0.16),transparent_28%)] pointer-events-none" style={{ zIndex: 4 }} />
        <div className="absolute inset-0 bg-black/60 md:bg-transparent pointer-events-none" style={{ zIndex: 4 }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.62)_32%,rgba(0,0,0,0.18)_64%,rgba(0,0,0,0.45)_100%)] pointer-events-none" style={{ zIndex: 4 }} />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/55 to-transparent pointer-events-none" style={{ zIndex: 4 }} />
      </div>

      {/* ═══ Content: split-grid layout ═══ */}
      <div className="container-wide mx-auto h-full px-4 sm:px-6 lg:px-10 relative z-20">
        <div className="grid h-full items-end lg:grid-cols-[minmax(0,1fr)_320px] gap-8 pb-[clamp(7rem,18vh,12rem)] md:pb-[clamp(5rem,12vh,10rem)] pt-[clamp(7rem,15vh,12rem)]">

          {/* ── Left column ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-[46rem] self-center"
          >
            <motion.span variants={itemUp} className="home-kicker mb-6 inline-block">
              <span className="hero-kicker-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Premier Interior Design Studio</span>
            </motion.span>

            <div className="mb-6">
              <motion.h1
                variants={itemUp}
                className="hero-title font-display text-[clamp(2.5rem,8vw,7.6rem)] font-semibold text-white leading-[0.96] tracking-[-0.05em] max-w-full sm:max-w-[12ch]"
                style={{ textShadow: "0 10px 38px rgba(0,0,0,0.42), 0 2px 10px rgba(0,0,0,0.24)" }}
              >
                <span className="text-[#F9F6F0]">Design Your</span>
                <br />
                <span
                  className="hero-title-accent text-transparent bg-clip-text drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  style={{
                    backgroundImage: "linear-gradient(to bottom, #FFFFFF 0%, #EAD5B7 30%, #C39E5C 70%, #8C6730 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Dream Home.
                </span>
              </motion.h1>
            </div>

            <motion.p
              variants={itemUp}
              className="hero-body-text home-body text-base md:text-lg lg:text-xl mb-10 max-w-[35rem]"
              style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
            >
              Award-winning interior design for homes and commercial spaces,
              shaped with editorial restraint, practical clarity, and execution
              you can trust from concept to handover.
            </motion.p>

            <motion.div variants={itemUp} className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="hero-cta-btn">
                <Link
                  to="/gallery"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap home-button-sweep group rounded-none h-14 px-8 md:px-10 uppercase tracking-[0.2em] text-[11px] font-bold transition-all duration-300 bg-[#E31837] text-white hover:bg-[#b5132b]"
                >
                  <span>See Our Works</span>
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
              <div className="hero-cta-btn">
                <Link
                  to="/about-us"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap home-button-sweep group rounded-none h-14 px-8 md:px-10 uppercase tracking-[0.2em] text-[11px] font-medium transition-all duration-300 bg-black text-white border border-white/20 hover:bg-black/80"
                >
                  <span>More About Us</span>
                  <ArrowRight className="ml-3 h-4 w-4 opacity-60" />
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemUp} className="flex flex-wrap gap-3">
              <motion.span variants={popIn} className="hero-trust-chip home-chip bg-black/40 backdrop-blur-md border-white/10">
                <Sparkles className="h-3.5 w-3.5 text-[#D1AF6E]" />
                <span>500+ Projects Delivered</span>
              </motion.span>
              <motion.span variants={popIn} className="hero-trust-chip home-chip bg-black/40 backdrop-blur-md border-white/10">
                <Sparkles className="h-3.5 w-3.5 text-[#D1AF6E]" />
                <span>15+ Years of Design Experience</span>
              </motion.span>
              <motion.span variants={popIn} className="hero-trust-chip home-chip bg-black/40 backdrop-blur-md border-white/10">
                <Sparkles className="h-3.5 w-3.5 text-[#D1AF6E]" />
                <span>Jamshedpur &amp; Kolkata</span>
              </motion.span>
            </motion.div>
          </motion.div>

          {/* ── Right column: info card (desktop only) ── */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate="show"
            className="hero-side-panel hidden lg:flex self-end justify-end lg:-translate-x-16"
          >
            <div className="home-panel w-full max-w-[320px] p-6 rounded-none relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#D1AF6E]/40" />
              <span className="home-kicker mb-4">
                <span>Why Clients Choose Us</span>
              </span>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/38 mb-2">Studio Presence</p>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="h-4 w-4 text-[#D1AF6E]" />
                    <span className="text-sm">Jamshedpur and Kolkata</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-3xl font-display text-white">500+</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/60 mt-1">Projects</p>
                  </div>
                  <div>
                    <p className="text-3xl font-display text-white">45</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/60 mt-1">Day Delivery Promise</p>
                  </div>
                </div>
                <p className="text-sm text-white/62 leading-relaxed">
                  Clear planning, transparent execution, and a premium design
                  language carried from the first meeting through final reveal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Slide indicators ═══ */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex
                  ? "w-12 bg-white shadow-[0_0_18px_rgba(255,255,255,0.34)]"
                  : "w-4 bg-white/24 hover:bg-white/48"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ═══ Scroll hint ═══ */}
      <motion.div
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-2"
        style={{ opacity: scrollHintOpacity }}
      >
        <span className="text-[10px] text-white/60 uppercase tracking-[0.3em] font-medium [writing-mode:vertical-rl]">Scroll</span>
        <motion.div
          className="w-px h-10 bg-white/30"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
};

export default Hero;
