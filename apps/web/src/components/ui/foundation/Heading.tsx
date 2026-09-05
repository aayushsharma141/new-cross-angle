import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva(
  "text-content-primary",
  {
    variants: {
      family: {
        sans: "font-sans font-medium",
        serif: "font-display font-medium",
      },
      size: {
        "hero": "text-hero leading-tightest tracking-tighter",
        "display-xl": "text-display-xl leading-tightest tracking-tighter",
        "display-lg": "text-display-lg leading-tightest tracking-tighter",
        "display-md": "text-display-md leading-tighter tracking-tight",
        "heading-xl": "text-heading-xl leading-tighter tracking-tight",
        "heading-lg": "text-heading-lg leading-tight tracking-normal",
        "heading-md": "text-heading-md leading-tight tracking-normal",
        "body-lg": "text-body-lg leading-relaxed tracking-normal",
        "body": "text-body leading-relaxed tracking-normal",
        "caption": "text-caption leading-relaxed tracking-wide",
        "micro": "text-micro leading-relaxed tracking-widest uppercase font-bold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }
    },
    defaultVariants: {
      family: "sans",
      size: "heading-xl",
      align: "left",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, family, size, align, as: Component = "h2", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ family, size, align, className }))}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

export { Heading, headingVariants }
