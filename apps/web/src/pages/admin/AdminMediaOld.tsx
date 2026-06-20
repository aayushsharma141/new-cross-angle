/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
    Database,
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
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaUploadZone } from "@/components/admin/media/MediaUploadZone";
import { MediaDetailsSheet } from "@/components/admin/media/MediaDetailsSheet";
import { icons } from "@/design-system/tokens/icons";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { AdminMetricsPanel, AdminSkeletonCard } from "@/components/admin/shared";
import { queryKeys } from "@/lib/queryKeys";
import { MediaService, type MediaFile } from "@/services/MediaService";

const FOLDERS = ["portfolio", "services", "blogs", "general"];

const AdminMedia = () => {
    const { toast } = useToast();
    const { isEditor } = useAdminAuth();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const urlSearch = searchParams.get("search");
    const urlFile = searchParams.get("file");
    const deepLinkHandled = useRef(false);

    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [selectedType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState(urlSearch ?? "");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
    const [moveTargetFolder, setMoveTargetFolder] = useState("general");
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isSyncingImageKit, setIsSyncingImageKit] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);

    // ── Data fetching ─────────────────────────────────────────────────────────

    const { data: files = [], isLoading } = useQuery({
        queryKey: queryKeys.media.all,
        queryFn: MediaService.list,
    });

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
            let successCount = 0;
            const errors: string[] = [];

            for (const file of fileList) {
                try {
                    const folder = selectedFolder === "all" ? "general" : selectedFolder;
                    await MediaService.upload({ file, folder });
                    successCount++;
                } catch (err) {
                    errors.push(`${file.name}: ${err instanceof Error ? err.message : String(err)}`);
                }
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
        onError: (err: unknown) => {
            const errorObj = err as { errors?: string[]; successCount?: number; total?: number };
            if (errorObj && errorObj.errors) {
                const msg = errorObj.errors.join("; ");
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
        mutationFn: (file: MediaFile) => MediaService.delete(file.id),
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
            const result = await MediaService.bulkDelete(Array.from(fileIds));
            return { succeeded: result.succeeded, total: result.total, failed: result.errors };
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

    // ── Bulk move mutation ──────────────────────────────────────────────────

    const bulkMoveMutation = useMutation({
        mutationFn: async (fileIds: Set<string>) => {
            const result = await MediaService.bulkMove(Array.from(fileIds), moveTargetFolder);
            return { succeeded: result.succeeded, total: result.total, failed: result.errors };
        },
        onSuccess: ({ succeeded, total, failed }) => {
            if (failed.length > 0) {
                toast({
                    title: `${succeeded} of ${total} files moved`,
                    description: `Errors: ${failed.join("; ")}`,
                    variant: "destructive",
                });
            } else {
                toast({ title: "Success", description: `${succeeded} file(s) moved to ${moveTargetFolder}` });
            }
            setSelectedFiles(new Set());
            void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
            setBulkMoveDialogOpen(false);
        },
    });

    // ── Sync: Supabase Storage ────────────────────────────────────────────────

    const syncStorageMutation = useMutation({
        mutationFn: MediaService.syncSupabaseStorage,
        onSuccess: ({ syncedCount }) => {
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
            const result = await MediaService.syncImageKitFiles();
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
                        "Deploy the imagekit-upload Edge Function and set IMAGEKIT_PRIVATE_KEY as a Supabase secret.",
                    variant: "destructive",
                });
            } else {
                toast({ title: "ImageKit sync failed", description: msg, variant: "destructive" });
            }
        } finally {
            setIsSyncingImageKit(false);
        }
    };

    // ── Migrate from Supabase Storage to ImageKit ──────────────────────────────

    const handleMigrateToImageKit = async () => {
        setIsMigrating(true);
        try {
            let hasMore = true;
            let totalProcessed = 0;
            let totalSkipped = 0;
            let totalErrors = 0;
            const allErrors: string[] = [];

            while (hasMore) {
                // Use a very small limit per request (5 files) to prevent the Edge Function
                // from hitting the hard wall-clock execution timeout (usually 5-10s).
                const result = await MediaService.migrateFromSupabase({ limit: 5 });
                
                totalProcessed += result.totalProcessed;
                totalSkipped += result.totalSkipped;
                totalErrors += result.totalErrors;
                if (result.errors && result.errors.length > 0) {
                    allErrors.push(...result.errors);
                }
                
                hasMore = result.hasMore ?? false;
                
                // Show a toast for progress during long migrations
                toast({
                    title: "Migration in progress...",
                    description: `Migrated ${totalProcessed} so far...`,
                });
            }

            toast({
                title: "Migration complete",
                description:
                    `${totalProcessed} migrated, ${totalSkipped} skipped, ${totalErrors} errors.`,
            });
            
            if (allErrors.length > 0) {
                console.warn("Migration errors:", allErrors);
            }
            void queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
        } catch (err) {
            toast({
                title: "Migration failed",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
            });
        } finally {
            setIsMigrating(false);
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
        const matchesFolder =
            selectedFolder === "all" ||
            (selectedFolder === "imagekit" ? file.provider === "imagekit" : file.folder === selectedFolder);
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
            
            
            <div className="fade-up-1">
                <AdminMetricsPanel 
                    metrics={[
                        { label: "Total Files", value: String(files.length) },
                        { label: "Storage Used", value: (files.reduce((a, f) => a + f.size, 0) / (1024 * 1024)).toFixed(1) + " MB" },
                        { label: "Images", value: String(files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(f.name)).length) },
                        { label: "Videos", value: String(files.filter(f => /\.(mp4|webm|ogg)$/i.test(f.name)).length) }
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
                        disabled={syncStorageMutation.isPending || isSyncingImageKit || isMigrating}
                        title="Import all files uploaded directly to ImageKit"
                    >
                        {isSyncingImageKit ? (
                            <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                        ) : (
                            <CloudDownload className={`${icons.sm} mr-2`} />
                        )}
                        {isSyncingImageKit ? "Importing…" : "Import from ImageKit"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleMigrateToImageKit}
                        disabled={syncStorageMutation.isPending || isSyncingImageKit || isMigrating}
                        title="Migrate all Supabase Storage files to ImageKit"
                    >
                        {isMigrating ? (
                            <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                        ) : (
                            <Database className={`${icons.sm} mr-2`} />
                        )}
                        {isMigrating ? "Migrating…" : "Migrate to ImageKit"}
                    </Button>
                </ModuleActions>
            )}
            </div>

            <div className="fade-up-3 space-y-6">
                {/* Visual Folder Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div
                        onClick={() => setSelectedFolder("all")}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedFolder("all"); }}
                        role="button"
                        tabIndex={0}
                        className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                            selectedFolder === "all" ? "bg-admin-primary/10 border-admin-primary ring-1 ring-admin-primary" : "bg-admin-card border-admin-border hover:bg-admin-surface hover:border-admin-primary/50"
                        }`}
                    >
                        <FolderOpen className={`w-8 h-8 ${selectedFolder === "all" ? "text-admin-primary" : "text-admin-text-subtle"}`} />
                        <span className={`text-sm font-semibold ${selectedFolder === "all" ? "text-admin-primary" : "text-admin-text"}`}>All Files</span>
                    </div>
                    {FOLDERS.map((folder) => (
                        <div
                            key={folder}
                            onClick={() => setSelectedFolder(folder)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedFolder(folder); }}
                            role="button"
                            tabIndex={0}
                            className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                                selectedFolder === folder ? "bg-admin-primary/10 border-admin-primary ring-1 ring-admin-primary" : "bg-admin-card border-admin-border hover:bg-admin-surface hover:border-admin-primary/50"
                            }`}
                        >
                            <FolderOpen className={`w-8 h-8 ${selectedFolder === folder ? "text-admin-primary" : "text-admin-text-subtle"}`} />
                            <span className={`text-sm font-semibold capitalize ${selectedFolder === folder ? "text-admin-primary" : "text-admin-text"}`}>{folder}</span>
                        </div>
                    ))}
                    <div
                        onClick={() => setSelectedFolder("imagekit")}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedFolder("imagekit"); }}
                        role="button"
                        tabIndex={0}
                        className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                            selectedFolder === "imagekit" ? "bg-admin-primary/10 border-admin-primary ring-1 ring-admin-primary" : "bg-admin-card border-admin-border hover:bg-admin-surface hover:border-admin-primary/50"
                        }`}
                    >
                        <CloudDownload className={`w-8 h-8 ${selectedFolder === "imagekit" ? "text-admin-primary" : "text-admin-text-subtle"}`} />
                        <span className={`text-sm font-semibold capitalize ${selectedFolder === "imagekit" ? "text-admin-primary" : "text-admin-text"}`}>ImageKit</span>
                    </div>
                </div>

                {/* Bulk selection toolbar */}
                <BulkActionsToolbar
                selectedCount={selectedFiles.size}
                onClear={() => setSelectedFiles(new Set())}
                onDelete={() => setBulkDeleteDialogOpen(true)}
                onMove={() => setBulkMoveDialogOpen(true)}
                isDeleting={bulkDeleteMutation.isPending}
                isMoving={bulkMoveMutation.isPending}
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

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
                </div>

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
                onConfirm={async () => { 
                    if (fileToDelete) await deleteMutation.mutateAsync(fileToDelete); 
                }}
            />

            {/* Bulk delete confirm */}
            <ConfirmDialog
                open={bulkDeleteDialogOpen}
                onOpenChange={setBulkDeleteDialogOpen}
                title="Delete Selected Files"
                description={`Are you sure you want to delete ${selectedFiles.size} files? This action cannot be undone.`}
                confirmText="Delete All"
                variant="destructive"
                onConfirm={async () => { await bulkDeleteMutation.mutateAsync(selectedFiles); }}
            />

            {/* Bulk move confirm / dialog */}
            <ConfirmDialog
                open={bulkMoveDialogOpen}
                onOpenChange={setBulkMoveDialogOpen}
                title={`Move ${selectedFiles.size} file${selectedFiles.size === 1 ? '' : 's'}`}
                description="Select a destination folder for the selected files."
                confirmText="Move Files"
                onConfirm={async () => { await bulkMoveMutation.mutateAsync(selectedFiles); }}
            >
                <div className="py-4">
                    <Select value={moveTargetFolder} onValueChange={setMoveTargetFolder}>
                        <SelectTrigger className="w-full">
                            <FolderOpen className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            {FOLDERS.filter(f => f !== "general").map((folder) => (
                                <SelectItem key={folder} value={folder} className="capitalize">
                                    {folder}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </ConfirmDialog>
            </div>
        </div>
    );
};

export default AdminMedia;
