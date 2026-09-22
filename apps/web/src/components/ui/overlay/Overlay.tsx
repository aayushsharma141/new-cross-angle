import * as React from "react"
import { cn } from "@/lib/utils"

export interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** If true, the overlay is visible */
  isOpen: boolean
  /** Callback fired when the overlay backdrop is clicked */
  onClose?: () => void
  /** Whether the overlay backdrop should be blurred (default: true) */
  blur?: boolean
  /** Whether the overlay backdrop should have a dark tint (default: true) */
  tint?: boolean
}

/**
 * Overlay
 * 
 * The visual backdrop for floating elements (modals, drawers, etc).
 * Handles the semi-transparent background, blur effects, and backdrop click to close.
 */
export const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  ({ className, isOpen, onClose, blur = true, tint = true, children, ...props }, ref) => {
    
    // We render null if not open. For complex exit animations, 
    // a library like Framer Motion's AnimatePresence is recommended.
    // Here we use simple CSS transition state.
    const [render, setRender] = React.useState(isOpen)
    const [animate, setAnimate] = React.useState(false)

    React.useEffect(() => {
      if (isOpen) {
        setRender(true)
        // Small delay to ensure the element is in the DOM before animating opacity
        requestAnimationFrame(() => {
          setAnimate(true)
        })
      } else {
        setAnimate(false)
        // Wait for CSS transition to finish before unmounting
        const timeout = setTimeout(() => {
          setRender(false)
        }, 300) // matches duration-300
        return () => clearTimeout(timeout)
      }
    }, [isOpen])

    if (!render) return null

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && onClose) {
        onClose()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-all duration-300 ease-out",
          blur ? "backdrop-blur-sm" : "",
          tint ? "bg-black/40" : "",
          animate ? "opacity-100" : "opacity-0 pointer-events-none",
          className
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
        {...props}
      >
        {children}
      </div>
    )
  }
)

Overlay.displayName = "Overlay"
