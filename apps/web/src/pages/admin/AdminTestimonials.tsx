import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminTabSlider } from "@/components/admin/ui/AdminTabSlider";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { AnalyticsKpiRow } from "@/components/admin/analytics/AnalyticsKpiRow";
import { Plus, Loader2, Grid, List as ListIcon, Eye, EyeOff, MessageSquare, StarHalf, ShieldCheck, EyeOff as EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { icons } from "@/design-system/tokens/icons";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import type { LucideIcon } from "lucide-react";

import { TestimonialsToolbar } from "@/components/admin/testimonials/TestimonialsToolbar";
import { TestimonialsTable, type Testimonial } from "@/components/admin/testimonials/TestimonialsTable";
import { TestimonialsGrid } from "@/components/admin/testimonials/TestimonialsGrid";
import { TestimonialFormDialog, type TestimonialFormData } from "@/components/admin/testimonials/TestimonialFormDialog";
import { TestimonialDeleteDialog } from "@/components/admin/testimonials/TestimonialDeleteDialog";
import { BulkActionsBar } from "@/components/admin/testimonials/BulkActionsBar";

type TestimonialStatus = "active" | "inactive";

const defaultFormData: TestimonialFormData = {
  author_name: "", author_role: "", content: "", rating: 5, avatar_url: "", active: true, city: "",
};

const AdminTestimonials = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const deepLinkHandled = useRef(false);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestimonialStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { toast } = useToast();
  const { can } = usePermissions();
  const isReadOnly = !can("content", "edit");
  const canWrite = can("content", "edit");

  const fetchTestimonials = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const { data, error } = await supabase.from('testimonials').select('*').is('project_id', null).order('display_order', { ascending: true });
    if (error) { toast({ title: "Error fetching testimonials", description: error.message, variant: "destructive" }); }
    else if (data) { setTestimonials(data); }
    setIsLoading(false);
  }, [toast]);

  const handleEdit = useCallback((t: Testimonial) => {
    setEditingTestimonial(t);
    setFormData({ author_name: t.author_name, author_role: t.author_role || "", content: t.content, rating: t.rating || 5, avatar_url: t.avatar_url || "", active: t.active ?? true, city: t.city || "" });
    setIsDialogOpen(true);
  }, []);

  useEffect(() => { void fetchTestimonials(); }, [fetchTestimonials]);
  useEffect(() => { setCurrentPage(1); }, [testimonials, searchQuery, statusFilter]);
  useEffect(() => {
    if (editId && !deepLinkHandled.current && testimonials.length > 0) {
      deepLinkHandled.current = true;
      const target = testimonials.find(t => t.id === editId);
      if (target) handleEdit(target);
    }
  }, [editId, handleEdit, testimonials]);

  const filteredTestimonials = useMemo(() => {
    let filtered = [...testimonials];
    if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter(t => t.author_name.toLowerCase().includes(q) || (t.author_role && t.author_role.toLowerCase().includes(q)) || t.content.toLowerCase().includes(q)); }
    if (statusFilter !== "all") { filtered = filtered.filter(t => statusFilter === "active" ? t.active : !t.active); }
    return filtered;
  }, [testimonials, searchQuery, statusFilter]);

  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTestimonials.slice(start, start + itemsPerPage);
  }, [filteredTestimonials, currentPage]);

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);

  const closeDialog = () => { setIsDialogOpen(false); setEditingTestimonial(null); setFormData(defaultFormData); };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedTestimonials.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginatedTestimonials.map(t => t.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.author_name.trim()) { toast({ title: "Validation Error", description: "Author name is required.", variant: "destructive" }); return; }
    if (!formData.content.trim()) { toast({ title: "Validation Error", description: "Content is required.", variant: "destructive" }); return; }
    setIsSaving(true);
    const payload = { author_name: formData.author_name.trim(), author_role: formData.author_role.trim() || null, content: formData.content.trim(), rating: formData.rating, avatar_url: formData.avatar_url.trim() || null, active: formData.active, city: formData.city.trim() || null };
    let error;
    if (editingTestimonial) { const { error: e } = await supabase.from('testimonials').update(payload).eq('id', editingTestimonial.id); error = e; }
    else { const { error: e } = await supabase.from('testimonials').insert({ ...payload, display_order: testimonials.length }); error = e; }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: editingTestimonial ? "Testimonial updated" : "Testimonial created", description: `Successfully ${editingTestimonial ? 'updated' : 'created'} testimonial.` }); await fetchTestimonials(); closeDialog(); }
    setIsSaving(false);
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletingId) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', deletingId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Deleted", description: "Testimonial deleted successfully." }); await fetchTestimonials(); setIsDeleteDialogOpen(false); setDeletingId(null); }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => supabase.from('testimonials').delete().eq('id', id)));
      toast({ title: "Deleted", description: `${selectedIds.size} testimonials deleted.` });
      setSelectedIds(new Set());
      await fetchTestimonials();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleBulkToggleActive = async (active: boolean) => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => supabase.from('testimonials').update({ active }).eq('id', id)));
      toast({ title: "Updated", description: `${selectedIds.size} testimonials ${active ? 'activated' : 'deactivated'}.` });
      setSelectedIds(new Set());
      await fetchTestimonials();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const activeCount = testimonials.filter(t => t.active).length;
  const inactiveCount = testimonials.length - activeCount;
  const avgRating = testimonials.length > 0 ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / (testimonials.filter(t => t.rating).length || 1)).toFixed(1) : "—";

  const kpiMetrics: Parameters<typeof AnalyticsKpiRow>[0]["metrics"] = [
    { title: "Total Testimonials", value: String(testimonials.length), numericValue: testimonials.length, icon: MessageSquare as LucideIcon, variant: "secondary" },
    { title: "Active", value: String(activeCount), numericValue: activeCount, icon: ShieldCheck as LucideIcon, variant: "accent", change: `${testimonials.length > 0 ? Math.round((activeCount / testimonials.length) * 100) : 0}% of total`, trend: "up" },
    { title: "Hidden", value: String(inactiveCount), numericValue: inactiveCount, icon: EyeOff as LucideIcon, variant: "accent", change: inactiveCount > 0 ? "Needs review" : "All active", trend: inactiveCount > 0 ? "down" : "neutral" },
    { title: "Avg Rating", value: String(avgRating), icon: StarHalf as LucideIcon, variant: "gold" },
  ];

  if (isLoading) {
    return (<div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--admin-primary))] mb-4" /><p className="text-[hsl(var(--admin-muted))]">Loading testimonials...</p></div></div>);
  }

  const Pagination = () => totalPages > 1 ? (
    <div className="flex items-center justify-between pt-4 mt-auto">
      <p className="text-sm text-[hsl(var(--admin-muted))]">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTestimonials.length)} of {filteredTestimonials.length} entries</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]">Previous</Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              pageNum = currentPage - 2 + i;
              if (pageNum > totalPages) pageNum = totalPages - (4 - i);
            }
            return (
              <Button
                key={pageNum}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "w-8 h-8 p-0 rounded-md",
                  currentPage === pageNum ? "bg-[hsl(var(--admin-primary))]/20 text-[hsl(var(--admin-primary))] font-medium" : "text-[hsl(var(--admin-text-muted))]"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]">Next</Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <ModuleActions>
        {canWrite && (
          <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
            <Plus className={`${icons.sm} mr-2`} /> Add Testimonial
          </Button>
        )}
      </ModuleActions>

      <AdminTabSlider
        header={
          <div className="mb-6 space-y-4 shrink-0">
            <AnalyticsKpiRow metrics={kpiMetrics} isLoading={isLoading} />
          </div>
        }
        tabs={[
          { id: "table", label: "List View", icon: ListIcon, content: (
            <div className="flex flex-col space-y-4 h-full relative">
              {selectedIds.size > 0 && <BulkActionsBar count={selectedIds.size} canWrite={canWrite} onClear={() => setSelectedIds(new Set())} onActivate={() => handleBulkToggleActive(true)} onDeactivate={() => handleBulkToggleActive(false)} onDelete={handleBulkDelete} />}
              <div className="shrink-0 mb-2"><h2 className="text-xl admin-title">List View</h2><p className="admin-subtitle text-sm mt-1">Detailed table for quick scanning and management.</p></div>
              <TestimonialsToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} resultCount={filteredTestimonials.length} />
              <TestimonialsTable testimonials={paginatedTestimonials} selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll} onEdit={handleEdit} onDelete={(id) => { setDeletingId(id); setIsDeleteDialogOpen(true); }} isReadOnly={isReadOnly} canWrite={canWrite} />
              <Pagination />
            </div>
          )},
          { id: "grid", label: "Card Grid", icon: Grid, content: (
            <div className="flex flex-col space-y-4 h-full relative">
              {selectedIds.size > 0 && <BulkActionsBar count={selectedIds.size} canWrite={canWrite} onClear={() => setSelectedIds(new Set())} onActivate={() => handleBulkToggleActive(true)} onDeactivate={() => handleBulkToggleActive(false)} onDelete={handleBulkDelete} />}
              <div className="shrink-0 mb-2"><h2 className="text-xl admin-title">Card Grid</h2><p className="admin-subtitle text-sm mt-1">Visual layout representing how testimonials look.</p></div>
              <TestimonialsToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} resultCount={filteredTestimonials.length} />
              <TestimonialsGrid testimonials={paginatedTestimonials} selectedIds={selectedIds} onToggleSelect={toggleSelect} onEdit={handleEdit} onDelete={(id) => { setDeletingId(id); setIsDeleteDialogOpen(true); }} canWrite={canWrite} />
              <Pagination />
            </div>
          )},
        ]}
      />
      <TestimonialFormDialog open={isDialogOpen} onClose={closeDialog} formData={formData} onChange={setFormData} onSave={handleSave} isSaving={isSaving} isEditing={!!editingTestimonial} />
      <TestimonialDeleteDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={handleDelete} />
    </div>
  );
};

export default AdminTestimonials;
