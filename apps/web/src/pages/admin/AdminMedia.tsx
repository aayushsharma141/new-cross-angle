import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Upload,
    Trash2,
    Loader2,
    Image as ImageIcon,
    Copy,
    Check,
    Search,
    FolderOpen,
    Grid,
    List,
    X,
    CheckSquare,
    Square,
    Download,
    Maximize2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface MediaFile {
    id: string;
    name: string;
    url: string;
    folder: string;
    size: number;
    created_at: string;
}

const FOLDERS = ["portfolio", "services", "blogs", "general"];
const BUCKET_NAME = "media";

const AdminMedia = () => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // New state for bulk select and preview
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setIsLoading(true);
        const allFiles: MediaFile[] = [];

        for (const folder of FOLDERS) {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

            if (data && !error) {
                const folderFiles = data
                    .filter((file) => file.name !== ".emptyFolderPlaceholder")
                    .map((file) => {
                        const { data: { publicUrl } } = supabase.storage
                            .from(BUCKET_NAME)
                            .getPublicUrl(`${folder}/${file.name}`);
                        return {
                            id: file.id || `${folder}-${file.name}`,
                            name: file.name,
                            url: publicUrl,
                            folder,
                            size: file.metadata?.size || 0,
                            created_at: file.created_at || new Date().toISOString(),
                        };
                    });
                allFiles.push(...folderFiles);
            }
        }

        setFiles(allFiles);
        setIsLoading(false);
    };

    const handleUpload = async (uploadFiles: FileList | null) => {
        if (!uploadFiles || uploadFiles.length === 0) return;

        setIsUploading(true);
        const folder = selectedFolder === "all" ? "general" : selectedFolder;

        try {
            for (const file of Array.from(uploadFiles)) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
                const filePath = `${folder}/${fileName}`;

                const { error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(filePath, file);

                if (error) throw error;
            }

            toast({ title: `${uploadFiles.length} file(s) uploaded successfully` });
            fetchFiles();
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

    const handleSingleDelete = async () => {
        if (!fileToDelete) return;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([`${fileToDelete.folder}/${fileToDelete.name}`]);

        if (error) {
            toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "File deleted" });
            setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
        }
        setFileToDelete(null);
    };

    const handleBulkDelete = async () => {
        const filesToDelete = files.filter(f => selectedFiles.has(f.id));
        const paths = filesToDelete.map(f => `${f.folder}/${f.name}`);

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(paths);

        if (error) {
            toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: `${filesToDelete.length} files deleted` });
            setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));
            setSelectedFiles(new Set());
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        toast({ title: "URL copied to clipboard" });
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const toggleFileSelection = (fileId: string) => {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(fileId)) {
            newSelected.delete(fileId);
        } else {
            newSelected.add(fileId);
        }
        setSelectedFiles(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedFiles.size === filteredFiles.length) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleUpload(e.dataTransfer.files);
    }, [selectedFolder]);

    const filteredFiles = files.filter((file) => {
        const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const isSelectionMode = selectedFiles.size > 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold">Media Library</h1>
                    <p className="text-muted-foreground mt-1">Manage images and files</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleUpload(e.target.files)}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                    <Button variant="gold" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload
                    </Button>
                </div>
            </div>

            {/* Selection Bar */}
            {isSelectionMode && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3"
                >
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-primary" />
                        <span className="font-medium">{selectedFiles.size} selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles(new Set())}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setBulkDeleteDialogOpen(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-[150px]">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Folders</SelectItem>
                        {FOLDERS.map((folder) => (
                            <SelectItem key={folder} value={folder} className="capitalize">
                                {folder}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? (
                        <>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Deselect All
                        </>
                    ) : (
                        <>
                            <Square className="w-4 h-4 mr-2" />
                            Select All
                        </>
                    )}
                </Button>
                <div className="flex border rounded-md overflow-hidden">
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
                    }`}
            >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Drag and drop files here, or click Upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Uploading to: <span className="font-medium capitalize">{selectedFolder === "all" ? "general" : selectedFolder}</span>
                </p>
            </div>

            {/* Files Grid/List */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredFiles.map((file, index) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                        >
                            <Card className={`group overflow-hidden relative ${selectedFiles.has(file.id) ? 'ring-2 ring-primary' : ''}`}>
                                {/* Selection checkbox */}
                                <div className="absolute top-2 left-2 z-10">
                                    <Checkbox
                                        checked={selectedFiles.has(file.id)}
                                        onCheckedChange={() => toggleFileSelection(file.id)}
                                        className="bg-background/80"
                                    />
                                </div>
                                <div className="aspect-square relative bg-secondary cursor-pointer" onClick={() => setPreviewFile(file)}>
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}>
                                            <Maximize2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url); }}>
                                            {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); setFileToDelete(file); setDeleteDialogOpen(true); }}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-2">
                                    <p className="text-xs truncate" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{file.folder}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.id}
                            className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors ${selectedFiles.has(file.id) ? 'ring-2 ring-primary' : ''}`}
                        >
                            <Checkbox
                                checked={selectedFiles.has(file.id)}
                                onCheckedChange={() => toggleFileSelection(file.id)}
                            />
                            <div
                                className="w-12 h-12 rounded bg-secondary overflow-hidden flex-shrink-0 cursor-pointer"
                                onClick={() => setPreviewFile(file)}
                            >
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{file.folder} • {formatFileSize(file.size)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => setPreviewFile(file)}>
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => copyToClipboard(file.url)}>
                                    {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setFileToDelete(file); setDeleteDialogOpen(true); }}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredFiles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No files found</p>
                </div>
            )}

            {/* Image Preview Modal */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="flex items-center justify-between">
                            <span className="truncate pr-4">{previewFile?.name}</span>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => previewFile && copyToClipboard(previewFile.url)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy URL
                                </Button>
                                <a href={previewFile?.url} target="_blank" rel="noopener noreferrer" download>
                                    <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </a>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-secondary/30 min-h-[400px]">
                        {previewFile && (
                            <img
                                src={previewFile.url}
                                alt={previewFile.name}
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete File"
                description={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleSingleDelete}
            />

            {/* Bulk Delete Confirmation */}
            <ConfirmDialog
                open={bulkDeleteDialogOpen}
                onOpenChange={setBulkDeleteDialogOpen}
                title="Delete Selected Files"
                description={`Are you sure you want to delete ${selectedFiles.size} files? This action cannot be undone.`}
                confirmText="Delete All"
                variant="destructive"
                onConfirm={handleBulkDelete}
            />
        </div>
    );
};

export default AdminMedia;
