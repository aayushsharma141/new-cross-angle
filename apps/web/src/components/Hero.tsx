import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitType from "split-type";
import { Image } from "@/components/ui/image";

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

/* ─── Fallback when CMS is empty ─── */

/* ─── Vertical wipe transition (replaces cross-fade) ─── */
const slideVariants = {
  enter: { clipPath: "inset(100% 0% 0% 0%)", zIndex: 10 },
  center: { clipPath: "inset(0% 0% 0% 0%)", zIndex: 10 },
  // Keep the exiting slide fully visible but underneath the new one
  exit: { clipPath: "inset(0% 0% 0% 0%)", zIndex: 0 },
};

const Hero = () => {
  const [mediaItems, setMediaItems] = useState<HeroMediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const items = (data as HeroMediaItem[] | null) || [];
      setMediaItems(items);
    } catch {
      setMediaItems([]);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    if (currentIndex >= mediaItems.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, mediaItems.length]);

  /* ─── Auto-rotate slides ─── */
  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const currentItem = mediaItems[currentIndex];
    const duration = currentItem?.duration_ms || 5000;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, mediaItems]);

  /* ─── GSAP Entrance Animations ─── */
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Split headlines for staggered character animation
    const title = new SplitType('.hero-title', { types: 'chars,words' });
    const kicker = new SplitType('.hero-kicker-text', { types: 'words' });

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.from('.hero-kicker-text .word', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
    })
      .from(title.chars, {
        y: 80,
        opacity: 0,
        duration: 0.9,
        stagger: 0.018,
        // rotateZ removed — caused blue placeholder boxes during GSAP split
      }, "-=0.6")
      .from('.hero-body-text', {
        y: 30,
        opacity: 0,
        duration: 1,
      }, "-=0.8")
      .from('.hero-cta-btn', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
      }, "-=0.8")
      .from('.hero-trust-chip', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      }, "-=0.6")
      .from('.hero-side-panel', {
        x: 50,
        opacity: 0,
        duration: 1,
      }, "-=1");

    return () => {
      tl.kill();
      title.revert();
      kicker.revert();
    };
  }, { scope: containerRef, dependencies: [] });

  const currentMedia = mediaItems[currentIndex];

  return (
    <section
      id="home"
      className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-black"
    >
      {/* ═══ Background slide ═══ */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {currentMedia && (
            <motion.div
              key={currentMedia.id + "-" + currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {currentMedia.media_type === "video" ? (
                <video
                  key={currentMedia.media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/hero_reality_render_1775299733746.png"
                  className="w-full h-full object-cover"
                >
                  <source src={currentMedia.media_url} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={currentMedia.media_url}
                  alt={currentMedia.title || "Hero background"}
                  className="h-full w-full"
                  imageClassName={EFFECT_CLASS[currentMedia.animation_effect || "none"]}
                  width={1920}
                  height={1080}
                  loading="eager"
                  style={
                    currentMedia.animation_effect &&
                      currentMedia.animation_effect !== "none"
                      ? {
                        animationDuration: `${(currentMedia.duration_ms || 6500) / 1000}s`,
                      }
                      : undefined
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Overlays (exact surge.sh match) ── */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(182,24,38,0.16),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.62)_32%,rgba(0,0,0,0.18)_64%,rgba(0,0,0,0.45)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/55 to-transparent" />
      </div>

      {/* ═══ Content: split-grid layout ═══ */}
      <div ref={containerRef} className="container mx-auto h-full px-6 md:px-10 relative z-20">
        <div className="grid h-full items-end lg:grid-cols-[minmax(0,1fr)_320px] gap-8 pb-10 pt-28 md:pt-32 md:pb-14">
          {/* ── Left column: headline + CTAs + trust chips ── */}
          <div className="max-w-[46rem] self-center">
            {/* Kicker */}
            <span className="home-kicker mb-6">
              <span className="hero-kicker-text">Premier Interior Design Studio</span>
            </span>

            {/* Headline — overflow-hidden clips chars during GSAP entry animation */}
            {/* DO NOT add padding/margin inside this wrapper; it will shift clipping */}
            <div className="overflow-hidden mb-6">
              <h1
                className="hero-title font-display text-[clamp(3.35rem,8vw,7.6rem)] font-semibold text-white leading-[0.94] tracking-[-0.05em] max-w-[12ch]"
                style={{
                  textShadow:
                    "0 10px 38px rgba(0,0,0,0.42), 0 2px 10px rgba(0,0,0,0.24)",
                }}
              >
                Design Your
                <br />
                {/* color: white fallback — prevents browser-blue flash if bg-clip fails */}
                <span
                  className="hero-title-accent text-transparent bg-clip-text bg-[linear-gradient(135deg,#FFFFFF_0%,#F4E0B7_46%,rgba(255,255,255,0.78)_100%)]"
                  style={{ color: 'white' }}
                >
                  Dream Home.
                </span>
              </h1>
            </div>

            {/* Body */}
            <p
              className="hero-body-text home-body text-base md:text-lg lg:text-xl mb-10 max-w-[35rem]"
              style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
            >
              Award-winning interior design for homes and commercial spaces,
              shaped with editorial restraint, practical clarity, and execution
              you can trust from concept to handover.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="hero-cta-btn">
                <Link
                  to="/gallery"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap home-button-sweep home-cta-primary group rounded-none h-14 px-8 md:px-10 uppercase tracking-[0.2em] text-[11px] font-bold transition-all duration-300"
                >
                  <span>See Our Works</span>
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
              <div className="hero-cta-btn">
                <Link
                  to="/about-us"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap home-button-sweep home-cta-secondary group rounded-none h-14 px-8 md:px-10 uppercase tracking-[0.2em] text-[11px] font-medium transition-all duration-300"
                >
                  <span>More About Us</span>
                  <ArrowRight className="ml-3 h-4 w-4 opacity-60" />
                </Link>
              </div>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-3">
              <span className="hero-trust-chip home-chip">
                <Sparkles className="h-3.5 w-3.5 text-[#D1AF6E]" />
                <span>500+ Projects Delivered</span>
              </span>
              <span className="hero-trust-chip home-chip">
                <Sparkles className="h-3.5 w-3.5 text-[#D1AF6E]" />
                <span>15+ Years of Design Experience</span>
              </span>
              <span className="hero-trust-chip home-chip">
                <Sparkles className="h-3.5 w-3.5 text-[#D1AF6E]" />
                <span>Jamshedpur &amp; Nearby</span>
              </span>
            </div>
          </div>

          {/* ── Right column: info card (desktop only) ── */}
          <div
            className="hero-side-panel hidden lg:flex self-end justify-end"
          >
            <div className="home-panel w-full max-w-[320px] p-6 rounded-none">
              <span className="home-kicker mb-4">
                <span>Why Clients Choose Us</span>
              </span>

              <div className="space-y-5">
                {/* Studio Presence */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/38 mb-2">
                    Studio Presence
                  </p>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="h-4 w-4 text-[#D1AF6E]" />
                    <span className="text-sm">Jamshedpur &amp; Nearby Neighborhoods</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-3xl font-display text-white">500+</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/42 mt-1">
                      Projects
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-display text-white">45</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/42 mt-1">
                      Day Delivery Promise
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-white/62 leading-relaxed">
                  Clear planning, transparent execution, and a premium design
                  language carried from the first meeting through final reveal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Slide indicators (bottom center) ═══ */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex
                  ? "w-12 bg-white shadow-[0_0_18px_rgba(255,255,255,0.34)]"
                  : "w-4 bg-white/24 hover:bg-white/48"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ═══ Scroll hint (bottom right) ═══ */}
      <motion.div
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-2"
        style={{ opacity: scrollHintOpacity }}
      >
        <span className="text-[10px] text-white/60 uppercase tracking-[0.3em] font-medium [writing-mode:vertical-rl]">
          Scroll
        </span>
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
