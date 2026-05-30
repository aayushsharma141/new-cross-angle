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
import { Plus, Loader2, ListOrdered, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { Image } from "@/components/ui/enhanced/image";

interface ProcessStep {
    id: string;
    step_number: string;
    title: string;
    subtitle: string;
    kicker: string | null;
    description: string;
    detail: string;
    icon_name: string;
    image_url: string | null;
    image_alt: string | null;
    display_order: number;
}

export default function AdminProcessSteps() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: steps = [], isLoading, error } = useQuery<ProcessStep[]>({
        queryKey: ["design-process-steps"],
        queryFn: async (): Promise<ProcessStep[]> => {
            const { data, error } = await supabase
                .from("design_process_steps")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) {
                console.error("Error fetching process steps:", error);
                throw error;
            }
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newStep: Omit<ProcessStep, "id">) => {
            const { data, error } = await supabase
                .from("design_process_steps")
                .insert([newStep])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["design-process-steps"] });
            queryClient.invalidateQueries({ queryKey: ["designProcessSteps"] });
            toast({
                title: "Step Created",
                description: "New process step has been added successfully.",
            });
            setIsDialogOpen(false);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create step.",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (step: ProcessStep) => {
            const { data, error } = await supabase
                .from("design_process_steps")
                .update({
                    step_number: step.step_number,
                    title: step.title,
                    subtitle: step.subtitle,
                    kicker: step.kicker,
                    description: step.description,
                    detail: step.detail,
                    icon_name: step.icon_name,
                    image_url: step.image_url,
                    image_alt: step.image_alt,
                    display_order: step.display_order,
                })
                .eq("id", step.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["design-process-steps"] });
            queryClient.invalidateQueries({ queryKey: ["designProcessSteps"] });
            toast({
                title: "Step Updated",
                description: "The process step has been updated.",
            });
            setIsDialogOpen(false);
            setEditingStep(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update step.",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("design_process_steps").delete().eq("id", id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["design-process-steps"] });
            queryClient.invalidateQueries({ queryKey: ["designProcessSteps"] });
            toast({
                title: "Step Deleted",
                description: "The process step has been removed.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete step.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const stepData = {
            step_number: formData.get("step_number") as string,
            title: formData.get("title") as string,
            subtitle: formData.get("subtitle") as string,
            kicker: formData.get("kicker") as string,
            description: formData.get("description") as string,
            detail: formData.get("detail") as string,
            icon_name: formData.get("icon_name") as string,
            image_url: selectedImage,
            image_alt: formData.get("image_alt") as string,
            display_order: parseInt(formData.get("display_order") as string) || 0,
        };

        if (editingStep) {
            updateMutation.mutate({ ...stepData, id: editingStep.id });
        } else {
            createMutation.mutate(stepData);
        }
    };

    const handleEdit = (step: ProcessStep) => {
        setEditingStep(step);
        setSelectedImage(step.image_url);
        setIsDialogOpen(true);
    };

    const handleDelete = (step: ProcessStep) => {
        if (window.confirm("Are you sure you want to delete this process step?")) {
            deleteMutation.mutate(step.id);
        }
    };

    const columns = [
        {
            key: "step_number",
            header: "No.",
            cell: (item: ProcessStep) => <span className="font-bold">{item.step_number}</span>
        },
        { key: "title", header: "Title", cell: (item: ProcessStep) => item.title },
        { key: "subtitle", header: "Subtitle", cell: (item: ProcessStep) => item.subtitle },
        { 
            key: "image_url", 
            header: "Image",
            cell: (item: ProcessStep) => item.image_url ? (
                <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                    <Image src={item.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
            ) : <span className="text-muted-foreground text-xs">No image</span>
        },
        { key: "display_order", header: "Order", cell: (item: ProcessStep) => item.display_order },
        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (item: ProcessStep) => (
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
                    <ListOrdered className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-medium">Failed to load process steps</h3>
                <p className="text-muted-foreground mt-2">{error.message}</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["design-process-steps"] })} className="mt-4">
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
                        if (!open) {
                            setEditingStep(null);
                            setSelectedImage(null);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Process Step
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingStep ? "Edit Process Step" : "Add Process Step"}</DialogTitle>
                            <DialogDescription>
                                {editingStep ? "Update the details of this design process step." : "Add a new step to your design process."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="step_number">Step Number</Label>
                                            <Input
                                                id="step_number"
                                                name="step_number"
                                                placeholder="e.g. 01"
                                                defaultValue={editingStep?.step_number || ""}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="display_order">Display Order</Label>
                                            <Input
                                                id="display_order"
                                                name="display_order"
                                                type="number"
                                                defaultValue={editingStep?.display_order || 0}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="e.g. Consult"
                                            defaultValue={editingStep?.title || ""}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subtitle">Subtitle</Label>
                                        <Input
                                            id="subtitle"
                                            name="subtitle"
                                            placeholder="e.g. Private Briefing"
                                            defaultValue={editingStep?.subtitle || ""}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="kicker">Kicker (Optional)</Label>
                                        <Input
                                            id="kicker"
                                            name="kicker"
                                            placeholder="e.g. Stage One"
                                            defaultValue={editingStep?.kicker || ""}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="icon_name">Icon Name (Lucide)</Label>
                                        <Input
                                            id="icon_name"
                                            name="icon_name"
                                            placeholder="e.g. Home, Ruler, Palette"
                                            defaultValue={editingStep?.icon_name || "Check"}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Step Image</Label>
                                        <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-3">
                                            {selectedImage ? (
                                                <div className="relative w-full aspect-video rounded overflow-hidden">
                                                    <Image src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                                                    <Button 
                                                        type="button" 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        className="absolute top-2 right-2"
                                                        onClick={() => setSelectedImage(null)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center flex flex-col items-center text-muted-foreground">
                                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                    <p className="text-sm">No image selected</p>
                                                </div>
                                            )}
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsMediaPickerOpen(true)}
                                                className="w-full"
                                            >
                                                {selectedImage ? "Change Image" : "Select Image"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image_alt">Image Alt Text (Optional)</Label>
                                        <Input
                                            id="image_alt"
                                            name="image_alt"
                                            placeholder="Describe the image..."
                                            defaultValue={editingStep?.image_alt || ""}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="Brief summary of the step..."
                                    defaultValue={editingStep?.description || ""}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="detail">Detailed Description</Label>
                                <Textarea
                                    id="detail"
                                    name="detail"
                                    placeholder="Full details about this process step..."
                                    defaultValue={editingStep?.detail || ""}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
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
                                    {editingStep ? "Update Step" : "Create Step"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </ModuleActions>

            <DataTable
                data={steps}
                columns={columns}
                isLoading={isLoading}
            />

            <MediaPickerModal
                open={isMediaPickerOpen}
                onOpenChange={setIsMediaPickerOpen}
                onSelect={(url) => {
                    setSelectedImage(url);
                    setIsMediaPickerOpen(false);
                }}
            />
        </div>
    );
}
