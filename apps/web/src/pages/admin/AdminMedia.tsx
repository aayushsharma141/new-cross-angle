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
import { MediaDetailsSheet } from "@/components/admin/media/MediaDetailsSheet";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface MediaFile {
    id: string;
    name: string;
    url: string;
    folder: string;
    size: number;
    created_at: string;
    alt?: string;
    caption?: string;
}

const FOLDERS = ["portfolio", "services", "blogs", "general"];
const BUCKET_NAME = "media";

const AdminMedia = () => {
    const { toast } = useToast();
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);

    const [uploadError, setUploadError] = useState<string | null>(null);

    const fetchFiles = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
                limit: 1000,
                sortBy: { column: 'created_at', order: 'desc' }
            });
            if (error) throw error;

            const formattedFiles: MediaFile[] = data.map(file => ({
                id: file.id,
                name: file.name,
                url: supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name).data.publicUrl,
                folder: file.name.split('/')[0] || 'general',
                size: file.metadata?.size || 0,
                created_at: file.created_at,
            }));
            setFiles(formattedFiles);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = async (files: File[]) => {
        try {
            setIsUploading(true);
            setUploadError(null);

            for (const file of files) {
                const path = selectedFolder === 'all' ? file.name : `${selectedFolder}/${file.name}`;
                const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file);
                if (error) throw error;
            }

            toast({ title: "Success", description: `${files.length} file(s) uploaded successfully` });
            fetchFiles();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setUploadError(error.message);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSingleDelete = async () => {
        if (!fileToDelete) return;
        try {
            const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileToDelete.name]);
            if (error) throw error;

            toast({ title: "Success", description: "File deleted successfully" });
            setPreviewFile(null);
            fetchFiles();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setDeleteDialogOpen(false);
            setFileToDelete(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFiles.size === 0) return;
        try {
            const filesToRemove = Array.from(selectedFiles).map(id => files.find(f => f.id === id)?.name).filter(Boolean) as string[];
            const { error } = await supabase.storage.from(BUCKET_NAME).remove(filesToRemove);
            if (error) throw error;

            toast({ title: "Success", description: "Files deleted successfully" });
            setSelectedFiles(new Set());
            fetchFiles();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setBulkDeleteDialogOpen(false);
        }
    };

    const toggleFileSelection = (id: string) => {
        setSelectedFiles(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const copyToClipboard = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        toast({ title: "Copied", description: "URL copied to clipboard" });
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;

        let matchesType = true;
        if (selectedType === "image") {
            matchesType = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
        } else if (selectedType === "video") {
            matchesType = /\.(mp4|webm|ogg)$/i.test(file.name);
        }

        return matchesFolder && matchesSearch && matchesType;
    });

    const toggleSelectAll = () => {
        if (selectedFiles.size === filteredFiles.length && filteredFiles.length > 0) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
        }
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
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Media Library</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

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
                errorMessage={uploadError}
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

            {/* Image Details Sheet */}
            <MediaDetailsSheet
                file={previewFile}
                open={!!previewFile}
                onClose={() => setPreviewFile(null)}
                onDelete={(file) => { setFileToDelete(file); setDeleteDialogOpen(true); }}
                onCopyUrl={copyToClipboard}
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
