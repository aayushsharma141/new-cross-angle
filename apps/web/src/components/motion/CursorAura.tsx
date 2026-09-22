import { useEffect, useRef } from "react";
import useReducedMotion from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface Ripple {
  x: number;
  y: number;
  angle: number;
  stretch: number;
  life: number;
}

interface CursorAuraProps {
  /** Accent colour as "r,g,b" — defaults to the site gold. */
  accent?: string;
  className?: string;
}

const IDLE_MS = 900;
const RIPPLE_EVERY_MS = 150;

/**
 * Cursor aura for hero sections: a fine glass ring with a gold glow that
 * trails the pointer, and low-key ellipse ripples stretched along the
 * direction of travel. Draws on a canvas that covers the parent element.
 *
 * Refinements over the original About hero cursor:
 * - only mounts for fine pointers (no touch), never under reduced motion
 * - DPR-aware canvas so rings stay crisp on retina screens
 * - single accent (gold) with a white core instead of gold + crimson
 * - the rAF loop sleeps when the cursor is idle or the section is offscreen
 *
 * The parent must be `position: relative` (or any positioned ancestor).
 */
export const CursorAura = ({ accent = "201,168,92", className }: CursorAuraProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cur = { x: 0, y: 0, tx: 0, ty: 0, speed: 0, opacity: 0 };
    let ripples: Ripple[] = [];
    let raf = 0;
    let lastMove = 0;
    let lastRipple = 0;
    let lastX = 0;
    let lastY = 0;
    let visible = true;
    let dpr = 1;

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(host.offsetWidth * dpr);
      canvas.height = Math.round(host.offsetHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      raf = 0;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      cur.x += (cur.tx - cur.x) * 0.16;
      cur.y += (cur.ty - cur.y) * 0.16;
      const idle = performance.now() - lastMove;
      cur.opacity = idle < IDLE_MS ? Math.min(1, cur.opacity + 0.07) : Math.max(0, cur.opacity - 0.035);
      const op = cur.opacity;

      if (op <= 0.004 && ripples.length === 0) return; // sleep until the next move

      // Ripples — hairline ellipses that thin out as they grow
      ripples = ripples.filter((r) => {
        r.life += 0.024;
        if (r.life >= 1) return false;
        const ease = 1 - Math.pow(1 - r.life, 4);
        const radius = 8 + ease * 44;
        const alpha = (1 - r.life) * 0.16 * op;
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.angle);
        const g = ctx.createLinearGradient(-radius, 0, radius, 0);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, `rgba(255,255,255,${alpha.toFixed(3)})`);
        g.addColorStop(1, `rgba(${accent},${alpha.toFixed(3)})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius / r.stretch, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      });

      // Aura — soft gold glow that widens slightly with speed
      const glowR = 26 + Math.min(cur.speed * 0.1, 8);
      const glow = ctx.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, glowR);
      glow.addColorStop(0, `rgba(${accent},${(op * 0.14).toFixed(3)})`);
      glow.addColorStop(1, `rgba(${accent},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Glass ring + core
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(0.06 * op).toFixed(3)})`;
      ctx.fill();
      const ring = ctx.createLinearGradient(cur.x - 8, cur.y - 8, cur.x + 8, cur.y + 8);
      ring.addColorStop(0, `rgba(255,255,255,${(0.9 * op).toFixed(3)})`);
      ring.addColorStop(1, `rgba(${accent},${(0.9 * op).toFixed(3)})`);
      ctx.strokeStyle = ring;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
      ctx.fill();

      cur.speed *= 0.9;
      if (visible) raf = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (raf === 0 && visible) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - lastX;
      const dy = y - lastY;
      cur.speed = Math.hypot(dx, dy);
      if (cur.opacity === 0) {
        cur.x = x;
        cur.y = y;
      }
      cur.tx = x;
      cur.ty = y;
      lastMove = performance.now();
      if (lastMove - lastRipple > RIPPLE_EVERY_MS && cur.speed > 2) {
        ripples.push({ x, y, angle: Math.atan2(dy, dx), stretch: 1 + Math.min(cur.speed / 160, 0.3), life: 0 });
        lastRipple = lastMove;
      }
      lastX = x;
      lastY = y;
      wake();
    };

    const onLeave = () => {
      lastMove = 0;
      cur.opacity = 0;
      ripples = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
        onLeave();
      }
    });
    io.observe(host);
    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);

    return () => {
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [accent, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
    />
  );
};

export default CursorAura;
