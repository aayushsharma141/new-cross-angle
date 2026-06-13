import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SiteBreadcrumb } from "@/components/shared/SiteBreadcrumb";

interface AboutHeroProps {
  onPlayVideo?: () => void;
  videoUrl?: string;
}

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "500+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
];

// ─── Luxury cursor system ────────────────────────────────────────────────────
// Glass cursor + gold/crimson aura + direction-aware ellipse ripples + particles
// Fades out after 1 s idle. Strictly hero-section only.

interface LuxRipple {
  x: number; y: number;
  angle: number;    // movement direction
  stretch: number;  // ellipse x/y ratio (wider in direction of travel)
  life: number;     // 0 → 1
}


const IDLE_THRESHOLD = 1000; // ms → begin fade-out

const AboutHero = ({
  videoUrl = "https://www.youtube.com/embed/gJMCIaI7nKg",
}: AboutHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Cursor state (smooth lerp)
  const cursorRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, speed: 0, opacity: 0 });
  const lastMoveRef = useRef<number>(0);
  const lastRippleRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);

  const ripplesRef = useRef<LuxRipple[]>([]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    if (rafRef.current === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cur = cursorRef.current;

    // Smooth cursor position
    cur.x += (cur.tx - cur.x) * 0.15;
    cur.y += (cur.ty - cur.y) * 0.15;

    // Opacity envelope — 1 s idle → fade out
    const idle = Date.now() - lastMoveRef.current;
    if (idle < IDLE_THRESHOLD) {
      cur.opacity = Math.min(1, cur.opacity + 0.06);
    } else {
      cur.opacity = Math.max(0, cur.opacity - 0.03);
    }

    if (cur.opacity <= 0.005) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    const op = cur.opacity;


    // ── Directional ellipse ripples ───────────────────────────────────────
    ripplesRef.current = ripplesRef.current.filter((r) => {
      r.life += 0.022;
      if (r.life >= 1) return false;

      const ease = 1 - Math.pow(1 - r.life, 4);   // ease-out-quart
      const radius = 10 + ease * 52;                  // max ~62 px — never giant
      const alpha = (1 - r.life) * 0.22 * op;

      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.angle);

      // Gradient fades transparent → white → crimson across the ellipse diameter
      const g = ctx.createLinearGradient(-radius, 0, radius, 0);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, `rgba(255,255,255,${alpha.toFixed(3)})`);
      g.addColorStop(1, `rgba(217,43,43,${alpha.toFixed(3)})`);

      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Ellipse: stretched in travel direction
      ctx.ellipse(0, 0, radius, radius / r.stretch, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      return true;
    });

    // ── Luxury aura ───────────────────────────────────────────────────────
    const glowR = 28 + Math.min(cur.speed * 0.12, 10);
    const glow = ctx.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, glowR);
    glow.addColorStop(0, `rgba(255,215,120,${(op * 0.16).toFixed(3)})`);
    glow.addColorStop(0.5, `rgba(217,43,43,${(op * 0.08).toFixed(3)})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cur.x, cur.y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // ── Glass ring ────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cur.x, cur.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${(0.08 * op).toFixed(3)})`;
    ctx.fill();

    const ring = ctx.createLinearGradient(
      cur.x - 8, cur.y - 8,
      cur.x + 8, cur.y + 8
    );
    ring.addColorStop(0, `rgba(255,255,255,${op.toFixed(3)})`);
    ring.addColorStop(1, `rgba(255,215,120,${op.toFixed(3)})`);
    ctx.strokeStyle = ring;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // ── Core dot ─────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cur.x, cur.y, 1.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
    ctx.fill();

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  // ── Mouse ─────────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cur = cursorRef.current;
      const dx = x - lastXRef.current;
      const dy = y - lastYRef.current;
      cur.speed = Math.sqrt(dx * dx + dy * dy);
      cur.tx = x;
      cur.ty = y;

      lastMoveRef.current = Date.now();

      // Throttled directional ellipse ripple
      const now = performance.now();
      if (now - lastRippleRef.current > 130) {
        const angle = Math.atan2(dy, dx);
        const stretch = 1 + Math.min(cur.speed / 140, 0.35);
        ripplesRef.current.push({ x, y, angle, stretch, life: 0 });
        lastRippleRef.current = now;
      }

      lastXRef.current = x;
      lastYRef.current = y;
    },
    []
  );

  // ── Setup / teardown ──────────────────────────────────────────────────────
  useEffect(() => {
    const section = containerRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const sync = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
      // Init cursor position to center of section on first load
      const cur = cursorRef.current;
      if (cur.tx === 0 && cur.ty === 0) {
        cur.x = cur.tx = canvas.width / 2;
        cur.y = cur.ty = canvas.height / 2;
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(section);

    // Clear on leave — cursor exits hero
    const handleMouseLeave = () => {
      lastMoveRef.current = 0;         // force idle immediately
      cursorRef.current.opacity = 0;   // snap fade
      ripplesRef.current = [];
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    // Pause RAF when hero out of viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (rafRef.current === 0) {
            rafRef.current = requestAnimationFrame(draw);
          }
        } else {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
          ripplesRef.current = [];
          cursorRef.current.opacity = 0;
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
      { threshold: 0 }
    );
    io.observe(section);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      io.disconnect();
    };
  }, [draw, handleMouseMove]);


  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0.3, 0.9], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100vh] bg-black flex items-center pt-24 pb-16 overflow-hidden"
    >
      {/* Subtle bg watermark — very low opacity */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-around opacity-[0.018]">
        {[1, -1, 1].map((dir, i) => (
          <motion.div
            key={i}
            className="whitespace-nowrap font-sans text-[9vh] font-black tracking-widest text-white"
            animate={{ x: dir > 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            CROSS ANGLE INTERIOR • TURNKEY EXECUTION • ESTD 2010 • CROSS ANGLE INTERIOR • TURNKEY EXECUTION • ESTD 2010 •
          </motion.div>
        ))}
      </div>

      {/* Ripple canvas — only active inside this hero section */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
        aria-hidden="true"
      />

      {/* Layout */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-0 font-sans"
      >
        {/* ─────── LEFT: TEXT ─────── */}
        <div className="w-full lg:w-[52%] xl:w-[54%] 2xl:w-[50%] flex flex-col justify-center gap-6
                        px-6 sm:px-10 lg:pl-16 xl:pl-24 lg:pr-12
                        py-10 lg:py-0 min-h-[50vh] lg:min-h-[calc(100vh-6rem)] mt-12 lg:mt-0">
          
          <SiteBreadcrumb items={[{ label: "About Us" }]} className="mb-[-0.5rem] mt-4" />

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">About The Studio</span>
          </motion.div>

          {/* H1 */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-sans text-[clamp(2.4rem,4.8vw,5.2rem)] font-normal text-white leading-[1.08] tracking-tight">
              We Design. We Execute.
              <br />
              We Deliver{" "}
              <span className="text-[#FF2A2A] font-semibold"> Turnkey </span> Interiors.
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.9rem,1.05vw,1.1rem)] leading-[1.8] text-white/60 max-w-[48ch]"
          >
            For over 15 years, we've delivered fully managed interior projects —
            combining design intelligence, execution precision, and
            hospitality-level detailing from concept to final handover.
          </motion.p>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(0.85rem,0.95vw,1rem)] text-site-gold italic font-medium"
          >
            Every project is delivered as a complete, ready-to-live environment.
          </motion.p>

          {/* Data Strip */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-stretch gap-y-4 pt-2"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1.5 pr-8 ${i < stats.length - 1 ? "border-r border-white/10 mr-8" : ""
                  }`}
              >
                <span className="text-[clamp(1.6rem,2.4vw,2.6rem)] font-bold text-white leading-none tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Value points */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2.5 text-[clamp(0.85rem,1vw,1rem)] text-white/70 pt-1"
          >
            {
              ([
                "Residential, Commercial & Hospitality",
                "End-to-End Turnkey — No Sub-Contracting",
                "Jamshedpur's Most-Referenced Interior Studio",
              ]).map((point, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#FF2A2A] shadow-[0_0_8px_rgba(255,42,42,0.9)] shrink-0" />
                  {point}
                </div>
              ))
            }
          </motion.div>
        </div>

        {/* ─────── RIGHT: VIDEO ─────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:absolute lg:right-10 xl:right-16 lg:top-[12vh] lg:bottom-[10vh]
                     w-full lg:w-[42%] xl:w-[40%]
                     px-6 sm:px-10 lg:px-0
                     flex flex-col gap-4 z-20 group mb-16 lg:mb-0"
        >
          {/* Premium Background Glow Effect behind video */}
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(232,27,57,0.16),transparent_65%)] rounded-full blur-[80px] opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

          {/* "Hear From The Founder" label */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-5 h-[2px] bg-[#FF2A2A] shadow-[0_0_6px_rgba(255,42,42,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
              Hear From The Founder
            </span>
          </div>

          {/* Video embed */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md
                       shadow-[0_24px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(232,27,57,0.06)]
                       group transition-all duration-500 z-10"
          >
            {/* Red glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                            shadow-[inset_0_0_0_1px_rgba(255,42,42,0.2)] pointer-events-none z-20 rounded-3xl" />

            <div className="aspect-video lg:absolute lg:inset-0 lg:w-full lg:h-full overflow-hidden rounded-3xl">
              <iframe
                src={videoUrl}
                title="Founder — CrossAngle Interior"
                className="w-full h-full lg:absolute lg:inset-0 rounded-3xl border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>

          {/* Below-video caption */}
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#555555] leading-relaxed relative z-10">
            How we approach turnkey interiors — from concept to final handover.
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-6 left-14 xl:left-20 flex items-center gap-3 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
      >
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-white/25"
        />
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
          Scroll to Explore
        </span>
      </motion.div>
    </section>
  );
};

export default AboutHero;