import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import { LandingTemplate } from "@/components/templates/LandingTemplate"
import { homepageMock } from "@/lib/recipes/homepage.mock"

export default function LabTemplates() {
  const [activePreview, setActivePreview] = React.useState<"overview" | "full-landing">("overview")

  if (activePreview === "full-landing") {
    return (
      <div className="relative">
        <div className="fixed top-20 right-6 z-50">
          <button
            onClick={() => setActivePreview("overview")}
            className="px-4 py-2 bg-copper text-white rounded-lg font-mono text-xs shadow-xl hover:bg-copper-dark"
          >
            ← Exit Full Landing Preview
          </button>
        </div>
        <LandingTemplate content={homepageMock} />
      </div>
    )
  }

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
                ✓ Template Library Certified
              </span>
            </div>
            <Heading size="display-md">Template Library Suite</Heading>
            <Text variant="secondary" size="body-lg" className="max-w-3xl">
              Slot-based full page layout templates. Pages are lightweight composition shells supplying patterns into pre-structured template slots.
            </Text>
          </Stack>
          <Divider className="mb-12" />
        </Section>

        {/* Live Assembly Overview */}
        <Section spacing="none">
          <div className="p-8 bg-surface-card border border-copper/30 rounded-2xl space-y-6">
            <Text size="micro" className="text-copper font-mono uppercase tracking-widest font-bold">
              ZERO BESPOKE CODE PAGE ASSEMBLY
            </Text>
            <Heading size="heading-lg">Full Landing Page Template Preview</Heading>
            <Text variant="secondary" className="max-w-2xl leading-relaxed">
              Click below to view a complete, fully assembled production page constructed entirely by supplying 8 certified patterns into <code className="text-copper font-mono">&lt;LandingTemplate /&gt;</code>.
            </Text>

            <button
              onClick={() => setActivePreview("full-landing")}
              className="px-6 py-3 bg-copper text-white rounded-xl font-medium shadow-lg hover:bg-copper-dark transition-colors"
            >
              Launch Live Full Landing Template Page
            </button>
          </div>
        </Section>
      </Stack>
    </Container>
  )
}
