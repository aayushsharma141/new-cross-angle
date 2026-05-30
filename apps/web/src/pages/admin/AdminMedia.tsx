import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    Loader2,
    Search,
    FolderOpen,
    Grid,
    List,
    CheckSquare,
    Square,
    CloudDownload,
    HardDrive,
    FileImage,
    FileVideo,
    Files
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/primitives/select";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaUploadZone } from "@/components/admin/media/MediaUploadZone";
import { MediaDetailsSheet } from "@/components/admin/media/MediaDetailsSheet";
import { icons } from "@/design-system/tokens/icons";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { AdminPageHeader, AdminMetricsPanel, AdminSkeletonCard } from "@/components/admin/shared";
import { queryKeys } from "@/lib/queryKeys";
import type { Tables } from "@/integrations/supabase/types";

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

type MediaRow = Tables<"media">;

const FOLDERS = ["portfolio", "services", "blogs", "general"];
const BUCKET_NAME = "media";

/** Derive a display folder from the raw file_name stored in DB. */
const deriveFolder = (fileName: string): string => {
    const isImageKit = fileName.startsWith("imagekit:");
    const rawPath = isImageKit ? fileName.replace("imagekit:", "") : fileName;
    const parts = rawPath.replace(/^\//, "").split("/");
    if (isImageKit) return parts.length > 1 ? parts[0] : "imagekit";
    return parts.length > 1 ? parts[0] : "general";
};

const fetchMediaFiles = async (): Promise<MediaFile[]> => {
    const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((file: MediaRow) => ({
        id: file.id,
        name: file.file_name,
        url: file.url,
        folder: deriveFolder(file.file_name),
        size: file.size_bytes || 0,
        created_at: file.created_at,
        alt: file.alt || undefined,
        caption: file.title || undefined,
    }));
};

const AdminMedia = () => {
    const { toast } = useToast();
    const { isEditor } = useAdminAuth();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const urlSearch = searchParams.get("search");
    const urlFile = searchParams.get("file");
    const deepLinkHandled = useRef(false);

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
    const [isSyncingImageKit, setIsSyncingImageKit] = useState(false);

    // ── Data fetching ─────────────────────────────────────────────────────────

    const { data: files = [], isLoading } = useQuery({
        queryKey: queryKeys.media.all,
        queryFn: fetchMediaFiles,
    });

    // Deep-link from command palette: ?file=<name>
    useEffect(() => {
        if (urlFile && !deepLinkHandled.current && files.length > 0) {
            deepLinkHandled.current = true;
            const target = files.find((f) => f.name === urlFile);
            if (target) setPreviewFile(target);
        }
    }, [files, urlFile]);

    // ── Upload mutation ───────────────────────────────────────────────────────

    const uploadMutation = useMutation({
        mutationFn: async (fileList: File[]) => {
            const { data: userData } = await supabase.auth.getUser();
            let successCount = 0;
            const errors: string[] = [];

            for (const file of fileList) {
                const folder = selectedFolder === "all" ? "general" : selectedFolder;
                const path = `${folder}/${file.name}`;

                const { error: storageError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(path, file, { upsert: true });

                const storageErrCode =
                    storageError && typeof (storageError as Record<string, unknown>).error === "string"
                        ? (storageError as Record<string, unknown>).error as string
                        : "";
                const isAlreadyExistsError =
                    storageError &&
                    (storageError.message.toLowerCase().includes("already exists") ||
                        storageError.message.toLowerCase().includes("duplicate") ||
                        storageErrCode === "Duplicate");

                if (storageError && !isAlreadyExistsError) {
                    errors.push(`${file.name}: ${storageError.message}`);
                    continue;
                }

                const { data: publicUrlObj } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

                const { error: dbError } = await supabase.from("media").upsert(
                    {
                        url: publicUrlObj.publicUrl,
                        file_name: path,
                        file_type: file.type,
                        size_bytes: file.size,
                        alt: file.name,
                        title: file.name,
                        uploaded_by: userData?.user?.id,
                    },
                    { onConflict: "file_name" }
                );

                if (dbError) {
                    if (!isAlreadyExistsError) {
                        await supabase.storage.from(BUCKET_NAME).remove([path]);
                    }
                    errors.push(`${file.name}: ${dbError.message}`);
                    continue;
                }

                successCount++;
            }

            if (errors.length > 0) {
                throw { successCount, total: fileList.length, errors };
            }
            return { successCount };
        },
        onSuccess: ({ successCount }) => {
            toast({ title: "Success", description: `${successCount} file(s) uploaded successfully` });
            setUploadError(null);
            void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
        },
        onError: (err: { errors?: string[]; successCount?: number; total?: number } | Error) => {
            if (err.errors) {
                const msg = err.errors.join("; ");
                setUploadError(msg);
                toast({
                    title: `${err.successCount} of ${err.total} file(s) uploaded`,
                    description: `Failed: ${msg}`,
                    variant: "destructive",
                });
                void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
            } else {
                toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
            }
        },
    });

    // ── Delete mutation ───────────────────────────────────────────────────────

    const deleteMutation = useMutation({
        mutationFn: async (file: MediaFile) => {
            const { error: dbError } = await supabase.from("media").delete().eq("id", file.id);
            if (dbError) throw dbError;

            const { error: storageError } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([file.name]);
            if (storageError) console.error("Storage delete failed:", storageError);
        },
        onSuccess: () => {
            toast({ title: "Success", description: "File deleted successfully" });
            setPreviewFile(null);
            void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
        onSettled: () => {
            setDeleteDialogOpen(false);
            setFileToDelete(null);
        },
    });

    // ── Bulk delete mutation ──────────────────────────────────────────────────

    const bulkDeleteMutation = useMutation({
        mutationFn: async (fileIds: Set<string>) => {
            const fileEntries = Array.from(fileIds)
                .map((id) => files.find((f) => f.id === id))
                .filter((f): f is MediaFile => !!f);

            const results = await Promise.allSettled(
                fileEntries.map(async (f) => {
                    const { error: dbError } = await supabase.from("media").delete().eq("id", f.id);
                    if (dbError) throw new Error(`DB: ${dbError.message}`);
                    const { error: storageError } = await supabase.storage
                        .from(BUCKET_NAME)
                        .remove([f.name]);
                    if (storageError) console.error(`Storage: ${storageError.message}`);
                    return f.id;
                })
            );

            const succeeded = results.filter((r) => r.status === "fulfilled").length;
            const failed = results
                .filter((r): r is PromiseRejectedResult => r.status === "rejected")
                .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));

            return { succeeded, total: fileEntries.length, failed };
        },
        onSuccess: ({ succeeded, total, failed }) => {
            if (failed.length > 0) {
                toast({
                    title: `${succeeded} of ${total} files deleted`,
                    description: `Errors: ${failed.join("; ")}`,
                    variant: "destructive",
                });
            } else {
                toast({ title: "Success", description: `${succeeded} file(s) deleted` });
            }
            setSelectedFiles(new Set());
            void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
            setBulkDeleteDialogOpen(false);
        },
    });

    // ── Sync: Supabase Storage ────────────────────────────────────────────────

    const syncStorageMutation = useMutation({
        mutationFn: async () => {
            const { data: userData } = await supabase.auth.getUser();
            let syncedCount = 0;

            for (const folder of FOLDERS) {
                const { data: storageFiles } = await supabase.storage
                    .from(BUCKET_NAME)
                    .list(folder === "general" ? "" : folder, { limit: 100 });
                if (!storageFiles) continue;

                for (const file of storageFiles) {
                    if (file.name === ".emptyFolderPlaceholder" || !file.metadata) continue;
                    const path = folder === "general" ? file.name : `${folder}/${file.name}`;
                    const { data: existing } = await supabase
                        .from("media")
                        .select("id")
                        .eq("file_name", path)
                        .maybeSingle();
                    if (!existing) {
                        const { data: publicUrlObj } = supabase.storage
                            .from(BUCKET_NAME)
                            .getPublicUrl(path);
                        await supabase.from("media").insert({
                            url: publicUrlObj.publicUrl,
                            file_name: path,
                            file_type: file.metadata?.mimetype || "unknown",
                            size_bytes: file.metadata?.size || 0,
                            alt: file.name,
                            title: file.name,
                            uploaded_by: userData?.user?.id,
                        });
                        syncedCount++;
                    }
                }
            }
            return syncedCount;
        },
        onSuccess: (syncedCount) => {
            toast({ title: "Success", description: `Synced ${syncedCount} missing files from storage` });
            void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
        },
        onError: (err: Error) => {
            toast({ title: "Error syncing", description: err.message, variant: "destructive" });
        },
    });

    // ── Sync: ImageKit ────────────────────────────────────────────────────────

    const handleSyncImageKit = async () => {
        setIsSyncingImageKit(true);
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-imagekit`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "Content-Type": "application/json",
                        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                    },
                    body: JSON.stringify({ limit: 1000 }),
                }
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || `HTTP ${res.status}`);
            }

            toast({
                title: "ImageKit sync complete",
                description:
                    `${result.upserted} file(s) imported from ImageKit.` +
                    (result.errors?.length ? ` ${result.errors.length} error(s).` : ""),
            });
            void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("Failed to fetch") || msg.includes("IMAGEKIT_PRIVATE_KEY") || msg.includes("404")) {
                toast({
                    title: "Setup required",
                    description:
                        "Deploy the sync-imagekit Edge Function and set IMAGEKIT_PRIVATE_KEY as a Supabase secret.",
                    variant: "destructive",
                });
            } else {
                toast({ title: "ImageKit sync failed", description: msg, variant: "destructive" });
            }
        } finally {
            setIsSyncingImageKit(false);
        }
    };

    // ── Selection & filtering ─────────────────────────────────────────────────

    const toggleFileSelection = (id: string) => {
        setSelectedFiles((prev) => {
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

    const filteredFiles = files.filter((file) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            file.name.toLowerCase().includes(q) || file.url.toLowerCase().includes(q);
        const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
        let matchesType = true;
        if (selectedType === "image") {
            matchesType =
                /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(file.name) ||
                /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(file.url);
        } else if (selectedType === "video") {
            matchesType = /\.(mp4|webm|ogg)$/i.test(file.name);
        }
        return matchesFolder && matchesSearch && matchesType;
    });

    const toggleSelectAll = () => {
        if (selectedFiles.size === filteredFiles.length && filteredFiles.length > 0) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
        }
    };

    const isReadOnly = !isEditor;

    // ── Render ────────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="w-full font-mono">
                <AdminPageHeader moduleName="CMS" tabName="Media Library" />
                <div className="space-y-4 mt-6">
                    <AdminSkeletonCard size="lg" />
                    <AdminSkeletonCard size="lg" />
                    <AdminSkeletonCard size="lg" />
                    <AdminSkeletonCard size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full font-mono">
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
                .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
                .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
                .fade-up-4 { animation: fadeUp var(--anim-duration) var(--anim-stagger-4) var(--anim-ease) both; }
            `}</style>
            
            <AdminPageHeader moduleName="CMS" tabName="Media Library" />

            <div className="fade-up-1">
                <AdminMetricsPanel 
                    metrics={[
                        { label: "Total Files", value: String(files.length), icon: Files },
                        { label: "Storage Used", value: (files.reduce((a, f) => a + f.size, 0) / (1024 * 1024)).toFixed(1) + " MB", icon: HardDrive },
                        { label: "Images", value: String(files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(f.name)).length), icon: FileImage },
                        { label: "Videos", value: String(files.filter(f => /\.(mp4|webm|ogg)$/i.test(f.name)).length), icon: FileVideo }
                    ]} 
                />
            </div>

            <div className="mt-8 mb-6 fade-up-2">
                {/* Action buttons */}
                {!isReadOnly && (
                    <ModuleActions>
                    <Button
                        variant="outline"
                        onClick={() => syncStorageMutation.mutate()}
                        disabled={syncStorageMutation.isPending || isSyncingImageKit}
                    >
                        {syncStorageMutation.isPending ? (
                            <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                        ) : (
                            <FolderOpen className={`${icons.sm} mr-2`} />
                        )}
                        Sync Storage
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleSyncImageKit}
                        disabled={syncStorageMutation.isPending || isSyncingImageKit}
                        title="Import all files uploaded directly to ImageKit"
                    >
                        {isSyncingImageKit ? (
                            <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                        ) : (
                            <CloudDownload className={`${icons.sm} mr-2`} />
                        )}
                        {isSyncingImageKit ? "Importing…" : "Import from ImageKit"}
                    </Button>
                </ModuleActions>
            )}
            </div>

            <div className="fade-up-3 space-y-6">
                {/* Bulk selection toolbar */}
                <BulkActionsToolbar
                selectedCount={selectedFiles.size}
                onClear={() => setSelectedFiles(new Set())}
                onDelete={() => setBulkDeleteDialogOpen(true)}
                isDeleting={bulkDeleteMutation.isPending}
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
                        <SelectItem value="imagekit">ImageKit</SelectItem>
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

            {/* Upload zone */}
            {!isReadOnly && (
                <MediaUploadZone
                    onUpload={(fileList) => uploadMutation.mutate(fileList)}
                    isUploading={uploadMutation.isPending}
                    selectedFolder={selectedFolder}
                    errorMessage={uploadError}
                />
            )}

            {/* Files grid/list */}
            <MediaGrid
                files={filteredFiles}
                viewMode={viewMode}
                selectedFiles={selectedFiles}
                onToggleSelection={toggleFileSelection}
                onPreview={setPreviewFile}
                onDelete={(file) => {
                    setFileToDelete(file);
                    setDeleteDialogOpen(true);
                }}
                onCopyUrl={copyToClipboard}
                copiedUrl={copiedUrl}
                isReadOnly={isReadOnly}
            />

            {/* File details sheet */}
            <MediaDetailsSheet
                file={previewFile}
                open={!!previewFile}
                onClose={() => setPreviewFile(null)}
                onDelete={(file) => {
                    setFileToDelete(file);
                    setDeleteDialogOpen(true);
                }}
                onCopyUrl={copyToClipboard}
                isReadOnly={isReadOnly}
            />

            {/* Single delete confirm */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete File"
                description={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={() => fileToDelete && deleteMutation.mutate(fileToDelete)}
            />

            {/* Bulk delete confirm */}
            <ConfirmDialog
                open={bulkDeleteDialogOpen}
                onOpenChange={setBulkDeleteDialogOpen}
                title="Delete Selected Files"
                description={`Are you sure you want to delete ${selectedFiles.size} files? This action cannot be undone.`}
                confirmText="Delete All"
                variant="destructive"
                onConfirm={() => bulkDeleteMutation.mutate(selectedFiles)}
            />
            </div>
        </div>
    );
};

export default AdminMedia;
