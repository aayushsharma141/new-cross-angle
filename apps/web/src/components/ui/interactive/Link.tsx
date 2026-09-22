import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const linkVariants = cva(
  "inline-flex items-center font-sans transition-colors duration-micro ease-physical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper",
  {
    variants: {
      color: {
        primary: "text-content-primary hover:text-copper",
        secondary: "text-content-secondary hover:text-content-primary",
        copper: "text-copper hover:text-gold",
      },
      underline: {
        hover: "hover:underline underline-offset-4",
        always: "underline underline-offset-4",
        none: "no-underline",
      },
    },
    defaultVariants: {
      color: "primary",
      underline: "hover",
    },
  }
)

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">,
    VariantProps<typeof linkVariants> {
  as?: React.ElementType
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, color, underline, as: Component = "a", ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(linkVariants({ color, underline, className }))}
        {...props}
      />
    )
  }
)
Link.displayName = "Link"

export { Link, linkVariants }
