import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ArchiveIcon,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import MediaPickerModal from "@/components/admin/MediaPickerModal";


// ─── TYPES ────────────────────────────────────────────────────────────────────

import { StatusBadge, ContentStatus } from "@/components/admin/StatusBadge";

interface PageSection {
  id: string;
  page: string;
  section_key: string;
  section_type: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  extra: Record<string, unknown> | null;
  content_json: Record<string, unknown> | null;
  order_index: number;
  status: ContentStatus;
  updated_at: string;
}

interface Page {
  slug: string;
  title: string;
  status: ContentStatus;
}

// ─── SORTABLE SECTION CARD ────────────────────────────────────────────────────

interface SortableSectionCardProps {
  section: PageSection;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onFieldChange: (id: string, field: string, value: string | null) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
  onImagePick: (id: string) => void;
  onDelete: (section: PageSection) => void;
  isSaving: boolean;
}

const SortableSectionCard = ({
  section,
  isExpanded,
  onToggleExpand,
  onFieldChange,
  onStatusChange,
  onImagePick,
  onDelete,
  isSaving,
}: SortableSectionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 ${isDragging ? "shadow-2xl shadow-purple-500/20 ring-1 ring-purple-400/40" : ""
          } ${isExpanded ? "ring-1 ring-white/20" : ""}`}
      >
        {/* ── Card Header / Handle Row ── */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          {/* Drag handle */}
          <Button
            variant="ghost"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded h-auto w-auto"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </Button>

          {/* Section info */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-sm font-medium text-slate-200 truncate">
              {section.section_key}
            </span>
            {section.title && (
              <span className="text-xs text-slate-500 truncate hidden sm:block">
                — {section.title}
              </span>
            )}
          </div>

          {/* Status badge */}
          <StatusBadge status={section.status} />

          {/* Actions */}
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {/* Publish / Unpublish quick toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-slate-400 hover:text-white"
                    onClick={() =>
                      onStatusChange(
                        section.id,
                        section.status === "published" ? "draft" : "published"
                      )
                    }
                    disabled={isSaving}
                  >
                    {section.status === "published" ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {section.status === "published" ? "Unpublish" : "Publish"}
                </TooltipContent>
              </Tooltip>

              {/* Archive */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-slate-400 hover:text-amber-400"
                    onClick={() => onStatusChange(section.id, "archived")}
                    disabled={isSaving || section.status === "archived"}
                  >
                    <ArchiveIcon className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Archive</TooltipContent>
              </Tooltip>

              {/* Delete */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-slate-400 hover:text-red-400"
                    onClick={() => onDelete(section)}
                    disabled={isSaving}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Delete</TooltipContent>
              </Tooltip>

              {/* Expand toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-slate-400 hover:text-white"
                onClick={() => onToggleExpand(section.id)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </TooltipProvider>
        </div>

        {/* ── Expanded Editor ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="flex flex-col gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1 block">Status</Label>
                    <Select
                      value={section.status}
                      onValueChange={(v) => onStatusChange(section.id, v as ContentStatus)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-400 mb-1 block">Title</Label>
                    <Input
                      value={section.title ?? ""}
                      onChange={(e) => onFieldChange(section.id, "title", e.target.value)}
                      className="h-8 text-sm bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600"
                      placeholder="Section title…"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-400 mb-1 block">Subtitle</Label>
                    <Input
                      value={section.subtitle ?? ""}
                      onChange={(e) => onFieldChange(section.id, "subtitle", e.target.value)}
                      className="h-8 text-sm bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600"
                      placeholder="Subtitle…"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-400 mb-1 block">Body</Label>
                    <Textarea
                      value={section.body ?? ""}
                      onChange={(e) => onFieldChange(section.id, "body", e.target.value)}
                      className="text-sm bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 min-h-[80px] resize-none"
                      placeholder="Section content…"
                    />
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1 block">CTA Text</Label>
                    <Input
                      value={section.cta_text ?? ""}
                      onChange={(e) => onFieldChange(section.id, "cta_text", e.target.value)}
                      className="h-8 text-sm bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600"
                      placeholder="Button label…"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-400 mb-1 block">CTA URL</Label>
                    <Input
                      value={section.cta_url ?? ""}
                      onChange={(e) => onFieldChange(section.id, "cta_url", e.target.value)}
                      className="h-8 text-sm bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600"
                      placeholder="/page-url or https://…"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-400 mb-1 block">Image</Label>
                    <div className="flex gap-2 items-start">
                      {section.image_url && (
                        <img
                          src={section.image_url}
                          alt="section"
                          className="w-16 h-16 object-cover rounded-md border border-white/10 shrink-0"
                        />
                      )}
                      <div className="flex flex-col gap-1 flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10 w-full"
                          onClick={() => onImagePick(section.id)}
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {section.image_url ? "Change Image" : "Pick Image"}
                        </Button>
                        {section.image_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-400 hover:text-red-300 w-full"
                            onClick={() => onFieldChange(section.id, "image_url", null)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const AdminPageSections = () => {
  const [searchParams] = useSearchParams();
  const editPageSlug = searchParams.get("edit");
  const [pages, setPages] = useState<Page[]>([]);
  const [activePage, setActivePage] = useState(editPageSlug || "home");

  useEffect(() => {
    if (editPageSlug) {
      setActivePage(editPageSlug);
    }
  }, [editPageSlug]);

  const [sections, setSections] = useState<PageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<PageSection | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeImageSectionId, setActiveImageSectionId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Data fetching ──
  const fetchPages = useCallback(async () => {
    const { data } = await supabase
      .from("pages")
      .select("slug, title, status")
      .order("slug");
    if (data) setPages(data as Page[]);
  }, []);

  const fetchSections = useCallback(async (page: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page", page)
      .order("order_index")
      .order("section_key");

    if (error) {
      toast({ variant: "destructive", title: "Error loading sections", description: error.message });
    }
    if (data) setSections(data as PageSection[]);
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    void fetchSections(activePage);
    setExpandedIds(new Set());
  }, [activePage, fetchSections]);

  // ── Field changes ──
  const handleFieldChange = useCallback(
    (id: string, field: string, value: string | null) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const handleStatusChange = useCallback(
    (id: string, status: ContentStatus) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    },
    []
  );

  // ── DnD ──
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIdx = prev.findIndex((s) => s.id === active.id);
      const newIdx = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIdx, newIdx).map((s, i) => ({
        ...s,
        order_index: i,
      }));
    });
  }, []);

  // ── Save all ──
  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      for (const section of sections) {
        const { error } = await supabase
          .from("page_sections")
          .update({
            title: section.title,
            subtitle: section.subtitle,
            body: section.body,
            image_url: section.image_url,
            cta_text: section.cta_text,
            cta_url: section.cta_url,
            extra: section.extra,
            order_index: section.order_index,
            status: section.status,
            section_type: section.section_type ?? section.section_key,
            content_json: section.content_json,
            updated_at: new Date().toISOString(),
          })
          .eq("id", section.id);

        if (error) throw error;
      }

      // Invalidate Edge Cache for this page
      await supabase.functions.invoke('cda-api', {
        body: { action: 'invalidate', resource: 'pages', slug: activePage }
      });

      toast({ title: "✓ Saved", description: "All sections updated successfully." });
    } catch (err) {
      const e = err as Error;
      toast({ variant: "destructive", title: "Save failed", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Add section ──
  const handleAddSection = async () => {
    if (!newSectionKey.trim()) return;
    const { data, error } = await supabase
      .from("page_sections")
      .insert({
        page: activePage,
        section_key: newSectionKey.trim().toLowerCase().replace(/\s+/g, "_"),
        section_type: newSectionKey.trim().toLowerCase().replace(/\s+/g, "_"),
        title: "",
        status: "draft",
        order_index: sections.length,
        content_json: {},
      })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else if (data) {
      setSections((prev) => [...prev, data as PageSection]);
      setExpandedIds((prev) => new Set(prev).add(data.id));
      toast({ title: "Section added", description: `"${data.section_key}" created as draft.` });
    }
    setNewSectionKey("");
    setAddDialogOpen(false);
  };

  // ── Delete section ──
  const handleDelete = async () => {
    if (!sectionToDelete) return;
    const { error } = await supabase
      .from("page_sections")
      .delete()
      .eq("id", sectionToDelete.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setSections((prev) => prev.filter((s) => s.id !== sectionToDelete.id));
      toast({ title: "Section deleted" });
    }
    setSectionToDelete(null);
    setDeleteDialogOpen(false);
  };

  // ── Media picker ──
  const handleImagePick = (sectionId: string) => {
    setActiveImageSectionId(sectionId);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (activeImageSectionId) {
      handleFieldChange(activeImageSectionId, "image_url", url);
    }
    setMediaPickerOpen(false);
    setActiveImageSectionId(null);
  };

  // ── Expand toggle ──
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Stats for page ──
  const stats = {
    total: sections.length,
    published: sections.filter((s) => s.status === "published").length,
    draft: sections.filter((s) => s.status === "draft").length,
    archived: sections.filter((s) => s.status === "archived").length,
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  const pageLabel = pages.find((p) => p.slug === activePage)?.title ?? activePage;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Page Builder
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag sections to reorder · Click to expand · Save to publish changes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => void fetchSections(activePage)}
              disabled={isLoading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 border-0"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Section
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 border-0"
              onClick={handleSaveAll}
              disabled={isSaving || sections.length === 0}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1" />
              )}
              Save All
            </Button>
          </div>
        </div>

        {/* ── Page selector + stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Page tabs panel */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm lg:col-span-1">
            <CardHeader className="py-3 px-4 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-0.5">
              {pages.length === 0 ? (
                <div className="text-xs text-slate-600 px-2 py-3">Loading…</div>
              ) : (
                pages.map((p) => (
                  <Button
                    variant="ghost"
                    key={p.slug}
                    onClick={() => setActivePage(p.slug)}
                    className={`w-full justify-between items-center text-left px-3 py-2 rounded-md text-sm transition-all h-auto ${activePage === p.slug
                      ? "bg-indigo-500/20 text-indigo-300 font-medium hover:bg-indigo-500/30 hover:text-indigo-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                  >
                    {p.title}
                    <StatusBadge status={p.status} />
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Stats + section list */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total", value: stats.total, color: "text-slate-300" },
                { label: "Published", value: stats.published, color: "text-emerald-400" },
                { label: "Draft", value: stats.draft, color: "text-amber-400" },
                { label: "Archived", value: stats.archived, color: "text-slate-500" },
              ].map((s) => (
                <Card key={s.label} className="border border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="py-3 px-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Section list */}
            <div>
              <h2 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                <span className="uppercase tracking-widest">Sections — {pageLabel}</span>
                <span className="text-slate-600">{sections.length} total</span>
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              ) : sections.length === 0 ? (
                <Card className="border border-dashed border-white/10 bg-white/3 backdrop-blur-sm">
                  <CardContent className="py-12 text-center">
                    <FileText className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No sections yet for <strong>{pageLabel}</strong></p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add First Section
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {sections.map((section) => (
                        <SortableSectionCard
                          key={section.id}
                          section={section}
                          isExpanded={expandedIds.has(section.id)}
                          onToggleExpand={toggleExpand}
                          onFieldChange={handleFieldChange}
                          onStatusChange={handleStatusChange}
                          onImagePick={handleImagePick}
                          onDelete={(s) => {
                            setSectionToDelete(s);
                            setDeleteDialogOpen(true);
                          }}
                          isSaving={isSaving}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Section Dialog ── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">New Section</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-xs text-slate-500">
              Adding to page: <strong className="text-slate-300">{pageLabel}</strong>
            </p>
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Section key</Label>
              <Input
                value={newSectionKey}
                onChange={(e) => setNewSectionKey(e.target.value)}
                placeholder="e.g. hero, services, cta"
                className="bg-white/5 border-white/10 text-slate-200"
                onKeyDown={(e) => e.key === "Enter" && void handleAddSection()}
                autoFocus
              />
              <p className="text-[10px] text-slate-600 mt-1">
                Use lowercase letters and underscores
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs bg-indigo-600 hover:bg-indigo-500"
              onClick={() => void handleAddSection()}
              disabled={!newSectionKey.trim()}
            >
              Create as Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Section?"
        description={`This will permanently delete "${sectionToDelete?.section_key}". This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => void handleDelete()}
      />

      {/* ── Media Picker ── */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};

export default AdminPageSections;