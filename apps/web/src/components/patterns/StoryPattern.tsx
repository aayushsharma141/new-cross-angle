import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { MetricCard } from "@/components/ui/card/business/MetricCard"
import { cn } from "@/lib/utils"
import { StoryContent } from "@/types/content/patterns"
import { getOptimizedUrl } from "@/lib/cdn";

export interface StoryPatternProps extends StoryContent {
  className?: string
}

export function StoryPattern({
  headline,
  manifestoText,
  secondaryText,
  imageUrl1,
  imageUrl2,
  metrics = [],
  className,
}: StoryPatternProps) {
  return (
    <Section spacing="loose" className={cn("py-24 bg-canvas-primary border-b border-subtle", className)}>
      <Container size="standard" className="space-y-24">
        {/* Top Split Manifesto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 aspect-[4/5] bg-stone-900 border border-subtle rounded-2xl overflow-hidden relative flex items-center justify-center font-mono text-xs text-stone-500">
            {imageUrl1 ? (
              <img src={getOptimizedUrl(imageUrl1, { width: 1200, quality: 80 })} alt={headline} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <span>[ Primary Interior Photography ]</span>
            )}
          </div>

          <div className="lg:col-span-7 space-y-8 lg:pl-8">
            <span className="text-xs font-mono text-copper uppercase tracking-widest font-bold">
              SPATIAL PHILOSOPHY & CRAFTSMANSHIP
            </span>
            <Heading size="display-lg" family="serif" className="leading-tight">
              {headline}
            </Heading>
            <Text size="body-lg" variant="secondary" className="leading-relaxed">
              {manifestoText}
            </Text>
            {secondaryText && (
              <Text size="body" variant="secondary" className="leading-relaxed">
                {secondaryText}
              </Text>
            )}
          </div>
        </div>

        {/* Full Width Hero Image */}
        <div className="w-full aspect-[21/9] bg-stone-900 border border-subtle rounded-2xl overflow-hidden relative flex items-center justify-center font-mono text-xs text-stone-500">
          {imageUrl2 ? (
            <img src={getOptimizedUrl(imageUrl2, { width: 1200, quality: 80 })} alt="Full interior panorama" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            <span>[ Full Width Architectural Panorama Render ]</span>
          )}
        </div>

        {/* Metrics Strip */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {metrics.map((m, i) => (
              <MetricCard key={i} value={m.value} label={m.label} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
