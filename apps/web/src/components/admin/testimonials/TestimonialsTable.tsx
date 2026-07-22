import { Star, Pencil, Trash2, CheckSquare, X, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/enhanced/image";
import { Button } from "@/components/ui/primitives/button";
import { Badge } from "@/components/primitives/interactive";
import { Checkbox } from "@/components/primitives/interactive";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/components/Table";

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  avatar_url: string | null;
  content: string;
  rating: number | null;
  display_order: number | null;
  active: boolean | null;
  project_id: string | null;
  city: string | null;
}

interface TestimonialsTableProps {
  testimonials: Testimonial[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
  isReadOnly: boolean;
  canWrite: boolean;
}

const renderStars = (rating: number) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={cn("w-3 h-3", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-[hsl(var(--admin-muted))]")} />
    ))}
  </div>
);

export const TestimonialsTable = ({ testimonials, selectedIds, onToggleSelect, onToggleSelectAll, onEdit, onDelete, isReadOnly, canWrite }: TestimonialsTableProps) => (
  <div className="bg-[hsl(var(--admin-surface))]/50 border border-[hsl(var(--admin-border))] rounded-xl overflow-hidden shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface))]">
          <TableHead className="w-10">
            <Checkbox checked={selectedIds.size === testimonials.length && testimonials.length > 0} onCheckedChange={onToggleSelectAll} className="border-[hsl(var(--admin-border))] data-[state=checked]:bg-[hsl(var(--admin-primary))] data-[state=checked]:text-black" />
          </TableHead>
          <TableHead className="text-[hsl(var(--admin-text-muted))]">Author</TableHead>
          <TableHead className="text-[hsl(var(--admin-text-muted))]">Rating</TableHead>
          <TableHead className="text-[hsl(var(--admin-text-muted))]">Preview</TableHead>
          <TableHead className="text-[hsl(var(--admin-text-muted))]">Status</TableHead>
          {!isReadOnly && <TableHead className="text-right text-[hsl(var(--admin-text-muted))]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {testimonials.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-[hsl(var(--admin-muted))]">
              No testimonials found. {canWrite && "Create your first testimonial to get started."}
            </TableCell>
          </TableRow>
        ) : (
          testimonials.map((t) => (
            <TableRow key={t.id} className="border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--admin-surface))]/50">
              <TableCell>
                <Checkbox checked={selectedIds.has(t.id)} onCheckedChange={() => onToggleSelect(t.id)} className="border-[hsl(var(--admin-border))] data-[state=checked]:bg-[hsl(var(--admin-primary))] data-[state=checked]:text-black" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <Image src={t.avatar_url} alt={t.author_name} width={96} quality={76} imageClassName="w-10 h-10 rounded-full object-cover border border-[hsl(var(--admin-border))]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center text-[hsl(var(--admin-text-muted))] font-medium">{t.author_name.charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    <p className="font-medium text-[hsl(var(--admin-text))]">{t.author_name}</p>
                    <p className="text-xs text-[hsl(var(--admin-muted))]">{t.author_role || "Client"}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{renderStars(t.rating || 5)}</TableCell>
              <TableCell><p className="text-sm text-[hsl(var(--admin-text-muted))] max-w-xs truncate">{t.content}</p></TableCell>
              <TableCell>
                <Badge className={cn("capitalize text-xs font-medium border", t.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-muted))] border-[hsl(var(--admin-border))]")}>{t.active ? "Active" : "Hidden"}</Badge>
              </TableCell>
              {!isReadOnly && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]" aria-label="More options"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] shadow-xl" align="end">
                      <DropdownMenuItem onClick={() => onEdit(t)} className="hover:bg-[hsl(var(--admin-background))] focus:bg-[hsl(var(--admin-background))] cursor-pointer"><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleSelect(t.id)} className="hover:bg-[hsl(var(--admin-background))] focus:bg-[hsl(var(--admin-background))] cursor-pointer">
                        {selectedIds.has(t.id) ? <X className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                        {selectedIds.has(t.id) ? "Deselect" : "Select"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[hsl(var(--admin-border))]" />
                      <DropdownMenuItem onClick={() => onDelete(t.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);
