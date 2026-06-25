const fs = require('fs');
const path = 'apps/web/src/pages/admin/AdminGallery.tsx';
let content = fs.readFileSync(path, 'utf8');

const newReturn = `    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <AdminPageHeader moduleName="CMS" tabName="Gallery" />

            <ModuleActions>
                <>
                {activeTab === 'items' && (
                    <Button onClick={() => openItemDialog()} className="rounded-xl shadow-lg shadow-primary/20">
                        <Plus className={\`\${icons.sm} mr-2\`} />
                        Add Item
                    </Button>
                )}
                {activeTab === 'categories' && (
                    <Button onClick={() => openCategoryDialog()} className="rounded-xl shadow-lg shadow-primary/20">
                        <Plus className={\`\${icons.sm} mr-2\`} />
                        Add Category
                    </Button>
                )}
                </>
            </ModuleActions>

            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
                <TabsList className="w-fit gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-1 mb-6">
                    <TabsTrigger value="items" className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Items</TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="space-y-6 m-0">
                    <AdminFilterBar
                        title="Gallery Items"
                        icon={ImageIcon}
                        filters={filterNames}
                        activeFilter={activeFilterName}
                        onFilterChange={(name) => {
                            if (name === 'All Categories') {
                                setSelectedCategory('all');
                            } else {
                                const cat = categories?.find(c => c.name === name);
                                if (cat) setSelectedCategory(cat.id);
                            }
                        }}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items?.map(item => (
                            <Card key={item.id} className="overflow-hidden bg-zinc-900/50 border-zinc-800 group transition-all duration-300 hover:border-zinc-700">
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
                                        <AdminSafeAction
                                            icon={Trash2}
                                            label=""
                                            confirmLabel="Delete?"
                                            onConfirm={() => handleDeleteItem(item.id)}
                                        />
                                    </div>
                                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-zinc-900/80 backdrop-blur-sm text-xs font-mono px-2 py-1 rounded text-zinc-400 border border-zinc-800/50 flex items-center gap-1">
                                            <GripVertical className="h-3 w-3" />
                                            {item.display_order}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-4 relative">
                                    <h3 className="font-medium text-white truncate text-base mb-1">{item.title}</h3>
                                    <div className="flex items-center justify-between">
                                        {item.category && (
                                            <span className="text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full">{item.category.name}</span>
                                        )}
                                        {item.location && (
                                            <p className="text-xs text-zinc-500 flex items-center gap-1">{item.location}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
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
                </TabsContent>

                <TabsContent value="categories" className="space-y-6 m-0">
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
                                                <AdminSafeAction
                                                    icon={Trash2}
                                                    label=""
                                                    confirmLabel="Delete?"
                                                    onConfirm={() => handleDeleteCategory(category.id)}
                                                />
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
                </TabsContent>
            </Tabs>

            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
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

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
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
                        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
                            <Button type="button" variant="outline" onClick={closeCategoryDialog}>Cancel</Button>
                            <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminGallery;
`;

const startIdx = content.indexOf('    return (');
if (startIdx === -1) {
    console.error('Start of return not found');
    process.exit(1);
}

const newContent = content.slice(0, startIdx) + newReturn;
fs.writeFileSync(path, newContent, 'utf8');
console.log('Success');
