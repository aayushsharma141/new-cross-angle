import React from "react";

export interface AdminMetric {
  label: string;
  value: string | React.ReactNode;
  dotColor?: "success" | "warning" | "danger" | "info" | "neutral" | "accent";
  barProgress?: number; // 0 to 1
}

interface AdminMetricsPanelProps {
  metrics: AdminMetric[];
}

export function AdminMetricsPanel({ metrics }: AdminMetricsPanelProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 px-6">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={`px-5 ${i > 0 ? "border-l border-[hsl(var(--admin-border))]" : ""}`}
        >
          <div className="text-[11px] font-semibold tracking-[0.08em] text-[hsl(var(--admin-text-muted))] uppercase mb-2">
            {m.label}
          </div>
          {m.barProgress !== undefined ? (
            <>
              <div className="text-[13px] font-medium text-[hsl(var(--admin-text))] mb-2">
                {m.value}
              </div>
              <div className="h-[3px] bg-[hsl(var(--admin-border))] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${m.barProgress * 100}%`,
                    background: "linear-gradient(90deg, hsl(var(--admin-success)), hsl(var(--admin-accent)))"
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-[7px]">
              {m.dotColor && (
                <div 
                  className="w-[7px] h-[7px] rounded-full shrink-0" 
                  style={{
                    background: `hsl(var(--admin-${m.dotColor}))`,
                    boxShadow: `0 0 6px hsl(var(--admin-${m.dotColor}) / 0.5)`
                  }}
                />
              )}
              <span className="text-[13px] font-medium text-[hsl(var(--admin-text))]">
                {m.value}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
