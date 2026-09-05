import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb (Layer C - Navigation Platform)
 * 
 * Location hierarchy trail with ARIA compliance.
 */
export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs font-mono", className)} {...props}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && <ChevronRight size={12} className="text-content-secondary opacity-40" />}
              {isLast || !item.href ? (
                <span className="text-copper font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="text-content-secondary hover:text-content-primary transition-colors">
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
