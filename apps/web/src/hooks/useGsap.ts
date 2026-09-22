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
        let cancelled = false;

        const initGsap = async () => {
            const [gsapMod, stMod] = await Promise.all([
                import("gsap"),
                import("gsap/ScrollTrigger")
            ]);

            // The effect may have been torn down while the dynamic imports were
            // in flight. Building the context now would attach ScrollTriggers to
            // a detached element that the cleanup below has already run past.
            if (cancelled) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const gsap = (gsapMod.default || gsapMod) as any;
            const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
            gsap.registerPlugin(ScrollTrigger);

            // context() passes the context to its own callback. Reading the outer
            // `ctx` here yields undefined, because the assignment below does not
            // happen until context() returns — so callers doing ctx.add() threw.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx = (gsap as any).context((self: any) => {
                cleanupFn = effect(self, gsap);
            }, el);
        };

        initGsap();

        return () => {
            cancelled = true;
            if (cleanupFn) cleanupFn();
            if (ctx) ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { scope };
};
