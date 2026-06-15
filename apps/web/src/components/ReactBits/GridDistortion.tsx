import { useEffect, useRef } from "react";

interface Props {
    /** Overall distortion amplitude – keep ≤ 0.15 for atmospheric feel */
    amplitude?: number;
    /** Animation speed – keep ≤ 0.12 for luxury slowness */
    speed?: number;
    /** Grid line color as rgba string */
    color?: string;
    /** Thickness of grid lines */
    lineWidth?: number;
    className?: string;
}

/**
 * Canvas-based grid-mesh distortion.
 * Desktop only (hidden on < 768 px) and respects prefers-reduced-motion.
 * GPU-friendly: only uses transform (translate) on canvas 2d paths – no layout triggers.
 */
const GridDistortion = ({ amplitude = 0.10, speed = 0.08, color = "rgba(180, 120, 100, 0.08)", lineWidth = 0.8, className = "" }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const targetMouseRef = useRef({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;
        if (window.innerWidth < 768) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const COLS = 14;
        const ROWS = 9;
        let W = 0, H = 0;

        const resize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const handleMouse = (e: MouseEvent) => {
            targetMouseRef.current = { x: e.clientX / W, y: e.clientY / H };
        };
        window.addEventListener("mousemove", handleMouse, { passive: true });

        let t = 0;
        const draw = () => {
            t += speed * 0.016; // ~0.016s per frame at 60fps

            // Smooth mouse follow
            mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.04;
            mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.04;

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            ctx.clearRect(0, 0, W, H);

            const cellW = W / COLS;
            const cellH = H / ROWS;

            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;

            // Draw distorted grid lines
            for (let c = 0; c <= COLS; c++) {
                ctx.beginPath();
                for (let r = 0; r <= ROWS; r++) {
                    const baseX = c * cellW;
                    const baseY = r * cellH;

                    // Distance from mouse (normalized)
                    const dx = c / COLS - mx;
                    const dy = r / ROWS - my;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const influence = Math.max(0, 1 - dist * 2.5);

                    const wave = Math.sin(c * 0.5 + r * 0.3 + t) * amplitude;
                    const mouseWave = influence * amplitude * 1.5;

                    const x = baseX + (wave + mouseWave * dx) * W;
                    const y = baseY + (wave + mouseWave * dy) * H;

                    if (r === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            for (let r = 0; r <= ROWS; r++) {
                ctx.beginPath();
                for (let c = 0; c <= COLS; c++) {
                    const baseX = c * cellW;
                    const baseY = r * cellH;

                    const dx = c / COLS - mx;
                    const dy = r / ROWS - my;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const influence = Math.max(0, 1 - dist * 2.5);

                    const wave = Math.sin(r * 0.5 + c * 0.3 + t) * amplitude;
                    const mouseWave = influence * amplitude * 1.5;

                    const x = baseX + (wave + mouseWave * dx) * W;
                    const y = baseY + (wave + mouseWave * dy) * H;

                    if (c === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("mousemove", handleMouse);
            ro.disconnect();
        };
    }, [amplitude, speed, color, lineWidth]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full pointer-events-none hidden md:block ${className}`}
            style={{ zIndex: 1 }}
        />
    );
};

export default GridDistortion;
