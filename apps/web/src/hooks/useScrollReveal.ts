import { useEffect, RefObject } from "react";
// Removed static gsap imports to enable dynamic chunking

interface ScrollRevealOptions {
    y?: number;
    opacity?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
    start?: string;
    once?: boolean;
}

/**
 * Registers a GSAP ScrollTrigger reveal on the elements inside `containerRef`.
 * Selects all children with the class names provided in `targets`.
 *
 * @param containerRef - React ref for the scroll trigger root element
 * @param targets - CSS selector(s) for elements to animate (e.g. ".reveal-title")
 * @param options   - GSAP from-to options
 */
const useScrollReveal = (
    containerRef: RefObject<Element>,
    targets: string,
    options: ScrollRevealOptions = {}
) => {
    const {
        y = 50,
        opacity = 0,
        duration = 0.85,
        delay = 0,
        stagger = 0.1,
        start = "top 82%",
        once = true,
    } = options;

    useEffect(() => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        const container = containerRef.current;
        if (!container) return;

        const els = container.querySelectorAll(targets);
        if (!els.length) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let ctx: any;

        const initAnimation = async () => {
            const [gsapMod, stMod] = await Promise.all([
                import("gsap"),
                import("gsap/ScrollTrigger")
            ]);
            
            const gsap = gsapMod.default || gsapMod;
            const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
                gsap.from(els, {
                    y,
                    opacity,
                    duration,
                    delay,
                    stagger,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: container,
                        start,
                        once,
                    },
                });
            }, container);
        };

        initAnimation();

        return () => {
            if (ctx) ctx.revert();
        };
    }, [containerRef, targets, y, opacity, duration, delay, stagger, start, once]);
};

export default useScrollReveal;
