import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/* ─── Types ─── */
type AnimationEffect = "none" | "ken-burns-in" | "ken-burns-out" | "pan-left" | "pan-right";

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
};

/* ─── Fallback when CMS is empty ─── */
const FALLBACK_MEDIA: HeroMediaItem[] = [
  {
    id: "fallback-1",
    media_url: "https://videos.pexels.com/video-files/7578546/7578546-uhd_2560_1440_30fps.mp4",
    media_type: "video",
    title: "Interior Showcase",
    display_order: 0,
    is_active: true,
    duration_ms: 4000,
    animation_effect: "none",
  },
];

/* ─── Cross-fade transition config ─── */
const slideVariants = {
  enter: { opacity: 0, scale: 1.05 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
};

const Hero = () => {
  const [mediaItems, setMediaItems] = useState<HeroMediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setMediaItems(items.length > 0 ? items : FALLBACK_MEDIA);
    } catch {
      setMediaItems(FALLBACK_MEDIA);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  /* ─── Responsive check ─── */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ─── Entrance animation ─── */
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  /* ─── Auto-rotate slides ─── */
  useEffect(() => {
    if (mediaItems.length <= 1) return;

    const currentItem = mediaItems[currentIndex];
    const duration = currentItem?.duration_ms || 3000;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, mediaItems]);

  const currentMedia = mediaItems[currentIndex];

  return (
    <section
      id="home"
      className="sticky top-0 z-0 h-screen w-full flex items-center overflow-hidden bg-black"
    >
      {/* ── Background: Cross-fade slideshow (natural, no darkening) ── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
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
                  className="w-full h-full object-cover"
                  poster=""
                >
                  <source src={currentMedia.media_url} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={currentMedia.media_url}
                  alt={currentMedia.title || "Hero background"}
                  className={`w-full h-full object-cover ${EFFECT_CLASS[currentMedia.animation_effect || "none"]}`}
                  style={currentMedia.animation_effect && currentMedia.animation_effect !== "none"
                    ? { animationDuration: `${(currentMedia.duration_ms || 4000) / 1000}s` }
                    : undefined
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal overlays — only for text legibility, NOT for darkening visuals */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[55%] bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none" />
      </div>

      {/* ── Content Layout ── */}
      <div className="container mx-auto px-6 md:px-10 relative z-20">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <h1
            className="font-display text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6"
            style={{
              textShadow: "0 2px 30px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            Design Your <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
              Dream
            </em>{" "}
            Home.
          </h1>

          <p
            className="text-white/75 text-base md:text-lg lg:text-xl mb-10 leading-relaxed font-light max-w-xl"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
          >
            From concept to completion, we create beautiful spaces that reflect
            your lifestyle and inspire your everyday.
          </p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <Link to="/gallery">
              <Button
                size="lg"
                className="bg-site-crimson hover:bg-[#A30E28] text-white uppercase tracking-[0.2em] text-xs font-bold px-10 h-14 rounded-none group shadow-lg shadow-black/30"
              >
                See Our Works
                <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </Button>
            </Link>

            <Link to="/about-us">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 hover:border-white/50 hover:bg-white/5 text-white uppercase tracking-[0.2em] text-xs font-medium px-10 h-14 rounded-none backdrop-blur-sm"
              >
                More About Us
                <ArrowRight className="ml-3 h-4 w-4 opacity-50" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Slide Indicators (bottom center) ── */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? "w-8 bg-white"
                  : "w-3 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Scroll Hint ── */}
      <motion.div
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2 }}
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
