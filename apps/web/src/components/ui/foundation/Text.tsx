import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva(
  "",
  {
    variants: {
      family: {
        sans: "font-sans",
        serif: "font-display",
      },
      size: {
        "body-lg": "text-body-lg leading-relaxed",
        "body": "text-body leading-relaxed",
        "caption": "text-caption leading-relaxed",
        "micro": "text-micro leading-relaxed tracking-wide uppercase font-bold",
      },
      variant: {
        primary: "text-content-primary",
        secondary: "text-content-secondary",
        copper: "text-copper",
        gold: "text-gold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }
    },
    defaultVariants: {
      family: "sans",
      size: "body",
      variant: "primary",
      align: "left",
    },
  }
)

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label"
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, family, size, variant, align, as: Component = "p", ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(textVariants({ family, size, variant, align, className }))}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Text, textVariants }
