import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, ImagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ServiceDetail, Feature, ProcessStep, FAQItem } from "@repo/types";
import { FeaturesEditor, ProcessEditor, FAQEditor } from "@/components/admin/ServiceFormFields";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ICONS = ["Home", "Building2", "Palette", "Lightbulb", "Sofa", "PenTool", "Lamp", "UtensilsCrossed", "Bed"];
const CATEGORIES = [
    { id: "residential", label: "Residential" },
    { id: "commercial", label: "Commercial" },
    { id: "specialized", label: "Specialized" }
];

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
    }, []);

    const fetchServices = async () => {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('display_order', { ascending: true });

        if (data) {
            // Need to ensure JSON fields are parsed if Supabase returns them as strings (though pg usually handles this)
            // But we cast to ServiceDetail[] assuming the API/Supabase client types are aligned or raw data matches
            setServices(data as unknown as ServiceDetail[]);
        }
        setIsLoading(false);
    };

    const handleEdit = (service: ServiceDetail) => {
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) {
            toast({
                title: "Error deleting service",
                variant: "destructive",
            });
        } else {
            toast({ title: "Service deleted successfully" });
            fetchServices();
        }
    };

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const serviceData = {
                title: formData.title,
                slug: formData.slug || generateSlug(formData.title || ""),
                description: formData.description,
                hero_image: formData.hero_image,
                category_id: formData.category_id,
                icon: formData.icon,
                tag: formData.tag || null,
                features: formData.features,
                process_steps: formData.process_steps,
                faq: formData.faq
            };

            if (editingService) {
                const { error } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', editingService.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert([{ ...serviceData, display_order: services.length + 1 }]);
                if (error) throw error;
            }

            toast({
                title: editingService ? "Service updated!" : "Service created!",
            });

            setIsDialogOpen(false);
            setEditingService(null);
            fetchServices();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error saving service",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNewService = () => {
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Services</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold">Services</h1>
                    <p className="text-muted-foreground mt-1">Manage your service offerings</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="gold" onClick={handleNewService}>
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
                                                <Label>Title</Label>
                                                <Input
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
                                                <Label>Slug</Label>
                                                <Input
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select
                                                    value={formData.category_id}
                                                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                                >
                                                    <SelectTrigger>
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
                                                <Label>Icon</Label>
                                                <Select
                                                    value={formData.icon}
                                                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                                                >
                                                    <SelectTrigger>
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
                                            <Label>Hero Image URL</Label>
                                            <div className="flex gap-2">
                                                <Input
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
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="bg-card border-border h-full">
                            <CardContent className="p-6 relative">
                                {service.tag && (
                                    <div className="absolute top-4 right-4">
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                            {service.tag}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <span className="text-sm text-muted-foreground font-mono">Icon: {service.icon}</span>
                                </div>

                                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                    {service.description}
                                </p>

                                <div className="flex gap-2 mt-auto">
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleEdit(service)}>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="outline" className="px-3" onClick={() => handleDelete(service.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No services found. Add your first service above!
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminServices;
