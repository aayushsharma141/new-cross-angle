import * as React from "react"
import { useState } from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import { Surface } from "@/components/ui/foundation/Surface"
import { TokenInspector, type TokenInfo } from "@/components/lab/TokenInspector"

export default function LabFoundations() {
  const [inspectedToken, setInspectedToken] = useState<TokenInfo | null>(null);

  const colors = [
    { name: "canvas-primary", tailwind: "bg-canvas-primary", cssVar: "var(--canvas-primary)", foundation: "stone-50 / white", usage: "The lowest foundational layer. Used for the main app background." },
    { name: "canvas-secondary", tailwind: "bg-canvas-secondary", cssVar: "var(--canvas-secondary)", foundation: "stone-100 / stone-50", usage: "Used to offset panels, sidebars, or areas requiring subtle contrast from the primary canvas." },
    { name: "surface-card", tailwind: "bg-surface-card", cssVar: "var(--surface-card)", foundation: "white", usage: "Elevated surfaces like cards, dropdowns, and modals." },
    { name: "accent-copper", tailwind: "bg-copper", cssVar: "var(--accent-copper)", foundation: "copper-500", usage: "Primary brand action color. Used sparingly for high-emphasis." }
  ];

  return (
    <>
      <Container size="standard" className="py-12 lg:py-24">
        <Stack direction="col" gap="section">
          
          {/* Typography */}
          <Section spacing="none">
            <Stack direction="col" gap="sm" className="mb-12">
              <Heading size="display-md">Typography Scale</Heading>
              <Text variant="secondary">The core typographic hierarchy used across the platform. Governed by a primary geometric sans, with an editorial serif reserved for accent.</Text>
            </Stack>
            <Divider className="mb-12" />

            <Stack direction="col" gap="xl">
              {/* Hero */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Hero</Text>
                  <Text size="sm" variant="secondary">Heading / hero</Text>
                  <Text size="sm" className="text-copper">96px / 100% / -2.5%</Text>
                </Stack>
                <Heading size="hero" className="break-words">The Architecture of Space.</Heading>
              </div>

              {/* Display XL */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Display Extra Large</Text>
                  <Text size="sm" variant="secondary">Heading / display-xl</Text>
                  <Text size="sm" className="text-copper">72px / 100% / -2.5%</Text>
                </Stack>
                <Heading size="display-xl" className="break-words">40,000 Sq. Ft. of Absolute Control.</Heading>
              </div>

              {/* Display LG */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Display Large</Text>
                  <Text size="sm" variant="secondary">Heading / display-lg</Text>
                  <Text size="sm" className="text-copper">60px / 100% / -2.5%</Text>
                </Stack>
                <Heading size="display-lg" className="break-words">German Technology, Kerala Heart.</Heading>
              </div>

              {/* Editorial Display */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Editorial Hero</Text>
                  <Text size="sm" variant="secondary">Heading / display-lg (serif)</Text>
                  <Text size="sm" className="text-copper">60px / 100% / -2.5%</Text>
                </Stack>
                <Heading family="serif" size="display-lg" className="break-words italic">Your vision, our legacy.</Heading>
              </div>

              {/* Section Heading XL */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Section Title</Text>
                  <Text size="sm" variant="secondary">Heading / heading-xl</Text>
                  <Text size="sm" className="text-copper">36px / 110% / -1.5%</Text>
                </Stack>
                <Heading size="heading-xl" className="break-words">The Minds Behind the Masterpieces.</Heading>
              </div>
              
              {/* Heading MD */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Card Title</Text>
                  <Text size="sm" variant="secondary">Heading / heading-md</Text>
                  <Text size="sm" className="text-copper">24px / 125% / 0%</Text>
                </Stack>
                <Heading size="heading-md" className="break-words">Flawless Deliveries</Heading>
              </div>

              {/* Body */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Body (Standard)</Text>
                  <Text size="sm" variant="secondary">Text / body</Text>
                  <Text size="sm" className="text-copper">16px / 150% / 0%</Text>
                </Stack>
                <Text size="body" className="max-w-2xl">
                  We believe that space shapes behavior. Our approach to interior architecture 
                  focuses on light, materiality, and proportion to create environments that 
                  elevate the human experience.
                </Text>
              </div>

              {/* Micro / Label */}
              <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-12">
                <Stack direction="col" gap="xs">
                  <Text size="label">Label / Overline</Text>
                  <Text size="sm" variant="secondary">Text / micro</Text>
                  <Text size="sm" className="text-copper">11px / 150% / +15%</Text>
                </Stack>
                <Text size="micro">Our Process</Text>
              </div>
            </Stack>
          </Section>

          {/* Semantic Colors */}
          <Section spacing="none">
            <Stack direction="col" gap="sm" className="mb-12">
              <Heading size="display-md">Semantic Architecture</Heading>
              <Text variant="secondary">Click any token to inspect its CSS variable and usage rules.</Text>
            </Stack>
            <Divider className="mb-12" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {colors.map((c) => (
                <div 
                  key={c.name}
                  onClick={() => setInspectedToken(c)}
                  className="group cursor-pointer flex flex-col border border-subtle bg-surface-card rounded-md overflow-hidden transition-all hover:-translate-y-1 hover:shadow-elevated"
                >
                  <div className={`h-32 w-full ${c.tailwind} border-b border-subtle`} />
                  <div className="p-4 flex flex-col gap-2">
                    <Text size="label" className="font-bold">{c.name}</Text>
                    <Text size="sm" variant="secondary" className="font-mono text-xs">{c.tailwind}</Text>
                    <Text size="sm" className="line-clamp-2 mt-2">{c.usage}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Spacing & Radii */}
          <Section spacing="none">
            <Stack direction="col" gap="sm" className="mb-12">
              <Heading size="display-md">Shape & Space</Heading>
              <Text variant="secondary">The physical boundaries of elements.</Text>
            </Stack>
            <Divider className="mb-12" />

            <div className="flex flex-wrap gap-8 lg:gap-12">
              {['sm', 'md', 'lg', 'full'].map((r) => (
                <Stack direction="col" gap="md" align="center" key={r}>
                  <Surface 
                    radius={r as any} 
                    elevation="level1"
                    background="canvasSecondary"
                    className="w-24 h-24 flex items-center justify-center border-subtle relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-copper/10" />
                  </Surface>
                  <Text size="sm" className="font-mono mt-4 text-center">rounded-{r}</Text>
                </Stack>
              ))}
            </div>
          </Section>

          {/* Interactive Motion */}
          <Section spacing="none">
            <Stack direction="col" gap="sm" className="mb-12">
              <Heading size="display-md">Motion Kinetics</Heading>
              <Text variant="secondary">Tap or hover to see physical translation, scale, and opacity shifts.</Text>
            </Stack>
            <Divider className="mb-12" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Surface elevation="level1" className="p-6 group cursor-pointer h-48 flex items-center justify-center overflow-hidden">
                <div className="w-16 h-16 bg-copper rounded-md group-hover:scale-125 group-active:scale-125 group-hover:-translate-y-4 group-active:-translate-y-4 transition-all duration-micro ease-physical"></div>
                <Text size="label" className="absolute bottom-4">Micro (300ms)</Text>
              </Surface>

              <Surface elevation="level1" className="p-6 group cursor-pointer h-48 flex items-center justify-center overflow-hidden">
                <div className="w-16 h-16 bg-copper rounded-md group-hover:scale-125 group-active:scale-125 group-hover:-translate-y-4 group-active:-translate-y-4 transition-all duration-macro ease-physical"></div>
                <Text size="label" className="absolute bottom-4">Macro (800ms)</Text>
              </Surface>

              <Surface elevation="level1" className="p-6 group cursor-pointer h-48 flex items-center justify-center overflow-hidden">
                <div className="w-16 h-16 bg-copper rounded-md opacity-100 group-hover:opacity-0 group-active:opacity-0 group-hover:scale-50 group-active:scale-50 transition-all duration-slow ease-physical"></div>
                <Text size="label" className="absolute bottom-4">Epic (1400ms)</Text>
              </Surface>
            </div>
          </Section>

        </Stack>
      </Container>

      <TokenInspector token={inspectedToken} onClose={() => setInspectedToken(null)} />
    </>
  )
}
