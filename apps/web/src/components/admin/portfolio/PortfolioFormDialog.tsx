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

const categories = ["Residential", "Commercial", "Hospitality", "Retail", "Office"];

interface PortfolioFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSuccess: () => void;
}

export function PortfolioFormDialog({ open, onOpenChange, initialData, onSuccess }: PortfolioFormDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        category: "Residential",
        client: "",
        location: "",
        type: "residential" as "residential" | "commercial",
        area: "",
        budget: "",
        duration: "",
        style: "",
        year: new Date().getFullYear(),
        hero_image: "",
        brief: "",
        approach: "",
        video_url: "",
        is_featured: false,
        status: "draft" as "draft" | "published",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                description: initialData.description || "",
                category: initialData.category || "Residential",
                client: initialData.client || "",
                location: initialData.location || "",
                type: initialData.type || "residential",
                area: initialData.area || "",
                budget: initialData.budget || "",
                duration: initialData.duration || "",
                style: initialData.style || "",
                year: initialData.year || new Date().getFullYear(),
                hero_image: initialData.hero_image || "",
                brief: initialData.brief || "",
                approach: initialData.approach || "",
                video_url: initialData.video_url || "",
                is_featured: initialData.is_featured || false,
                status: initialData.status || "draft",
            });
        } else {
            setFormData({
                title: "",
                slug: "",
                description: "",
                category: "Residential",
                client: "",
                location: "",
                type: "residential",
                area: "",
                budget: "",
                duration: "",
                style: "",
                year: new Date().getFullYear(),
                hero_image: "",
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
        // Only auto-generate slug if it's a new item or slug is empty
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

            setFormData({ ...formData, hero_image: publicUrl });
            toast({ title: "Image uploaded successfully" });
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.message,
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
            const itemData = {
                title: formData.title,
                slug: formData.slug || generateSlug(formData.title),
                description: formData.description || null,
                category: formData.category,
                client: formData.client || null,
                location: formData.location || null,
                type: formData.type,
                area: formData.area || null,
                budget: formData.budget || null,
                duration: formData.duration || null,
                style: formData.style || null,
                year: formData.year,
                hero_image: formData.hero_image || null,
                brief: formData.brief || null,
                approach: formData.approach || null,
                video_url: formData.video_url || null,
                is_featured: formData.is_featured,
                status: formData.status,
                published_at: formData.status === 'published' && (!initialData?.published_at) ? new Date().toISOString() : (initialData?.published_at || null),
            };

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
        } catch (error: any) {
            toast({
                title: "Error saving project",
                description: error.message,
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
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: "residential" | "commercial") => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="residential">Residential</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Additional details */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Area</Label>
                            <Input value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Budget</Label>
                            <Input value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Style</Label>
                            <Input value={formData.style} onChange={(e) => setFormData({ ...formData, style: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Short)</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.hero_image}
                                onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                                placeholder="Image URL"
                                className="flex-1"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
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
                        {formData.hero_image && (
                            <div className="relative mt-2 w-full h-40 group">
                                <img
                                    src={formData.hero_image}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setFormData({ ...formData, hero_image: "" })}
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
                onSelect={(url) => setFormData({ ...formData, hero_image: url })}
            />
        </Dialog>
    );
}
