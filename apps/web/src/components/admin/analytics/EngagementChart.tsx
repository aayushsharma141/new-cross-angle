import { motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/tokens/icons";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface EngagementChartProps {
  data: { date: string; sessions: number; completions: number }[];
}

export const EngagementChart = ({ data }: EngagementChartProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.4 }}
    className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-serif-display font-semibold flex items-center gap-2">
        <MousePointerClick className={cn("text-pink-500", icons.md)} />
        Engagement Trends
      </h3>
      <div className="flex items-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
          <span className="text-muted-foreground">Sessions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span className="text-muted-foreground">Completions</span>
        </div>
      </div>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", color: "#fff" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Area type="monotone" dataKey="sessions" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" activeDot={{ r: 6, strokeWidth: 0, fill: "#ec4899" }} />
          <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletions)" activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);
