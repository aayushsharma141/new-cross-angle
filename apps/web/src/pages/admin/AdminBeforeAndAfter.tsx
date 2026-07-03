import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, ArrowUp, ArrowDown, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Image } from "@/components/ui/enhanced/image";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import { Switch } from "@/components/ui/primitives/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/primitives/dialog";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives/badge";
import { Compare } from "@/components/ui/enhanced/compare";
import { MediaPicker as CanonicalMediaPicker } from "@/components/admin/media/MediaPicker";
import { AdminSafeAction } from "@/components/admin/shared";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Media Input Wrapper ──────────────────────────────────────────────────
function MediaInput({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL�"
          className="flex-1 text-xs"
        />
        <CanonicalMediaPicker
          onSelect={onChange}
          trigger={
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="w-3.5 h-3.5 mr-1" /> Pick
            </Button>
          }
        />
      </div>

      {value && (
        <div className="mt-2 relative group">
          <Image 
            src={value} 
            width={400} 
            quality={72} 
            alt={label} 
            imageClassName="h-20 w-full object-cover rounded-lg border" 
          />
          <button aria-label="Remove image" onClick={() => onChange("")} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}


// ─── Main Component ─────────────────────────────────────────────────────────

interface TransformationStory {
  id: string;
  title: string;
  location: string;
  before_media: string;
  after_media: string;
  challenge: string;
  design_moves: string[];
  products_used: { name: string; brand: string; spec: string }[];
  outcome_metric: string;
  testimonial_quote: string | null;
  testimonial_client_name: string | null;
  display_order: number;
  active: boolean;
}

interface FormData {
  title: string;
  location: string;
  before_media: string;
  after_media: string;
  challenge: string;
  design_moves: string;
  outcome_metric: string;
  testimonial_quote: string;
  testimonial_client_name: string;
  active: boolean;
}

const defaultForm: FormData = {
  title: "", location: "", before_media: "", after_media: "",
  challenge: "", design_moves: "", outcome_metric: "",
  testimonial_quote: "", testimonial_client_name: "", active: true,
};

export default function AdminBeforeAndAfter() {
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const { toast } = useToast();

  const { data: stories = [], isLoading: loading } = useQuery({
    queryKey: ['admin-before-after'],
    queryFn: async (): Promise<TransformationStory[]> => {
      const { data, error } = await supabase.from("transformation_stories").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []).map(d => ({ ...d, products_used: (d.products_used as { name: string; brand: string; spec: string }[]) ?? [] })) as TransformationStory[];
    }
  });

  const openCreate = () => { setEditingId(null); setForm(defaultForm); setDialogOpen(true); };

  const openEdit = (s: TransformationStory) => {
    setEditingId(s.id);
    setForm({
      title: s.title, location: s.location,
      before_media: s.before_media, after_media: s.after_media,
      challenge: s.challenge, design_moves: s.design_moves.join("\n"),
      outcome_metric: s.outcome_metric,
      testimonial_quote: s.testimonial_quote || "",
      testimonial_client_name: s.testimonial_client_name || "",
      active: s.active,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: Omit<TransformationStory, 'id' | 'display_order'>) => {
      let error;
      if (editingId) {
        ({ error } = await supabase.from("transformation_stories").update(payload).eq("id", editingId));
      } else {
        const maxOrder = stories.length > 0 ? Math.max(...stories.map(s => s.display_order)) + 1 : 0;
        ({ error } = await supabase.from("transformation_stories").insert({ ...payload, display_order: maxOrder }));
      }
      if (error) throw error;
      return payload;
    },
    onSuccess: () => {
      toast({ title: "Saved!" }); 
      setDialogOpen(false); 
      queryClient.invalidateQueries({ queryKey: ['admin-before-after'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSave = () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    
    const payload = {
      title: form.title.trim(), location: form.location.trim(),
      before_media: form.before_media.trim(), after_media: form.after_media.trim(),
      challenge: form.challenge.trim(),
      design_moves: form.design_moves.split("\n").filter(Boolean),
      outcome_metric: form.outcome_metric.trim(),
      testimonial_quote: form.testimonial_quote.trim() || null,
      testimonial_client_name: form.testimonial_client_name.trim() || null,
      active: form.active,
      products_used: [],
    };
    
    saveMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transformation_stories").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({ title: "Deleted" }); 
      queryClient.invalidateQueries({ queryKey: ['admin-before-after'] });
    }
  });

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
      const { error } = await supabase.from("transformation_stories").update({ active: !active }).eq("id", id);
      if (error) throw error;
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-before-after'] });
    }
  });

  const toggleActive = (id: string, active: boolean) => {
    toggleMutation.mutate({ id, active });
  };

  const moveMutation = useMutation({
    mutationFn: async ({ id, dir }: { id: string, dir: "up" | "down" }) => {
      const idx = stories.findIndex(s => s.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= stories.length) return;
      const { error: err1 } = await supabase.from("transformation_stories").update({ display_order: stories[swapIdx].display_order }).eq("id", stories[idx].id);
      if (err1) throw err1;
      const { error: err2 } = await supabase.from("transformation_stories").update({ display_order: stories[idx].display_order }).eq("id", stories[swapIdx].id);
      if (err2) throw err2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-before-after'] });
    }
  });

  const moveOrder = (id: string, dir: "up" | "down") => {
    moveMutation.mutate({ id, dir });
  };

  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    story.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className="space-y-4 fade-up-1">
      
      <ModuleActions>
        <div className="flex justify-end w-full">
          <Button onClick={openCreate} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add Transformation
          </Button>
        </div>
      </ModuleActions>

      <AdminFilterBar
        title="Transformations"
        icon={ImageIcon}
        badgeCount={stories.length > 0 ? `${stories.length} stories` : undefined}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-admin-border rounded-xl">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No transformation stories yet.</p>
          <Button onClick={openCreate} size="sm" className="mt-4"><Plus className="w-4 h-4 mr-2" /> Add First Story</Button>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-admin-border rounded-xl">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No stories found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStories.map((story, idx) => (
            <div key={story.id} className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 rounded-xl border", story.active ? "bg-admin-card border-admin-border" : "bg-admin-card/50 border-admin-border/50 opacity-60")}>
              <div className="flex gap-1 shrink-0">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted border border-admin-border">
                  {story.before_media ? (
                    <Image 
                      src={story.before_media} 
                      width={200} 
                      quality={70} 
                      alt="Before" 
                      imageClassName="w-full h-full object-cover" 
                    />
                  ) : <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">Before</div>}
                </div>
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted border border-admin-border">
                  {story.after_media ? (
                    <Image 
                      src={story.after_media} 
                      width={200} 
                      quality={70} 
                      alt="After" 
                      imageClassName="w-full h-full object-cover" 
                    />
                  ) : <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">After</div>}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{story.title}</h4>
                  {!story.before_media || !story.after_media ? <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Needs Images</Badge> : <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Ready</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{story.location} · {story.design_moves.length} design moves</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" aria-label="Move up" className="h-8 w-8" onClick={() => moveOrder(story.id, "up")} disabled={idx === 0}><ArrowUp className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" aria-label="Move down" className="h-8 w-8" onClick={() => moveOrder(story.id, "down")} disabled={idx === stories.length - 1}><ArrowDown className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" aria-label={story.active ? "Hide story" : "Show story"} className="h-8 w-8" onClick={() => toggleActive(story.id, story.active)}>{story.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</Button>
                <Button variant="ghost" size="icon" aria-label="Edit story" className="h-8 w-8" onClick={() => openEdit(story)}><Pencil className="w-3.5 h-3.5" /></Button>
                <AdminSafeAction
                    icon={Trash2}
                    label=""
                    confirmLabel="Delete?"
                    onConfirm={() => handleDelete(story.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create/Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-admin-card border-admin-border text-admin-text">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "New"} Transformation Story</DialogTitle>
            <DialogDescription>Manage the Before & After showcase on the homepage.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Left: Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Master Bedroom Makeover" /></div>
                <div><Label className="text-xs">Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="JAMSHEDPUR" /></div>
              </div>

              <MediaInput label="Before Image" value={form.before_media} onChange={(url) => setForm({ ...form, before_media: url })} />
              <MediaInput label="After Image" value={form.after_media} onChange={(url) => setForm({ ...form, after_media: url })} />

              <div><Label className="text-xs">The Challenge</Label><Textarea value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} rows={2} placeholder="What problem did the client face?" /></div>
              <div>
                <Label className="text-xs">Design Moves (one per line)</Label>
                <Textarea value={form.design_moves} onChange={(e) => setForm({ ...form, design_moves: e.target.value })} rows={3} placeholder="Each design decision�" />
              </div>
              <div><Label className="text-xs">Outcome</Label><Input value={form.outcome_metric} onChange={(e) => setForm({ ...form, outcome_metric: e.target.value })} placeholder="Completed in 30 days�" /></div>

              <div className="p-3 rounded-lg border border-dashed border-admin-border">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Client Testimonial (optional)</span>
                <Textarea value={form.testimonial_quote} onChange={(e) => setForm({ ...form, testimonial_quote: e.target.value })} rows={2} placeholder="Client quote�" className="mb-2" />
                <Input value={form.testimonial_client_name} onChange={(e) => setForm({ ...form, testimonial_client_name: e.target.value })} placeholder="Client name" />
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label className="text-sm">Show on website</Label>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</span>
              </div>

              {/* Compare Slider Preview */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-admin-border bg-black relative">
                {form.before_media && form.after_media ? (
                  <Compare
                    firstImage={form.before_media}
                    secondImage={form.after_media}
                    firstImageClassName="object-cover"
                    secondImageClassname="object-cover"
                    className="w-full h-full"
                    slideMode="drag"
                    initialSliderPercentage={50}
                    showHandlebar={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Add both images to see the slider preview</p>
                    </div>
                  </div>
                )}

                {/* Before/After labels */}
                {form.before_media && form.after_media && (
                  <>
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded text-[9px] uppercase text-white/80 pointer-events-none">Before</div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-[9px] uppercase text-amber-400 pointer-events-none">After</div>
                  </>
                )}
              </div>

              {/* Text Preview */}
              <div className="p-4 rounded-xl border border-admin-border bg-black/50 text-white">
                <h4 className="font-medium text-base mb-1">{form.title || "Project Title"}</h4>
                <p className="text-white/40 text-xs mb-3">{form.location || "Location"}</p>
                {form.challenge && <p className="text-white/60 text-xs italic mb-2">"{form.challenge.slice(0, 80)}..."</p>}
                {form.testimonial_quote && (
                  <div className="border-l-2 border-amber-500/40 pl-3 mt-3">
                    <p className="text-white/70 text-xs italic">"{form.testimonial_quote.slice(0, 60)}..."</p>
                    <span className="text-white/40 text-[10px]">— {form.testimonial_client_name || "Client"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Save Changes" : "Create Story"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
