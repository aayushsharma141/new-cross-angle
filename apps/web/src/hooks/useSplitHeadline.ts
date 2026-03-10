import { useEffect, RefObject } from "react";
import gsap from "gsap";
import SplitType from "split-type";

/**
 * Splits the headline inside `headlineRef` into words using SplitType
 * and creates a GSAP timeline that reveals each word via a clip/translate mask.
 *
 * Returns the GSAP timeline so callers can chain it into a master sequence.
 *
 * @param headlineRef - ref pointing to the heading element
 * @param delay       - start delay within a master timeline (seconds)
 */
const useSplitHeadline = (
    headlineRef: RefObject<HTMLElement>,
    delay = 0.3
): void => {
    useEffect(() => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        const el = headlineRef.current;
        if (!el) return;

        // Split into words
        const split = new SplitType(el, { types: "words" });

        // Set initial state
        gsap.set(split.words, { y: 80, opacity: 0 });

        const tl = gsap.timeline({ delay });
        tl.to(split.words, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.07,
            ease: "power3.out",
        });

        return () => {
            tl.kill();
            split.revert();
        };
    }, [headlineRef, delay]);
};

export default useSplitHeadline;
