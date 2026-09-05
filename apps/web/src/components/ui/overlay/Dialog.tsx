import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Portal } from "./Portal"
import { Overlay } from "./Overlay"
import { FocusTrap } from "./FocusTrap"
import { useScrollLock } from "./useScrollLock"
import { useEscapeKey } from "./useEscapeKey"
import { overlayManager } from "./OverlayManager"

import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { IconButton } from "@/components/ui/interactive/IconButton"

export type DialogVariant = "default" | "alert" | "sheet" | "fullscreen" | "confirmation" | "gallery"

interface DialogContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  variant: DialogVariant
  dialogId: string
  titleId: string
  descriptionId: string
  triggerRef: React.MutableRefObject<HTMLElement | null>
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog compound components must be rendered within a <Dialog> root component.")
  }
  return context
}

export interface DialogProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: DialogVariant
}

export function Dialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  variant = "default",
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(open)
      }
      onOpenChange?.(open)
    },
    [isControlled, onOpenChange]
  )

  const dialogId = React.useId()
  const titleId = `${dialogId}-title`
  const descriptionId = `${dialogId}-description`
  const triggerRef = React.useRef<HTMLElement | null>(null)

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        variant,
        dialogId,
        titleId,
        descriptionId,
        triggerRef,
      }}
    >
      {children}
    </DialogContext.Provider>
  )
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { setIsOpen, triggerRef } = useDialogContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerRef.current = e.currentTarget
      onClick?.(e)
      setIsOpen(true)
    }

    return (
      <button
        ref={(node) => {
          triggerRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DialogTrigger.displayName = "DialogTrigger"

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showCloseButton = true, ...props }, ref) => {
    const { isOpen, setIsOpen, variant, dialogId, titleId, descriptionId, triggerRef } = useDialogContext()

    // Register with global OverlayManager for stack & z-index
    const [zIndex, setZIndex] = React.useState(50)

    React.useEffect(() => {
      if (!isOpen) return

      const unregister = overlayManager.register({
        id: dialogId,
        onClose: () => setIsOpen(false),
        returnFocusElement: triggerRef.current,
      })

      setZIndex(overlayManager.getZIndex(dialogId))

      return () => {
        unregister()
      }
    }, [isOpen, dialogId, setIsOpen, triggerRef])

    useScrollLock(isOpen)
    useEscapeKey(() => setIsOpen(false), isOpen)

    if (!isOpen) return null

    // Variant style maps
    const variantStyles: Record<DialogVariant, string> = {
      default: "w-full max-w-lg bg-surface-card border border-subtle shadow-2xl rounded-xl p-6 transition-all duration-200 animate-in fade-in-0 zoom-in-95",
      alert: "w-full max-w-md bg-surface-card border border-red-500/30 shadow-2xl rounded-xl p-6 transition-all duration-200 animate-in fade-in-0 zoom-in-95",
      sheet: "fixed inset-y-0 right-0 h-full w-full max-w-md bg-surface-card border-l border-subtle shadow-2xl p-6 transition-all duration-300 animate-in slide-in-from-right-full",
      fullscreen: "fixed inset-0 h-full w-full bg-canvas-primary p-8 overflow-y-auto animate-in fade-in-0 zoom-in-95",
      confirmation: "w-full max-w-md bg-surface-card border border-copper/30 shadow-2xl rounded-xl p-6 text-center animate-in fade-in-0 zoom-in-95",
      gallery: "w-full max-w-4xl bg-stone-950 border border-stone-800 text-stone-100 shadow-2xl rounded-xl p-8 animate-in fade-in-0 zoom-in-95",
    }

    const isSheet = variant === "sheet"
    const isFullscreen = variant === "fullscreen"

    return (
      <Portal>
        <Overlay isOpen={isOpen} onClose={() => setIsOpen(false)} style={{ zIndex }}>
          <FocusTrap active={isOpen}>
            <div
              ref={ref}
              id={dialogId}
              role={variant === "alert" ? "alertdialog" : "dialog"}
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className={cn(
                "relative text-content-primary focus:outline-none",
                variantStyles[variant],
                className
              )}
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {showCloseButton && !isFullscreen && (
                <div className="absolute top-4 right-4 z-10">
                  <IconButton
                    icon={<X size={18} />}
                    intent="ghost"
                    size="icon"
                    aria-label="Close dialog"
                    onClick={() => setIsOpen(false)}
                  />
                </div>
              )}
              {children}
            </div>
          </FocusTrap>
        </Overlay>
      </Portal>
    )
  }
)
DialogContent.displayName = "DialogContent"

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 mb-4 text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    const { titleId } = useDialogContext()
    return (
      <Heading ref={ref} id={titleId} size="heading-md" className={cn("m-0", className)} {...props}>
        {children}
      </Heading>
    )
  }
)
DialogTitle.displayName = "DialogTitle"

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { descriptionId } = useDialogContext()
    return (
      <Text ref={ref} id={descriptionId} size="sm" variant="secondary" className={cn("mt-1", className)} {...props}>
        {children}
      </Text>
    )
  }
)
DialogDescription.displayName = "DialogDescription"

export const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("py-2 my-2 overflow-y-auto max-h-[60vh]", className)} {...props} />
)
DialogBody.displayName = "DialogBody"

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2 mt-6", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    const { setIsOpen } = useDialogContext()
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          onClick?.(e)
          setIsOpen(false)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DialogClose.displayName = "DialogClose"
