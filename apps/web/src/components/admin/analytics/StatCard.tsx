import { motion } from "framer-motion";
import { TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/tokens/icons";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}

export const StatCard = ({ icon: Icon, label, value, sub, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md p-6 flex flex-col gap-2 shadow-2xl hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex items-center justify-between relative z-10">
      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
        <Icon className={cn("relative z-10", icons.md)} />
      </div>
      {sub && (
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest flex items-center gap-1">
          <TrendingUp className={icons.xs} />
          {sub}
        </span>
      )}
    </div>
    <div className="mt-2 relative z-10">
      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</h3>
      <p className="text-3xl font-serif font-bold tracking-tight text-white">{value}</p>
    </div>
  </motion.div>
);
