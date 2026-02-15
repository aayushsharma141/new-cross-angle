import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ScrollManager = () => {
    useEffect(() => {
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

        // Global Reveal Effects
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

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove((time) => lenis.raf(time * 1000));
            ScrollTrigger.getAll().forEach(t => t.kill());
            lenis.destroy();
        };
    }, []);

    return null;
};
