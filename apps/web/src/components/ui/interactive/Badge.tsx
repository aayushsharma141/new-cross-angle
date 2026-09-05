import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Text } from "@/components/ui/foundation/Text"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-copper focus:ring-offset-2",
  {
    variants: {
      tone: {
        neutral: "border-transparent bg-canvas-secondary text-content-primary hover:bg-surface-card",
        brand: "border-transparent bg-copper text-canvas-primary hover:bg-gold",
        success: "border-transparent bg-green-500/10 text-green-700 hover:bg-green-500/20",
        warning: "border-transparent bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
        critical: "border-transparent bg-red-500/10 text-red-700 hover:bg-red-500/20",
        outline: "text-content-primary border-subtle",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ tone }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
