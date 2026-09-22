import { ReactNode, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import useReducedMotion from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface ChapterBuildContext {
  /** Scrubbed timeline: progress 0 → 1 across the whole runway. */
  tl: gsap.core.Timeline;
  /** Selector scoped to the sticky stage (`q(".word")`). */
  q: gsap.utils.SelectorFunc;
  /** The pinned viewport element. */
  stage: HTMLDivElement;
}

export interface PinnedChapterProps {
  /**
   * Extra scroll distance the stage stays pinned for, in viewport heights.
   * `1.5` ⇒ section is 250vh tall, the viewport stays fixed for 150vh of scroll.
   */
  runway?: number;
  /** Runway below the `md` breakpoint. Defaults to `runway * 0.6`. */
  mobileRunway?: number;
  /**
   * Populate the scrubbed timeline. Runs once on mount (and again on
   * breakpoint change). Write children in their FINAL state and animate
   * `from` hidden — that way the reduced-motion fallback needs no branches.
   */
  build: (ctx: ChapterBuildContext) => void;
  /** Smoothing between scroll position and timeline head, in seconds. */
  scrub?: number | boolean;
  id?: string;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}

const MD_QUERY = "(min-width: 768px)";

/**
 * A scroll-pinned "chapter": tall runway section + sticky 100dvh stage,
 * with a GSAP timeline scrubbed 0→1 across the runway.
 *
 * Pinning is done with CSS `position: sticky` rather than ScrollTrigger's
 * `pin`, so no pin-spacer is injected, nothing reflows on refresh, and it
 * stays rock-solid under Lenis. ScrollTrigger only supplies progress.
 *
 * With `prefers-reduced-motion` the section collapses to a single static
 * viewport with `data-motion="static"` and no timeline is built.
 */
export const PinnedChapter = ({
  runway = 1.5,
  mobileRunway,
  build,
  scrub = 0.6,
  id,
  className,
  stageClassName,
  children,
}: PinnedChapterProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const effectiveMobileRunway = mobileRunway ?? runway * 0.6;

  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: MD_QUERY, isMobile: `not all and ${MD_QUERY}` },
        () => {
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub,
              invalidateOnRefresh: true,
            },
          });
          build({ tl, q: gsap.utils.selector(stage), stage });
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  const sectionStyle = prefersReducedMotion
    ? undefined
    : ({
        "--chapter-runway": `${runway * 100}vh`,
        "--chapter-runway-mobile": `${effectiveMobileRunway * 100}vh`,
      } as React.CSSProperties);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-motion={prefersReducedMotion ? "static" : "scrubbed"}
      className={cn("pinned-chapter relative w-full", className)}
      style={sectionStyle}
    >
      <div
        ref={stageRef}
        className={cn(
          "pinned-chapter__stage relative w-full overflow-hidden",
          prefersReducedMotion ? "min-h-[100dvh]" : "sticky top-0 h-[100dvh]",
          stageClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
};

export default PinnedChapter;
