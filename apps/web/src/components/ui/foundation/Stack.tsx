import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const stackVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        col: "flex-col",
        row: "flex-row",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
      },
      wrap: {
        true: "flex-wrap",
        false: "flex-nowrap",
      },
      gap: {
        none: "gap-0",
        xs: "gap-[var(--spacing-xs)]",
        sm: "gap-[var(--spacing-sm)]",
        md: "gap-[var(--spacing-md)]",
        lg: "gap-[var(--spacing-lg)]",
        xl: "gap-[var(--spacing-xl)]",
        "2xl": "gap-[var(--spacing-2xl)]",
        "3xl": "gap-[var(--spacing-3xl)]",
        section: "gap-[var(--spacing-section-mobile)] md:gap-[var(--spacing-section-desktop)]",
      }
    },
    defaultVariants: {
      direction: "col",
      align: "stretch",
      justify: "start",
      wrap: false,
      gap: "none",
    },
  }
)

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: React.ElementType
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, align, justify, wrap, gap, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(stackVariants({ direction, align, justify, wrap, gap, className }))}
        {...props}
      />
    )
  }
)
Stack.displayName = "Stack"

export { Stack, stackVariants }
