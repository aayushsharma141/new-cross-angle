import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAttentionTelemetry } from "@/hooks/useAttentionTelemetry";

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

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = url;
    if (img.complete && img.naturalWidth > 0) { resolve(); return; }
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

const Hero = () => {
  const containerRef = useAttentionTelemetry<HTMLDivElement>("entrance", "hero-media", 1);
  const [mediaItems, setMediaItems] = useState<HeroMediaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Stagger content reveal on mount
  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

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

  // Cross-dissolve: just swap opacity, no translateX
  const transitionTo = useCallback(async (nextIdx: number) => {
    if (!isMountedRef.current || transitioning) return;
    const nextItem = mediaItems[nextIdx];
    setTransitioning(true);

    if (nextItem && nextItem.media_type === "image") {
      await preloadImage(nextItem.media_url);
    }
    if (!isMountedRef.current) return;

    requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      setPrevIndex(activeIndex);
      setActiveIndex(nextIdx);
      setTimeout(() => {
        if (isMountedRef.current) {
          setPrevIndex(null);
          setTransitioning(false);
        }
      }, 1100);
    });
  }, [activeIndex, mediaItems, transitioning]);

  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const currentItem = mediaItems[activeIndex];
    const duration = currentItem?.duration_ms || 6000;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const nextIdx = (activeIndex + 1) % mediaItems.length;
      transitionTo(nextIdx);
    }, duration);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex, mediaItems, transitionTo]);

  // Cross-dissolve style: use opacity instead of translateX
  const getSlideStyle = (i: number): React.CSSProperties => {
    if (i === activeIndex) {
      return {
        opacity: 1,
        zIndex: 3,
        transition: transitioning ? "opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
      };
    }
    if (i === prevIndex && prevIndex !== null) {
      return {
        opacity: 0,
        zIndex: 2,
        transition: "opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }
    return {
      opacity: 0,
      zIndex: 1,
      transition: "none",
    };
  };

  return (
    <>
      {/* CSS for staggered hero text reveal */}
      <style>{`
        @keyframes heroWordReveal {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-word { display: inline-block; opacity: 0; }
        .hero-content-visible .hero-word-1 {
          animation: heroWordReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
        }
        .hero-content-visible .hero-word-2 {
          animation: heroWordReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards;
        }
        .hero-content-visible .hero-kicker-text {
          animation: heroWordReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
          opacity: 0;
        }
        .hero-content-visible .hero-body-text {
          animation: heroWordReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards;
          opacity: 0;
        }
        .hero-content-visible .hero-cta-btn {
          animation: heroWordReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.82s forwards;
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-word, .hero-kicker-text, .hero-body-text, .hero-cta-btn {
            opacity: 1 !important;
            animation: none !important;
          }
        }
      `}</style>

      <section
        ref={containerRef}
        className="relative w-full h-[70vh] md:h-[85vh] lg:h-[95vh] overflow-hidden bg-[var(--s-canvas-primary)]"
      >
        {/* Noise grain overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-screen z-10 bg-[url('/noise.png')]" />

        {/* Photography layer */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Guaranteed fallback render */}
          <img
            src="/hero_reality_render_1775299733746.png"
            alt="CrossAngle luxury architectural interior"
            className="absolute inset-0 w-full h-full object-cover z-0"
            loading="eager"
            {...({ fetchpriority: "high" } as any)}
            decoding="sync"
          />

          {/* Dynamic slides — cross-dissolve */}
          {mediaItems.map((item, i) => (
            <div
              key={item.id}
              className="absolute inset-0 will-change-[opacity]"
              style={getSlideStyle(i)}
            >
              {item.media_type === "video" ? (
                <video
                  autoPlay loop muted playsInline preload="auto"
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
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero_reality_render_1775299733746.png";
                  }}
                  style={
                    item.animation_effect && item.animation_effect !== "none"
                      ? { animationDuration: `${(item.duration_ms || 7000) / 1000}s` }
                      : undefined
                  }
                />
              )}
            </div>
          ))}

          {/* Overlay — lighter so photography dominates */}
          <div
            className={`absolute inset-0 pointer-events-none z-10 flex flex-col justify-end p-8 md:p-16 lg:px-24 bg-gradient-to-t from-black/75 via-black/15 to-transparent${contentVisible ? " hero-content-visible" : ""}`}
          >
            <div className="pointer-events-auto w-full max-w-[1600px] mx-auto flex flex-col gap-5">

              {/* Kicker */}
              <span className="hero-kicker-text uppercase text-[10px] tracking-[0.25em] font-bold text-[#C9A85C] flex items-center gap-4">
                <span className="w-12 h-px bg-[#C9A85C]/60" />
                CrossAngle Interior
              </span>

              {/* Staggered headline */}
              <h1
                className="hero-title font-display text-[clamp(2.5rem,6vw,5.75rem)] leading-[1.05] text-white mb-1 font-normal"
                style={{ letterSpacing: "-0.03em" }}
              >
                <span className="hero-word hero-word-1 block">Museum-Quality</span>
                <span className="hero-word hero-word-2 block text-[#C9A85C] italic">Residential Design</span>
              </h1>

              {/* Body */}
              <p className="hero-body-text text-base md:text-lg max-w-[44ch] leading-relaxed text-white/75">
                We design turn-key interiors that blend architectural discipline with effortless living.
              </p>

              {/* CTA */}
              <div className="flex gap-4 mt-1">
                <a
                  href="/portfolio"
                  className="hero-cta-btn home-button-sweep inline-flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold text-[10px] uppercase tracking-[0.2em] hover:border-[#C9A85C] hover:text-[#C9A85C] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A85C] motion-reduce:transition-none group rounded-md"
                >
                  <span>View Portfolio</span>
                  <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true">→</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
