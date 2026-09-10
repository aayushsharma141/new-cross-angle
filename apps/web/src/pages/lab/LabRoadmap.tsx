import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"

interface ProgressItemProps {
  title: string;
  percentage: number;
  description?: string;
}

const ProgressItem = ({ title, percentage, description }: ProgressItemProps) => (
  <Stack direction="col" gap="sm">
    <div className="flex justify-between items-end">
      <Text size="body-lg" className="font-medium">{title}</Text>
      <Text size="caption" variant="secondary" className="font-mono">{percentage}%</Text>
    </div>
    {description && <Text size="caption" variant="secondary">{description}</Text>}
    <div className="h-2 w-full bg-canvas-secondary rounded-full overflow-hidden">
      <div 
        className="h-full bg-copper transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </Stack>
)

export default function LabRoadmap() {
  return (
    <Container size="standard" className="py-12 lg:py-24">
      <Stack direction="col" gap="section">
        <Section spacing="none">
          <Stack direction="col" gap="sm" className="mb-12">
            <Heading size="display-md">Roadmap & Adoption</Heading>
            <Text variant="secondary">Tracking the evolution of the Design System and its integration into production.</Text>
          </Stack>
          <Divider className="mb-12" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            <Stack direction="col" gap="xl">
              <Heading size="heading-md">Architecture Phases</Heading>
              
              <ProgressItem 
                title="Phase 1: Foundation" 
                percentage={100} 
                description="Tokens 2.0, Typography Scale, Spacing, Semantic Colors"
              />
              <ProgressItem 
                title="Phase 2: Interactive Primitives" 
                percentage={100} 
                description="Buttons, Inputs, Selects, Checkboxes, IconButtons"
              />
              <ProgressItem 
                title="Phase 3: Overlay & Card Ecosystem" 
                percentage={100} 
                description="Overlay Platform (Certified), Dialog System, Structural & Business Cards"
              />
              <ProgressItem 
                title="Phase 4: Navigation Platform" 
                percentage={100} 
                description="Navbar (Glass), MegaMenu, MobileNav, Breadcrumb, Tabs, Pagination, AnchorNav"
              />
              <ProgressItem 
                title="Phase 5: Feedback System" 
                percentage={0} 
                description="Toasts, Banners, Loading States, Skeletons, Empty States"
              />
              <ProgressItem 
                title="Phase 6: Data Display" 
                percentage={0} 
                description="Tables, Timelines, Key-Value Grids, Accordions"
              />
              <ProgressItem 
                title="Phase 7: Pattern Library" 
                percentage={0} 
                description="Hero Blocks, Editorial Story Blocks, Gallery Grid, Contact Sections"
              />
              <ProgressItem 
                title="Phase 8: Template Library" 
                percentage={0} 
                description="Portfolio Template, Service Template, Case Study Template"
              />
              <ProgressItem 
                title="Phase 9: Production Migration" 
                percentage={0} 
                description="Pattern-by-pattern migration of Homepage, Portfolio & Estimator"
              />
              <ProgressItem 
                title="Phase 10: Optimization & QA" 
                percentage={0} 
                description="Bundle Splitting, Performance Budget, Lighthouse ≥ 95, Visual Regression"
              />
            </Stack>

            <Stack direction="col" gap="xl">
              <Heading size="heading-md">Production Rollout</Heading>
              
              <ProgressItem 
                title="Design System Lab" 
                percentage={70} 
                description="Interactive documentation and token inspector"
              />
              <ProgressItem 
                title="Global Layout (Nav/Footer)" 
                percentage={0} 
                description="Migrating global shell to new architecture"
              />
              <ProgressItem 
                title="Homepage Restructure" 
                percentage={0} 
                description="Assembling homepage from strict patterns"
              />
              <ProgressItem 
                title="Portfolio & Case Studies" 
                percentage={0} 
                description="Migrating gallery and editorial blocks"
              />
            </Stack>

          </div>
        </Section>
      </Stack>
    </Container>
  )
}
