import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import {
  HeroPattern,
  StoryPattern,
  GalleryPattern,
  ProcessPattern,
  MetricsPattern,
  CTAPattern,
  TestimonialPattern,
  ContactPattern,
} from "@/components/patterns"
import { homepageMock } from "@/lib/recipes/homepage.mock"

export default function LabPatterns() {
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
                ✓ Architectural Pattern Certified
              </span>
            </div>
            <Heading size="display-md">Pattern Library Suite</Heading>
            <Text variant="secondary" size="body-lg" className="max-w-3xl">
              High-level architectural narrative blocks composed strictly from certified primitives. Pages consume patterns rather than raw primitives.
            </Text>
          </Stack>
          <Divider className="mb-12" />
        </Section>

        {/* 1. Hero Pattern Showcase */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-4">1. Hero Pattern (Editorial & Split Variants)</Heading>
          <div className="space-y-8">
            <HeroPattern {...homepageMock.hero} />
          </div>
        </Section>

        {/* 2. Story Pattern */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-4">2. Story Pattern (LivingSpace Narrative Flow)</Heading>
          <StoryPattern {...homepageMock.story} />
        </Section>

        {/* 3. Gallery Pattern */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-4">3. Gallery Pattern</Heading>
          <GalleryPattern {...homepageMock.gallery} />
        </Section>

        {/* 4. Process Pattern */}
        {homepageMock.process && (
          <Section spacing="none">
            <Heading size="heading-md" className="mb-4">4. Process Pattern</Heading>
            <ProcessPattern {...homepageMock.process} />
          </Section>
        )}

        {/* 5. Metrics Pattern */}
        {homepageMock.metrics && (
          <Section spacing="none">
            <Heading size="heading-md" className="mb-4">5. Metrics Pattern</Heading>
            <MetricsPattern {...homepageMock.metrics} />
          </Section>
        )}

        {/* 6. Testimonial Pattern */}
        {homepageMock.testimonials && (
          <Section spacing="none">
            <Heading size="heading-md" className="mb-4">6. Testimonial Pattern</Heading>
            <TestimonialPattern {...homepageMock.testimonials} />
          </Section>
        )}

        {/* 7. CTA Pattern */}
        {homepageMock.cta && (
          <Section spacing="none">
            <Heading size="heading-md" className="mb-4">7. CTA Pattern</Heading>
            <CTAPattern {...homepageMock.cta} />
          </Section>
        )}

        {/* 8. Contact Pattern */}
        {homepageMock.contact && (
          <Section spacing="none">
            <Heading size="heading-md" className="mb-4">8. Contact Pattern</Heading>
            <ContactPattern {...homepageMock.contact} />
          </Section>
        )}
      </Stack>
    </Container>
  )
}
