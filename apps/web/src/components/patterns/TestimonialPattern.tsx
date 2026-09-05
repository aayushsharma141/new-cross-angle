import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { TestimonialCard } from "@/components/ui/card/business/TestimonialCard"
import { cn } from "@/lib/utils"
import { TestimonialsContent } from "@/types/content/patterns"

export interface TestimonialPatternProps extends TestimonialsContent {
  subtitle?: string
  className?: string
}

export function TestimonialPattern({
  title,
  subtitle,
  testimonials = [],
  className,
}: TestimonialPatternProps) {
  return (
    <Section spacing="xl" className={cn("py-24 bg-canvas-primary border-b border-subtle", className)}>
      <Container size="standard">
        <div className="mb-16 space-y-4 max-w-3xl">
          <Text size="micro" className="text-copper font-mono uppercase tracking-widest font-bold">
            TRUST & REPUTATION
          </Text>
          <Heading size="display-md">{title}</Heading>
          {subtitle && <Text size="body-lg" variant="secondary">{subtitle}</Text>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={i}
              quote={t.quote}
              author={t.author}
              role={t.role}
              projectScope={t.projectScope}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
