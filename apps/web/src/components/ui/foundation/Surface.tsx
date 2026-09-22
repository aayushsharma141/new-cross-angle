import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const surfaceVariants = cva(
  "transition-all duration-macro ease-physical",
  {
    variants: {
      elevation: {
        flat: "",
        level1: "shadow-surface",
        level2: "shadow-surface-lg",
        overlay: "shadow-glass backdrop-blur-md",
        modal: "shadow-elevated z-modal",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
      },
      background: {
        card: "bg-surface-card",
        canvasPrimary: "bg-canvas-primary",
        canvasSecondary: "bg-canvas-secondary",
        transparent: "bg-transparent",
      },
      border: {
        true: "border border-subtle",
        false: "border-transparent",
      }
    },
    defaultVariants: {
      elevation: "flat",
      radius: "md",
      background: "card",
      border: true,
    },
  }
)

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  as?: React.ElementType
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, elevation, radius, background, border, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(surfaceVariants({ elevation, radius, background, border, className }))}
        {...props}
      />
    )
  }
)
Surface.displayName = "Surface"

export { Surface, surfaceVariants }
