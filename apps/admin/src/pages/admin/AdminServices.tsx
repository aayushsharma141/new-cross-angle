import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Home, Building2, Palette, Lightbulb, Sofa, PenTool } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    tag: string | null;
    display_order: number;
}

const ICONS = ["Home", "Building2", "Palette", "Lightbulb", "Sofa", "PenTool"];

import { Pagination } from "@repo/ui";

const ITEMS_PER_PAGE = 9;

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: "Home",
        tag: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchServices();
    }, [currentPage]);

    const fetchServices = async () => {
        setIsLoading(true);
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // Cast to any to bypass strict type checking for new table
        const { data, count, error } = await (supabase
            .from('services' as any)
            .select('*', { count: 'exact' })
            .order('display_order', { ascending: true })
            .range(from, to)) as any;

        if (data) {
            setServices(data);
        }

        if (count) {
            setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        }

        setIsLoading(false);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            title: service.title,
            description: service.description || "",
            icon: service.icon || "Home",
            tag: service.tag || ""
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        const { error } = await (supabase
            .from('services' as any)
            .delete()
            .eq('id', id)) as any;

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const serviceData = {
                title: formData.title,
                description: formData.description,
                icon: formData.icon,
                tag: formData.tag || null
            };

            if (editingService) {
                const { error } = await (supabase
                    .from('services' as any)
                    .update(serviceData)
                    .eq('id', editingService.id)) as any;
                if (error) throw error;
            } else {
                const { error } = await (supabase
                    .from('services' as any)
                    .insert([{ ...serviceData, display_order: services.length + 1 }])) as any;
                if (error) throw error;
            }

            toast({
                title: editingService ? "Service updated!" : "Service created!",
            });

            setIsDialogOpen(false);
            setEditingService(null);
            setFormData({
                title: "",
                description: "",
                icon: "Home",
                tag: ""
            });
            fetchServices();
        } catch (error: any) {
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
            description: "",
            icon: "Home",
            tag: ""
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
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingService ? "Edit Service" : "New Service"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
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
                                <Label>Icon</Label>
                                <Select
                                    value={formData.icon}
                                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ICONS.map((icon) => (
                                            <SelectItem key={icon} value={icon}>
                                                {icon}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tag (Optional)</Label>
                                <Input
                                    value={formData.tag}
                                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                    placeholder="e.g. Popular, Premium"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="gold" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {editingService ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
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
                                <p className="text-muted-foreground text-sm mb-4">
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

            {totalPages > 1 && (
                <div className="py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminServices;
