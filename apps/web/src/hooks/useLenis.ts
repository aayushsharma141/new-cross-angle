import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

/**
 * Initializes a singleton Lenis smooth-scroll instance and integrates
 * its RAF loop with GSAP's ticker so ScrollTrigger positions are accurate.
 * Call once at the top of App.tsx.
 */
const useLenis = () => {
    const initRef = useRef(false);

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
        });

        // Sync Lenis RAF with GSAP ticker
        gsap.ticker.add((time) => {
            lenisInstance?.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // Keep ScrollTrigger up to date when Lenis scrolls
        lenisInstance.on("scroll", ScrollTrigger.update);

        return () => {
            lenisInstance?.destroy();
            lenisInstance = null;
        };
    }, []);
};

export default useLenis;
