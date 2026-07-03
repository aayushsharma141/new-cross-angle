import React from 'react';
import { useState, useMemo } from "react";
import { Pencil, Trash2, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/primitives/dialog";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { auditService } from "@/services/AuditService";
import { ServiceDetail } from "@repo/types";
import { serviceSchema, formatZodErrors } from "@/lib/validation/validations";
import { FeaturesEditor, ProcessEditor, FAQEditor } from "@/components/admin/ServiceFormFields";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import { AssetUsageService } from "@/services/AssetUsageService";
import { AdminFilterBar, AdminSafeAction, AdminEmptyState, AdminSkeletonCard } from "@/components/admin/shared";
import { AdminAddCard } from "@/components/admin/shared/AdminEmptyState";
import { DataLoadingBoundary } from "@/components/ui/enhanced/DataLoadingBoundary";
import * as LucideIcons from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ICONS = ["Home", "Building2", "Palette", "Lightbulb", "Sofa", "PenTool", "Lamp", "UtensilsCrossed", "Bed"];
const CATEGORIES = [
    { id: "residential", label: "Residential" },
    { id: "commercial", label: "Commercial" },
    { id: "specialized", label: "Specialized" }
];

type ServiceFilter = "All" | "Residential" | "Commercial" | "Specialized";

interface ServiceRecord {
    id: string;
    created_at: string;
    name: string;
    slug: string;
    description: string | Record<string, unknown>;
    icon_url?: string;
    short_description?: string;
    short_tag?: string;
    active?: boolean;
    service_steps?: { step_number: number; title: string; description: string }[];
    service_faqs?: { display_order: number; question: string; answer: string }[];
}

const AdminServices = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceDetail | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<ServiceFilter>("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        hero_image: "",
        hero_asset_id: null as string | null,
        category_id: "residential",
        icon: "Home",
        tag: "",
        features: [] as string[],
        process_steps: [] as { title: string, description: string }[],
        faq: [] as { question: string, answer: string }[]
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: services = [], isLoading } = useQuery({
        queryKey: ['admin-services'],
        queryFn: async (): Promise<ServiceDetail[]> => {
            const { data, error } = await supabase
                .from('services')
                .select(`
                    *,
                    service_steps (*),
                    service_faqs (*)
                `)
                .order('display_order', { ascending: true });

            if (error) {
                console.error("Error fetching services:", error);
                throw error;
            }

            if (!data) return [];

            return (data as ServiceRecord[]).map((item: ServiceRecord) => {
                const descJson = typeof item.description === 'string'
                    ? JSON.parse(item.description)
                    : (item.description as Record<string, unknown>) || {};

                return {
                    id: item.id,
                    created_at: item.created_at,
                    title: item.name, 
                    slug: item.slug,
                    active: item.active ?? true,
                    category_id: descJson.category_id || "residential",
                    description: descJson.content || item.short_description || "",
                    hero_image: item.icon_url || "",
                    icon: descJson.icon || "Home",
                    tag: item.short_tag || "",
                    features: descJson.features || [],
                    process_steps: item.service_steps?.sort((a, b) => a.step_number - b.step_number).map((step) => ({
                        title: step.title,
                        description: step.description
                    })) || [],
                    faq: item.service_faqs?.sort((a, b) => a.display_order - b.display_order).map((f) => ({
                        question: f.question,
                        answer: f.answer
                    })) || []
                };
            });
        }
    });

    const handleEdit = (service: ServiceDetail): void => {
        setEditingService(service);
        setFormData({
            title: service.title,
            slug: service.slug,
            description: service.description || "",
            hero_image: service.hero_image || "",
            hero_asset_id: null,
            category_id: service.category_id || "residential",
            icon: service.icon || "Home",
            tag: service.tag || "",
            features: service.features || [],
            process_steps: service.process_steps || [],
            faq: service.faq || []
        });
        setIsDialogOpen(true);
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            toast({ title: "Service deleted successfully" });
            void auditService.writeAudit('DELETE', 'service', id, {});
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        },
        onError: (error: Error) => {
            toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        }
    });

    const handleDelete = (id: string): void => {
        deleteMutation.mutate(id);
    };

    const generateSlug = (title: string): string => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const upsertMutation = useMutation({
        mutationFn: async (payload: {
            p_active: boolean;
            p_description: any;
            p_display_order: number;
            p_faqs: any;
            p_icon_url: string | null;
            p_name: string;
            p_service_id: string | null;
            p_short_tag: string | null;
            p_slug: string;
            p_steps: any;
        }) => {
            const { data, error: rpcError } = await supabase.rpc('upsert_service', payload as any);
            if (rpcError) throw rpcError;
            
            return {
                payload,
                returnedId: data as string
            };
        },
        onSuccess: ({ payload, returnedId }) => {
            const finalServiceId = payload.p_service_id || returnedId;

            // Sync asset relationship if one was selected
            if (finalServiceId && formData.hero_asset_id) {
                void AssetUsageService.replaceUsage({
                    assetId: formData.hero_asset_id,
                    entityType: "services",
                    entityId: finalServiceId,
                    role: "hero"
                });
            }

            toast({ title: payload.p_service_id ? "Service updated!" : "Service created!" });
            void auditService.writeAudit(
                payload.p_service_id ? 'UPDATE' : 'CREATE',
                'service',
                payload.p_service_id || null,
                { title: payload.p_name }
            );
            setIsDialogOpen(false);
            setEditingService(null);
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        },
        onError: (error: Error) => {
            toast({ title: "Error saving service", description: error.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();

        const validation = serviceSchema.safeParse(formData);
        if (!validation.success) {
            toast({
                title: "Validation Error",
                description: formatZodErrors(validation.error),
                variant: "destructive",
            });
            return;
        }

        const descriptionData = {
            content: formData.description,
            features: formData.features,
            icon: formData.icon,
            category_id: formData.category_id
        };

        const stepsPayload = formData.process_steps?.map((step, index) => ({
            step_number: index + 1,
            title: step.title,
            description: step.description
        })) || [];

        const faqPayload = formData.faq?.map((f, index) => ({
            display_order: index + 1,
            question: f.question,
            answer: f.answer
        })) || [];

        upsertMutation.mutate({
            p_service_id: editingService?.id || null,
            p_name: formData.title,
            p_slug: formData.slug || generateSlug(formData.title || ""),
            p_description: descriptionData,
            p_icon_url: formData.hero_image || null,
            p_short_tag: formData.tag || null,
            p_display_order: editingService
                ? (services.findIndex(s => s.id === editingService.id) + 1) || 1
                : services.length + 1,
            p_active: true,
            p_steps: stepsPayload,
            p_faqs: faqPayload
        });
    };

    const handleNewService = (): void => {
        setEditingService(null);
        setFormData({
            title: "",
            slug: "",
            description: "",
            hero_image: "",
            hero_asset_id: null,
            category_id: "residential",
            icon: "Home",
            tag: "",
            features: [],
            process_steps: [],
            faq: []
        });
        setIsDialogOpen(true);
    };

    const filteredServices = useMemo(() => {
        let filtered = services;
        if (searchQuery) {
            filtered = filtered.filter(s => 
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.slug?.toLowerCase() || "").includes(searchQuery.toLowerCase())
            );
        }
        if (categoryFilter !== "All") {
            filtered = filtered.filter(s => s.category_id?.toLowerCase() === categoryFilter.toLowerCase());
        }
        return filtered;
    }, [services, categoryFilter, searchQuery]);

    const activeCount = services.filter(s => s.active).length;

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
            `}</style>

            


            <div className="fade-up-1 mt-6">
                <AdminFilterBar
                    title="Service Categories"
                    icon={Briefcase}
                    badgeCount={activeCount > 0 ? `${activeCount} published` : undefined}
                    filters={["All", "Residential", "Commercial", "Specialized"]}
                    activeFilter={categoryFilter}
                    onFilterChange={(f) => setCategoryFilter(f as ServiceFilter)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </div>

            <DataLoadingBoundary 
              isLoading={isLoading} 
              loadingMessage="FETCHING SERVICES..."
              subMessage="Decrypting and loading category data"
              skeleton={
                <>
                  <AdminSkeletonCard size="md" />
                  <AdminSkeletonCard size="md" />
                  <AdminSkeletonCard size="md" />
                </>
              }
            >
              <div className="flex flex-col gap-3 relative min-h-[200px]">
                {filteredServices.length === 0 ? (
                    <div className="fade-up-2 mt-4">
                        <AdminEmptyState
                            icon={Briefcase}
                            title="No services found"
                            description="You haven't defined any services matching this filter."
                        />
                    </div>
                ) : (
                    filteredServices.map((service, i) => {
                        const delayClass = `fade-up-${Math.min((i % 4) + 1, 4)}`;

                        const ServiceIcon = (LucideIcons as any)[service.icon || "Briefcase"] || LucideIcons.Briefcase;

                        return (
                            <div key={service.id} className={`${delayClass} group`}>
                                <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-200 grid grid-cols-[44px_1fr_auto] gap-4 items-center">

                                    {/* Icon */}
                                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex flex-col items-center justify-center shrink-0">
                                        <ServiceIcon className="w-5 h-5 text-[hsl(var(--admin-accent))]" />
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                            <span className="text-[15px] font-bold text-[hsl(var(--admin-text))]">
                                                {service.title}
                                            </span>

                                            {service.tag && (
                                                <span className="bg-[hsl(var(--admin-accent)/0.1)] border border-[hsl(var(--admin-accent)/0.2)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-accent))] tracking-wide uppercase">
                                                    {service.tag}
                                                </span>
                                            )}

                                            <span className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-text-muted))] tracking-wide uppercase">
                                                {service.category_id || "residential"}
                                            </span>

                                            {service.active !== false ? (
                                                <span className="bg-[hsl(var(--admin-success)/0.12)] border border-[hsl(var(--admin-success)/0.25)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-success))] tracking-wide uppercase flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-success))] shadow-[0_0_4px_hsl(var(--admin-success))]" />
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-text-muted))] tracking-wide uppercase">
                                                    Draft
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-[13px] text-[hsl(var(--admin-text-muted))] truncate max-w-2xl mb-1.5">
                                            {typeof service.description === 'string' ? service.description : 'Service description...'}
                                        </div>

                                        <div className="flex gap-4 text-[12px] text-[hsl(var(--admin-text-muted))]">
                                            <div className="flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5" />
                                                {service.process_steps?.length || 0} Steps
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <LucideIcons.HelpCircle className="w-3.5 h-3.5" />
                                                {service.faq?.length || 0} FAQs
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <LucideIcons.List className="w-3.5 h-3.5" />
                                                {service.features?.length || 0} Features
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="px-2.5 py-2 rounded-[7px] text-[12px] font-normal bg-transparent border border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-150 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Pencil className="w-[13px] h-[13px]" />
                                            Edit
                                        </button>

                                        <AdminSafeAction
                                            icon={Trash2}
                                            label="Delete"
                                            confirmLabel="Delete service?"
                                            onConfirm={async () => { handleDelete(service.id); }}
                                            danger
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
              </div>
            </DataLoadingBoundary>

            {!isLoading && (
                <div className="fade-up-3 mt-[10px]">
                    <AdminAddCard
                        label="Add a new service"
                        onClick={handleNewService}
                    />
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingService(null);
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl bg-admin-card border-admin-border text-admin-text">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-admin-border shrink-0">
                        <DialogTitle className="text-xl font-display text-admin-text">
                            {editingService ? "Edit Service" : "New Service"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden font-sans">
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            <Tabs defaultValue="basic">
                                <TabsList className="grid w-full grid-cols-4 bg-admin-surface p-1">
                                    <TabsTrigger value="basic" className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-text">Basic Info</TabsTrigger>
                                    <TabsTrigger value="features" className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-text">Features</TabsTrigger>
                                    <TabsTrigger value="process" className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-text">Process</TabsTrigger>
                                    <TabsTrigger value="faq" className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-text">FAQ</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="svc-title" className="text-[hsl(var(--admin-text))]">Title</Label>
                                            <Input
                                                id="svc-title"
                                                value={formData.title}
                                                onChange={(e) => {
                                                    const title = e.target.value;
                                                    // Only auto-generate slug if generic or empty
                                                    const slug = !editingService ? generateSlug(title) : formData.slug;
                                                    setFormData({ ...formData, title, slug });
                                                }}
                                                required
                                                className="admin-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="svc-slug" className="text-[hsl(var(--admin-text))]">Slug</Label>
                                            <Input
                                                id="svc-slug"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                required
                                                className="admin-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="svc-category" className="text-[hsl(var(--admin-text))]">Category</Label>
                                            <Select
                                                value={formData.category_id}
                                                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                            >
                                                <SelectTrigger id="svc-category" className="admin-input">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                                                    {CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="svc-icon" className="text-[hsl(var(--admin-text))]">Icon</Label>
                                            <Select
                                                value={formData.icon}
                                                onValueChange={(value) => setFormData({ ...formData, icon: value })}
                                            >
                                                <SelectTrigger id="svc-icon" className="admin-input">
                                                    <SelectValue placeholder="Select Icon" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                                                    {ICONS.map((icon) => (
                                                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="svc-hero" className="text-[hsl(var(--admin-text))]">Hero Image URL</Label>
                                        <MediaPickerField
                                            id="hero_image"
                                            value={formData.hero_image}
                                            onChange={(url) => setFormData({ ...formData, hero_image: url })}
                                            onAssetSelect={(asset, url) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    hero_image: url,
                                                    hero_asset_id: asset.id
                                                }));
                                            }}
                                            entityId={editingService?.id}
                                            placeholder="Select hero image…"
                                            domain="services"
                                            entityType="services"
                                            damRole="hero"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="service-description" className="text-[hsl(var(--admin-text))]">Description</Label>
                                        <Textarea
                                            id="service-description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="admin-input"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="service-tag" className="text-[hsl(var(--admin-text))]">Tag (Optional)</Label>
                                        <Input
                                            id="service-tag"
                                            value={formData.tag}
                                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                            placeholder="e.g. Popular"
                                            className="admin-input"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="features" className="mt-4 text-[hsl(var(--admin-text))]">
                                    <FeaturesEditor
                                        features={formData.features || []}
                                        onChange={(f) => setFormData({ ...formData, features: f })}
                                    />
                                </TabsContent>

                                <TabsContent value="process" className="mt-4 text-[hsl(var(--admin-text))]">
                                    <ProcessEditor
                                        steps={formData.process_steps || []}
                                        onChange={(s) => setFormData({ ...formData, process_steps: s })}
                                    />
                                </TabsContent>

                                <TabsContent value="faq" className="mt-4 text-[hsl(var(--admin-text))]">
                                    <FAQEditor
                                        faq={formData.faq || []}
                                        onChange={(f) => setFormData({ ...formData, faq: f })}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div className="shrink-0 px-6 py-4 border-t border-[hsl(var(--admin-border))] flex justify-end gap-2 bg-[hsl(var(--admin-surface))] rounded-b-xl">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="admin-btn-secondary">Cancel</Button>
                            <Button type="submit" disabled={upsertMutation.isPending} className="admin-btn-primary">
                                {upsertMutation.isPending ? "Saving…" : editingService ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminServices;
