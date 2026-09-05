import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import {
  Card,
  Panel,
  ProjectCard,
  ServiceCard,
  TestimonialCard,
  MetricCard,
  ArticleCard,
  GalleryCard,
} from "@/components/ui/card"
import { Layers, Compass } from "lucide-react"

export default function LabCards() {
  return (
    <Container size="standard" className="py-12 lg:py-24">
      <Stack direction="col" gap="section">
        {/* Header */}
        <Section spacing="none">
          <Stack direction="col" gap="sm" className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                🟢 Stable
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-copper/10 text-copper border border-copper/30 rounded-full">
                ✓ Business Taxonomy Certified
              </span>
            </div>
            <Heading size="display-md">Card Ecosystem Taxonomy</Heading>
            <Text variant="secondary" size="body-lg" className="max-w-3xl">
              Decoupled structural card primitives (`Card`, `Panel`) and business domain semantic cards (`ProjectCard`, `ServiceCard`, `TestimonialCard`, `MetricCard`, `ArticleCard`, `GalleryCard`).
            </Text>
          </Stack>
          <Divider className="mb-12" />
        </Section>

        {/* Structural Layer */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-6">
            Layer A: Structural Base Primitives
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border border-subtle">
              <Heading size="heading-sm" className="mb-2">Base Structural Card</Heading>
              <Text size="sm" variant="secondary">
                Inherits directly from Surface. Accepts elevation levels and lighting state environments (`gallery`, `workspace`).
              </Text>
            </Card>

            <Panel className="border border-subtle">
              <Heading size="heading-sm" className="mb-2">Compact Panel Container</Heading>
              <Text size="sm" variant="secondary">
                Designed for sidebars, inspector tools, and auxiliary control boxes.
              </Text>
            </Panel>
          </div>
        </Section>

        {/* Business Domain Layer */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-6">
            Layer B: Business Semantic Cards
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ProjectCard */}
            <ProjectCard
              title="The Minimalist Residence"
              category="Luxury Residential"
              location="Tokyo, Japan"
            />

            {/* ServiceCard */}
            <ServiceCard
              title="Full Architecture & Interiors"
              description="Complete spatial overhaul from blueprint to finished luxury interior."
              features={[
                "3D Spatial Virtualization",
                "Custom Material Sourcing",
                "On-site Execution Oversight"
              ]}
              priceRange="$50,000"
              icon={<Compass size={24} />}
            />

            {/* TestimonialCard */}
            <TestimonialCard
              quote="CrossAngle transformed our duplex into a calm, light-filled haven. The execution was flawless."
              author="Kenji Takahashi"
              role="Principal Architect"
              projectScope="Tokyo Penthouse Project"
            />

            {/* MetricCard */}
            <MetricCard
              value="150+"
              label="COMPLETED RESIDENCES"
              trend="+24% YoY"
            />

            {/* ArticleCard */}
            <ArticleCard
              title="The Psychology of Light in Modern Japanese Interiors"
              snippet="How ambient lighting states alter human spatial perception in urban habitats."
              date="AUG 01, 2026"
              readTime="5 MIN READ"
              category="JOURNAL"
            />

            {/* GalleryCard */}
            <GalleryCard
              title="Kyoto Zen Garden Pavilion"
              subtitle="Interior Lighting & Acoustics"
            />
          </div>
        </Section>
      </Stack>
    </Container>
  )
}
