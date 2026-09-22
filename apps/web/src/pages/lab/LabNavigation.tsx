import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import { Button } from "@/components/ui/interactive/Button"
import {
  Navbar,
  MegaMenu,
  MobileNav,
  Breadcrumb,
  Tabs,
  Pagination,
  AnchorNav,
} from "@/components/ui/navigation"
import { Menu, ArrowUpRight } from "lucide-react"

export default function LabNavigation() {
  const [megaOpen, setMegaOpen] = React.useState(false)
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("residential")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [activeAnchor, setActiveAnchor] = React.useState("spec-1")

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
                ✓ Navigation Platform Certified
              </span>
            </div>
            <Heading size="display-md">Navigation Platform</Heading>
            <Text variant="secondary" size="body-lg" className="max-w-3xl">
              Application layout skeleton primitives managing global page headers, rich mega menus, mobile drawers, accessible breadcrumb trails, tabs, and pagination.
            </Text>
          </Stack>
          <Divider className="mb-12" />
        </Section>

        {/* 1. Global Glassmorphic Navbar & MegaMenu Demo */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-4">
            Navbar, Mega Menu & Mobile Drawer
          </Heading>
          <Text variant="secondary" size="caption" className="mb-6">
            Interactive preview of the global navigation header with glassmorphism, category dropdown trigger, and mobile drawer.
          </Text>

          <div className="p-4 bg-canvas-secondary border border-subtle rounded-2xl">
            <Navbar
              sticky={false}
              variant="glass"
              logo={<span className="font-bold tracking-wider text-copper">CROSSANGLE</span>}
              actions={
                <div className="flex items-center gap-3">
                  <Button intent="ghost" size="sm" onClick={() => setMegaOpen(true)} className="hidden md:flex gap-1">
                    Explore Typologies <ArrowUpRight size={14} />
                  </Button>
                  <Button intent="primary" size="sm" className="hidden sm:inline-flex">
                    Book Consultation
                  </Button>
                  <Button intent="ghost" size="icon" className="md:hidden" onClick={() => setMobileNavOpen(true)}>
                    <Menu size={18} />
                  </Button>
                </div>
              }
            >
              <a href="#demo" className="hover:text-copper transition-colors">Philosophy</a>
              <a href="#demo" className="hover:text-copper transition-colors">Portfolio</a>
              <a href="#demo" className="hover:text-copper transition-colors">Services</a>
              <a href="#demo" className="hover:text-copper transition-colors">Journal</a>
            </Navbar>

            {/* Mega Menu Overlay */}
            <MegaMenu isOpen={megaOpen} onClose={() => setMegaOpen(false)}>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <Text size="micro" className="text-copper font-bold mb-3 uppercase tracking-wider font-mono">
                    RESIDENTIAL TYPOLOGIES
                  </Text>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#demo" className="hover:text-copper">Penthouse & Luxury Duplex</a></li>
                    <li><a href="#demo" className="hover:text-copper">Minimalist Urban Villas</a></li>
                    <li><a href="#demo" className="hover:text-copper">Heritage Restorations</a></li>
                  </ul>
                </div>
                <div>
                  <Text size="micro" className="text-copper font-bold mb-3 uppercase tracking-wider font-mono">
                    COMMERCIAL & STUDIO
                  </Text>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#demo" className="hover:text-copper">Executive Workspaces</a></li>
                    <li><a href="#demo" className="hover:text-copper">Boutique Hospitality</a></li>
                    <li><a href="#demo" className="hover:text-copper">Acoustic Audio Studios</a></li>
                  </ul>
                </div>
                <div>
                  <Text size="micro" className="text-copper font-bold mb-3 uppercase tracking-wider font-mono">
                    FEATURED CASE STUDY
                  </Text>
                  <div className="p-4 bg-canvas-secondary border border-subtle rounded-xl text-xs font-mono">
                    <span className="text-copper font-bold">Tokyo Residence</span>
                    <p className="text-content-secondary mt-1">100% custom Japanese timber panelling & light wells.</p>
                  </div>
                </div>
              </div>
            </MegaMenu>

            {/* Mobile Nav Sheet */}
            <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="CrossAngle Navigation">
              <Stack direction="col" gap="md">
                <a href="#demo" className="text-lg font-medium hover:text-copper">Philosophy</a>
                <a href="#demo" className="text-lg font-medium hover:text-copper">Portfolio Showcase</a>
                <a href="#demo" className="text-lg font-medium hover:text-copper">Architectural Services</a>
                <a href="#demo" className="text-lg font-medium hover:text-copper">Design Journal</a>
                <Divider />
                <Button intent="primary" className="w-full">Book Private Consultation</Button>
              </Stack>
            </MobileNav>
          </div>
        </Section>

        {/* 2. Breadcrumbs & Tabs */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-6">
            Breadcrumbs & View-Switching Tabs
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Breadcrumbs */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl">
              <Text size="micro" className="mb-4">Accessible Breadcrumb Trail</Text>
              <Breadcrumb
                items={[
                  { label: "Home", href: "#" },
                  { label: "Portfolio", href: "#" },
                  { label: "Residential", href: "#" },
                  { label: "Tokyo Penthouse" },
                ]}
              />
            </div>

            {/* Tabs */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl">
              <Text size="micro" className="mb-4">Keyboard Accessible Tabs</Text>
              <Tabs
                variant="pill"
                tabs={[
                  { id: "residential", label: "Residential" },
                  { id: "commercial", label: "Commercial" },
                  { id: "specialized", label: "Specialized" },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
              <div className="mt-4 p-4 bg-canvas-secondary border border-subtle rounded-lg text-xs font-mono">
                Active Context: <span className="text-copper font-bold">{activeTab}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* 3. Pagination & Sticky AnchorNav */}
        <Section spacing="none">
          <Heading size="heading-md" className="mb-6">
            Pagination & Sticky Section Anchor Navigation
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pagination */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl flex flex-col justify-between">
              <div>
                <Text size="micro" className="mb-2">Portfolio Page Controls</Text>
                <Text size="caption" variant="secondary" className="mb-4">
                  Paginated page index indicator for project collections.
                </Text>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* AnchorNav */}
            <div className="p-6 bg-surface-card border border-subtle rounded-xl">
              <Text size="micro" className="mb-4">Editorial Anchor Section Indicator</Text>
              <AnchorNav
                items={[
                  { id: "spec-1", label: "01. Spatial Philosophy" },
                  { id: "spec-2", label: "02. Material Specifications" },
                  { id: "spec-3", label: "03. Lighting State Engineering" },
                  { id: "spec-4", label: "04. Acoustic Treatment" },
                ]}
                activeId={activeAnchor}
                onSelect={setActiveAnchor}
              />
            </div>
          </div>
        </Section>
      </Stack>
    </Container>
  )
}
