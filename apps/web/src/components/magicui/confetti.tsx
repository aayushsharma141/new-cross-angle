import { useEffect } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
    rotation: number;
    rotationSpeed: number;
}

interface ConfettiProps {
    /** fires once on mount if true */
    onMount?: boolean;
    count?: number;
    colors?: string[];
}

const COLORS = [
    "#F59E0B", "#FCD34D", "#FDE68A", "#FFFFFF",
    "#D4A853", "#E5C882", "#A78BFA", "#F9A8D4",
];

let canvasEl: HTMLCanvasElement | null = null;
let rafId: number;

function fire(count = 120, colors = COLORS) {
    if (typeof window === "undefined") return;

    if (!canvasEl) {
        canvasEl = document.createElement("canvas");
        canvasEl.style.cssText =
            "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
        document.body.appendChild(canvasEl);
    }

    const canvas = canvasEl;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height * 0.4;

    const particles: Particle[] = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 10;
        return {
            x: cx + (Math.random() - 0.5) * 60,
            y: cy + (Math.random() - 0.5) * 40,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 4 + Math.random() * 6,
            life: 1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
        };
    });

    cancelAnimationFrame(rafId);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.vx *= 0.99;
            p.life -= 0.012;
            p.rotation += p.rotationSpeed;

            if (p.life > 0) {
                alive = true;
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            }
        });

        if (alive) {
            rafId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    draw();
}

export const Confetti = ({ onMount = true, count = 120, colors = COLORS }: ConfettiProps) => {
    useEffect(() => {
        if (onMount) {
            const t = setTimeout(() => fire(count, colors), 400);
            return () => clearTimeout(t);
        }
    }, [onMount, count, colors]);

    return null;
};

/** Imperative trigger for button click events */
export const triggerConfetti = (count = 100) => fire(count);

export default Confetti;
