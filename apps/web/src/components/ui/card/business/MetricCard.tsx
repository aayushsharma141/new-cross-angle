import * as React from "react"
import { Card } from "../base/Card"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { cn } from "@/lib/utils"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  label: string
  trend?: string
}

export function MetricCard({
  value,
  label,
  trend,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("p-6 border border-subtle bg-surface-card flex flex-col justify-between", className)} {...props}>
      <div className="flex items-baseline justify-between mb-2">
        <Heading size="hero" className="text-copper font-medium">
          {value}
        </Heading>
        {trend && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <Text size="sm" variant="secondary" className="font-mono uppercase tracking-wider">
        {label}
      </Text>
    </Card>
  )
}
