import { motion } from "framer-motion";
import { icons } from "@/design-system/tokens/icons";
import { type DeviceStat, DEVICE_ICONS } from "./analytics-utils";

interface BreakdownBarProps {
  items: DeviceStat[];
  delay?: number;
}

export const BreakdownBar = ({ items, delay = 0 }: BreakdownBarProps) => {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const Icon = DEVICE_ICONS[item.label];
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20 text-right shrink-0 truncate flex items-center justify-end gap-1.5">
              {Icon && <Icon className={icons.xs} />}
              {item.label}
            </span>
            <div className="flex-1 h-6 rounded bg-muted overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / max) * 100}%` }}
                transition={{ delay: delay + i * 0.04, duration: 0.5 }}
                className="h-full rounded"
                style={{ background: `hsl(var(--foreground) / ${0.18 + (1 - i / Math.max(items.length, 1)) * 0.22})` }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                {item.count}
              </span>
            </div>
            <span className="text-xs text-muted-foreground w-12 shrink-0">
              {item.pct.toFixed(0)}%
            </span>
          </div>
        );
      })}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No user agent data available.</p>
      )}
    </div>
  );
};
