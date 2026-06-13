import { useLayoutEffect, useRef } from "react";

// Export a type for the callback context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GsapContext = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GsapInstance = any;

export const useGSAP = (
    effect: (context: GsapContext, gsap: GsapInstance) => void | (() => void),
    deps: React.DependencyList = []
) => {
    const scope = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const el = scope.current;
        if (!el) return;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let ctx: any;
        let cleanupFn: void | (() => void);

        const initGsap = async () => {
            const [gsapMod, stMod] = await Promise.all([
                import("gsap"),
                import("gsap/ScrollTrigger")
            ]);
            
            const gsap = gsapMod.default || gsapMod;
            const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
            gsap.registerPlugin(ScrollTrigger);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx = (gsap as any).context(() => {
                cleanupFn = effect(ctx, gsap);
            }, el);
        };

        initGsap();

        return () => {
            if (cleanupFn) cleanupFn();
            if (ctx) ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { scope };
};
