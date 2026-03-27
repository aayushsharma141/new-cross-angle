import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const useGSAP = (
    effect: (context: gsap.Context) => void | (() => void),
    deps: React.DependencyList = []
) => {
    const scope = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        if (!scope.current) return;
        const ctx = gsap.context(effect, scope.current);

        return () => {
            ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { scope };
};

// Export pre-configured gsap instance
export { gsap };
