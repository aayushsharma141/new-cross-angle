import React from 'react';
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/primitives/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/primitives/select";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import { portfolioSchema, formatZodErrors } from "@/lib/validation/validations";
import { Switch } from "@/components/ui/primitives/switch";
import FocusLock from "react-focus-lock";

interface Category {
    id: string;
    name: string;
}

interface ProjectRow {
    id: string;
    title: string;
    slug: string | null;
    short_description?: string | null;
    category_id?: string | null;
    client_name?: string | null;
    location?: string | null;
    area?: string | null;
    budget?: string | null;
    duration?: string | null;
    style_tags?: string[] | null;
    year_completed?: number | null;
    cover_image_url?: string | null;
    description?: unknown;
    featured?: boolean | null;
    status?: string | null;
    published_at?: string | null;
}

interface PortfolioFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: ProjectRow | null;
    onSuccess: () => void;
}

export function PortfolioFormDialog({ open, onOpenChange, initialData, onSuccess }: PortfolioFormDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const { toast } = useToast();

    // Form state matching the new schema
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        short_description: "",
        category_id: "",
        client_name: "",
        location: "",
        area: "",
        budget: "",
        duration: "",
        style: "",
        year_completed: new Date().getFullYear(),
        cover_image_url: "",
        brief: "",
        approach: "",
        video_url: "",
        hero_image_url: "",
        is_featured: false,
        status: "draft" as "draft" | "live",
    });

    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('project_categories')
            .select('id, name')
            .order('display_order');

        if (data) {
            setCategories(data);
        }
    };

    useEffect(() => {
        if (initialData) {
            // Parse description JSONB
            const desc = typeof initialData.description === 'string'
                ? JSON.parse(initialData.description)
                : (initialData.description || {});

            setFormData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                short_description: initialData.short_description || "",
                category_id: initialData.category_id || "",
                client_name: initialData.client_name || "",
                location: initialData.location || "",
                area: desc.area || "",
                budget: desc.budget || "",
                duration: desc.duration || "",
                style: (initialData.style_tags && initialData.style_tags[0]) || "", // Taking first tag
                year_completed: initialData.year_completed || new Date().getFullYear(),
                cover_image_url: initialData.cover_image_url || "",
                brief: desc.brief || "",
                approach: desc.approach || "",
                video_url: desc.video_url || "",
                hero_image_url: desc.hero_image_url || "",
                is_featured: initialData.featured || false,
                status: initialData.status === 'live' ? 'live' : 'draft',
            });
            setActiveTab("general");
        } else {
            // Reset form
            setFormData({
                title: "",
                slug: "",
                short_description: "",
                category_id: "",
                client_name: "",
                location: "",
                area: "",
                budget: "",
                duration: "",
                style: "",
                year_completed: new Date().getFullYear(),
                cover_image_url: "",
                brief: "",
                approach: "",
                video_url: "",
                hero_image_url: "",
                is_featured: false,
                status: "draft",
            });
            setActiveTab("general");
        }
    }, [initialData, open]);

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (title: string) => {
        if (!initialData) {
            const slug = generateSlug(title);
            setFormData(prev => ({ ...prev, title, slug }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    // File uploads are now handled inside MediaPickerField

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate with Zod before saving
        const validation = portfolioSchema.safeParse(formData);
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
            // Construct description JSONB
            const descriptionData = {
                area: formData.area,
                budget: formData.budget,
                duration: formData.duration,
                brief: formData.brief,
                approach: formData.approach,
                video_url: formData.video_url,
                hero_image_url: formData.hero_image_url
            };

            const itemData = {
                title: formData.title,
                slug: formData.slug || generateSlug(formData.title),
                category_id: formData.category_id || null, // Ensure null if empty string
                client_name: formData.client_name,
                location: formData.location,
                year_completed: formData.year_completed,
                style_tags: formData.style ? [formData.style] : [],
                short_description: formData.short_description,
                description: descriptionData,
                cover_image_url: formData.cover_image_url,
                featured: formData.is_featured,
                status: formData.status,
                published_at: formData.status === 'live' && (!initialData?.published_at) ? new Date().toISOString() : (initialData?.published_at || null),
            };

            // Remove category_id if empty string to avoid UUID error
            if (itemData.category_id === "") {
                itemData.category_id = null;
            }

            if (initialData?.id) {
                const { error } = await supabase
                    .from('projects')
                    .update(itemData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('projects')
                    .insert(itemData);
                if (error) throw error;
            }

            toast({
                title: initialData ? "Project updated!" : "Project created!",
            });

            onSuccess();
            onOpenChange(false);
        } catch {
            toast({
                title: "Error saving project",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="admin-theme max-w-4xl max-h-[90vh] overflow-y-auto bg-admin-card border-admin-border text-admin-text">
                <FocusLock returnFocus>
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Project" : "New Project"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 p-1 mb-6">
                            <TabsTrigger value="general" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">General Info</TabsTrigger>
                            <TabsTrigger value="media" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Media</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="general" className="space-y-6 mt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-title">Title</Label>
                                    <Input
                                        id="portfolio-title"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-slug">Slug</Label>
                                    <Input
                                        id="portfolio-slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-category">Category</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                    >
                                        <SelectTrigger id="portfolio-category">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: "draft" | "live") => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger id="portfolio-status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="live">Live (Published)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-client">Client</Label>
                                    <Input id="portfolio-client" value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-location">Location</Label>
                                    <Input id="portfolio-location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-year">Year Completed</Label>
                                    <Input id="portfolio-year" type="number" value={formData.year_completed} onChange={(e) => setFormData({ ...formData, year_completed: parseInt(e.target.value) || new Date().getFullYear() })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-area">Area</Label>
                                    <Input id="portfolio-area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="e.g. 2500 sqft" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-budget">Budget</Label>
                                    <Input id="portfolio-budget" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="e.g. ₹500k" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-duration">Duration</Label>
                                    <Input id="portfolio-duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 6 months" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-style">Style Tag</Label>
                                    <Input id="portfolio-style" value={formData.style} onChange={(e) => setFormData({ ...formData, style: e.target.value })} placeholder="e.g. Modern" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="portfolio-short-desc">Short Description</Label>
                                <Textarea
                                    id="portfolio-short-desc"
                                    value={formData.short_description}
                                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-brief">Brief</Label>
                                    <Textarea
                                        id="portfolio-brief"
                                        value={formData.brief}
                                        onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                                        rows={3}
                                        placeholder="Project brief..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio-approach">Approach</Label>
                                    <Textarea
                                        id="portfolio-approach"
                                        value={formData.approach}
                                        onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                                        rows={3}
                                        placeholder="Design approach..."
                                    />
                                </div>
                            </div>
                        
                            <div className="flex items-center gap-2 pt-2">
                                <Switch
                                    id="portfolio-featured"
                                    checked={formData.is_featured}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                                />
                                <Label htmlFor="portfolio-featured">Featured project (Show on Home Page)</Label>
                            </div>
                        </TabsContent>

                        <TabsContent value="media" className="space-y-8 mt-0">
                            {/* Grid Cover Image */}
                            <div className="space-y-3 bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                                <div>
                                    <Label htmlFor="portfolio-cover-image" className="text-base font-semibold text-white">Grid Cover Image</Label>
                                    <p className="text-sm text-zinc-500 mb-4">Displayed on the portfolio listing page.</p>
                                </div>
                                <div className="max-w-xl">
                                    <MediaPickerField
                                        value={formData.cover_image_url}
                                        onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                                        placeholder="Cover Image URL"
                                    />
                                </div>
                            </div>

                            {/* Project Page Hero */}
                            <div className="space-y-3 bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                                <div>
                                    <Label htmlFor="portfolio-hero-image" className="text-base font-semibold text-white">Project Detail Hero Image</Label>
                                    <p className="text-sm text-zinc-500 mb-4">The massive banner image shown at the top of the individual project page. Falls back to Grid Cover if empty.</p>
                                </div>
                                <div className="max-w-xl">
                                    <MediaPickerField
                                        value={formData.hero_image_url}
                                        onChange={(url) => setFormData({ ...formData, hero_image_url: url })}
                                        placeholder="Hero Image URL"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[hsl(var(--brand-primary))]" disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {initialData ? "Update Project" : "Create Project"}
                        </Button>
                    </div>
                </form>
                </FocusLock>
            </DialogContent>
        </Dialog>
    );
}
