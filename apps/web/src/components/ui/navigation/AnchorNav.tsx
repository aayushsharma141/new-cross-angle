import * as React from "react"
import { cn } from "@/lib/utils"

export interface AnchorItem {
  id: string
  label: string
}

export interface AnchorNavProps {
  items: AnchorItem[]
  activeId?: string
  onSelect?: (id: string) => void
  className?: string
}

/**
 * AnchorNav (Layer C - Navigation Platform)
 * 
 * Sticky section indicator for long editorial pages and system specs.
 */
export function AnchorNav({ items, activeId, onSelect, className }: AnchorNavProps) {
  return (
    <nav className={cn("space-y-1 font-mono text-xs border-l border-subtle pl-4", className)}>
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "block w-full text-left py-1 transition-colors relative",
              isActive
                ? "text-copper font-semibold before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-4 before:bg-copper"
                : "text-content-secondary hover:text-content-primary"
            )}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
