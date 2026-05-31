import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import { Switch } from "@/components/ui/primitives/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/primitives/dialog";

export interface TestimonialFormData {
  author_name: string;
  author_role: string;
  content: string;
  rating: number;
  avatar_url: string;
  active: boolean;
  city: string;
}

interface TestimonialFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: TestimonialFormData;
  onChange: (data: TestimonialFormData) => void;
  onSave: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

export const TestimonialFormDialog = ({ open, onClose, formData, onChange, onSave, isSaving, isEditing }: TestimonialFormDialogProps) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="bg-admin-card border-admin-border text-admin-text max-w-lg max-h-[90vh] flex flex-col overflow-hidden sm:rounded-2xl shadow-2xl">
      <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--admin-border))]">
        <DialogTitle className="text-xl font-serif">{isEditing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
        <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
          {isEditing ? "Update the testimonial details below." : "Add a new client testimonial to showcase on your website."}
        </DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 custom-scrollbar">
        <div className="space-y-2">
          <Label htmlFor="author_name" className="text-[hsl(var(--admin-text-muted))]">Author Name *</Label>
          <Input id="author_name" value={formData.author_name} onChange={(e) => onChange({ ...formData, author_name: e.target.value })} className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))]" placeholder="John Doe" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="author_role" className="text-[hsl(var(--admin-text-muted))]">Role / Title</Label>
            <Input id="author_role" value={formData.author_role} onChange={(e) => onChange({ ...formData, author_role: e.target.value })} className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))]" placeholder="CEO, Homeowner" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-[hsl(var(--admin-text-muted))]">Rating</Label>
            <div className="flex items-center gap-2 h-10 px-3 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-md">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" aria-label={`Rate ${star} stars`} title={`Rate ${star} stars`} onClick={() => onChange({ ...formData, rating: star })} className="transition-transform active:scale-95 hover:scale-110">
                  <Star className={cn("w-5 h-5 transition-colors", star <= formData.rating ? "fill-yellow-500 text-yellow-500" : "text-[hsl(var(--admin-border))] hover:text-[hsl(var(--admin-muted))]")} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content" className="text-[hsl(var(--admin-text-muted))]">Testimonial Content *</Label>
          <Textarea id="content" value={formData.content} onChange={(e) => onChange({ ...formData, content: e.target.value })} className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))] min-h-[120px] resize-none" placeholder="Enter the testimonial text..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar_url" className="text-[hsl(var(--admin-text-muted))]">Avatar Image URL</Label>
          <Input id="avatar_url" value={formData.avatar_url} onChange={(e) => onChange({ ...formData, avatar_url: e.target.value })} className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))]" placeholder="https://example.com/avatar.jpg" />
        </div>
        <div className="flex items-center gap-3 p-4 bg-[hsl(var(--admin-surface))]/50 border border-[hsl(var(--admin-border))]/50 rounded-xl">
          <Switch id="active" checked={formData.active} onCheckedChange={(checked) => onChange({ ...formData, active: checked })} className="data-[state=checked]:bg-[hsl(var(--admin-primary))]" />
          <Label htmlFor="active" className="cursor-pointer font-medium text-[hsl(var(--admin-text))]">{formData.active ? "Visible on website" : "Hidden from website"}</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-[hsl(var(--admin-text-muted))]">City / Location</Label>
          <Input id="city" value={formData.city} onChange={(e) => onChange({ ...formData, city: e.target.value })} className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))]" placeholder="e.g. Jamshedpur" />
        </div>
      </div>
      <DialogFooter className="shrink-0 px-6 py-4 border-t border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]/30 gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface))] hover:text-[hsl(var(--admin-text))]">Cancel</Button>
        <Button onClick={onSave} disabled={isSaving} className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/90] text-black font-semibold">
          {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : isEditing ? "Update Testimonial" : "Create Testimonial"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
