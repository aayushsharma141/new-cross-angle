import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { icons } from '@/design-system/tokens/icons';
import { Loader2, Plus, Pencil, Trash2, Image, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Input } from '@/components/ui/primitives/input';
import { Textarea } from '@/components/ui/primitives/textarea';
import { Label } from '@/components/ui/primitives/label';
import { Switch } from '@/components/ui/primitives/switch';
import { Card, CardContent } from '@/components/ui/primitives/card';
import { useToast } from '@/hooks/useToast';
import { MediaPicker } from '@/components/admin/media/MediaPicker';
import { getOptimizedUrl } from '@/lib/cdn';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/primitives/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/primitives/select";

interface GalleryCategory {
    id: string;
    name: string;
    slug: string;
    display_order: number;
}

interface GalleryItem {
    id: string;
    category_id: string | null;
    title: string;
    subtitle: string | null;
    image_url: string;
    location: string | null;
    year: number | null;
    description: string | null;
    display_order: number;
    category?: GalleryCategory;
}

type GalleryFormData = {
    title: string;
    subtitle: string;
    image_url: string;
    category_id: string;
    location: string;
    year: string;
    description: string;
};

type CategoryFormData = {
    name: string;
    slug: string;
    display_order: string;
};

const AdminGallery = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [itemFormData, setItemFormData] = useState<GalleryFormData>({
        title: '',
        subtitle: '',
        image_url: '',
        category_id: '',
        location: '',
        year: new Date().getFullYear().toString(),
        description: '',
    });

    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
        name: '',
        slug: '',
        display_order: '0',
    });

    const { data: categories, isLoading: categoriesLoading } = useQuery<GalleryCategory[]>({
        queryKey: ['gallery-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery_categories')
                .select('*')
                .order('display_order');
            if (error) throw error;
            return data;
        },
    });

    const { data: items, isLoading: itemsLoading } = useQuery<GalleryItem[]>({
        queryKey: ['gallery-items', selectedCategory],
        queryFn: async () => {
            let query = supabase
                .from('gallery_items')
                .select('*, category:gallery_categories(*)')
                .order('display_order');
            
            if (selectedCategory !== 'all') {
                query = query.eq('category_id', selectedCategory);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });

    const createItemMutation = useMutation({
        mutationFn: async (data: GalleryFormData) => {
            const { error } = await supabase.from('gallery_items').insert({
                title: data.title,
                subtitle: data.subtitle || null,
                image_url: data.image_url,
                category_id: data.category_id || null,
                location: data.location || null,
                year: parseInt(data.year) || null,
                description: data.description || null,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
            toast({ title: "Item created successfully" });
            closeItemDialog();
        },
        onError: (error: Error) => {
            toast({ title: "Error creating item", description: error.message, variant: "destructive" });
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: GalleryFormData }) => {
            const { error } = await supabase.from('gallery_items').update({
                title: data.title,
                subtitle: data.subtitle || null,
                image_url: data.image_url,
                category_id: data.category_id || null,
                location: data.location || null,
                year: parseInt(data.year) || null,
                description: data.description || null,
            }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
            toast({ title: "Item updated successfully" });
            closeItemDialog();
        },
        onError: (error: Error) => {
            toast({ title: "Error updating item", description: error.message, variant: "destructive" });
        },
    });

    const deleteItemMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('gallery_items').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
            toast({ title: "Item deleted successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error deleting item", description: error.message, variant: "destructive" });
        },
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
            const { error } = await supabase.from('gallery_categories').insert({
                name: data.name,
                slug: data.slug,
                display_order: parseInt(data.display_order) || 0,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
            toast({ title: "Category created successfully" });
            closeCategoryDialog();
        },
        onError: (error: Error) => {
            toast({ title: "Error creating category", description: error.message, variant: "destructive" });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
            toast({ title: "Category deleted successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
        },
    });

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const openItemDialog = (item?: GalleryItem) => {
        if (item) {
            setEditingItem(item);
            setItemFormData({
                title: item.title,
                subtitle: item.subtitle || '',
                image_url: item.image_url,
                category_id: item.category_id || '',
                location: item.location || '',
                year: item.year?.toString() || new Date().getFullYear().toString(),
                description: item.description || '',
            });
        } else {
            setEditingItem(null);
            setItemFormData({
                title: '',
                subtitle: '',
                image_url: '',
                category_id: '',
                location: '',
                year: new Date().getFullYear().toString(),
                description: '',
            });
        }
        setIsItemDialogOpen(true);
    };

    const closeItemDialog = () => {
        setIsItemDialogOpen(false);
        setEditingItem(null);
    };

    const openCategoryDialog = (category?: GalleryCategory) => {
        if (category) {
            setEditingCategory(category);
            setCategoryFormData({
                name: category.name,
                slug: category.slug,
                display_order: category.display_order.toString(),
            });
        } else {
            setEditingCategory(null);
            setCategoryFormData({
                name: '',
                slug: '',
                display_order: '0',
            });
        }
        setIsCategoryDialogOpen(true);
    };

    const closeCategoryDialog = () => {
        setIsCategoryDialogOpen(false);
        setEditingCategory(null);
    };

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            updateItemMutation.mutate({ id: editingItem.id, data: itemFormData });
        } else {
            createItemMutation.mutate(itemFormData);
        }
    };

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            // Update not implemented for simplicity
            toast({ title: "Update not implemented", variant: "destructive" });
        } else {
            createCategoryMutation.mutate(categoryFormData);
        }
    };

    const handleDeleteItem = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteItemMutation.mutate(id);
        }
    };

    const handleDeleteCategory = (id: string) => {
        if (confirm('Are you sure? Items in this category will become uncategorized.')) {
            deleteCategoryMutation.mutate(id);
        }
    };

    const isLoading = categoriesLoading || itemsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className={`${icons.xl} animate-spin text-primary`} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif text-white tracking-tight">Gallery</h1>
                    <p className="text-sm text-zinc-500 font-sans max-w-sm">Manage gallery categories and items.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'items' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('items')}
                    >
                        <Image className={`${icons.sm} mr-2`} />
                        Items
                    </Button>
                    <Button
                        variant={activeTab === 'categories' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </Button>
                </div>
            </div>

            {activeTab === 'items' && (
                <>
                    {/* Filter and Add */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories?.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => openItemDialog()}>
                                    <Plus className={`${icons.sm} mr-2`} />
                                    Add Item
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl border-zinc-800">
                                <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
                                    <DialogTitle className="text-lg font-display">{editingItem ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleItemSubmit} className="flex flex-col flex-1 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                value={itemFormData.title}
                                                onChange={e => setItemFormData(p => ({ ...p, title: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subtitle">Subtitle</Label>
                                            <Input
                                                id="subtitle"
                                                value={itemFormData.subtitle}
                                                onChange={e => setItemFormData(p => ({ ...p, subtitle: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={itemFormData.category_id}
                                                onValueChange={v => setItemFormData(p => ({ ...p, category_id: v }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories?.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    value={itemFormData.location}
                                                    onChange={e => setItemFormData(p => ({ ...p, location: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="year">Year</Label>
                                                <Input
                                                    id="year"
                                                    type="number"
                                                    value={itemFormData.year}
                                                    onChange={e => setItemFormData(p => ({ ...p, year: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={itemFormData.description}
                                                onChange={e => setItemFormData(p => ({ ...p, description: e.target.value }))}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image</Label>
                                            {itemFormData.image_url ? (
                                                <div className="relative">
                                                    <img src={getOptimizedUrl(itemFormData.image_url, { width: 720, quality: 76 })} alt="" className="h-32 w-full object-cover rounded" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => setItemFormData(p => ({ ...p, image_url: '' }))}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <MediaPicker
                                                    onSelect={url => setItemFormData(p => ({ ...p, image_url: url }))}
                                                    trigger={<Button type="button" variant="outline">Select Image</Button>}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-zinc-800">
                                        <Button type="button" variant="outline" onClick={closeItemDialog}>Cancel</Button>
                                        <Button type="submit" disabled={createItemMutation.isPending || updateItemMutation.isPending}>
                                            {editingItem ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items?.map(item => (
                            <Card key={item.id} className="overflow-hidden bg-zinc-900/50 border-zinc-800">
                                <div className="aspect-video relative">
                                    <img src={getOptimizedUrl(item.image_url, { width: 720, quality: 76 })} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openItemDialog(item)} aria-label="Edit item">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteItem(item.id)} aria-label="Delete item">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-medium text-white truncate">{item.title}</h3>
                                    {item.category && (
                                        <span className="text-xs text-zinc-500">{item.category.name}</span>
                                    )}
                                    {item.location && (
                                        <p className="text-xs text-zinc-600 mt-1">{item.location}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {items?.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            No items found. Add your first gallery item!
                        </div>
                    )}
                </>
            )}

            {activeTab === 'categories' && (
                <>
                    <div className="flex justify-end">
                        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => openCategoryDialog()}>
                                    <Plus className={`${icons.sm} mr-2`} />
                                    Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl border-zinc-800">
                                <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
                                    <DialogTitle className="text-lg font-display">{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCategorySubmit} className="flex flex-col flex-1 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-name">Name</Label>
                                            <Input
                                                id="cat-name"
                                                value={categoryFormData.name}
                                                onChange={e => setCategoryFormData(p => ({
                                                    ...p,
                                                    name: e.target.value,
                                                    slug: generateSlug(e.target.value)
                                                }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-slug">Slug</Label>
                                            <Input
                                                id="cat-slug"
                                                value={categoryFormData.slug}
                                                onChange={e => setCategoryFormData(p => ({ ...p, slug: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-order">Display Order</Label>
                                            <Input
                                                id="cat-order"
                                                type="number"
                                                value={categoryFormData.display_order}
                                                onChange={e => setCategoryFormData(p => ({ ...p, display_order: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-zinc-800">
                                        <Button type="button" variant="outline" onClick={closeCategoryDialog}>Cancel</Button>
                                        <Button type="submit" disabled={createCategoryMutation.isPending}>
                                            {editingCategory ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50">
                                <tr className="text-zinc-500 text-xs uppercase">
                                    <th className="px-4 py-3 text-left">Order</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Slug</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories?.map(category => (
                                    <tr key={category.id} className="border-t border-zinc-800">
                                        <td className="px-4 py-3 text-zinc-400">{category.display_order}</td>
                                        <td className="px-4 py-3 text-white font-medium">{category.name}</td>
                                        <td className="px-4 py-3 text-zinc-500 font-mono text-sm">{category.slug}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)} aria-label="Delete category">
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminGallery;
