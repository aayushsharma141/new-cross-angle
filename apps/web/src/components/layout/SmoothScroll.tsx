import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactNode, useEffect } from 'react';
import useReducedMotion from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Keeps GSAP ScrollTrigger in lock-step with the single Lenis instance.
 *
 * Lenis scrolls the native window (no transform hijack), so ScrollTrigger
 * only needs two things: a scroll notification, and for Lenis's raf to run
 * on GSAP's ticker so both advance on the same frame.
 */
const LenisGsapBridge = () => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(tick);
    };
  }, [lenis]);

  return null;
};

/**
 * Global Smooth Scroll Provider using Lenis.
 * Configured for creative, cinematic feel suitable for interior design showcase.
 * Respects prefers-reduced-motion for vestibular safety.
 *
 * This is the ONLY place a Lenis instance may be created. Scroll-driven
 * choreography (pinned chapters, scrubbed timelines) attaches to GSAP
 * ScrollTrigger, which LenisGsapBridge keeps in sync.
 */
export const SmoothScroll = ({ children }: { children: ReactNode }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false, // driven by gsap.ticker in LenisGsapBridge
        lerp: 0.08, // Slightly slower for more "luxury" feel
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
};
