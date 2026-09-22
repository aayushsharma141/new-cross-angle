import * as React from "react"
import { Surface, SurfaceProps } from "@/components/ui/foundation/Surface"
import { cn } from "@/lib/utils"

export interface PanelProps extends SurfaceProps {
  bordered?: boolean
}

/**
 * Panel (Layer A - Structural Base)
 * 
 * Compact, structured container for sidebars, inspector tools, and auxiliary content.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, bordered = true, children, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        className={cn(
          "p-4 rounded-lg bg-surface-card",
          bordered ? "border border-subtle" : "",
          className
        )}
        {...props}
      >
        {children}
      </Surface>
    )
  }
)
Panel.displayName = "Panel"
