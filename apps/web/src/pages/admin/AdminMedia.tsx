import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Loader2,
    Search,
    FolderOpen,
    Grid,
    List,
    CheckSquare,
    Square,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaUploadZone } from "@/components/admin/media/MediaUploadZone";
import { MediaPreviewDialog } from "@/components/admin/media/MediaPreviewDialog";

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

    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);

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

    const filteredFiles = files.filter((file) => {
        const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFolder && matchesSearch;
    });

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
            <MediaUploadZone
                onUpload={handleUpload}
                isUploading={isUploading}
                selectedFolder={selectedFolder}
            />

            {/* Files Grid/List */}
            <MediaGrid
                files={filteredFiles}
                viewMode={viewMode}
                selectedFiles={selectedFiles}
                onToggleSelection={toggleFileSelection}
                onPreview={setPreviewFile}
                onDelete={(file) => { setFileToDelete(file); setDeleteDialogOpen(true); }}
                onCopyUrl={copyToClipboard}
                copiedUrl={copiedUrl}
            />

            {/* Image Preview Modal */}
            <MediaPreviewDialog
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />

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
