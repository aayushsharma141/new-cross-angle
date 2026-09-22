import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/interactive/Button"
import { cn } from "@/lib/utils"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Pagination (Layer C - Navigation Platform)
 * 
 * Page navigation controls.
 */
export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Pagination" className={cn("flex items-center space-x-2 font-mono text-sm", className)}>
      <Button
        intent="ghost"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </Button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            "w-9 h-9 rounded-lg transition-colors flex items-center justify-center font-medium",
            p === currentPage
              ? "bg-copper text-white shadow-sm"
              : "text-content-secondary hover:text-content-primary hover:bg-canvas-secondary"
          )}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <Button
        intent="ghost"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </Button>
    </nav>
  )
}
