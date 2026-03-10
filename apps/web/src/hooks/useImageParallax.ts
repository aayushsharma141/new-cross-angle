import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import useReducedMotion from "./useReducedMotion";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface UseImageParallaxOptions {
    speed?: number; // 0 to 1, where higher means more movement
    scale?: number; // How much to scale the image initially so it can move without showing edges
}

export function useImageParallax({ speed = 0.15, scale = 1.15 }: UseImageParallaxOptions = {}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (prefersReducedMotion || !containerRef.current || !imageRef.current) {
            return;
        }

        const container = containerRef.current;
        const image = imageRef.current;

        // Apply initial scale to the image so it has room to move
        gsap.set(image, { scale: scale, transformOrigin: 'center center' });

        const parallaxTween = gsap.fromTo(
            image,
            { y: "-8%" },
            {
                y: "8%",
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            }
        );

        return () => {
            parallaxTween.kill();
        };
    }, [prefersReducedMotion, scale, speed]);

    return { containerRef, imageRef };
}
