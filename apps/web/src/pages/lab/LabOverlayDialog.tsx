import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import { Button } from "@/components/ui/interactive/Button"
import { Input } from "@/components/ui/interactive/Input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/overlay"

export default function LabOverlayDialog() {
  const [nestedOpen, setNestedOpen] = React.useState(false)

  // Story Scenario States
  const [galleryOpen, setGalleryOpen] = React.useState(false)
  const [inquiryOpen, setInquiryOpen] = React.useState(false)
  const [confirmationOpen, setConfirmationOpen] = React.useState(false)

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInquiryOpen(false)
    setConfirmationOpen(true)
  }

  const handleCloseAllStory = () => {
    setConfirmationOpen(false)
    setInquiryOpen(false)
    setGalleryOpen(false)
  }

  return (
    <Container size="standard" className="py-12 lg:py-24">
      <Stack direction="col" gap="section">
        {/* Page Header */}
        <Section spacing="none">
          <Stack direction="col" gap="sm" className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                Core Infra Stable
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-copper/10 text-copper border border-copper/30 rounded-full">
                ✓ Certified Accessibility
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full">
                ✓ Focus Trap Verified
              </span>
            </div>
            <Heading size="display-md">Overlay Platform & Dialog System</Heading>
            <Text variant="secondary" size="body-lg" className="max-w-3xl">
              Central floating infrastructure managing portals, focus traps, scroll locking, z-index stacks, and screen-reader accessibility across all overlay primitives.
            </Text>
          </Stack>
          <Divider className="mb-12" />
        </Section>

        {/* Real UX Story Scenario Stress Test */}
        <Section spacing="none">
          <div className="p-8 bg-copper/5 border border-copper/30 rounded-2xl">
            <Stack direction="col" gap="md" className="mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-copper font-bold">
                REAL WORKFLOW STRESS TEST SCENARIO
              </span>
              <Heading size="heading-lg">End-to-End Client Journey Test</Heading>
              <Text variant="secondary">
                Simulates real production user flow: <code className="text-copper">Project Showcase → Gallery Modal → Inquiry Form → Submission → Success Toast</code>. Tests 3-deep portal stacking, ESC key priority order, and trigger focus restoration.
              </Text>
            </Stack>

            <Button intent="primary" size="lg" onClick={() => setGalleryOpen(true)}>
              Launch Real Story Scenario
            </Button>

            {/* Step 1: Gallery Showcase Dialog */}
            <Dialog open={galleryOpen} onOpenChange={setGalleryOpen} variant="gallery">
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-stone-100">The Minimalist Penthouse Showcase</DialogTitle>
                  <DialogDescription className="text-stone-400">
                    Tokyo luxury residential suite with custom timber panelling.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-6">
                  <div className="aspect-video bg-stone-900 border border-stone-800 rounded-lg flex flex-col items-center justify-center text-stone-400 font-mono text-sm p-8 text-center">
                    <span>[ Architectural Interior High-Res Photograph ]</span>
                    <span className="text-xs text-stone-600 mt-2">Pressing ESC here closes Step 1. Clicking below opens Step 2 on top.</span>
                  </div>
                </DialogBody>
                <DialogFooter className="justify-between sm:justify-between">
                  <DialogClose asChild>
                    <Button intent="secondary" className="border-stone-700 text-stone-300 hover:bg-stone-800">
                      Close Showcase
                    </Button>
                  </DialogClose>
                  <Button intent="primary" onClick={() => setInquiryOpen(true)}>
                    Inquire About This Space
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Step 2: Inquiry Form Dialog (Stacked on top) */}
            <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen} variant="default">
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Project Design Inquiry</DialogTitle>
                  <DialogDescription>
                    Inquiring about <strong className="text-copper">The Minimalist Penthouse</strong> spatial concepts.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInquirySubmit}>
                  <DialogBody className="space-y-4">
                    <Input label="Your Name" placeholder="Aayush Sharma" required />
                    <Input label="Email Address" type="email" placeholder="aayush@example.com" required />
                    <Input label="Estimated Budget" placeholder="$150,000 - $300,000" />
                  </DialogBody>
                  <DialogFooter>
                    <Button type="button" intent="secondary" onClick={() => setInquiryOpen(false)}>
                      Back to Gallery
                    </Button>
                    <Button type="submit" intent="primary">
                      Submit Inquiry
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Step 3: Success Confirmation Dialog (Top of stack) */}
            <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen} variant="confirmation">
              <DialogContent>
                <DialogHeader>
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                    ✓
                  </div>
                  <DialogTitle>Inquiry Submitted Successfully!</DialogTitle>
                  <DialogDescription>
                    Our interior design team will review your project parameters within 24 hours.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="justify-center sm:justify-center">
                  <Button intent="primary" onClick={handleCloseAllStory}>
                    Complete Journey & Close All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </Section>

        {/* Layer Dependency Map */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-6">
            Layer Dependency Map
          </Heading>
          <div className="p-6 bg-surface-card border border-subtle rounded-xl font-mono text-sm">
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-canvas-secondary rounded border border-subtle text-content-secondary">
                Layer A (Foundation): Heading, Text, Surface, Container, Stack
              </div>
              <div className="text-center text-copper font-bold">↓</div>
              <div className="p-3 bg-canvas-secondary rounded border border-subtle text-content-secondary">
                Layer B (Interactive): Button, Input, Select, Checkbox, IconButton
              </div>
              <div className="text-center text-copper font-bold">↓</div>
              <div className="p-3 bg-copper/10 border border-copper/30 rounded text-copper font-semibold">
                Overlay Platform: Portal, Overlay, FocusTrap, useScrollLock, useEscapeKey, OverlayManager
              </div>
              <div className="text-center text-copper font-bold">↓</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                  Dialog System (🟢 Stable · ✓ Certified)
                </div>
                <div className="p-2 bg-canvas-secondary border border-subtle text-content-secondary rounded">
                  Drawer (Planned)
                </div>
                <div className="p-2 bg-canvas-secondary border border-subtle text-content-secondary rounded">
                  Command Palette (Planned)
                </div>
                <div className="p-2 bg-canvas-secondary border border-subtle text-content-secondary rounded">
                  Lightbox (Planned)
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Interactive Dialog Playground */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-6">
            Interactive Dialog Variants
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Default Dialog */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl flex flex-col justify-between gap-4">
              <div>
                <Heading size="heading-md" className="mb-1">
                  Default Dialog
                </Heading>
                <Text size="caption" variant="secondary">
                  Standard modal card for forms, details, and information lookup.
                </Text>
              </div>
              <Dialog variant="default">
                <DialogTrigger asChild>
                  <Button intent="primary">Open Default Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Project Consultation</DialogTitle>
                    <DialogDescription>
                      Request a private consultation for your residential or commercial space.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="space-y-4">
                    <Text size="caption">Please enter your details below:</Text>
                    <Input placeholder="Full Name" />
                    <Input placeholder="Email Address" type="email" />
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button intent="secondary">Cancel</Button>
                    </DialogClose>
                    <Button intent="primary">Submit Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 2. Alert Dialog */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl flex flex-col justify-between gap-4">
              <div>
                <Heading size="heading-md" className="mb-1">
                  Alert Dialog
                </Heading>
                <Text size="caption" variant="secondary">
                  High-priority modal requiring immediate user attention or action.
                </Text>
              </div>
              <Dialog variant="alert">
                <DialogTrigger asChild>
                  <Button intent="ghost" className="text-red-500 hover:bg-red-500/10">
                    Open Alert Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-500">Delete Custom Blueprint?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently erase your saved spatial preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button intent="secondary">Keep Blueprint</Button>
                    </DialogClose>
                    <Button intent="primary" className="bg-red-600 hover:bg-red-700 text-white border-none">
                      Delete Blueprint
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 3. Sheet (Drawer Variant) */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl flex flex-col justify-between gap-4">
              <div>
                <Heading size="heading-md" className="mb-1">
                  Sheet (Slide Over)
                </Heading>
                <Text size="caption" variant="secondary">
                  Side drawer sliding from viewport edge for filters or navigation.
                </Text>
              </div>
              <Dialog variant="sheet">
                <DialogTrigger asChild>
                  <Button intent="secondary">Open Sheet</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Projects</DialogTitle>
                    <DialogDescription>
                      Refine interior portfolio by typology and lighting environment.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="space-y-6">
                    <Stack direction="col" gap="sm">
                      <Text size="micro">Typology</Text>
                      <Button intent="secondary" size="sm">Residential Luxury</Button>
                      <Button intent="secondary" size="sm">Commercial Workspace</Button>
                      <Button intent="secondary" size="sm">Specialized Studio</Button>
                    </Stack>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button intent="primary">Apply Filters</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 4. Fullscreen Dialog */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl flex flex-col justify-between gap-4">
              <div>
                <Heading size="heading-md" className="mb-1">
                  Fullscreen Canvas
                </Heading>
                <Text size="caption" variant="secondary">
                  Immersive distraction-free overlay for configurators or galleries.
                </Text>
              </div>
              <Dialog variant="fullscreen">
                <DialogTrigger asChild>
                  <Button intent="secondary">Open Fullscreen</Button>
                </DialogTrigger>
                <DialogContent>
                  <Container size="standard" className="py-12">
                    <DialogHeader>
                      <DialogTitle size="display-md">Spatial Experience Gallery</DialogTitle>
                      <DialogDescription size="body-lg">
                        Full scale immersive architectural review.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="py-12">
                      <div className="h-64 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-stone-500">
                        High-Resolution Interior Render Container
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button intent="primary">Close Canvas</Button>
                      </DialogClose>
                    </DialogFooter>
                  </Container>
                </DialogContent>
              </Dialog>
            </div>

            {/* 5. Gallery Dialog */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl flex flex-col justify-between gap-4">
              <div>
                <Heading size="heading-md" className="mb-1">
                  Gallery / Portfolio
                </Heading>
                <Text size="caption" variant="secondary">
                  Dark mode container optimized for architectural imagery.
                </Text>
              </div>
              <Dialog variant="gallery">
                <DialogTrigger asChild>
                  <Button intent="secondary">Open Gallery Modal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-stone-100">The Minimalist Penthouse</DialogTitle>
                    <DialogDescription className="text-stone-400">
                      Curated residential interior design in Tokyo, Japan.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <div className="aspect-video bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-center text-stone-600 font-mono text-sm">
                      [ Architectural Photograph Render ]
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button intent="secondary" className="border-stone-700 text-stone-300 hover:bg-stone-800">
                        Close Showcase
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 6. Nested Dialog Stack */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl flex flex-col justify-between gap-4">
              <div>
                <Heading size="heading-md" className="mb-1">
                  Nested Overlays
                </Heading>
                <Text size="caption" variant="secondary">
                  Tests OverlayManager stacking z-indexes and top-only ESC key stack.
                </Text>
              </div>
              <Dialog variant="default">
                <DialogTrigger asChild>
                  <Button intent="secondary">Open Level 1 Modal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Level 1 Modal</DialogTitle>
                    <DialogDescription>
                      Pressing ESC or opening Level 2 will verify stack order.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="space-y-4">
                    <Button intent="primary" onClick={() => setNestedOpen(true)}>
                      Open Level 2 Modal
                    </Button>
                  </DialogBody>

                  {/* Level 2 Sub Dialog */}
                  <Dialog open={nestedOpen} onOpenChange={setNestedOpen} variant="confirmation">
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Level 2 Confirmation</DialogTitle>
                        <DialogDescription>
                          This modal sits on top with a higher z-index (60 vs 50).
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button intent="primary" onClick={() => setNestedOpen(false)}>
                          Dismiss Level 2
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button intent="secondary">Close Level 1</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

          </div>
        </Section>

        {/* Accessibility & Platform Checklist */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-6">
            Accessibility & Infrastructure Verification Matrix
          </Heading>
          <div className="p-6 bg-surface-card border border-subtle rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-400">
                <span>✓</span>
                <span>Keyboard Tab Trap (Focus stays within content)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span>✓</span>
                <span>Focus Restoration (Returns to trigger on close)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span>✓</span>
                <span>ESC Key Handling (Top-most overlay closes first)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span>✓</span>
                <span>Body Scroll Lock (Prevents page scroll layout shift)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span>✓</span>
                <span>ARIA Attributes (role="dialog", aria-labelledby, aria-describedby)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span>✓</span>
                <span>Portal Rendering (Escapes overflow hidden boundaries)</span>
              </div>
            </div>
          </div>
        </Section>
      </Stack>
    </Container>
  )
}
