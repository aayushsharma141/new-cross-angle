import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useReducedMotion from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export const ScrollManager = () => {
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (prefersReducedMotion) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenis.on('scroll', ScrollTrigger.update);

        ScrollTrigger.scrollerProxy(document.documentElement, {
            scrollTop(value) {
                if (value !== undefined) {
                    lenis.scrollTo(value, { immediate: true });
                }
                return lenis.scroll;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: document.documentElement.style.transform ? "transform" : "fixed",
        });

        const handleRefresh = () => lenis.resize();
        ScrollTrigger.addEventListener("refresh", handleRefresh);

        const revealElements = document.querySelectorAll('.gsap-reveal');
        revealElements.forEach((el) => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
            });
        });

        const staggerContainers = document.querySelectorAll('.gsap-reveal-stagger');
        staggerContainers.forEach((container) => {
            const children = container.children;
            gsap.from(children, {
                scrollTrigger: {
                    trigger: container,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
            });
        });

        const handleTick = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(handleTick);

        gsap.ticker.lagSmoothing(0);

        return () => {
            ScrollTrigger.removeEventListener("refresh", handleRefresh);
            gsap.ticker.remove(handleTick);
            ScrollTrigger.getAll().forEach(t => t.kill());
            lenis.destroy();
        };
    }, [prefersReducedMotion]);

    return null;
};
