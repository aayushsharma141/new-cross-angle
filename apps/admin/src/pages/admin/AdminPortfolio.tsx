import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Upload, Star, GripVertical, Video, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogTrigger,
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

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  client: string | null;
  location: string | null;
  type: "residential" | "commercial" | null;
  category: string | null;
  area: string | null;
  budget: string | null;
  duration: string | null;
  style: string | null;
  year: number | null;
  hero_image: string | null;
  brief: string | null;
  approach: string | null;
  video_url: string | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string;
}

const categories = ["Residential", "Commercial", "Hospitality", "Retail", "Office"];

import { Pagination, Image } from "@repo/ui";

const ITEMS_PER_PAGE = 9;

const AdminPortfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [currentPage]);

  const fetchItems = async () => {
    setIsLoading(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .range(from, to);

    if (data) {
      setItems(data);
    }

    if (count) {
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }

    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    setFormData(prev => ({ ...prev, title, slug }));
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

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description || "",
      category: item.category || "Residential",
      client: item.client || "",
      location: item.location || "",
      type: item.type || "residential",
      area: item.area || "",
      budget: item.budget || "",
      duration: item.duration || "",
      style: item.style || "",
      year: item.year || new Date().getFullYear(),
      hero_image: item.hero_image || "",
      brief: item.brief || "",
      approach: item.approach || "",
      video_url: item.video_url || "",
      is_featured: item.is_featured || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting item",
        variant: "destructive",
      });
    } else {
      toast({ title: "Item deleted successfully" });
      fetchItems();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const itemData = {
        title: formData.title,
        slug: formData.slug,
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
        display_order: editingItem?.display_order ?? items.length,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('projects')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(itemData);
        if (error) throw error;
      }

      toast({
        title: editingItem ? "Project updated!" : "Project created!",
      });

      setIsDialogOpen(false);
      setEditingItem(null);
      handleNewItem(); // Reset form
      fetchItems();
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

  const handleNewItem = () => {
    setEditingItem(null);
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
          <h1 className="font-display text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage new projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={handleNewItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Project" : "New Project"}
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
                  <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
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
                <Label>Project Brief</Label>
                <Textarea
                  value={formData.brief}
                  onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Design Approach</Label>
                <Textarea
                  value={formData.approach}
                  onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.hero_image}
                    onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                    placeholder="Image URL or upload"
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
                </div>
                {formData.hero_image && (
                  <Image
                    src={formData.hero_image}
                    alt="Preview"
                    imageClassName="mt-2 w-full h-40 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label>Featured project</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingItem ? "Update" : "Create"} Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card border-border overflow-hidden group">
              <div className="aspect-[4/3] relative">
                {item.hero_image ? (
                  <Image
                    src={item.hero_image}
                    alt={item.title}
                    imageClassName="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No projects found.
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

export default AdminPortfolio;
