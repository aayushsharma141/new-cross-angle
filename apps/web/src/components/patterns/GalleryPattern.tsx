import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { ProjectCard } from "@/components/ui/card/business/ProjectCard"
import { GalleryCard } from "@/components/ui/card/business/GalleryCard"
import { cn } from "@/lib/utils"
import { GalleryContent } from "@/types/content/patterns"

export interface GalleryPatternProps extends GalleryContent {
  onSelectProject?: (project: GalleryContent["projects"][number]) => void
  className?: string
}

export function GalleryPattern({
  title,
  subtitle,
  mode = "grid",
  projects = [],
  onSelectProject,
  className,
}: GalleryPatternProps) {
  if (mode === "dark") {
    return (
      <Section spacing="xl" className={cn("bg-stone-950 text-stone-100 py-24", className)}>
        <Container size="standard">
          <div className="mb-16 space-y-4">
            <Text size="micro" className="text-copper font-mono uppercase tracking-widest font-bold">
              DARK WORKSPACE ENVIRONMENT
            </Text>
            <Heading size="display-md" className="text-stone-100">
              {title}
            </Heading>
            {subtitle && <Text size="body-lg" className="text-stone-400 max-w-2xl">{subtitle}</Text>}
          </div>

          {/* Editorial Asymmetry — Bible §7: "Symmetrical grids are banned for storytelling" */}
          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            {projects.map((p, i) => {
              // Staggered column spans: alternate 7-col and 5-col, offset vertically
              const isWide = i % 2 === 0
              const colSpan = isWide ? "col-span-12 sm:col-span-7" : "col-span-12 sm:col-span-5"
              const verticalOffset = !isWide ? "sm:mt-16" : ""

              return (
                <div key={p.id} className={cn(colSpan, verticalOffset)}>
                  <GalleryCard
                    title={p.title}
                    subtitle={`${p.category} · ${p.location}`}
                    imageUrl={p.imageUrl}
                    onClick={() => onSelectProject?.(p)}
                  />
                </div>
              )
            })}
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section spacing="xl" className={cn("py-24 bg-canvas-primary border-b border-subtle", className)}>
      <Container size="standard">
        <div className="mb-16 space-y-4">
          <Text size="micro" className="text-copper font-mono uppercase tracking-widest font-bold">
            CURATED SELECTION
          </Text>
          <Heading size="display-md">{title}</Heading>
          {subtitle && <Text size="body-lg" variant="secondary" className="max-w-2xl">{subtitle}</Text>}
        </div>

        {/* Editorial Asymmetry — Bible §7 */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {projects.map((p, i) => {
            const isWide = i % 2 === 0
            const colSpan = isWide ? "col-span-12 md:col-span-7" : "col-span-12 md:col-span-5"
            const verticalOffset = !isWide ? "md:mt-12" : ""

            return (
              <div key={p.id} className={cn(colSpan, verticalOffset)}>
                <ProjectCard
                  title={p.title}
                  category={p.category ?? ""}
                  location={p.location}
                  imageUrl={p.imageUrl}
                  aspectRatio="portrait"
                  onClick={() => onSelectProject?.(p)}
                />
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
