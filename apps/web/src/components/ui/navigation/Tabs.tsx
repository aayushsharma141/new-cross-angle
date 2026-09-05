import * as React from "react"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: string
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: "line" | "pill"
  className?: string
}

/**
 * Tabs (Layer C - Navigation Platform)
 * 
 * Accessible, keyboard-navigable view switching tab bar.
 */
export function Tabs({ tabs, activeTab, onChange, variant = "line", className }: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      const next = (index + 1) % tabs.length
      if (!tabs[next].disabled) onChange(tabs[next].id)
    } else if (e.key === "ArrowLeft") {
      const prev = (index - 1 + tabs.length) % tabs.length
      if (!tabs[prev].disabled) onChange(tabs[prev].id)
    }
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "flex items-center space-x-1",
        variant === "line" ? "border-b border-subtle" : "bg-canvas-secondary p-1 rounded-xl border border-subtle",
        className
      )}
    >
      {tabs.map((tab, i) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-copper",
              tab.disabled ? "opacity-40 cursor-not-allowed text-content-secondary" : "",
              variant === "line"
                ? isActive
                  ? "text-copper border-b-2 border-copper font-semibold"
                  : "text-content-secondary hover:text-content-primary border-b-2 border-transparent"
                : isActive
                  ? "bg-surface-card text-content-primary shadow-sm rounded-lg font-semibold"
                  : "text-content-secondary hover:text-content-primary"
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
