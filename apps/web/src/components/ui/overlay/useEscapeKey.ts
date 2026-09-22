import * as React from "react"

/**
 * useEscapeKey
 * 
 * Triggers a callback when the Escape key is pressed.
 * Essential for accessibility (closing modals, dropdowns, etc.)
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  React.useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        onEscape()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onEscape, enabled])
}
