import * as React from "react"

/**
 * useScrollLock
 * 
 * Prevents scrolling on the body element when a modal or overlay is open.
 * Accounts for scrollbar width to prevent layout shift when the scrollbar is hidden.
 */
export function useScrollLock(lock: boolean) {
  React.useEffect(() => {
    if (!lock) return

    // Calculate scrollbar width to prevent layout shift
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    
    // Save original styles
    const originalStyle = window.getComputedStyle(document.body).overflow
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight

    // Apply lock styles
    document.body.style.overflow = "hidden"
    
    // Only add padding if there was actually a scrollbar
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `calc(${originalPaddingRight} + ${scrollBarWidth}px)`
    }

    return () => {
      // Restore original styles
      document.body.style.overflow = originalStyle
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [lock])
}
