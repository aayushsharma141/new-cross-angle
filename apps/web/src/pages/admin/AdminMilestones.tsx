import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/primitives/dialog";
import { Plus, Loader2, ListOrdered, Pencil, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";

interface Milestone {
    id: string;
    year: string;
    title: string;
    event: string;
    display_order: number;
}

export default function AdminMilestones() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: milestones = [], isLoading, error } = useQuery<Milestone[]>({
        queryKey: ["studio-milestones"],
        queryFn: async (): Promise<Milestone[]> => {
            const { data, error } = await supabase
                .from("studio_milestones")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) {
                console.error("Error fetching milestones:", error);
                throw error;
            }
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newMilestone: Omit<Milestone, "id">) => {
            const { data, error } = await supabase
                .from("studio_milestones")
                .insert([newMilestone])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studio-milestones"] });
            queryClient.invalidateQueries({ queryKey: ["studioMilestones"] });
            toast({
                title: "Milestone Created",
                description: "New milestone has been added successfully.",
            });
            setIsDialogOpen(false);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create milestone.",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (milestone: Milestone) => {
            const { data, error } = await supabase
                .from("studio_milestones")
                .update({
                    year: milestone.year,
                    title: milestone.title,
                    event: milestone.event,
                    display_order: milestone.display_order,
                })
                .eq("id", milestone.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studio-milestones"] });
            queryClient.invalidateQueries({ queryKey: ["studioMilestones"] });
            toast({
                title: "Milestone Updated",
                description: "The milestone has been updated.",
            });
            setIsDialogOpen(false);
            setEditingMilestone(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update milestone.",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("studio_milestones").delete().eq("id", id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studio-milestones"] });
            queryClient.invalidateQueries({ queryKey: ["studioMilestones"] });
            toast({
                title: "Milestone Deleted",
                description: "The milestone has been removed.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete milestone.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const milestoneData = {
            year: formData.get("year") as string,
            title: formData.get("title") as string,
            event: formData.get("event") as string,
            display_order: parseInt(formData.get("display_order") as string) || 0,
        };

        if (editingMilestone) {
            updateMutation.mutate({ ...milestoneData, id: editingMilestone.id });
        } else {
            createMutation.mutate(milestoneData);
        }
    };

    const handleEdit = (milestone: Milestone) => {
        setEditingMilestone(milestone);
        setIsDialogOpen(true);
    };

    const handleDelete = (milestone: Milestone) => {
        if (window.confirm("Are you sure you want to delete this milestone?")) {
            deleteMutation.mutate(milestone.id);
        }
    };

    const columns = [
        {
            key: "year",
            header: "Year",
            cell: (item: Milestone) => (
                <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    {item.year}
                </div>
            )
        },
        { key: "title", header: "Title", cell: (item: Milestone) => item.title },
        { 
            key: "event", 
            header: "Event",
            cell: (item: Milestone) => <div className="max-w-xs truncate">{item.event}</div>
        },
        { key: "display_order", header: "Order", cell: (item: Milestone) => item.display_order },
        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (item: Milestone) => (
                <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(item)}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-lg border border-border">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-medium">Failed to load milestones</h3>
                <p className="text-muted-foreground mt-2">{error.message}</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["studio-milestones"] })} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ModuleActions>
                <Dialog 
                    open={isDialogOpen} 
                    onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingMilestone(null);
                    }}
                >
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Milestone
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-admin-card border-admin-border text-admin-text">
                        <DialogHeader>
                            <DialogTitle>{editingMilestone ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
                            <DialogDescription>
                                {editingMilestone ? "Update milestone details below." : "Add a new milestone to the studio timeline."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        name="year"
                                        placeholder="e.g. 2024"
                                        defaultValue={editingMilestone?.year || ""}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display_order">Display Order</Label>
                                    <Input
                                        id="display_order"
                                        name="display_order"
                                        type="number"
                                        defaultValue={editingMilestone?.display_order || 0}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. The Beginning"
                                    defaultValue={editingMilestone?.title || ""}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="event">Event Description</Label>
                                <Textarea
                                    id="event"
                                    name="event"
                                    placeholder="Describe the milestone event..."
                                    defaultValue={editingMilestone?.event || ""}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    {editingMilestone ? "Update Milestone" : "Create Milestone"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </ModuleActions>

            <DataTable
                data={milestones}
                columns={columns}
                isLoading={isLoading}
            />
        </div>
    );
}
