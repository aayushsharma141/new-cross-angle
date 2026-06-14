import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface ProjectOutcomeProps {
  location?: string;
  area?: string;
  duration?: string;
  style?: string;
  year?: number;
  type?: string;
}

/** Animates a number from 0 to `end` over `duration` ms when `active` becomes true. */
function useCountUp(end: number, durationMs: number, active: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, durationMs, active]);

  return value;
}

interface StatConfig {
  /** Prefix shown before the number, e.g. "<" */
  prefix?: string;
  /** Suffix shown after the number, e.g. "+" */
  suffix?: string;
  /** The numeric value to animate to */
  end: number;
  /** Label below the number */
  label: string;
  /** Duration of count-up animation in ms */
  durationMs?: number;
  /** If true, shows the prefix BEFORE the animated number */
  prefixBefore?: boolean;
}

function StatCard({ prefix, suffix, end, label, durationMs = 1800, prefixBefore, active }: StatConfig & { active: boolean }) {
  const count = useCountUp(end, durationMs, active);

  return (
    <div className="flex flex-col gap-2 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-4xl md:text-6xl font-serif text-white tracking-tight"
        aria-label={`${prefix ?? ""}${end}${suffix ?? ""}`}
      >
        {prefixBefore && <span className="text-site-gold mr-0.5">{prefix}</span>}
        {count}
        {suffix && <span className="text-site-gold">{suffix}</span>}
        {!prefixBefore && prefix && <span className="text-site-gold">{prefix}</span>}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-stone-500"
      >
        {label}
      </motion.div>
    </div>
  );
}

const ProjectOutcome = ({ area, duration }: ProjectOutcomeProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const daysValue = parseInt(duration ?? "45", 10) || 45;
  const areaValue = parseInt((area ?? "1200").replace(/\D/g, ""), 10) || 1200;

  return (
    <section
      ref={sectionRef}
      aria-label="Project results and metrics"
      className="py-24 md:py-32 bg-neutral-950 relative overflow-hidden"
      data-chapter="outcome"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-site-gold block mb-4">Results</span>
          <h2 className="text-3xl md:text-5xl text-white tracking-tight font-serif font-normal leading-[1.1]">
            By the <em className="italic text-site-crimson font-light not-italic">Numbers</em>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          <div data-reveal="stat"><StatCard end={daysValue} suffix="d" label="Days to Deliver" active={isInView} durationMs={1200} /></div>
          <div data-reveal="stat"><StatCard end={3} prefixBefore prefix="<" suffix="%" label="Budget Variance" active={isInView} durationMs={1000} /></div>
          <div data-reveal="stat"><StatCard end={0} label="Contractor Delays" active={isInView} durationMs={600} /></div>
          <div data-reveal="stat"><StatCard end={areaValue} suffix="+" label="Sq Ft Transformed" active={isInView} durationMs={1600} /></div>
        </div>
      </div>
    </section>
  );
};

export default ProjectOutcome;
