import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    Loader2,
    FolderOpen,
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
import { MediaUploadZone } from "@/components/admin/media/MediaUploadZone";
import { AssetWorkspaceLayout } from "@/components/admin/media/AssetWorkspaceLayout";
import { icons } from "@/design-system/tokens/icons";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { AdminMetricsPanel, AdminSkeletonCard } from "@/components/admin/shared";
import { queryKeys } from "@/lib/queryKeys";
import type { Tables } from "@/integrations/supabase/types";
import { MediaService } from "@/services/MediaService";

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

type MediaRow = Tables<"media_files">;

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
        .from("media_files")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((file: MediaRow) => ({
        id: file.id,
        name: file.display_name || file.file_name,
        url: file.url,
        folder: deriveFolder(file.file_name),
        size: file.size_bytes || 0,
        created_at: file.created_at || "",
        alt: file.alt_text || undefined,
        caption: file.caption || undefined,
    }));
};

const AdminMedia = () => {
    const { toast } = useToast();
    const { isEditor } = useAdminAuth();
    const queryClient = useQueryClient();

    const [selectedFolder] = useState<string>("all");

    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isSyncingImageKit, setIsSyncingImageKit] = useState(false);

    // DAM contextual states
    const [uploadDomain, setUploadDomain] = useState<string>("system");
    const [uploadEntityType, setUploadEntityType] = useState<string>("system");
    const [uploadRole, setUploadRole] = useState<string>("general");

    // ── Data fetching ─────────────────────────────────────────────────────────

    const { data: files = [], isLoading } = useQuery({
        queryKey: queryKeys.media.all,
        queryFn: fetchMediaFiles,
    });



    // ── Upload mutation ───────────────────────────────────────────────────────

    const uploadMutation = useMutation({
        mutationFn: async (fileList: File[]) => {
            const { data: userData } = await supabase.auth.getUser();
            let successCount = 0;
            const errors: string[] = [];

            for (const file of fileList) {
                try {
                    // 1. Upload to DAM (ImageKit + assets + asset_versions + optionally asset_usages)
                    const { url, filePath } = await MediaService.uploadDamAsset({
                        file,
                        title: file.name,
                        domain: uploadDomain,
                        entityType: uploadEntityType,
                        entityId: null, // UI currently doesn't specify an entity ID
                        role: uploadRole
                    });

                    // 2. Dual Write to Legacy `media_files` (keeps old CMS UI working)
                    const { error: dbError } = await supabase.from("media_files").upsert(
                        {
                            url: url,
                            file_name: filePath,
                            display_name: file.name,
                            mime_type: file.type || "application/octet-stream",
                            size_bytes: file.size,
                            alt_text: file.name,
                            caption: file.name,
                            storage_provider: "imagekit",
                            storage_path: filePath,
                            uploaded_by: userData?.user?.id,
                        },
                        { onConflict: "file_name" }
                    );

                    if (dbError) {
                        errors.push(`${file.name}: Legacy DB Error - ${dbError.message}`);
                        // Ideally we'd rollback DAM here, but we will let it pass for now.
                        continue;
                    }

                    successCount++;
                } catch (e: unknown) {
                    errors.push(`${file.name}: ${e.message}`);
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
            if (err && typeof err === "object" && "errors" in err && Array.isArray(err.errors)) {
                const msg = err.errors.join("; ");
                setUploadError(msg);
                toast({
                    title: `${err.successCount || 0} of ${err.total || 0} file(s) uploaded`,
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
            const { error: dbError } = await supabase.from("media_files").delete().eq("id", file.id);
            if (dbError) throw dbError;

            const { error: storageError } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([file.name]);
            if (storageError) console.error("Storage delete failed:", storageError);
        },
        onSuccess: () => {
            toast({ title: "Success", description: "File deleted successfully" });
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
                    const { error: dbError } = await supabase.from("media_files").delete().eq("id", f.id);
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
                        .from("media_files")
                        .select("id")
                        .eq("file_name", path)
                        .maybeSingle();
                    if (!existing) {
                        const { data: publicUrlObj } = supabase.storage
                            .from(BUCKET_NAME)
                            .getPublicUrl(path);
                        await supabase.from("media_files").insert({
                            url: publicUrlObj.publicUrl,
                            file_name: path,
                            display_name: file.name,
                            mime_type: file.metadata?.mimetype || "unknown",
                            size_bytes: file.metadata?.size || 0,
                            alt_text: file.name,
                            caption: file.name,
                            storage_provider: "supabase",
                            storage_path: path,
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
                        { label: "Total Files", value: String(files.length), icon: Files },
                        { label: "Storage Used", value: (files.reduce((a, f) => a + f.size, 0) / (1024 * 1024)).toFixed(1) + " MB", icon: HardDrive },
                        { label: "Images", value: String(files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(f.name)).length), icon: FileImage },
                        { label: "Videos", value: String(files.filter(f => /\.(mp4|webm|ogg)$/i.test(f.name)).length), icon: FileVideo }
                    ] as unknown as never} 
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
                {/* Upload zone */}
                {!isReadOnly && (
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 border border-admin-border/50 rounded-xl bg-admin-card/50">
                            <div className="space-y-1 flex-1">
                                <label htmlFor="dam-domain-select" className="text-xs text-muted-foreground font-semibold">DAM Domain</label>
                                <Select value={uploadDomain} onValueChange={setUploadDomain}>
                                    <SelectTrigger id="dam-domain-select"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="system">System (Default)</SelectItem>
                                        <SelectItem value="portfolio">Portfolio</SelectItem>
                                        <SelectItem value="services">Services</SelectItem>
                                        <SelectItem value="discovery">Discovery</SelectItem>
                                        <SelectItem value="blog">Blog</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1 flex-1">
                                <label htmlFor="entity-type-input" className="text-xs text-muted-foreground font-semibold">Entity Type</label>
                                <Input id="entity-type-input" placeholder="e.g., projects, archetypes" value={uploadEntityType} onChange={e => setUploadEntityType(e.target.value)} />
                            </div>
                            <div className="space-y-1 flex-1">
                                <label htmlFor="role-input" className="text-xs text-muted-foreground font-semibold">Role</label>
                                <Input id="role-input" placeholder="e.g., general, hero, gallery" value={uploadRole} onChange={e => setUploadRole(e.target.value)} />
                            </div>
                        </div>
                        <MediaUploadZone
                            onUpload={(fileList) => uploadMutation.mutate(fileList)}
                            isUploading={uploadMutation.isPending}
                            folderName={selectedFolder}
                            errorMessage={uploadError}
                        />
                    </div>
                )}

                {/* Asset Workspace */}
                <div className="h-[700px] border border-border rounded-xl overflow-hidden mt-6">
                    <AssetWorkspaceLayout />
                </div>

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
