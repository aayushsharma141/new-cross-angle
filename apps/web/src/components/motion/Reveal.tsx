import { ReactNode, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import useReducedMotion from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** Seconds before the reveal starts once in view. */
  delay?: number;
  /** Stagger direct children instead of revealing the wrapper as one block. */
  stagger?: number;
  /** ScrollTrigger start position (default: element top at 85% of viewport). */
  start?: string;
  className?: string;
  as?: "div" | "section" | "ul" | "li" | "article";
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  up: { autoAlpha: 0, y: 48 },
  left: { autoAlpha: 0, x: -56 },
  right: { autoAlpha: 0, x: 56 },
  scale: { autoAlpha: 0, scale: 0.94 },
  fade: { autoAlpha: 0 },
};

/**
 * In-view entrance for editorial sections — the inner-page counterpart to
 * the homepage's scrubbed chapters. Plays once when the element enters the
 * viewport; renders statically under prefers-reduced-motion.
 */
export const Reveal = ({
  children,
  variant = "up",
  delay = 0,
  stagger,
  start = "top 85%",
  className,
  as: Tag = "div",
}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (prefersReducedMotion || !el) return;
      const targets = stagger ? Array.from(el.children) : el;
      gsap.fromTo(targets, FROM[variant], {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1,
        delay,
        stagger: stagger ?? 0,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref, dependencies: [prefersReducedMotion] },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = Tag as any;
  return (
    <Component ref={ref} className={cn(className)}>
      {children}
    </Component>
  );
};

export default Reveal;
