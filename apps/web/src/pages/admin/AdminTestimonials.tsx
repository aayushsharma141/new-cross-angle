import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Edit, Plus, X, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/admin/EmptyState";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AdminTestimonials() {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        author_name: "",
        role: "",
        content: "",
        rating: 5,
        is_featured: true,
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch testimonials
    const { data: testimonials, isLoading } = useQuery({
        queryKey: ["testimonials"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("testimonials")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: async (vars: typeof formData & { id?: number }) => {
            if (vars.id) {
                const { error } = await supabase
                    .from("testimonials")
                    .update(vars)
                    .eq("id", vars.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("testimonials")
                    .insert([vars]);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonials"] });
            setIsOpen(false);
            resetForm();
            toast({ title: "Success", description: "Testimonial saved successfully." });
        },
        onError: (error) => {
            toast({ variant: "destructive", title: "Error", description: error.message });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from("testimonials").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonials"] });
            toast({ title: "Deleted", description: "Testimonial removed." });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ ...formData, id: editingId ?? undefined });
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            author_name: item.author_name,
            role: item.role,
            content: item.content,
            rating: item.rating,
            is_featured: item.is_featured,
        });
        setIsOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ author_name: "", role: "", content: "", rating: 5, is_featured: true });
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Testimonials</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">Testimonials</h2>
                    <p className="text-[hsl(var(--admin-muted))]">Manage client reviews and feedback.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="author">Author Name</Label>
                            <Input
                                id="author"
                                value={formData.author_name}
                                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role / Project</Label>
                            <Input
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="e.g. Homeowner, Villa Renovation"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Review</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rating">Rating (1-5)</Label>
                            <Input
                                id="rating"
                                type="number"
                                min="1"
                                max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? "Saving..." : "Save Testimonial"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : !testimonials || testimonials.length === 0 ? (
                <EmptyState
                    icon={MessageSquare}
                    title="No testimonials yet"
                    description="Start building trust by adding client testimonials and reviews"
                    primaryAction={{
                        label: "Add Testimonial",
                        onClick: () => { resetForm(); setIsOpen(true); },
                        icon: Plus
                    }}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials?.map((item: any) => (
                        <Card key={item.id} className="relative group overflow-hidden border-[hsl(var(--admin-border))]">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{item.author_name}</CardTitle>
                                        <CardDescription>{item.role}</CardDescription>
                                    </div>
                                    <div className="flex bg-yellow-50 px-2 py-1 rounded text-yellow-600">
                                        <Star className="w-3 h-3 fill-current mr-1 self-center" />
                                        <span className="text-xs font-bold">{item.rating}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-[hsl(var(--admin-muted))] line-clamp-3">"{item.content}"</p>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
