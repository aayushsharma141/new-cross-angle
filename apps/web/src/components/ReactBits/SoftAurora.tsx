import { useEffect, useRef } from "react";

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string; // CSS hex
  color2?: string; // CSS hex
  color3?: string; // CSS hex (optional third band)
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Simple seeded smooth noise using sin/cos harmonics (no external lib needed)
function smoothNoise(x: number, y: number, t: number, freq: number): number {
  return (
    Math.sin(x * freq + t * 1.3) * Math.cos(y * freq * 0.8 + t * 0.9) * 0.5 +
    Math.sin(x * freq * 0.6 + y * freq * 0.4 + t * 0.7) * 0.3 +
    Math.cos(x * freq * 1.4 - t * 1.1) * Math.sin(y * freq * 1.2 + t * 0.5) * 0.2
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function lerpColor(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number,
  t: number
): [number, number, number] {
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ];
}

const SoftAurora = ({
  speed = 0.3,
  scale = 1.5,
  brightness = 1.0,
  color1 = "#c4a882",   // warm gold
  color2 = "#3d6b4f",   // sage green
  color3 = "#e8ddd0",   // cream
  noiseFrequency = 1.8,
  noiseAmplitude = 1.0,
  bandHeight = 0.45,
  bandSpread = 1.2,
  colorSpeed = 0.8,
  enableMouseInteraction = true,
  mouseInfluence = 0.2,
  className = "",
  style,
}: SoftAuroraProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const animId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let time = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) / rect.width;
      mouse.current.y = (e.clientY - rect.top) / rect.height;
    };

    resize();

    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const [r3, g3, b3] = hexToRgb(color3);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const mx = enableMouseInteraction ? mouse.current.x : 0.5;
      const my = enableMouseInteraction ? mouse.current.y : 0.5;

      // Draw 3 overlapping aurora bands
      const bands = [
        { yFrac: 0.35 + mouseInfluence * (my - 0.5) * 0.5, colorT: (Math.sin(time * colorSpeed * 0.4) + 1) / 2, layer: 0 },
        { yFrac: 0.55 + mouseInfluence * (my - 0.5) * 0.3, colorT: (Math.sin(time * colorSpeed * 0.3 + 2) + 1) / 2, layer: 1 },
        { yFrac: 0.7  + mouseInfluence * (my - 0.5) * 0.2, colorT: (Math.cos(time * colorSpeed * 0.5 + 1) + 1) / 2, layer: 2 },
      ];

      bands.forEach(({ yFrac, colorT, layer }) => {
        // Wavy center Y modulated by noise
        const waveOffset = smoothNoise(
          mx + layer * 2.3,
          time * 0.15 + layer,
          time * speed,
          noiseFrequency / (scale * 3)
        ) * noiseAmplitude * H * 0.12;

        const cy = yFrac * H + waveOffset;
        const spread = (H * bandSpread * bandHeight * (0.6 + layer * 0.15));

        // Pick color for this band
        const [cr, cg, cb] = layer === 0
          ? lerpColor(r1, g1, b1, r3, g3, b3, colorT)
          : layer === 1
          ? lerpColor(r2, g2, b2, r1, g1, b1, colorT)
          : lerpColor(r3, g3, b3, r2, g2, b2, colorT);

        // Horizontal color shift driven by mouse X
        const xShift = (mx - 0.5) * mouseInfluence * W * 0.3;

        const grad = ctx.createRadialGradient(
          W / 2 + xShift, cy, 0,
          W / 2 + xShift, cy, spread
        );
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${0.55 * brightness})`);
        grad.addColorStop(0.4, `rgba(${cr},${cg},${cb},${0.25 * brightness})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

        ctx.save();
        // Horizontal stretch so bands feel wide across screen
        ctx.scale(2.5, 1);
        ctx.translate(-W * 0.75, 0);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W * 2.5, H);
        ctx.restore();
      });

      time += 0.008 * speed * 60;
      animId.current = requestAnimationFrame(draw);
    };

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);
    if (enableMouseInteraction) {
      window.addEventListener("mousemove", handleMouse);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [speed, scale, brightness, color1, color2, color3, noiseFrequency, noiseAmplitude, bandHeight, bandSpread, colorSpeed, enableMouseInteraction, mouseInfluence]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0, ...style }}
    />
  );
};

export default SoftAurora;
