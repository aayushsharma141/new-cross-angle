import { Star, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/enhanced/image";
import { Card } from "@/components/ui/primitives/card";
import { Button } from "@/components/ui/primitives/button";
import { Badge } from "@/components/ui/primitives/badge";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import type { Testimonial } from "./TestimonialsTable";

interface TestimonialsGridProps {
  testimonials: Testimonial[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
  canWrite: boolean;
}

export const TestimonialsGrid = ({ testimonials, selectedIds, onToggleSelect, onEdit, onDelete, canWrite }: TestimonialsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
    {testimonials.map((t) => (
      <Card key={t.id} className={cn(
        "bg-[hsl(var(--admin-surface))]/50 border-[hsl(var(--admin-border))] overflow-hidden hover:border-[hsl(var(--admin-border-strong))] transition-all duration-300 hover:shadow-lg group",
        selectedIds.has(t.id) && "ring-2 ring-[hsl(var(--admin-primary))] border-transparent"
      )}>
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {t.avatar_url ? (
                <Image src={t.avatar_url} alt={t.author_name} width={120} quality={76} imageClassName="w-12 h-12 rounded-full object-cover border border-[hsl(var(--admin-border))]" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--admin-background))] border border-[hsl(var(--admin-border))] flex items-center justify-center text-[hsl(var(--admin-muted))] font-medium text-lg">{t.author_name.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <p className="font-medium text-[hsl(var(--admin-text))]">{t.author_name}</p>
                <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5">{t.author_role || "Client"}</p>
              </div>
            </div>
            {canWrite && (
              <Checkbox checked={selectedIds.has(t.id)} onCheckedChange={() => onToggleSelect(t.id)} className="border-[hsl(var(--admin-border))] data-[state=checked]:bg-[hsl(var(--admin-primary))] data-[state=checked]:text-black mt-1" />
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={cn("w-4 h-4", star <= (t.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-[hsl(var(--admin-muted))]")} />
            ))}
          </div>
          <p className="text-sm text-[hsl(var(--admin-text-muted))] leading-relaxed line-clamp-4 relative z-10 group-hover:text-[hsl(var(--admin-text))] transition-colors">"{t.content}"</p>
          <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--admin-border))]/50 mt-auto">
            <Badge className={cn("capitalize text-xs font-medium border", t.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-muted))] border-[hsl(var(--admin-border))]")}>{t.active ? "Active" : "Hidden"}</Badge>
            {canWrite && (
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-8 w-8 text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface))]" aria-label="Edit testimonial"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} className="h-8 w-8 text-[hsl(var(--admin-muted))] hover:text-red-400 hover:bg-red-500/10" aria-label="Delete testimonial"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    ))}
  </div>
);
