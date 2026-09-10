import * as React from "react"
import { Surface, SurfaceProps } from "@/components/ui/foundation/Surface"
import { cn } from "@/lib/utils"

export interface CardProps extends SurfaceProps {
  /** Enables hover elevation and transition effects */
  interactive?: boolean
}

/**
 * Card (Layer A - Structural Base)
 * 
 * Inherits directly from Surface. Provides elevation, lighting environment compatibility,
 * and optional subtle hover scaling for interactive cards.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, elevation = "level1", children, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        elevation={elevation}
        className={cn(
          "rounded-xl transition-all duration-300",
          interactive ? "hover:-translate-y-1 hover:shadow-lg cursor-pointer" : "",
          className
        )}
        {...props}
      >
        {children}
      </Surface>
    )
  }
)
Card.displayName = "Card"
