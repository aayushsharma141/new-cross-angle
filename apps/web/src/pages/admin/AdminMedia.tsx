import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    Loader2,
    FolderOpen,
    CloudDownload,
    HardDrive,
    FileImage,
    FileVideo,
    Files,
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { useToast } from "@/hooks/useToast";
import { supabase, invokeEdge } from "@/integrations/supabase/client";
import { MediaService } from "@/services/media";
import { AssetService } from "@/services/AssetService";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AssetWorkspaceLayout } from "@/components/admin/media/AssetWorkspaceLayout";
import { icons } from "@/design-system/tokens/icons";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { AdminMetricsPanel, AdminSkeletonCard } from "@/components/admin/shared";
import { queryKeys } from "@/lib/queryKeys";

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
    const queryClient = useQueryClient();

    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
    const [isSyncingImageKit, setIsSyncingImageKit] = useState(false);

    // ── Data fetching ─────────────────────────────────────────────────────────

    // The KPI row must describe the same store the workspace below renders.
    //
    // It previously counted `media_files` (the v2 store) while
    // AssetWorkspaceLayout lists `assets` (the v3 DAM), so the header claimed
    // 131 files above a grid showing 22. Until media_files is retired per
    // ADR-0002, the headline numbers follow the assets the user can actually
    // see; `files` stays for the Sync/Import flows that still target v2.
    const { data: damAssets = [], isLoading } = useQuery({
        queryKey: ["dam", "assets", "metrics"],
        queryFn: () => AssetService.getAssets(null, { limit: 1000 }),
    });

    const damMetrics = useMemo(() => {
        const bytes = damAssets.reduce(
            (sum, a) => sum + (a.asset_versions?.[0]?.size_bytes ?? 0),
            0,
        );
        return {
            total: damAssets.length,
            images: damAssets.filter((a) => a.type === "image").length,
            videos: damAssets.filter((a) => a.type === "video").length,
            megabytes: (bytes / (1024 * 1024)).toFixed(1),
        };
    }, [damAssets]);





    // ── Delete mutation ───────────────────────────────────────────────────────

    const deleteMutation = useMutation({
        // Routed through MediaService: it resolves the provider from the row's
        // storage_provider and deletes by storage_path. Removing from the
        // `media` bucket by display name (as this did) never touched
        // ImageKit-backed files and left them orphaned in the CDN.
        mutationFn: (file: MediaFile) => MediaService.delete(file.id),
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
        mutationFn: (fileIds: Set<string>) => MediaService.bulkDelete(Array.from(fileIds)),
        onSuccess: ({ succeeded, total, errors }) => {
            if (errors.length > 0) {
                toast({
                    title: `${succeeded} of ${total} files deleted`,
                    description: `Errors: ${errors.join("; ")}`,
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
                            // media_files has no uploaded_by column — passing it
                            // made this insert fail typecheck and would have been
                            // rejected by PostgREST at runtime.
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
            // Must go through invokeEdge (/api/supabase/functions/v1/...), not a
            // direct call to VITE_SUPABASE_URL. Auth lives in an HTTP-only
            // access_token cookie that only the proxy path can use: middleware
            // (or the vite dev proxy) reads it and injects the Authorization
            // header. A direct call to the Supabase origin never sees that
            // cookie and so cannot authenticate.
            const { data: result, error } = await invokeEdge<{
                upserted: number;
                errors?: string[];
            }>("sync-imagekit", { limit: 1000 });

            if (error) throw new Error(error.message);
            if (!result) throw new Error("Empty response from sync-imagekit");

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
                        { label: "Total Assets", value: String(damMetrics.total), icon: Files },
                        { label: "Storage Used", value: damMetrics.megabytes + " MB", icon: HardDrive },
                        { label: "Images", value: String(damMetrics.images), icon: FileImage },
                        { label: "Videos", value: String(damMetrics.videos), icon: FileVideo }
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
                            Sync
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
                            {isSyncingImageKit ? "Importing…" : "Import"}
                        </Button>
                    </ModuleActions>
                )}
            </div>

            <div className="fade-up-3 space-y-6">
                {/* Asset Workspace */}
                <div className="h-[calc(100vh-12rem)] min-h-[600px] border border-border rounded-xl overflow-hidden mt-6">
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
