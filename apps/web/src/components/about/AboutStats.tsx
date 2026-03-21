import { motion } from "framer-motion";
import { Award, Users, Clock, Sparkles, LucideIcon } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";

interface Stat {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { icon: Award, value: 15, suffix: "+", label: "Years Experience" },
  { icon: Users, value: 500, suffix: "+", label: "Happy Clients" },
  { icon: Clock, value: 750, suffix: "+", label: "Projects Completed" },
  { icon: Sparkles, value: 25, suffix: "+", label: "Design Awards" },
];

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => {
  const { count, ref } = useCountUp(stat.value, { duration: 2000, delay: index * 200 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="relative p-8 md:p-10 rounded-3xl bg-card/50 backdrop-blur-md border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl overflow-hidden text-center">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Icon */}
        <motion.div
          className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 group-hover:bg-primary flex items-center justify-center mb-6 transition-all duration-500"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <stat.icon className="w-8 h-8 text-muted-foreground group-hover:text-white transition-colors duration-500" />
        </motion.div>

        {/* Value */}
        <div className="font-serif text-4xl md:text-5xl font-bold text-primary mb-2">
          {count}{stat.suffix}
        </div>

        {/* Label */}
        <div className="text-muted-foreground font-medium text-sm uppercase tracking-wider">
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
};

const AboutStats = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-primary/5 to-transparent" />
      <div className="absolute bottom-1/4 right-0 w-1/3 h-1/2 bg-gradient-to-l from-secondary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
        >
          <span className="text-primary font-medium tracking-widest uppercase text-sm mb-4 block">
            Our Impact
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Numbers That <span className="text-primary">Speak</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A track record of excellence, measured by the spaces we've transformed
            and the clients we've delighted.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
