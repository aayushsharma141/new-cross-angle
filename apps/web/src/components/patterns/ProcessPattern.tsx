import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Card } from "@/components/ui/card/base/Card"
import { cn } from "@/lib/utils"
import { ProcessContent } from "@/types/content/patterns"

export interface ProcessPatternProps extends ProcessContent {
  className?: string
}

export function ProcessPattern({
  title,
  subtitle,
  steps = [],
  className,
}: ProcessPatternProps) {
  return (
    <Section spacing="xl" className={cn("py-24 bg-canvas-secondary border-b border-subtle", className)}>
      <Container size="standard">
        <div className="mb-16 space-y-4 text-center max-w-3xl mx-auto">
          <Text size="micro" className="text-copper font-mono uppercase tracking-widest font-bold">
            METHODOLOGY & PRECISION
          </Text>
          <Heading size="display-md">{title}</Heading>
          {subtitle && <Text size="body-lg" variant="secondary">{subtitle}</Text>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="p-8 border border-subtle bg-surface-card flex flex-col justify-between">
              <div>
                <span className="text-display-md font-mono text-copper/30 font-bold block mb-4">
                  {step.number}
                </span>
                <Heading size="heading-sm" className="mb-3">
                  {step.title}
                </Heading>
                <Text size="sm" variant="secondary" className="leading-relaxed">
                  {step.description}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
