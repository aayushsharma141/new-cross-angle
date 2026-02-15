import { motion } from "framer-motion";

interface SectionProgressProps {
  current: number;
  total: number;
  labels: string[];
}

const SectionProgress = ({ current, total, labels }: SectionProgressProps) => (
  <div className="w-full max-w-lg mx-auto mb-8">
    {/* Thin line with sliding glowing dot */}
    <div className="relative h-6 flex items-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {/* Tick marks */}
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-500"
          style={{
            left: `${(i / (total - 1)) * 100}%`,
            transform: "translate(-50%, -50%)",
            background: i <= current ? "hsl(var(--gold))" : "hsl(var(--border))",
          }}
        />
      ))}
      {/* Glowing sliding dot */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10"
        style={{
          background: "hsl(var(--gold))",
          boxShadow: "0 0 12px hsl(var(--gold) / 0.5), 0 0 24px hsl(var(--gold) / 0.2)",
        }}
        animate={{ left: `${(current / (total - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
    {/* Section label */}
    <motion.p
      key={current}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center text-xs tracking-premium text-muted-foreground mt-2"
    >
      {labels[current]}
    </motion.p>
  </div>
);

export default SectionProgress;
