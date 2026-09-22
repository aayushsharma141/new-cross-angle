import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "./Button"

export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  icon: React.ReactNode
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn("aspect-square p-0", className)}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
