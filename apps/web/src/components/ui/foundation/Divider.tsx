import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dividerVariants = cva(
  "shrink-0 bg-subtle",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  decorative?: boolean
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(dividerVariants({ orientation, className }))}
        {...props}
      />
    )
  }
)
Divider.displayName = "Divider"

export { Divider, dividerVariants }
