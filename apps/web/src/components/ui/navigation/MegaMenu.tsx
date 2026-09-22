import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal } from "@/components/ui/overlay/Portal"
import { Overlay } from "@/components/ui/overlay/Overlay"

export interface MegaMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

/**
 * MegaMenu (Layer C - Navigation Platform)
 * 
 * Rich dropdown panel for interior portfolio categories, services, and featured projects.
 */
export const MegaMenu = React.forwardRef<HTMLDivElement, MegaMenuProps>(
  ({ className, isOpen, onClose, children, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <Portal>
        <Overlay isOpen={isOpen} onClose={onClose} tint blur className="items-start pt-24">
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Mega menu"
            tabIndex={-1}
            className={cn(
              "w-full max-w-5xl bg-surface-card border border-subtle shadow-2xl rounded-2xl p-8 animate-in fade-in-0 slide-in-from-top-4 duration-200 text-content-primary",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </Overlay>
      </Portal>
    )
  }
)
MegaMenu.displayName = "MegaMenu"
