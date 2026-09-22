import * as React from "react"
import { createPortal } from "react-dom"

export interface PortalProps {
  /** The content to render into the portal */
  children: React.ReactNode
  /** An optional container element. Defaults to document.body */
  container?: HTMLElement | null
}

/**
 * Portal
 * 
 * A primitive component that renders children into a DOM node that exists outside 
 * the DOM hierarchy of the parent component. Essential for modals, popovers, and tooltips
 * to avoid z-index and overflow clipping issues.
 */
export const Portal = ({ children, container }: PortalProps) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  const target = container || document.body

  return createPortal(children, target)
}
