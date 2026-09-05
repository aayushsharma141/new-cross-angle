import { motion } from "framer-motion";
import { Award, Users, Clock, Sparkles, LucideIcon } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Stat {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
}

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => {
  const { count, ref } = useCountUp(stat.value, { duration: 2000, delay: index * 200 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative p-8 md:p-10 rounded-[2.5rem] bg-[var(--s-canvas-secondary)] backdrop-blur-2xl border border-[var(--s-border-subtle)] shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-700 hover:shadow-[0_20px_50px_rgba(209,175,110,0.12)] hover:border-primary/40 flex flex-col justify-between overflow-hidden group"
    >
      {/* Internal reflection */}
      <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/5 pointer-events-none" />

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/0 group-hover:border-primary/50 rounded-tl-[2.5rem] transition-all duration-700 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/0 group-hover:border-primary/50 rounded-br-[2.5rem] transition-all duration-700 pointer-events-none" />

      {/* Glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full gap-8">
        <motion.div
          className="w-14 h-14 rounded-2xl bg-black/40 border border-[var(--s-border-subtle)] group-hover:border-primary/40 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-700 shadow-inner group-hover:shadow-[0_0_20px_rgba(209,175,110,0.2)]"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <stat.icon className="w-7 h-7 text-white/50 group-hover:text-primary transition-colors duration-500" />
        </motion.div>

        <div>
          <div className="font-serif text-5xl md:text-6xl font-bold text-white group-hover:text-primary transition-colors duration-500 mb-3 tracking-tight">
            {count}{stat.suffix}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-[1px] bg-primary group-hover:w-10 transition-all duration-500" />
            <div className="text-white/60 font-medium text-xs md:text-sm uppercase tracking-[0.2em]">
              {stat.label}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AboutStats = () => {
  const { settings } = useSiteSettings();
  
  const stats: Stat[] = [
    { icon: Award, value: settings?.studio_stats?.yearsExperience || 15, suffix: "+", label: "Years Experience" },
    { icon: Users, value: settings?.studio_stats?.happyClients || 500, suffix: "+", label: "Happy Clients" },
    { icon: Clock, value: settings?.studio_stats?.projectsCompleted || 750, suffix: "+", label: "Projects Completed" },
    { icon: Sparkles, value: settings?.studio_stats?.awardsWon || 25, suffix: "+", label: "Design Awards" },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[var(--s-canvas-primary)] overflow-hidden border-b border-[var(--s-border-subtle)]">
      {/* Background accents */}
      <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-primary/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-1/3 h-1/2 bg-[radial-gradient(ellipse_at_right,rgba(255,255,255,0.03),transparent_70%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
        >
          <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs mb-4 block">
            Our Impact
          </span>
          <h2 className="font-serif font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-white mb-6">
            Numbers That <span className="text-primary italic font-light">Speak</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg leading-relaxed font-light max-w-[50ch] mx-auto">
            A track record of excellence, measured by the spaces we've transformed
            and the clients who trust our execution standard.
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
