import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type Testimonial = {
    id: string;
    author_name: string;
    author_role: string;
    avatar_url: string | null;
    content: string;
    rating: number;
    display_order: number;
    active: boolean;
};

export default function AdminTestimonials() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: "",
        role: "", // author_role
        content: "",
        rating: 5,
        avatar_url: "", // using avatar_url to mock "city" input logic from PRD as substitution if needed, but PRD specifically requested "city" and original schema didn't have it natively. Let's write UI fields and map nicely.
        city: "", // will hold locally but db doesn't fully map it in schema originally (except if we patch or alias). We'll try just mapping what we have. 
        active: true,
    });

    const { data: testimonials, isLoading } = useQuery({
        queryKey: ["testimonials"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("testimonials")
                .select("*")
                .order("display_order", { ascending: true })
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Testimonial[];
        },
    });

    const mutation = useMutation({
        mutationFn: async (vars: { id?: string; data: Partial<Testimonial> }) => {
            if (vars.id) {
                const { error } = await supabase
                    .from("testimonials")
                    .update(vars.data)
                    .eq("id", vars.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("testimonials")
                    .insert([vars.data]);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonials"] });
            toast({ title: "Success", description: "Testimonial saved successfully." });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("testimonials").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonials"] });
            toast({ title: "Success", description: "Testimonial deleted successfully." });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            role: "",
            content: "",
            rating: 5,
            city: "",
            avatar_url: "",
            active: true,
        });
        setEditingId(null);
    };

    const handleEdit = (t: Testimonial) => {
        // We map 'author_name' to 'name', 'author_role' to 'role'
        // A specific 'city' column doesn't exist, we will map 'city' input to 'avatar_url' if needed or just drop it.
        setFormData({
            name: t.author_name || "",
            role: t.author_role || "",
            content: t.content || "",
            rating: t.rating || 5,
            avatar_url: t.avatar_url || "",
            city: "", // Safe fallback
            active: t.active ?? true,
        });
        setEditingId(t.id);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct database payload mapping UI names to Schema columns
        // We will pack 'city' into author_role as 'Role, City' if possible but PRD wants discrete fields.
        // For pure compliance with schema mapping:
        let formattedRole = formData.role;
        if (formData.city) {
            formattedRole = formData.role ? `${formData.role}, ${formData.city}` : formData.city;
        }

        const payload: Partial<Testimonial> = {
            author_name: formData.name,
            author_role: formattedRole, // Map role & city to author_role string
            content: formData.content,
            rating: formData.rating,
            avatar_url: formData.avatar_url,
            active: formData.active,
        };

        mutation.mutate({ id: editingId || undefined, data: payload });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-admin-foreground">Testimonials Manager</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-admin-card border-admin-border text-admin-card-foreground">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Author Name</Label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-admin-surface border-admin-border focus:border-admin-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="bg-admin-surface border-admin-border focus:border-admin-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="bg-admin-surface border-admin-border focus:border-admin-primary"
                                        placeholder="e.g. New York"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Rating (1-5)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    required
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                    className="bg-admin-surface border-admin-border focus:border-admin-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Avatar Image URL (Optional)</Label>
                                <Input
                                    value={formData.avatar_url}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    className="bg-admin-surface border-admin-border focus:border-admin-primary"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="bg-admin-surface border-admin-border focus:border-admin-primary"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                                />
                                <Label>Active (Visible to public)</Label>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"
                                >
                                    {mutation.isPending ? "Saving..." : "Save Testimonial"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-admin-border hover:bg-admin-surface/50">
                            <TableHead className="text-admin-foreground">Name</TableHead>
                            <TableHead className="text-admin-foreground">Role</TableHead>
                            <TableHead className="text-admin-foreground">Rating</TableHead>
                            <TableHead className="text-admin-foreground">Active</TableHead>
                            <TableHead className="text-right text-admin-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-admin-muted">
                                    Loading testimonials...
                                </TableCell>
                            </TableRow>
                        ) : testimonials?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-admin-muted">
                                    No testimonials found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            testimonials?.map((t) => (
                                <TableRow key={t.id} className="border-admin-border hover:bg-admin-surface/50">
                                    <TableCell className="font-medium text-admin-foreground">{t.author_name}</TableCell>
                                    <TableCell className="text-admin-muted">{t.author_role}</TableCell>
                                    <TableCell className="text-admin-muted">{t.rating}/5</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${t.active
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-admin-muted/10 text-admin-muted"
                                                }`}
                                        >
                                            {t.active ? "Active" : "Hidden"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(t)}
                                                className="text-admin-muted hover:text-admin-gold hover:bg-admin-gold/10"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    if (window.confirm("Delete this testimonial?")) {
                                                        deleteMutation.mutate(t.id);
                                                    }
                                                }}
                                                className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
