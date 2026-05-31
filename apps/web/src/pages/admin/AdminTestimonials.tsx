import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, ShieldCheck, EyeOff, StarHalf, Edit2, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/hooks/usePermissions";
import { auditService } from "@/services/AuditService";
import { 
  AdminPageHeader, 
  AdminMetricsPanel, 
  AdminFilterBar, 
  AdminEmptyState, 
  AdminSafeAction, 
  AdminSkeletonCard 
} from "@/components/admin/shared";
import { AdminAddCard } from "@/components/admin/shared/AdminEmptyState";
import { TestimonialFormDialog, type TestimonialFormData } from "@/components/admin/testimonials/TestimonialFormDialog";
import type { Testimonial } from "@/components/admin/testimonials/TestimonialsTable";

type TestimonialStatus = "All" | "Active" | "Hidden";

const defaultFormData: TestimonialFormData = {
  author_name: "", author_role: "", content: "", rating: 5, avatar_url: "", active: true, city: "",
};

const AdminTestimonials = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();
  const { can } = usePermissions();
  const canWrite = can("content", "edit");

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TestimonialStatus>("All");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .is('project_id', null)
      .order('display_order', { ascending: true });
      
    if (error) {
      toast({ title: "Error fetching testimonials", description: error.message, variant: "destructive" });
    } else if (data) {
      setTestimonials(data);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => { void fetchTestimonials(); }, [fetchTestimonials]);

  const handleEdit = useCallback((t: Testimonial) => {
    setEditingTestimonial(t);
    setFormData({ 
      author_name: t.author_name, 
      author_role: t.author_role || "", 
      content: t.content, 
      rating: t.rating || 5, 
      avatar_url: t.avatar_url || "", 
      active: t.active ?? true, 
      city: t.city || "" 
    });
    setIsDialogOpen(true);
  }, []);

  const closeDialog = () => { 
    setIsDialogOpen(false); 
    setEditingTestimonial(null); 
    setFormData(defaultFormData); 
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.author_name.trim()) { toast({ title: "Validation Error", description: "Author name is required.", variant: "destructive" }); return; }
    if (!formData.content.trim()) { toast({ title: "Validation Error", description: "Content is required.", variant: "destructive" }); return; }
    setIsSaving(true);
    
    const payload = { 
      author_name: formData.author_name.trim(), 
      author_role: formData.author_role.trim() || null, 
      content: formData.content.trim(), 
      rating: formData.rating, 
      avatar_url: formData.avatar_url.trim() || null, 
      active: formData.active, 
      city: formData.city.trim() || null 
    };
    
    let error;
    if (editingTestimonial) { 
      const { error: e } = await supabase.from('testimonials').update(payload).eq('id', editingTestimonial.id); 
      error = e; 
    } else { 
      const { error: e } = await supabase.from('testimonials').insert({ ...payload, display_order: testimonials.length }); 
      error = e; 
    }
    
    if (error) { 
      toast({ title: "Error", description: error.message, variant: "destructive" }); 
    } else { 
      void auditService.writeAudit(
        editingTestimonial ? 'UPDATE' : 'CREATE',
        'testimonial',
        editingTestimonial?.id || null,
        { author_name: formData.author_name }
      );
      toast({ title: editingTestimonial ? "Testimonial updated" : "Testimonial created", description: `Successfully ${editingTestimonial ? 'updated' : 'created'} testimonial.` }); 
      await fetchTestimonials(); 
      closeDialog(); 
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) { 
      throw error; 
    } else { 
      toast({ title: "Deleted", description: "Testimonial deleted successfully." }); 
      void auditService.writeAudit('DELETE', 'testimonial', id, {});
      await fetchTestimonials(); 
    }
  };

  // Derived state
  const activeCount = testimonials.filter(t => t.active).length;
  const hiddenCount = testimonials.length - activeCount;
  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1) 
    : "—";

  const metrics = [
    { label: "Total Reviews", value: String(testimonials.length), dotColor: "info" as const },
    { label: "Published", value: String(activeCount), dotColor: "success" as const },
    { label: "Hidden", value: String(hiddenCount), dotColor: hiddenCount > 0 ? "warning" as const : "success" as const },
    { label: "Avg Rating", value: `${avgRating} / 5.0`, dotColor: "accent" as const },
  ];

  const filteredTestimonials = useMemo(() => {
    if (statusFilter === "Active") return testimonials.filter(t => t.active);
    if (statusFilter === "Hidden") return testimonials.filter(t => !t.active);
    return testimonials;
  }, [testimonials, statusFilter]);

  return (
    <div className="w-full font-mono">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
        .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
        .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
        .fade-up-4 { animation: fadeUp var(--anim-duration) var(--anim-stagger-4) var(--anim-ease) both; }
      `}</style>
      
      <AdminPageHeader moduleName="CMS" tabName="Testimonials" />

      <div className="fade-up-1">
        <AdminMetricsPanel metrics={metrics} />
      </div>

      <div className="fade-up-2">
        <AdminFilterBar 
          title="Client Testimonials"
          icon={MessageSquare}
          badgeCount={activeCount > 0 ? `${activeCount} active` : undefined}
          filters={["All", "Active", "Hidden"]}
          activeFilter={statusFilter}
          onFilterChange={(f) => setStatusFilter(f as TestimonialStatus)}
        />
      </div>

      <div className="flex flex-col gap-[10px]">
        {isLoading ? (
          <>
            <AdminSkeletonCard size="md" />
            <AdminSkeletonCard size="md" />
            <AdminSkeletonCard size="md" />
          </>
        ) : filteredTestimonials.length === 0 ? (
          <div className="fade-up-3 mt-4">
            <AdminEmptyState 
              icon={MessageSquare}
              title="No testimonials found"
              description="You don't have any testimonials matching this filter yet."
            />
          </div>
        ) : (
          filteredTestimonials.map((testimonial, i) => {
            const delayClass = `fade-up-${Math.min((i % 4) + 1, 4)}`;
            
            return (
              <div key={testimonial.id} className={`${delayClass} group`}>
                <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-200 grid grid-cols-[44px_1fr_auto] gap-4 items-center">
                  
                  {/* Avatar */}
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex flex-col items-center justify-center shrink-0 overflow-hidden">
                    {testimonial.avatar_url ? (
                      <img src={testimonial.avatar_url} alt={testimonial.author_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[hsl(var(--admin-text-muted))]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <span className="text-[15px] font-bold text-[hsl(var(--admin-text))]">
                        {testimonial.author_name}
                      </span>
                      
                      {testimonial.active ? (
                        <span className="bg-[hsl(var(--admin-success)/0.12)] border border-[hsl(var(--admin-success)/0.25)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-success))] tracking-wide uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-success))] shadow-[0_0_4px_hsl(var(--admin-success))]" />
                          Active
                        </span>
                      ) : (
                        <span className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-text-muted))] tracking-wide uppercase">
                          Hidden
                        </span>
                      )}
                      
                      <div className="flex text-[hsl(var(--admin-accent))] items-center ml-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarHalf key={i} className={`w-3.5 h-3.5 ${i < (testimonial.rating || 5) ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-[13px] text-[hsl(var(--admin-text-muted))] truncate max-w-2xl mb-2">
                      "{testimonial.content}"
                    </div>
                    
                    <div className="text-[12px] text-[hsl(var(--admin-text-muted))]">
                      {testimonial.author_role} {testimonial.city && `· ${testimonial.city}`}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canWrite && (
                      <>
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="px-2.5 py-2 rounded-[7px] text-[12px] font-normal bg-transparent border border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-[13px] h-[13px]" />
                          Edit
                        </button>
                        
                        <AdminSafeAction
                          icon={Trash2}
                          label="Delete"
                          confirmLabel="Delete review?"
                          onConfirm={() => handleDelete(testimonial.id)}
                          danger
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canWrite && !isLoading && (
        <div className="fade-up-4 mt-[10px]">
          <AdminAddCard 
            label="Add a new testimonial"
            onClick={() => setIsDialogOpen(true)}
          />
        </div>
      )}

      <TestimonialFormDialog 
        open={isDialogOpen} 
        onClose={closeDialog} 
        formData={formData} 
        onChange={setFormData} 
        onSave={handleSave} 
        isSaving={isSaving} 
        isEditing={!!editingTestimonial} 
      />
    </div>
  );
};

export default AdminTestimonials;
