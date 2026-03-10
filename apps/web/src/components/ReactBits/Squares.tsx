import { useEffect, useRef } from "react";

interface Props {
    /** Drift speed: keep ≤ 0.10 */
    speed?: number;
    /** 0–1 opacity of the grid lines */
    opacity?: number;
    className?: string;
}

/**
 * CSS-animated diagonal square grid pattern for the Services section.
 * Pure CSS animation – zero JS runtime cost.
 * Disabled on mobile and for prefers-reduced-motion users.
 */
const Squares = ({ speed = 0.08, opacity = 0.07, className = "" }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isMobile = window.innerWidth < 768;
        if (prefersReduced || isMobile) return;

        const el = containerRef.current;
        if (!el) return;
        // Duration inverse to speed: slower speed = longer duration
        const duration = Math.round(6 / speed); // speed 0.08 → ~75s
        el.style.setProperty("--sq-duration", `${duration}s`);
        el.style.setProperty("--sq-opacity", String(opacity));
        el.classList.add("sq-animated");
    }, [speed, opacity]);

    return (
        <>
            <style>{`
        @media (prefers-reduced-motion: no-preference) and (min-width: 768px) {
          .sq-animated .sq-grid {
            animation: sq-drift var(--sq-duration, 75s) linear infinite;
          }
        }
        @keyframes sq-drift {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
      `}</style>
            <div
                ref={containerRef}
                aria-hidden="true"
                className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
                style={{ zIndex: 0 }}
            >
                <div
                    className="sq-grid absolute inset-[-60px]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(180, 100, 80, var(--sq-opacity, 0.07)) 1px, transparent 1px),
              linear-gradient(90deg, rgba(180, 100, 80, var(--sq-opacity, 0.07)) 1px, transparent 1px)
            `,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>
        </>
    );
};

export default Squares;
