import { ReactNode, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import useReducedMotion from "@/hooks/useReducedMotion";
import { useSiteMediaSlot } from "@/hooks/useSiteMediaSlot";
import { getOptimizedUrl } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import { ChapterKicker } from "@/components/home/ChapterKicker";
import { HeroWatermark } from "@/components/home/HeroWatermark";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface PageHeroProps {
  /** Eyebrow above the headline ("Our Story"). */
  kicker: string;
  /** Headline lines; each rises in on its own. Strings or inline JSX. */
  lines: ReactNode[];
  /** Optional paragraph under the headline. */
  lede?: ReactNode;
  /** Buttons / links rendered under the lede. */
  actions?: ReactNode;
  /** Extra content along the bottom edge (stats, meta). Hidden below `md` to keep the headline in view. */
  meta?: ReactNode;
  /** Backdrop photograph: `site_media_assets.asset_key` = `page_<entity>_hero`, with a static fallback. */
  image: { entity: string; fallback: string; alt?: string };
  /** Text alignment / column placement. */
  align?: "left" | "center";
  /** Show the rotating brand seal (top-right). */
  seal?: boolean;
  className?: string;
  /** Element rendered as the headline — pages that already have an `<h1>` can pass "h2". */
  as?: "h1" | "h2";
  /** Headline scale: "lg" for two short lines, "md" for longer statements. */
  size?: "lg" | "md";
}

const HEADLINE_SIZE = {
  lg: "text-[clamp(2.6rem,7vw,6.5rem)] max-w-[20ch]",
  md: "text-[clamp(2.2rem,5.2vw,4.9rem)] max-w-[24ch]",
} as const;

/**
 * Cinematic page hero shared by the inner pages: a 90vh photograph with
 * a slow push-in on load, kicker + headline lines rising in sequence, and
 * a scroll-linked exit (photo scales up while the copy drifts out) so
 * every page opens the way the homepage does.
 *
 * Reduced motion: no entrance or exit animation, static layout.
 */
export const PageHero = ({
  kicker,
  lines,
  lede,
  actions,
  meta,
  image,
  align = "left",
  seal = true,
  className,
  as: Heading = "h1",
  size = "lg",
}: PageHeroProps) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { url } = useSiteMediaSlot(`page_${image.entity}_hero`, image.fallback);

  useGSAP(
    () => {
      if (prefersReducedMotion || !ref.current) return;
      const q = gsap.utils.selector(ref);

      // Entrance
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(q("[data-hero-media]"), { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
        .fromTo(q("[data-hero-kicker]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.2)
        .fromTo(q("[data-hero-line]"), { autoAlpha: 0, y: "0.6em" }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.3)
        .fromTo(q("[data-hero-lede]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.7)
        .fromTo(q("[data-hero-meta]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.85);

      // Scroll exit
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.6 },
      })
        .to(q("[data-hero-media]"), { scale: 1.1, duration: 1 }, 0)
        .to(q("[data-hero-copy]"), { y: -70, autoAlpha: 0, duration: 0.6 }, 0.15)
        .to(q("[data-hero-seal]"), { rotate: 90, autoAlpha: 0, duration: 0.6 }, 0.1);
    },
    { scope: ref, dependencies: [prefersReducedMotion] },
  );

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-full h-[80vh] md:h-[90vh] min-h-[560px] overflow-hidden bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]",
        className,
      )}
    >
      {/* Photograph */}
      <div data-hero-media className="absolute inset-0 will-change-transform transform-gpu">
        <img
          src={getOptimizedUrl(url, { width: 1920, quality: 82 })}
          alt={image.alt ?? ""}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.66)_38%,rgba(0,0,0,0.3)_64%,rgba(0,0,0,0.15)_100%)]" />
        <div className="absolute inset-0 home-noise mix-blend-overlay" />
      </div>

      {seal && (
        <div data-hero-seal className="absolute top-[14vh] right-6 md:right-16 lg:right-24 z-[9] pointer-events-none will-change-transform">
          <HeroWatermark />
        </div>
      )}

      {/* Copy */}
      <div
        data-hero-copy
        className={cn(
          "absolute inset-0 z-10 flex flex-col justify-end px-6 md:px-12 lg:px-24 pb-[8vh] md:pb-[10vh] will-change-transform",
          align === "center" && "items-center text-center",
        )}
      >
        <div className={cn("w-full max-w-[1600px] mx-auto flex flex-col gap-5", align === "center" && "items-center")}>
          <div data-hero-kicker>
            <ChapterKicker align={align}>{kicker}</ChapterKicker>
          </div>
          <Heading
            className={cn("font-display leading-[0.98] font-normal [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]", HEADLINE_SIZE[size])}
            style={{ letterSpacing: "-0.03em" }}
          >
            {lines.map((line, i) => (
              <span key={i} data-hero-line className="block">
                {line}
              </span>
            ))}
          </Heading>
          {lede && (
            <p data-hero-lede className="text-base md:text-lg max-w-[46ch] leading-relaxed text-white/80 [text-shadow:0_1px_16px_rgba(0,0,0,0.5)]">
              {lede}
            </p>
          )}
          {actions && (
            <div data-hero-lede className={cn("flex flex-wrap gap-4 mt-1", align === "center" && "justify-center")}>
              {actions}
            </div>
          )}
          {meta && (
            <div data-hero-meta className="hidden md:block mt-8 pt-6 border-t border-white/10 w-full">
              {meta}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
