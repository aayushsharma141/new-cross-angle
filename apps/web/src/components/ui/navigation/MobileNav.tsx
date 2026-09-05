import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/overlay"

export interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

/**
 * MobileNav (Layer C - Navigation Platform)
 * 
 * Mobile sheet drawer navigation wrapper.
 */
export function MobileNav({ isOpen, onClose, children, title = "Navigation" }: MobileNavProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} variant="sheet">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4 py-6">
          {children}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
