import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/primitives/dialog";

interface TestimonialDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const TestimonialDeleteDialog = ({ open, onOpenChange, onConfirm }: TestimonialDeleteDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] sm:rounded-2xl shadow-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-serif text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Delete Testimonial
        </DialogTitle>
        <DialogDescription className="text-[hsl(var(--admin-text-muted))] pt-2">
          Are you sure you want to delete this testimonial? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-6 gap-3">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface))] hover:text-[hsl(var(--admin-text))]">Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 font-semibold">Yes, delete it</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
