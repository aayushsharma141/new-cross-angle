import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";
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
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

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

  const transitionTo = useCallback(async (nextIdx: number, dir: 1 | -1) => {
    if (!isMountedRef.current || transitioning) return;
    const nextItem = mediaItems[nextIdx];
    setTransitioning(true);
    
    if (nextItem && nextItem.media_type === "image") {
      await preloadImage(nextItem.media_url);
    }
    if (!isMountedRef.current) return;
    
    requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      setDirection(dir);
      setPrevIndex(activeIndex);
      setActiveIndex(nextIdx);
      setTimeout(() => {
        if (isMountedRef.current) {
          setPrevIndex(null);
          setTransitioning(false);
        }
      }, 900);
    });
  }, [activeIndex, mediaItems, transitioning]);

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

  const getSlideStyle = (i: number): React.CSSProperties => {
    if (i === activeIndex) {
      return {
        transform: "translateX(0)",
        zIndex: 3,
        transition: transitioning ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
      };
    }
    if (i === prevIndex && prevIndex !== null) {
      return {
        transform: direction === 1 ? "translateX(-100%)" : "translateX(100%)",
        zIndex: 2,
        transition: "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)",
      };
    }
    return {
      transform: direction === 1 ? "translateX(100%)" : "translateX(-100%)",
      zIndex: 1,
      transition: "none",
    };
  };

  return (
    <section ref={containerRef} className="relative w-full h-[70vh] md:h-[85vh] lg:h-[95vh] overflow-hidden bg-[var(--s-canvas-primary)]">
      {/* Noise grain overlay for canvas */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-10 bg-[url('/noise.png')]" />

      {/* Frame the photography with whitespace margins (Architectural framing) */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 overflow-hidden bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)]">
        {mediaItems.length === 0 && (
          <MediaSlot
            assetKey="home_hero_bg"
            fallbackUrl="/hero_reality_render_1775299733746.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {mediaItems.map((item, i) => (
          <div key={item.id} className="absolute inset-0 will-change-transform" style={getSlideStyle(i)}>
            {item.media_type === "video" ? (
              <video autoPlay loop muted playsInline preload="auto" poster="/hero_reality_render_1775299733746.png" className="w-full h-full object-cover">
                <source src={item.media_url} type="video/mp4" />
              </video>
            ) : (
              <img src={item.media_url} alt={item.title || "Hero background"} className={`w-full h-full object-cover ${EFFECT_CLASS[item.animation_effect || "none"]}`} loading={i <= 1 ? "eager" : "lazy"} decoding="async" style={item.animation_effect && item.animation_effect !== "none" ? { animationDuration: `${(item.duration_ms || 6500) / 1000}s` } : undefined} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
