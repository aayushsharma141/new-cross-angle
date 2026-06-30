import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import useCountUp from "@/hooks/useCountUp";

const MetricItem = ({ metric, idx }: { metric: { label: string; value: string; suffix?: string }; idx: number }) => {
  const numericValue = parseFloat(metric.value.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(numericValue);
  const { count, ref } = useCountUp(isNumeric ? numericValue : 0, { duration: 1800 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      className="text-center"
    >
      <div className="font-display italic text-[clamp(2rem,4vw,3.5rem)] leading-none text-white mb-2">
        {isNumeric ? (
          <>
            {metric.value.startsWith("<") && (
              <span className="text-site-gold text-[clamp(1rem,2vw,1.8rem)] mr-1">&lt;</span>
            )}
            {count}
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
  const { data: processMetrics = [] } = useQuery({
    queryKey: ['processMetrics'],
    queryFn: api.getProcessMetrics
  });

  if (processMetrics.length === 0) return null;

  return (
    <section className="relative bg-[#050505] border-y border-white/[0.05] py-16 md:py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {processMetrics.map((metric, idx) => (
            <MetricItem key={metric.label} metric={metric} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
