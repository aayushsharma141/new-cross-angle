import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/foundation/Container"

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "solid" | "transparent" | "glass"
  sticky?: boolean
  logo?: React.ReactNode
  actions?: React.ReactNode
}

/**
 * Navbar (Layer C - Navigation Platform)
 * 
 * Global header navigation container supporting solid, transparent, and glassmorphic
 * luxury styling, sticky positioning, and adaptive background opacity.
 */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, variant = "glass", sticky = true, logo, actions, children, ...props }, ref) => {
    const [scrolled, setScrolled] = React.useState(false)

    React.useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20)
      }
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const variantStyles = {
      solid: "bg-surface-card border-b border-subtle text-content-primary shadow-sm",
      transparent: scrolled
        ? "bg-surface-card/90 border-b border-subtle text-content-primary backdrop-blur-md shadow-sm"
        : "bg-transparent text-content-primary",
      glass: scrolled
        ? "bg-canvas-primary/80 border-b border-subtle text-content-primary backdrop-blur-xl shadow-lg"
        : "bg-canvas-primary/40 border-b border-subtle/50 text-content-primary backdrop-blur-md",
    }

    return (
      <header
        ref={ref}
        className={cn(
          "w-full transition-all duration-300 z-40 top-0 left-0 right-0",
          sticky ? "sticky" : "relative",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Container size="standard">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6">
            {logo && <div className="flex items-center gap-3">{logo}</div>}
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              {children}
            </nav>

            {actions && <div className="flex items-center gap-4">{actions}</div>}
          </div>
        </Container>
      </header>
    )
  }
)
Navbar.displayName = "Navbar"
