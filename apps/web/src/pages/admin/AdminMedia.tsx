import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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
import { icons } from "@/design-system/tokens/icons";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader";

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
    const { isEditor } = useAdminAuth();
    const [searchParams] = useSearchParams();
    const urlSearch = searchParams.get("search");
    const urlFile = searchParams.get("file");
    const deepLinkHandled = useRef(false);

    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState(urlSearch ?? "");
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
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedFiles: MediaFile[] = data.map(file => ({
                id: file.id,
                name: file.file_name,
                url: file.url,
                folder: file.file_name.split('/').length > 1 ? file.file_name.split('/')[0] : 'general',
                size: file.size_bytes || 0,
                created_at: file.created_at,
                alt: file.alt || undefined,
                caption: file.title || undefined,
            }));
            setFiles(formattedFiles);
            // Deep-link from command palette: ?file=<name> or ?search=<query>
            if (urlFile && !deepLinkHandled.current) {
                deepLinkHandled.current = true;
                const target = formattedFiles.find((f) => f.name === urlFile);
                if (target) setPreviewFile(target);
            }
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = async (fileList: File[]) => {
        try {
            setIsUploading(true);
            setUploadError(null);

            const { data: userData } = await supabase.auth.getUser();

            for (const file of fileList) {
                const path = selectedFolder === 'all' ? file.name : `${selectedFolder}/${file.name}`;
                const { error: storageError } = await supabase.storage.from(BUCKET_NAME).upload(path, file);

                // If it already exists, we could just overwrite or ignore. Here we assume we want to proceed.
                // Storage upload returns an error if already exists, unless upsert is true. Let's fallback gracefully if possible.
                if (storageError && !storageError.message.includes('already exists')) {
                    throw storageError;
                }

                const { data: publicUrlObj } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

                // Insert into DB
                const { error: dbError } = await supabase.from('media').insert({
                    url: publicUrlObj.publicUrl,
                    file_name: path,
                    file_type: file.type,
                    size_bytes: file.size,
                    alt: file.name,
                    title: file.name,
                    uploaded_by: userData?.user?.id
                });

                if (dbError && dbError.code !== '23505') { // Ignore unique constraint if we handle it
                    throw dbError;
                }
            }

            toast({ title: "Success", description: `${fileList.length} file(s) uploaded successfully` });
            fetchFiles();
        } catch (error) {
            const err = error as Error;
            setUploadError(err.message);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSingleDelete = async () => {
        if (!fileToDelete) return;
        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([fileToDelete.name]);
            if (storageError) throw storageError;

            // Delete from DB
            const { error: dbError } = await supabase.from('media').delete().eq('id', fileToDelete.id);
            if (dbError) throw dbError;

            toast({ title: "Success", description: "File deleted successfully" });
            setPreviewFile(null);
            fetchFiles();
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setDeleteDialogOpen(false);
            setFileToDelete(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFiles.size === 0) return;
        try {
            const filesToRemove = Array.from(selectedFiles).map(id => files.find(f => f.id === id)?.name).filter(Boolean) as string[];

            // Delete from storage
            const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove(filesToRemove);
            if (storageError) throw storageError;

            // Delete from DB
            const { error: dbError } = await supabase.from('media').delete().in('id', Array.from(selectedFiles));
            if (dbError) throw dbError;

            toast({ title: "Success", description: "Files deleted successfully" });
            setSelectedFiles(new Set());
            fetchFiles();
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setBulkDeleteDialogOpen(false);
        }
    };

    const handleSyncStorage = async () => {
        try {
            setIsLoading(true);
            const { data: userData } = await supabase.auth.getUser();

            let syncedCount = 0;
            for (const folder of FOLDERS) {
                const { data: storageFiles } = await supabase.storage.from(BUCKET_NAME).list(folder === 'general' ? '' : folder, { limit: 100 });
                if (!storageFiles) continue;

                for (const file of storageFiles) {
                    if (file.name === '.emptyFolderPlaceholder' || !file.metadata) continue;

                    const path = folder === 'general' ? file.name : `${folder}/${file.name}`;
                    const { data: existing } = await supabase.from('media').select('id').eq('file_name', path).maybeSingle();
                    if (!existing) {
                        const { data: publicUrlObj } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
                        await supabase.from('media').insert({
                            url: publicUrlObj.publicUrl,
                            file_name: path,
                            file_type: file.metadata?.mimetype || 'unknown',
                            size_bytes: file.metadata?.size || 0,
                            alt: file.name,
                            title: file.name,
                            uploaded_by: userData?.user?.id
                        });
                        syncedCount++;
                    }
                }
            }
            toast({ title: "Success", description: `Synced ${syncedCount} missing files from storage` });
            fetchFiles();
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error syncing", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
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
    const isReadOnly = !isEditor;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className={`${icons.xl} animate-spin text-primary`} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ModuleHeader
                title="Media Library"
                description="Manage images and files"
                action={
                !isReadOnly && (
                    <Button
                        variant="outline"
                        onClick={handleSyncStorage}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className={`${icons.sm} mr-2 animate-spin`} /> : <FolderOpen className={`${icons.sm} mr-2`} />}
                        Sync Storage
                    </Button>
                )}
            />

            {/* Selection Bar */}
            <BulkActionsToolbar
                selectedCount={selectedFiles.size}
                onClear={() => setSelectedFiles(new Set())}
                onDelete={() => setBulkDeleteDialogOpen(true)}
                isDeleting={false}
            />

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
                        aria-label="Show media as grid"
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        aria-label="Show media as list"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Drop Zone */}
            {!isReadOnly && (
                <MediaUploadZone
                    onUpload={handleUpload}
                    isUploading={isUploading}
                    selectedFolder={selectedFolder}
                    errorMessage={uploadError}
                />
            )}

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
                isReadOnly={isReadOnly}
            />

            {/* Image Details Sheet */}
            <MediaDetailsSheet
                file={previewFile}
                open={!!previewFile}
                onClose={() => setPreviewFile(null)}
                onDelete={(file) => { setFileToDelete(file); setDeleteDialogOpen(true); }}
                onCopyUrl={copyToClipboard}
                isReadOnly={isReadOnly}
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
