import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SparklineChartProps {
  data: number[];
  color?: "brand" | "emerald" | "amber" | "red" | "blue";
  height?: number;
  showTrend?: boolean;
  className?: string;
}

const COLOR_MAP = {
  brand: "hsl(var(--brand-primary))",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
};

function computeTrend(data: number[]): "up" | "down" | "neutral" {
  if (data.length < 2) return "neutral";
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first * 1.02) return "up";
  if (last < first * 0.98) return "down";
  return "neutral";
}

export function SparklineChart({
  data,
  color = "brand",
  height = 40,
  showTrend = false,
  className,
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const trend = computeTrend(data);
  const strokeColor = COLOR_MAP[color];

  const trendIcon = showTrend ? (
    trend === "up" ? (
      <TrendingUp className="w-3 h-3 text-emerald-500" />
    ) : trend === "down" ? (
      <TrendingDown className="w-3 h-3 text-red-500" />
    ) : null
  ) : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="bg-background border border-border rounded px-2 py-1 text-[10px] font-mono shadow-sm">
                  {payload[0].value}
                </div>
              ) : null
            }
          />
        </LineChart>
      </ResponsiveContainer>
      {trendIcon && (
        <div className="shrink-0">{trendIcon}</div>
      )}
    </div>
  );
}
