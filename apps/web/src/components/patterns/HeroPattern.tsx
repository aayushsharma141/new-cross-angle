import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Button } from "@/components/ui/interactive/Button"
import { Badge } from "@/components/ui/interactive/Badge"

import { cn } from "@/lib/utils"
import { HeroContent } from "@/types/content/patterns"
import { getOptimizedUrl } from "@/lib/cdn";

export interface HeroPatternProps extends HeroContent {
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  className?: string
}

export function HeroPattern({
  variant = "editorial",
  badge,
  title,
  subtitle,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  imageUrl,
  className,
}: HeroPatternProps) {
  if (variant === "manifesto") {
    return (
      <Section spacing="loose" className={cn("bg-canvas-primary text-content-primary py-24 lg:py-36", className)}>
        <Container size="reading">
          <div className="text-center space-y-8">
            {badge && <Badge tone="brand" className="mx-auto font-mono text-xs">{badge}</Badge>}
            <Heading size="hero" family="serif" className="leading-tight text-balance">
              {title}
            </Heading>
            {subtitle && (
              <Text size="body-lg" variant="secondary" className="max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </Text>
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {primaryActionLabel && (
                <Button intent="primary" size="lg" onClick={onPrimaryAction} className="gap-2">
                  {primaryActionLabel} <span aria-hidden="true">→</span>
                </Button>
              )}
              {secondaryActionLabel && (
                <Button intent="secondary" size="lg" onClick={onSecondaryAction}>
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  if (variant === "split") {
    return (
      <Section spacing="default" className={cn("py-16 lg:py-24", className)}>
        <Container size="standard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              {badge && <Badge tone="brand" className="font-mono text-xs">{badge}</Badge>}
              <Heading size="display-xl" className="leading-tight">
                {title}
              </Heading>
              {subtitle && (
                <Text size="body-lg" variant="secondary" className="leading-relaxed">
                  {subtitle}
                </Text>
              )}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {primaryActionLabel && (
                  <Button intent="primary" size="lg" onClick={onPrimaryAction} className="gap-2">
                    {primaryActionLabel} <span aria-hidden="true">→</span>
                  </Button>
                )}
                {secondaryActionLabel && (
                  <Button intent="secondary" size="lg" onClick={onSecondaryAction}>
                    {secondaryActionLabel}
                  </Button>
                )}
              </div>
            </div>

            <div className="aspect-[3/4] bg-stone-900 border border-subtle overflow-hidden relative flex items-center justify-center font-mono text-xs text-stone-500">
              {imageUrl ? (
                <img 
                  src={getOptimizedUrl(imageUrl, { width: 1920, quality: 80 })} 
                  alt={title} 
                  loading="eager" 
                  {...({ fetchpriority: "high" } as any)} 
                  decoding="sync" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>[ High-Resolution Architectural Render ]</span>
              )}
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  // Default: Editorial Hero
  return (
    <Section spacing="loose" className={cn("py-20 lg:py-32 bg-canvas-primary border-b border-subtle", className)}>
      <Container size="standard">
        <div className="max-w-4xl space-y-8">
          {badge && <Badge tone="brand" className="font-mono text-xs">{badge}</Badge>}
          <Heading size="hero" className="leading-tight font-medium text-balance">
            {title}
          </Heading>
          {subtitle && (
            <Text size="body-lg" variant="secondary" className="max-w-2xl leading-relaxed">
              {subtitle}
            </Text>
          )}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {primaryActionLabel && (
              <Button intent="primary" size="lg" onClick={onPrimaryAction} className="gap-2">
                {primaryActionLabel} <span aria-hidden="true">→</span>
              </Button>
            )}
            {secondaryActionLabel && (
              <Button intent="secondary" size="lg" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}
