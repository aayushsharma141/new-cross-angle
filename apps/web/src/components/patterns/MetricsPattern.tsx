import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { MetricCard } from "@/components/ui/card/business/MetricCard"
import { cn } from "@/lib/utils"
import { MetricsContent } from "@/types/content/patterns"

export interface MetricsPatternProps extends MetricsContent {
  className?: string
}

export function MetricsPattern({ metrics = [], className }: MetricsPatternProps) {
  return (
    <Section spacing="lg" className={cn("py-16 bg-canvas-primary border-b border-subtle", className)}>
      <Container size="standard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((m, i) => (
            <MetricCard key={i} value={m.value} label={m.label} trend={m.trend} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
