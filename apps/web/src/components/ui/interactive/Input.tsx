import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-surface-card px-3 py-2 text-sm text-content-primary ring-offset-canvas-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-micro ease-physical",
  {
    variants: {
      state: {
        default: "border-subtle",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
      }
    },
    defaultVariants: {
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /**
   * Renders a bound <label> above the field. Omit it for a bare input —
   * existing call sites that pass no label are unaffected.
   */
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, type, label, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? (label ? generatedId : undefined)

    const input = (
      <input
        type={type}
        id={inputId}
        className={cn(inputVariants({ state, className }))}
        ref={ref}
        {...props}
      />
    )

    if (!label) return input

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-caption text-content-secondary font-medium"
        >
          {label}
        </label>
        {input}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
