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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(209,175,110,0.15)] hover:border-site-gold/30 transition-all duration-700 overflow-hidden text-left group-hover:bg-gradient-to-b group-hover:from-white/[0.06] group-hover:to-transparent">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-site-gold/0 group-hover:border-site-gold/50 rounded-tl-[2.5rem] transition-all duration-700 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-site-crimson/0 group-hover:border-site-crimson/50 rounded-br-[2.5rem] transition-all duration-700 pointer-events-none" />
        
        {/* Glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-site-gold/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full gap-8">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 group-hover:border-site-gold/40 group-hover:bg-site-gold/10 flex items-center justify-center transition-all duration-700 shadow-inner group-hover:shadow-[0_0_20px_rgba(209,175,110,0.2)]"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <stat.icon className="w-7 h-7 text-muted-foreground group-hover:text-site-gold transition-colors duration-500 drop-shadow-[0_0_8px_rgba(209,175,110,0)] group-hover:drop-shadow-[0_0_8px_rgba(209,175,110,0.5)]" />
          </motion.div>

          <div>
            <div className="font-serif text-5xl md:text-6xl font-bold text-white group-hover:text-site-gold transition-colors duration-500 mb-3 tracking-tight">
              {count}{stat.suffix}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-[1px] bg-site-crimson group-hover:w-10 transition-all duration-500" />
              <div className="text-muted-foreground font-medium text-xs md:text-sm uppercase tracking-[0.2em]">
                {stat.label}
              </div>
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
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-site-gold/5 to-transparent blur-3xl pointer-events-none" />
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
          <span className="text-site-gold font-medium tracking-widest uppercase text-sm mb-4 block">
            Our Impact
          </span>
          <h2 className="font-serif font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-foreground mb-6">
            Numbers That <span className="text-site-gold">Speak</span>
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
