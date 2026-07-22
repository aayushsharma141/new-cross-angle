import React from 'react';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSafeAction, AdminEmptyState, AdminSkeletonCard } from "@/components/admin/shared";
import { AdminAddCard } from "@/components/admin/shared/AdminEmptyState";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Textarea } from "@/components/primitives/interactive";
import { Label } from "@/components/ui/primitives/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/primitives/dialog";
import { ListOrdered, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import { Image } from "@/components/ui/enhanced/image";
import * as LucideIcons from "lucide-react";

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

    const handleDelete = async (id: string): Promise<void> => {
        await deleteMutation.mutateAsync(id);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[hsl(var(--admin-card))] rounded-xl border border-[hsl(var(--admin-border))]">
                <div className="w-12 h-12 bg-[hsl(var(--admin-danger)/0.1)] rounded-full flex items-center justify-center mb-4">
                    <ListOrdered className="w-6 h-6 text-[hsl(var(--admin-danger))]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[hsl(var(--admin-text))]">Failed to load process steps</h3>
                <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-2">{error.message}</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["design-process-steps"] })} className="mt-4" variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

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
            
            
            <div className="flex flex-col gap-[10px] mt-6">
                {isLoading ? (
                    <>
                        <AdminSkeletonCard size="lg" />
                        <AdminSkeletonCard size="lg" />
                        <AdminSkeletonCard size="lg" />
                    </>
                ) : steps.length === 0 ? (
                    <div className="fade-up-1">
                        <AdminEmptyState 
                            icon={ListOrdered}
                            title="No process steps found"
                            description="You haven't defined any steps for your design process."
                        />
                    </div>
                ) : (
                    steps.map((step, i) => {
                        const delayClass = `fade-up-${Math.min((i % 4) + 1, 4)}`;
                        
                        // Dynamically render the icon if available
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const StepIcon = (LucideIcons as any)[step.icon_name] || LucideIcons.CheckCircle;
                        
                        return (
                            <div key={step.id} className={`${delayClass} group`}>
                                <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-200 grid grid-cols-[44px_1fr_auto] gap-4 items-center">
                                    
                                    {/* Icon / Image */}
                                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center shrink-0 overflow-hidden relative">
                                        {step.image_url ? (
                                            <>
                                                <Image src={step.image_url} alt={step.title} className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <StepIcon className="w-5 h-5 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <StepIcon className="w-5 h-5 text-[hsl(var(--admin-accent))]" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                            <span className="text-[15px] font-bold text-[hsl(var(--admin-text))]">
                                                {step.step_number}. {step.title}
                                            </span>
                                            <span className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-text-muted))] tracking-wide uppercase">
                                                Order: {step.display_order}
                                            </span>
                                        </div>
                                        
                                        <div className="text-[13px] text-[hsl(var(--admin-text))] font-medium mb-1">
                                            {step.subtitle}
                                        </div>
                                        
                                        <div className="text-[13px] text-[hsl(var(--admin-text-muted))] truncate max-w-2xl">
                                            {step.description}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(step)}
                                            className="px-2.5 py-2 rounded-[7px] text-[12px] font-normal bg-transparent border border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-150 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Edit2 className="w-[13px] h-[13px]" />
                                            Edit
                                        </button>
                                        
                                        <AdminSafeAction
                                            icon={Trash2}
                                            label="Delete"
                                            confirmLabel="Delete step?"
                                            onConfirm={() => handleDelete(step.id)}
                                            danger
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {!isLoading && (
                <div className="fade-up-3 mt-[10px]">
                    <AdminAddCard 
                        label="Add a new process step"
                        onClick={() => {
                            setEditingStep(null);
                            setSelectedImage(null);
                            setIsDialogOpen(true);
                        }}
                    />
                </div>
            )}

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
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-admin-card border-admin-border text-admin-text">
                    <DialogHeader>
                        <DialogTitle className="text-[hsl(var(--admin-text))]">{editingStep ? "Edit Process Step" : "Add Process Step"}</DialogTitle>
                        <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
                            {editingStep ? "Update the details of this design process step." : "Add a new step to your design process."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4 font-sans">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="step_number" className="text-[hsl(var(--admin-text))]">Step Number</Label>
                                        <Input
                                            id="step_number"
                                            name="step_number"
                                            placeholder="e.g. 01"
                                            defaultValue={editingStep?.step_number || ""}
                                            required
                                            className="admin-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="display_order" className="text-[hsl(var(--admin-text))]">Display Order</Label>
                                        <Input
                                            id="display_order"
                                            name="display_order"
                                            type="number"
                                            defaultValue={editingStep?.display_order || 0}
                                            required
                                            className="admin-input"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-[hsl(var(--admin-text))]">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g. Consult"
                                        defaultValue={editingStep?.title || ""}
                                        required
                                        className="admin-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subtitle" className="text-[hsl(var(--admin-text))]">Subtitle</Label>
                                    <Input
                                        id="subtitle"
                                        name="subtitle"
                                        placeholder="e.g. Private Briefing"
                                        defaultValue={editingStep?.subtitle || ""}
                                        required
                                        className="admin-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kicker" className="text-[hsl(var(--admin-text))]">Kicker (Optional)</Label>
                                    <Input
                                        id="kicker"
                                        name="kicker"
                                        placeholder="e.g. Stage One"
                                        defaultValue={editingStep?.kicker || ""}
                                        className="admin-input"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="icon_name" className="text-[hsl(var(--admin-text))]">Icon Name (Lucide)</Label>
                                    <Input
                                        id="icon_name"
                                        name="icon_name"
                                        placeholder="e.g. Home, Ruler, Palette"
                                        defaultValue={editingStep?.icon_name || "Check"}
                                        required
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[hsl(var(--admin-text))]">Step Image</Label>
                                    <MediaPickerField
                                        value={selectedImage || ""}
                                        onChange={(url) => setSelectedImage(url)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image_alt" className="text-[hsl(var(--admin-text))]">Image Alt Text (Optional)</Label>
                                    <Input
                                        id="image_alt"
                                        name="image_alt"
                                        placeholder="Describe the image�"
                                        defaultValue={editingStep?.image_alt || ""}
                                        className="admin-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[hsl(var(--admin-text))]">Short Description</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Brief summary of the step�"
                                defaultValue={editingStep?.description || ""}
                                required
                                className="admin-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="detail" className="text-[hsl(var(--admin-text))]">Detailed Description</Label>
                            <Textarea
                                id="detail"
                                name="detail"
                                placeholder="Full details about this process step�"
                                defaultValue={editingStep?.detail || ""}
                                required
                                className="admin-input min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--admin-border))] mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="admin-btn-secondary"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="admin-btn-primary"
                            >
                                {(createMutation.isPending || updateMutation.isPending) ? (
                                    "Saving�"
                                ) : (
                                    editingStep ? "Update Step" : "Create Step"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>


        </div>
    );
}
