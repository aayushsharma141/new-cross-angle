import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { processMetrics } from "@/data/process";

function useCountUp(end: number, durationMs: number, active: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, durationMs, active]);

  return value;
}

const MetricItem = ({ metric, isInView, idx }: { metric: { label: string; value: string; suffix?: string }; isInView: boolean; idx: number }) => {
  const numericValue = parseFloat(metric.value.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(numericValue);
  const countedValue = useCountUp(isNumeric ? numericValue : 0, 1800, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      className="text-center"
    >
      <div className="font-display italic text-[clamp(2rem,4vw,3.5rem)] leading-none text-white mb-2">
        {isNumeric ? (
          <>
            {metric.value.startsWith("<") && (
              <span className="text-site-gold text-[clamp(1rem,2vw,1.8rem)] mr-1">&lt;</span>
            )}
            {countedValue}
            {metric.suffix || (metric.value.includes("+") ? "+" : metric.value.includes("★") ? "★" : "")}
          </>
        ) : (
          <span className="text-white">{metric.value}</span>
        )}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
        {metric.label}
      </div>
    </motion.div>
  );
};

const TrustStrip = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#050505] border-y border-white/[0.05] py-16 md:py-20 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {processMetrics.map((metric, idx) => (
            <MetricItem key={metric.label} metric={metric} isInView={isInView} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
