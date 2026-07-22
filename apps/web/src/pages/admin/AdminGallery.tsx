import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { icons } from '@/design-system/tokens/icons';
import { Loader2, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Input } from "@/components/primitives/interactive";
import { Textarea } from "@/components/primitives/interactive";
import { Label } from '@/components/ui/primitives/label';
import { Surface } from "@/components/primitives/foundation";
import { useToast } from '@/hooks/useToast';
import { MediaPicker } from '@/components/admin/media/MediaPicker';
import { ModuleActions } from '@/components/admin/layout/ModuleLayout';
import { Image } from '@/components/ui/enhanced/image';
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
    display_order: number | null;
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
    display_order: number | null;
    category?: GalleryCategory | null;
}

type GalleryFormData = {
    title: string;
    subtitle: string;
    image_url: string;
    category_id: string;
    location: string;
    year: string;
    description: string;
    display_order: string;
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
        display_order: '0',
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
                display_order: parseInt(data.display_order) || 0,
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
                display_order: parseInt(data.display_order) || 0,
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
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['gallery-items', selectedCategory] });
            const previousItems = queryClient.getQueryData(['gallery-items', selectedCategory]);
            queryClient.setQueryData(['gallery-items', selectedCategory], (old: GalleryItem[] | undefined) => {
                if (!old) return old;
                return old.filter(item => item.id !== id);
            });
            return { previousItems };
        },
        onError: (err: Error, id, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(['gallery-items', selectedCategory], context.previousItems);
            }
            toast({ title: "Error deleting item", description: err.message, variant: "destructive" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
        },
        onSuccess: () => {
            toast({ title: "Item deleted successfully" });
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

    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
            const { error } = await supabase.from('gallery_categories').update({
                name: data.name,
                slug: data.slug,
                display_order: parseInt(data.display_order) || 0,
            }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
            toast({ title: "Category updated successfully" });
            closeCategoryDialog();
        },
        onError: (error: Error) => {
            toast({ title: "Error updating category", description: error.message, variant: "destructive" });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
            if (error) throw error;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['gallery-categories'] });
            const previousCategories = queryClient.getQueryData(['gallery-categories']);
            queryClient.setQueryData(['gallery-categories'], (old: GalleryCategory[] | undefined) => {
                if (!old) return old;
                return old.filter(cat => cat.id !== id);
            });
            return { previousCategories };
        },
        onError: (err: Error, id, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(['gallery-categories'], context.previousCategories);
            }
            toast({ title: "Error deleting category", description: err.message, variant: "destructive" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
        },
        onSuccess: () => {
            toast({ title: "Category deleted successfully" });
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
                display_order: item.display_order?.toString() || '0',
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
                display_order: '0',
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
            updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryFormData });
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
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <ModuleActions>
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
            </ModuleActions>

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
                            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl bg-admin-card border-admin-border text-admin-text">
                                <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
                                    <DialogTitle className="text-lg font-display">{editingItem ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleItemSubmit} className="flex flex-col flex-1 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
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
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
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
                                            <div className="space-y-2">
                                                <Label htmlFor="item-order">Display Order</Label>
                                                <Input
                                                    id="item-order"
                                                    type="number"
                                                    value={itemFormData.display_order}
                                                    onChange={e => setItemFormData(p => ({ ...p, display_order: e.target.value }))}
                                                    placeholder="0"
                                                />
                                            </div>
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
                                                    <Image
                                                        src={itemFormData.image_url}
                                                        alt=""
                                                        width={720}
                                                        quality={76}
                                                        imageClassName="h-48 w-full object-cover rounded border border-zinc-800"
                                                    />
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
                                                    trigger={<Button type="button" variant="outline" className="w-full h-24 border-dashed">Select Image from Media Library</Button>}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
                                        <Button type="button" variant="outline" onClick={closeItemDialog}>Cancel</Button>
                                        <Button type="submit" disabled={createItemMutation.isPending || updateItemMutation.isPending}>
                                            {editingItem ? 'Update Item' : 'Create Item'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items?.map(item => (
                            <Surface variant="primary" radius="lg" border shadow="sm" key={item.id} className="overflow-hidden bg-zinc-900/50 border-zinc-800 group transition-all duration-300 hover:border-zinc-700">
                                <div className="aspect-video relative overflow-hidden">
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        width={720}
                                        quality={76}
                                        imageClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
                                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-zinc-900/80 backdrop-blur-sm border-none hover:bg-zinc-800" onClick={() => openItemDialog(item)} aria-label="Edit item">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" className="h-8 w-8 backdrop-blur-sm border-none" onClick={() => handleDeleteItem(item.id)} aria-label="Delete item">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-zinc-900/80 backdrop-blur-sm text-xs font-mono px-2 py-1 rounded text-zinc-400 border border-zinc-800/50 flex items-center gap-1">
                                            <GripVertical className="h-3 w-3" />
                                            {item.display_order}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-0" className="p-4 relative">
                                    <h3 className="font-medium text-white truncate text-base mb-1">{item.title}</h3>
                                    <div className="flex items-center justify-between">
                                        {item.category && (
                                            <span className="text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full">{item.category.name}</span>
                                        )}
                                        {item.location && (
                                            <p className="text-xs text-zinc-500 flex items-center gap-1">{item.location}</p>
                                        )}
                                    </div>
                                </div>
                            </Surface>
                        ))}
                    </div>

                    {items?.length === 0 && (
                        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <Image className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-1">No gallery items found</h3>
                            <p className="text-sm text-zinc-500 mb-4 max-w-sm mx-auto">Get started by creating your first gallery item. You can upload images or select them from your media library.</p>
                            <Button onClick={() => openItemDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Item
                            </Button>
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
                            <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl bg-admin-card border-admin-border text-admin-text">
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
                                        <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                                            {editingCategory ? 'Update Category' : 'Create Category'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50">
                                <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 text-left font-medium">Order</th>
                                    <th className="px-6 py-4 text-left font-medium">Name</th>
                                    <th className="px-6 py-4 text-left font-medium">Slug</th>
                                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {categories?.map(category => (
                                    <tr key={category.id} className="hover:bg-zinc-800/20 transition-colors group">
                                        <td className="px-6 py-4 text-zinc-400 font-mono text-sm">{category.display_order}</td>
                                        <td className="px-6 py-4 text-white font-medium">{category.name}</td>
                                        <td className="px-6 py-4 text-zinc-500 font-mono text-sm">{category.slug}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white" onClick={() => openCategoryDialog(category)} aria-label="Edit category">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10" onClick={() => handleDeleteCategory(category.id)} aria-label="Delete category">
                                                    <Trash2 className="h-4 w-4 text-red-400" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                            No categories found. Create one to organize your gallery.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminGallery;

