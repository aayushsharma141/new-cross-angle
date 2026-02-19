import { useState, useRef, useEffect } from "react";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface Category {
    id: string;
    name: string;
}

interface ProjectDescription {
    area?: string;
    budget?: string;
    duration?: string;
    brief?: string;
    approach?: string;
    video_url?: string;
}

interface ProjectRow {
    id: string;
    title: string;
    slug: string;
    short_description?: string;
    category_id?: string;
    client_name?: string;
    location?: string;
    area?: string;
    budget?: string;
    duration?: string;
    style_tags?: string[];
    year_completed?: number;
    cover_image_url?: string;
    description?: ProjectDescription | string | null;
    featured?: boolean;
    status?: string;
    published_at?: string;
}

interface PortfolioFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: ProjectRow | null;
    onSuccess: () => void;
}

export function PortfolioFormDialog({ open, onOpenChange, initialData, onSuccess }: PortfolioFormDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
        is_featured: false,
        status: "draft" as "draft" | "live",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data, error } = await supabase
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
                is_featured: initialData.featured || false,
                status: initialData.status === 'live' ? 'live' : 'draft',
            });
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
                is_featured: false,
                status: "draft",
            });
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `portfolio/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(filePath);

            setFormData({ ...formData, cover_image_url: publicUrl });
            toast({ title: "Image uploaded successfully" });
        } catch (error) {
            toast({
                title: "Upload failed",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Construct description JSONB
            const descriptionData = {
                area: formData.area,
                budget: formData.budget,
                duration: formData.duration,
                brief: formData.brief,
                approach: formData.approach,
                video_url: formData.video_url
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
        } catch (error) {
            console.error(error);
            toast({
                title: "Error saving project",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Project" : "New Project"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
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
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: "draft" | "live") => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="live">Live (Published)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Additional details */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Year Completed</Label>
                            <Input type="number" value={formData.year_completed} onChange={(e) => setFormData({ ...formData, year_completed: parseInt(e.target.value) || new Date().getFullYear() })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Area</Label>
                            <Input value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="e.g. 2500 sqft" />
                        </div>
                        <div className="space-y-2">
                            <Label>Budget</Label>
                            <Input value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="e.g. $500k" />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 6 months" />
                        </div>
                        <div className="space-y-2">
                            <Label>Style Tag</Label>
                            <Input value={formData.style} onChange={(e) => setFormData({ ...formData, style: e.target.value })} placeholder="e.g. Modern" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Short Description</Label>
                        <Textarea
                            value={formData.short_description}
                            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Brief</Label>
                            <Textarea
                                value={formData.brief}
                                onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                                rows={3}
                                placeholder="Project brief..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Approach</Label>
                            <Textarea
                                value={formData.approach}
                                onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                                rows={3}
                                placeholder="Design approach..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.cover_image_url}
                                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                                placeholder="Image URL"
                                className="flex-1"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                                aria-label="Upload cover image"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsMediaPickerOpen(true)}
                            >
                                <ImagePlus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.cover_image_url && (
                            <div className="relative mt-2 w-full h-40 group">
                                <img
                                    src={formData.cover_image_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                        />
                        <Label>Featured project (Show on Home Page)</Label>
                    </div>

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
            </DialogContent>

            <MediaPickerModal
                open={isMediaPickerOpen}
                onOpenChange={setIsMediaPickerOpen}
                onSelect={(url) => setFormData({ ...formData, cover_image_url: url })}
            />
        </Dialog>
    );
}
