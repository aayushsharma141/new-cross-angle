import { MediaPickerModal } from "@/components/media/MediaPickerModal";

// ... existing imports

const AdminPortfolio = () => {
  // ... existing state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // ... existing fetch and handlers

  return (
    <div className="space-y-8">
      {/* ... existing header and dialog trigger */}

      {/* existing Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* ... */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... other fields */}

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
                variant="secondary"
                onClick={() => setIsMediaPickerOpen(true)}
                title="Select from Library"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload New"
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

          {/* ... other fields */}
        </form>

        <MediaPickerModal
          open={isMediaPickerOpen}
          onOpenChange={setIsMediaPickerOpen}
          onSelect={(url) => setFormData(prev => ({ ...prev, hero_image: url }))}
        />
      </DialogContent>
    </Dialog>
      
      {/* ... grid list */ }
    </div >
  );
};

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

{
  totalPages > 1 && (
    <div className="py-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
    </div >
  );
};

export default AdminPortfolio;
