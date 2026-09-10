import * as React from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import { IconButton } from "@/components/ui/interactive/IconButton"

const navGroups = [
  {
    title: "FOUNDATIONS",
    items: [
      { path: "/lab/overview", label: "Overview", disabled: false },
      { path: "/lab/roadmap", label: "Roadmap", disabled: false },
      { path: "/lab/foundations", label: "Typography & Tokens", disabled: false },
      { path: "/lab/spacing", label: "Spacing", disabled: true },
      { path: "/lab/motion", label: "Motion", disabled: true },
      { path: "/lab/accessibility", label: "Accessibility", disabled: true },
    ]
  },
  {
    title: "COMPONENTS",
    items: [
      { path: "/lab/interactive", label: "Interactive", disabled: false },
      { path: "/lab/overlay", label: "Overlay System & Dialog", disabled: false },
      { path: "/lab/cards", label: "Card Ecosystem", disabled: false },
      { path: "/lab/navigation", label: "Navigation Platform", disabled: false },
      { path: "/lab/feedback", label: "Feedback (Frozen)", disabled: true },
      { path: "/lab/forms", label: "Forms (Frozen)", disabled: true },
      { path: "/lab/data-display", label: "Data Display (Frozen)", disabled: true },
    ]
  },
  {
    title: "PATTERNS & TEMPLATES",
    items: [
      { path: "/lab/patterns", label: "Pattern Library Suite", disabled: false },
      { path: "/lab/templates", label: "Template Library Suite", disabled: false },
      { path: "/lab/editorial", label: "Editorial Story", disabled: true },
      { path: "/lab/portfolio-patterns", label: "Portfolio Grid", disabled: true },
    ]
  },
  {
    title: "RESOURCES",
    items: [
      { path: "/lab/icons", label: "Icons", disabled: true },
      { path: "/lab/illustrations", label: "Illustrations", disabled: true },
      { path: "/lab/content", label: "Content Rules", disabled: true },
      { path: "/lab/changelog", label: "Changelog", disabled: true },
    ]
  }
]

export default function LabLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const NavLinks = () => (
    <Stack direction="col" gap="lg">
      {navGroups.map((group) => (
        <Stack key={group.title} direction="col" gap="sm">
          <Text size="micro" className="text-content-secondary mb-1">{group.title}</Text>
          <Stack direction="col" gap="xs">
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.disabled ? "#" : item.path}
                className={({ isActive }) => cn(
                  "block py-1.5 text-sm font-medium transition-colors",
                  item.disabled 
                    ? "text-content-secondary opacity-40 cursor-not-allowed" 
                    : isActive 
                      ? "text-copper font-bold" 
                      : "text-content-secondary hover:text-content-primary"
                )}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault()
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )

  const ComponentStatus = () => (
    <Stack direction="col" gap="md">
      <Text size="micro" className="text-content-secondary">LIFECYCLE STATUS</Text>
      <div className="grid grid-cols-2 gap-y-3 text-sm">
        <Text size="caption" variant="secondary">Heading</Text><Text size="caption" className="text-emerald-500">🟢 Stable · ✓</Text>
        <Text size="caption" variant="secondary">Surface</Text><Text size="caption" className="text-emerald-500">🟢 Stable · ✓</Text>
        <Text size="caption" variant="secondary">Button</Text><Text size="caption" className="text-emerald-500">🟢 Stable · ✓</Text>
        <Text size="caption" variant="secondary">Input</Text><Text size="caption" className="text-emerald-500">🟢 Stable · ✓</Text>
        <Text size="caption" variant="secondary">Overlay Platform</Text><Text size="caption" className="text-emerald-500">🟢 Infra · ✓</Text>
        <Text size="caption" variant="secondary">Dialog</Text><Text size="caption" className="text-emerald-500">🟢 Stable · ✓</Text>
        <Text size="caption" variant="secondary">Card Ecosystem</Text><Text size="caption" className="text-emerald-500">🟢 Stable · ✓</Text>
        <Text size="caption" variant="secondary">Navigation Platform</Text><Text size="caption" className="text-emerald-500">🟢 Stable · ✓</Text>
        <Text size="caption" variant="secondary">Drawer</Text><Text size="caption" className="text-gray-400">⚪ Planned</Text>
      </div>
    </Stack>
  )

  return (
    <div className="flex h-screen w-full bg-canvas-primary pt-16 overflow-hidden">
      
      {/* Mobile Top Nav & Drawer */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-surface-card border-b border-subtle px-4 py-3 flex items-center justify-between shadow-sm">
        <Heading size="heading-md" className="m-0">CrossAngle UI Platform</Heading>
        <IconButton 
          icon={mobileMenuOpen ? <X size={20} /> : <Menu size={20} />} 
          intent="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[120px] z-30 bg-surface-card overflow-y-auto p-6 border-t border-subtle">
          <Stack direction="col" gap="xl">
            <Stack direction="col" gap="md">
              <Text size="micro">Navigation</Text>
              <NavLinks />
            </Stack>
            <Divider />
            <ComponentStatus />
          </Stack>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 flex-col border-r border-subtle bg-canvas-secondary p-8 overflow-y-auto">
        <Heading size="heading-md" className="mb-8">CrossAngle UI Platform</Heading>
        <Stack direction="col" gap="xl">
          <Stack direction="col" gap="md">
            <Text size="micro">Overview</Text>
            <NavLinks />
          </Stack>
          <Divider />
          <ComponentStatus />
        </Stack>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-canvas-primary lg:pt-0 pt-16">
        <Outlet />
      </main>

    </div>
  )
}
