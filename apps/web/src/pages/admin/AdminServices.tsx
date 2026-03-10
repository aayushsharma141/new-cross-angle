import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, ImagePlus, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceDetail } from "@repo/types";
import { FeaturesEditor, ProcessEditor, FAQEditor } from "@/components/admin/ServiceFormFields";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/design-system/components/Table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { EmptyState, LoadingState } from "@/design-system/components/states";

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
                    category_id: descJson.category_id || "residential", // Storing category in description or fallback
                    // Start: Schema mapping
                    description: descJson.content || item.short_description || "",
                    hero_image: item.icon_url || "", // Using icon_url for hero image for now, or we store it in desc
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
        setIsSaving(true);

        try {
            // Prepare the JSONB description object
            const descriptionData = {
                content: formData.description,
                features: formData.features,
                icon: formData.icon,
                category_id: formData.category_id
            };

            const servicePayload = {
                name: formData.title,
                slug: formData.slug || generateSlug(formData.title || ""),
                description: descriptionData,
                icon_url: formData.hero_image, // Storing hero image in icon_url or maybe distinct column? DB has icon_url.
                short_tag: formData.tag || null,
                display_order: services.length + 1,
                active: true
            };

            let serviceId = editingService?.id;

            if (editingService) {
                const { error } = await supabase
                    .from('services')
                    .update(servicePayload)
                    .eq('id', editingService.id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('services')
                    .insert([servicePayload])
                    .select()
                    .single();
                if (error) throw error;
                serviceId = data.id;
            }

            if (serviceId) {
                // Handle Steps
                // First delete existing steps for this service
                await supabase.from('service_steps').delete().eq('service_id', serviceId);

                // Insert new steps
                if (formData.process_steps && formData.process_steps.length > 0) {
                    const stepsPayload = formData.process_steps.map((step, index) => ({
                        service_id: serviceId,
                        step_number: index + 1,
                        title: step.title,
                        description: step.description
                    }));
                    const { error: stepsError } = await supabase.from('service_steps').insert(stepsPayload);
                    if (stepsError) throw stepsError;
                }

                // Handle FAQs
                // First delete existing faqs
                await supabase.from('service_faqs').delete().eq('service_id', serviceId);

                // Insert new faqs
                if (formData.faq && formData.faq.length > 0) {
                    const faqPayload = formData.faq.map((f, index) => ({
                        service_id: serviceId,
                        display_order: index + 1,
                        question: f.question,
                        answer: f.answer
                    }));
                    const { error: faqError } = await supabase.from('service_faqs').insert(faqPayload);
                    if (faqError) throw faqError;
                }
            }

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

    if (isLoading) {
        return (
            <LoadingState
                title="Loading Services"
                description="Fetching your service offerings..."
                size="lg"
            />
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Services"
                description="Manage your service offerings"
            >
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="primary" onClick={handleNewService}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>
                                {editingService ? "Edit Service" : "New Service"}
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="flex-1 pr-4">
                            <form onSubmit={handleSubmit} className="space-y-6 pb-6">
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
                                            <Label>Description</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tag (Optional)</Label>
                                            <Input
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

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="gold" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {editingService ? "Update" : "Create"}
                                    </Button>
                                </div>
                            </form>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm mt-8">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-slate-300">Name & Desc</TableHead>
                            <TableHead className="text-slate-300">Category</TableHead>
                            <TableHead className="text-slate-300">Status</TableHead>
                            <TableHead className="text-right text-slate-300">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map((service, index) => (
                            <TableRow
                                key={service.id}
                                className="border-white/10 hover:bg-white/5 transition-colors"
                            >
                                <TableCell className="font-medium text-slate-200">
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
                                </TableCell>
                                <TableCell className="text-slate-300 capitalize">
                                    {service.category_id || "residential"}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={"published"} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => handleEdit(service)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => handleDelete(service.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {services.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="p-0">
                                    <EmptyState
                                        icon={Briefcase}
                                        title="No services found"
                                        description="You haven't added any services yet. Create one to get started."
                                        action={
                                            <Button onClick={() => setIsDialogOpen(true)} variant="gold">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Service
                                            </Button>
                                        }
                                        className="border-0 rounded-none bg-transparent"
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default AdminServices;
