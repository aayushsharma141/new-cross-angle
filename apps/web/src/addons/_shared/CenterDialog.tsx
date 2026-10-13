import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Centered pop-up for the tool surfaces (estimator, discovery quiz).
 *
 * Why the extra flex wrapper: centering with `left-1/2 top-1/2 -translate-*`
 * on the animated element breaks the open animation, because the `zoom-in`
 * keyframes rewrite `transform` and drop the translate for the duration. The
 * panel then flies in from the corner and snaps to centre. Centring the
 * wrapper instead leaves the panel's own transform free, so it scales and
 * fades from its exact centre.
 *
 * It renders in a portal, outside the light "workspace" scope, so colours are
 * explicit light values rather than theme tokens.
 */

interface CenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CenterDialog({ open, onOpenChange, title, description, children, className }: CenterDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#1a1a1a]/40 backdrop-blur-[2px] duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
        <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4">
          <Dialog.Content
            className={cn(
              "pointer-events-auto relative flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl border border-[#e8e4dd] bg-white p-6 text-[#1a1a1a] shadow-2xl focus:outline-none",
              "duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none",
              className,
            )}
          >
            <Dialog.Title className="pr-8 font-serif text-2xl font-light">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-1 text-[13px] text-[#5a5a5a]">{description}</Dialog.Description>
            ) : (
              <Dialog.Description className="sr-only">{title}</Dialog.Description>
            )}
            <div className="mt-5 min-h-0 flex-1 overflow-y-auto">{children}</div>
            <Dialog.Close
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-[#5a5a5a] transition-colors hover:bg-[#faf8f5] hover:text-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
