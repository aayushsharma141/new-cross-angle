import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CollectionService,
    type CollectionType,
} from "@/services/CollectionService";
import { MediaService } from "@/services/MediaService";
import {
    Folders,
    Trash2,
    Edit2,
    Check,
    X,
    Image as ImageIcon,
    FileVideo,
    File as FileIcon,
    ArrowLeft,
    HardDrive,
    Layers,
    Link as LinkIcon,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/primitives/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/primitives/dialog";
import { MediaUploadZone } from "@/components/admin/media/MediaUploadZone";
import { useToast } from "@/hooks/useToast";
import { getOptimizedUrl } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CollectionDetailViewProps {
    collectionId: string;
    onSelectAsset: (assetId: string) => void;
    onClearCollection: () => void;
}

const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
    shoot: "Shoot",
    campaign: "Campaign",
    moodboard_set: "Moodboard",
    project_delivery: "Delivery",
};

const COLLECTION_TYPE_COLORS: Record<CollectionType, string> = {
    shoot: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    campaign: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    moodboard_set: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    project_delivery: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function formatBytes(bytes: number | null | undefined): string {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function CollectionDetailView({
    collectionId,
    onSelectAsset,
    onClearCollection,
}: CollectionDetailViewProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Renaming state
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [typeInput, setTypeInput] = useState<CollectionType>("shoot");

    // Deletion modal state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadStats, setUploadStats] = useState<{ current: number; total: number; percent: number } | null>(null);

    const {
        data: details,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["dam", "collection_details", collectionId],
        queryFn: () => CollectionService.getCollectionDetails(collectionId),
    });

    const renameMutation = useMutation({
        mutationFn: (patch: { name?: string; type?: CollectionType }) =>
            CollectionService.updateCollection(collectionId, patch),
        onSuccess: () => {
            setIsEditingName(false);
            void queryClient.invalidateQueries({ queryKey: ["dam", "collection_details", collectionId] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
            toast({ title: "Collection updated" });
        },
        onError: (err: Error) => {
            toast({ title: "Failed to update", description: err.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => CollectionService.deleteCollection(collectionId),
        onSuccess: () => {
            toast({ title: "Collection deleted" });
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
            setIsDeleteDialogOpen(false);
            onClearCollection();
        },
        onError: (err: Error) => {
            setIsDeleteDialogOpen(false);
            toast({
                title: "Cannot delete collection",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    const removeAssetMutation = useMutation({
        mutationFn: (assetId: string) =>
            CollectionService.assignAssetToCollection(assetId, null),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["dam", "collection_details", collectionId] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
            toast({ title: "Asset removed from collection" });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const handleBulkUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        setUploadError(null);
        setUploadStats({ current: 0, total: files.length, percent: 0 });

        let successCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const { url, filePath } = await MediaService.uploadDamAsset({
                    file,
                    title: file.name,
                    domain: "system",
                    entityType: "system",
                    entityId: null,
                    role: "general",
                    collectionId,
                    onProgress: (p) => setUploadStats({ current: i + 1, total: files.length, percent: p }),
                });

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
                    },
                    { onConflict: "file_name" }
                );

                if (dbError) {
                    errors.push(`${file.name}: ${dbError.message}`);
                    continue;
                }

                successCount++;
            } catch (err: unknown) {
                errors.push(`${file.name}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        setIsUploading(false);
        setUploadStats(null);

        if (successCount > 0) {
            toast({
                title: "Upload Complete",
                description: `${successCount} of ${files.length} asset(s) ingested into collection`,
            });
            void queryClient.invalidateQueries({ queryKey: ["dam", "collection_details", collectionId] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
        }

        if (errors.length > 0) {
            const errorMsg = errors.join("; ");
            setUploadError(errorMsg);
            toast({
                title: "Some uploads failed",
                description: errorMsg,
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-background">
                <AlertCircle className="w-12 h-12 text-destructive mb-3 opacity-60" />
                <h3 className="text-lg font-medium text-foreground">Collection Not Found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    This collection may have been deleted or the ID is invalid.
                </p>
                <Button variant="outline" size="sm" onClick={onClearCollection} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Assets
                </Button>
            </div>
        );
    }

    const { collection, assets, totalBytes, totalUsages, inUseAssetsCount } = details;
    const utilizationRate = assets.length > 0 ? Math.round((inUseAssetsCount / assets.length) * 100) : 0;

    return (
        <div className="h-full overflow-y-auto bg-background p-6 space-y-8 max-w-6xl mx-auto">
            {/* Navigation & Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearCollection}
                        className="text-xs text-muted-foreground hover:text-foreground -ml-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Assets
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-xs text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Collection
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                    <div className="space-y-1.5 flex-1">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 max-w-md">
                                <Input
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    className="h-8 text-sm font-semibold"
                                    placeholder="Collection name"
                                />
                                <Select
                                    value={typeInput}
                                    onValueChange={(v) => setTypeInput(v as CollectionType)}
                                >
                                    <SelectTrigger className="h-8 w-36 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shoot">Shoot</SelectItem>
                                        <SelectItem value="campaign">Campaign</SelectItem>
                                        <SelectItem value="moodboard_set">Moodboard</SelectItem>
                                        <SelectItem value="project_delivery">Delivery</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-primary"
                                    disabled={!nameInput.trim() || renameMutation.isPending}
                                    onClick={() => renameMutation.mutate({ name: nameInput.trim(), type: typeInput })}
                                >
                                    {renameMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => setIsEditingName(false)}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <Folders className="w-6 h-6 text-primary shrink-0" />
                                    <span>{collection.name}</span>
                                </h1>
                                <button
                                    onClick={() => {
                                        setNameInput(collection.name);
                                        setTypeInput(collection.type);
                                        setIsEditingName(true);
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                    title="Edit collection details"
                                    aria-label="Edit collection details"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider", COLLECTION_TYPE_COLORS[collection.type])}>
                                    {COLLECTION_TYPE_LABELS[collection.type]}
                                </span>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Created on {new Date(collection.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium uppercase tracking-wider">Total Assets</span>
                        <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{assets.length}</div>
                    <p className="text-[11px] text-muted-foreground">Assets in this collection</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium uppercase tracking-wider">Storage Size</span>
                        <HardDrive className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{formatBytes(totalBytes)}</div>
                    <p className="text-[11px] text-muted-foreground">Active version payload</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium uppercase tracking-wider">Site References</span>
                        <LinkIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{totalUsages}</div>
                    <p className="text-[11px] text-muted-foreground">Total usages across rooms</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium uppercase tracking-wider">In-Use Ratio</span>
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            utilizationRate > 50 ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{utilizationRate}%</div>
                    <p className="text-[11px] text-muted-foreground">{inUseAssetsCount} of {assets.length} active</p>
                </div>
            </div>

            {/* Child Assets Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">Collection Assets</h2>
                    <span className="text-xs text-muted-foreground">{assets.length} files</span>
                </div>

                {assets.length === 0 ? (
                    <div className="p-8 border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <Folders className="w-10 h-10 opacity-30" />
                        <p className="text-sm font-medium">This collection is empty</p>
                        <p className="text-xs max-w-sm">Drop photos below or assign assets from the library to populate this collection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {assets.map((asset) => {
                            const isImage = asset.type === "image";
                            const isVideo = asset.type === "video";
                            const thumbUrl = asset.asset_versions?.[0]?.url;
                            const usagesCount = asset.asset_usages?.[0]?.count || 0;

                            return (
                                <button
                                    type="button"
                                    key={asset.id}
                                    onClick={() => onSelectAsset(asset.id)}
                                    className="group relative aspect-square flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40 overflow-hidden cursor-pointer hover:border-primary transition-all shadow-sm text-left p-0"
                                >
                                    {thumbUrl ? (
                                        <img
                                            src={getOptimizedUrl(thumbUrl, { width: 300, quality: 75 })}
                                            alt={asset.title || "Asset"}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {isImage ? (
                                                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                                            ) : isVideo ? (
                                                <FileVideo className="w-8 h-8 text-muted-foreground/50" />
                                            ) : (
                                                <FileIcon className="w-8 h-8 text-muted-foreground/50" />
                                            )}
                                        </div>
                                    )}

                                    {/* Top badges */}
                                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                                        <span className={cn(
                                            "text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm backdrop-blur-md text-white border",
                                            usagesCount > 0 ? "bg-emerald-500/80 border-emerald-500/20" : "bg-background/80 text-muted-foreground border-border"
                                        )}>
                                            {usagesCount > 0 ? `${usagesCount} In Use` : "Unused"}
                                        </span>
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeAssetMutation.mutate(asset.id);
                                        }}
                                        className="absolute top-2 left-2 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all z-10"
                                        title="Remove from collection"
                                        aria-label="Remove from collection"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>

                                    {/* Title Footer */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <p className="text-[11px] font-medium text-white truncate">{asset.title}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bulk Ingestion Zone (COLL-03) */}
            <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Bulk Ingestion</h3>
                        <p className="text-xs text-muted-foreground">Add multiple images or videos directly to this collection.</p>
                    </div>
                    {uploadStats && (
                        <span className="text-xs font-mono text-primary">
                            Uploading {uploadStats.current} of {uploadStats.total} ({uploadStats.percent}%)
                        </span>
                    )}
                </div>

                <MediaUploadZone
                    folderName={collection.name}
                    collectionId={collectionId}
                    isUploading={isUploading}
                    errorMessage={uploadError}
                    onUpload={handleBulkUpload}
                    onError={(err) => setUploadError(err)}
                />
            </div>

            {/* Delete confirmation modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Collection</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{collection.name}&quot;? Assets in this collection will not be deleted, but they will be unassigned from this collection.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate()}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
