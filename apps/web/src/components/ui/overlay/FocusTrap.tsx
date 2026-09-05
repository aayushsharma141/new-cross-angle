import * as React from "react"

export interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
}

/**
 * FocusTrap
 * 
 * Traps keyboard focus within the provided children elements when active.
 * Essential for accessibility in modals, dialogs, and overlays.
 */
export const FocusTrap = ({ children, active = true }: FocusTrapProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!active) return
    
    const container = containerRef.current
    if (!container) return
    
    // Find all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    // Auto-focus first element
    setTimeout(() => {
      firstElement.focus()
    }, 0)
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    document.addEventListener('keydown', handleTabKey)
    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [active])
  
  return (
    <div ref={containerRef} style={{ outline: 'none' }} tabIndex={-1}>
      {children}
    </div>
  )
}
