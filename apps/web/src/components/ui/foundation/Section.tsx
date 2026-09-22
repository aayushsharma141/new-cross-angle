import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sectionVariants = cva(
  "w-full",
  {
    variants: {
      spacing: {
        default: "py-[var(--spacing-section-mobile)] md:py-[var(--spacing-section-desktop)]",
        none: "py-0",
        tight: "py-8 md:py-12",
        loose: "py-24 md:py-32",
      },
    },
    defaultVariants: {
      spacing: "default",
    },
  }
)

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: React.ElementType
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, as: Component = "section", ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(sectionVariants({ spacing, className }))}
        {...props}
      />
    )
  }
)
Section.displayName = "Section"

export { Section, sectionVariants }
