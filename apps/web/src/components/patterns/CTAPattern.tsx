import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Button } from "@/components/ui/interactive/Button"
import { Input } from "@/components/ui/interactive/Input"

import { cn } from "@/lib/utils"
import { CTAContent } from "@/types/content/patterns"

export interface CTAPatternProps extends CTAContent {
  onAction?: () => void
  className?: string
}

export function CTAPattern({
  headline,
  description,
  primaryButtonLabel,
  variant = "default",
  onAction,
  className,
}: CTAPatternProps) {
  const [email, setEmail] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAction?.()
  }

  return (
    <Section spacing="xl" className={cn("py-24 bg-canvas-secondary border-b border-subtle relative overflow-hidden", className)}>
      <Container size="narrow">
        <div className="text-center space-y-8 p-12 bg-surface-card border border-copper/30 shadow-2xl rounded-3xl relative z-10">
          <Text size="micro" className="text-copper font-mono uppercase tracking-widest font-bold">
            COMMISSION YOUR PROJECT
          </Text>
          <Heading size="display-md" family="serif" className="leading-tight text-balance">
            {headline}
          </Heading>
          <Text size="body-lg" variant="secondary" className="max-w-xl mx-auto leading-relaxed">
            {description}
          </Text>

          {variant === "newsletter" ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
              <Input
                placeholder="Enter your email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" intent="primary" size="lg" className="whitespace-nowrap gap-2">
                {primaryButtonLabel} <span aria-hidden="true">→</span>
              </Button>
            </form>
          ) : (
            <Button intent="primary" size="lg" onClick={onAction} className="gap-2 mx-auto">
              {primaryButtonLabel} <span aria-hidden="true">→</span>
            </Button>
          )}
        </div>
      </Container>
    </Section>
  )
}
