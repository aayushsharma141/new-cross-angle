import { motion } from "framer-motion";
import { MapPin, Ruler, Clock, Palette, Calendar, Banknote } from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectStatsProps {
  location: string;
  area: string;
  duration: string;
  style: string;
  year: number;
  budget: string;
}

const ProjectStats = ({ location, area, duration, style, year, budget }: ProjectStatsProps) => {
  const stats = [
    { icon: MapPin, label: "Location", value: location || "N/A" },
    { icon: Ruler, label: "Area", value: area || "N/A" },
    { icon: Clock, label: "Duration", value: duration || "N/A" },
    { icon: Palette, label: "Style", value: style || "N/A" },
    { icon: Calendar, label: "Year", value: year?.toString() || "2024" },
    { icon: Banknote, label: "Budget", value: budget || "Premium" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="group p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
            {stat.label}
          </p>
          <p className="font-semibold text-foreground text-xs sm:text-sm md:text-base truncate">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProjectStats;