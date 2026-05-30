import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, ImagePlus, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/primitives/dialog";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceDetail } from "@repo/types";
import { serviceSchema, formatZodErrors } from "@/lib/validation/validations";
import { FeaturesEditor, ProcessEditor, FAQEditor } from "@/components/admin/ServiceFormFields";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";

import { DataTable, Column } from "@/components/admin/ui/DataTable";
const ICONS = ["Home", "Building2", "Palette", "Lightbulb", "Sofa", "PenTool", "Lamp", "UtensilsCrossed", "Bed"];
const CATEGORIES = [
    { id: "residential", label: "Residential" },
    { id: "commercial", label: "Commercial" },
    { id: "specialized", label: "Specialized" }
];

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
    const [services, setServices] = useState<ServiceDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceDetail | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<ServiceDetail>>({
        title: "",
        slug: "",
        description: "",
        hero_image: "",
        category_id: "residential",
        icon: "Home",
        tag: "",
        features: [],
        process_steps: [],
        faq: []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchServices = async (): Promise<void> => {
        setIsLoading(true);
        // Fetch services with their related steps and faqs
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
            toast({
                title: "Error fetching services",
                description: error.message,
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (data) {
            const mappedServices: ServiceDetail[] = (data as ServiceRecord[]).map((item: ServiceRecord) => {
                const descJson = typeof item.description === 'string'
                    ? JSON.parse(item.description)
                    : (item.description as Record<string, unknown>) || {};

                return {
                    id: item.id,
                    created_at: item.created_at,
                    title: item.name, // Mapping 'name' to 'title'
                    slug: item.slug,
                    active: item.active ?? true,
                    category_id: descJson.category_id || "residential",
                    // Start: Schema mapping
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
            setServices(mappedServices);
        }
        setIsLoading(false);
    };

    const handleEdit = (service: ServiceDetail): void => {
        setEditingService(service);
        setFormData({
            title: service.title,
            slug: service.slug,
            description: service.description || "",
            hero_image: service.hero_image || "",
            category_id: service.category_id || "residential",
            icon: service.icon || "Home",
            tag: service.tag || "",
            features: service.features || [],
            process_steps: service.process_steps || [],
            faq: service.faq || []
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string): Promise<void> => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) {
            toast({
                title: "Error deleting service",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({ title: "Service deleted successfully" });
            void fetchServices();
        }
    };

    const generateSlug = (title: string): string => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        // Validate with Zod before saving
        const validation = serviceSchema.safeParse(formData);
        if (!validation.success) {
            toast({
                title: "Validation Error",
                description: formatZodErrors(validation.error),
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);

        try {
            // Prepare the JSONB description object
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

            const { error: rpcError } = await supabase.rpc('upsert_service', {
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

            if (rpcError) throw rpcError;

            toast({
                title: editingService ? "Service updated!" : "Service created!",
            });

            setIsDialogOpen(false);
            setEditingService(null);
            void fetchServices();
        } catch (error) {
            const err = error as Error;
            console.error(err);
            toast({
                title: "Error saving service",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNewService = (): void => {
        setEditingService(null);
        setFormData({
            title: "",
            slug: "",
            description: "",
            hero_image: "",
            category_id: "residential",
            icon: "Home",
            tag: "",
            features: [],
            process_steps: [],
            faq: []
        });
        setIsDialogOpen(true);
    };

    const columns: Column<ServiceDetail>[] = [
        {
            key: "name_desc",
            header: "Name & Desc",
            cell: (service) => (
                <div className="font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                        <span>{service.title}</span>
                        {service.tag && (
                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                {service.tag}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 font-normal line-clamp-1 mt-1">
                        {service.description as string}
                    </p>
                </div>
            )
        },
        {
            key: "category",
            header: "Category",
            cell: (service) => (
                <span className="capitalize">{service.category_id || "residential"}</span>
            )
        },
        {
            key: "status",
            header: "Status",
            cell: (service) => (
                <StatusBadge status={service.active !== false ? "published" : "draft"} />
            )
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (service) => (
                <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => handleEdit(service)} aria-label="Edit service">
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => handleDelete(service.id)} aria-label="Delete service">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingService(null);
            }}>
                <ModuleActions>
                    <DialogTrigger asChild>
                        <Button variant="primary" onClick={handleNewService}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Service
                        </Button>
                    </DialogTrigger>
                </ModuleActions>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl">
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
                            <DialogTitle className="text-xl font-display">
                                {editingService ? "Edit Service" : "New Service"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                                <Tabs defaultValue="basic">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="features">Features</TabsTrigger>
                                        <TabsTrigger value="process">Process</TabsTrigger>
                                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="svc-title">Title</Label>
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
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="svc-slug">Slug</Label>
                                                <Input
                                                    id="svc-slug"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="svc-category">Category</Label>
                                                <Select
                                                    value={formData.category_id}
                                                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                                >
                                                    <SelectTrigger id="svc-category">
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CATEGORIES.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="svc-icon">Icon</Label>
                                                <Select
                                                    value={formData.icon}
                                                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                                                >
                                                    <SelectTrigger id="svc-icon">
                                                        <SelectValue placeholder="Select Icon" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ICONS.map((icon) => (
                                                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="svc-hero">Hero Image URL</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="svc-hero"
                                                    value={formData.hero_image}
                                                    onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                                                    placeholder="https://..."
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsMediaPickerOpen(true)}
                                                >
                                                    <ImagePlus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <MediaPickerModal
                                                open={isMediaPickerOpen}
                                                onOpenChange={setIsMediaPickerOpen}
                                                onSelect={(url) => setFormData({ ...formData, hero_image: url })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="service-description">Description</Label>
                                            <Textarea
                                                id="service-description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="service-tag">Tag (Optional)</Label>
                                            <Input
                                                id="service-tag"
                                                value={formData.tag}
                                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                                placeholder="e.g. Popular"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="features" className="mt-4">
                                        <FeaturesEditor
                                            features={formData.features || []}
                                            onChange={(f) => setFormData({ ...formData, features: f })}
                                        />
                                    </TabsContent>

                                    <TabsContent value="process" className="mt-4">
                                        <ProcessEditor
                                            steps={formData.process_steps || []}
                                            onChange={(s) => setFormData({ ...formData, process_steps: s })}
                                        />
                                    </TabsContent>

                                    <TabsContent value="faq" className="mt-4">
                                        <FAQEditor
                                            faq={formData.faq || []}
                                            onChange={(f) => setFormData({ ...formData, faq: f })}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                            <div className="shrink-0 px-6 py-4 border-t border-zinc-800 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
                                    {isSaving ? "Saving..." : editingService ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                </DialogContent>
            </Dialog>

            <DataTable 
                data={services} 
                columns={columns} 
                isLoading={isLoading} 
                emptyIcon={Briefcase}
                emptyTitle="No services found"
                emptyDescription="You haven't added any services yet. Create one to get started."
                emptyAction={
                    <Button onClick={() => setIsDialogOpen(true)} variant="primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                    </Button>
                }
            />
        </div>
    );
};

export default AdminServices;
