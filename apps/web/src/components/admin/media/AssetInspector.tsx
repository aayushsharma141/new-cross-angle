import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssetService, type AssetRow } from "@/services/AssetService";
import { CollectionService } from "@/services/CollectionService";
import { Loader2, AlertCircle, Trash2, Link as LinkIcon, Info, Folders, X, Archive, ArchiveRestore } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/primitives/button";
import { ScrollArea } from "@/components/ui/primitives/scroll-area";
import { Separator } from "@/components/ui/primitives/separator";
import { Badge } from "@/components/ui/primitives/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives/select";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/useToast";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/primitives/dialog";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AssetInspectorProps {
    selectedAssetId: string | null;
    activeCollectionId?: string | null;
    onCollectionFilter?: (id: string | null) => void;
}

export function AssetInspector({ selectedAssetId, onCollectionFilter, activeCollectionId }: AssetInspectorProps) {
    const { data: assets } = useQuery({
        queryKey: ["dam", "assets"],
        queryFn: () => AssetService.getAssets(),
    });

    const asset = assets?.find(a => a.id === selectedAssetId);

    if (!selectedAssetId) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-background">
                <Info className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground mb-1">No Asset Selected</h3>
                <p className="text-sm">Select an asset from the sidebar to view its details, usages, and versions.</p>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <ScrollArea className="h-full bg-background">
            <div className="p-6 space-y-8 max-w-4xl mx-auto">
                <AssetPreview asset={asset} />
                <Separator />
                <AssetUsagePanel asset={asset} />
                <Separator />
                <AssetCollectionPanel asset={asset} onCollectionFilter={onCollectionFilter} activeCollectionId={activeCollectionId} />
                <Separator />
                <AssetMetadataPanel asset={asset} />
                <Separator />
                <AssetVersionPanel asset={asset} />
                <Separator />
                <AssetActionsPanel asset={asset} />
            </div>
        </ScrollArea>
    );
}

// -- Sub Components -- //

function AssetPreview({ asset }: { asset: AssetRow }) {
    // Use the first asset_version URL directly (latest is first due to order desc)
    const versionUrl = asset.asset_versions?.[0]?.url;
    const isLoading = false;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{asset.title}</h2>
                    <p className="text-sm text-muted-foreground">
                        Added {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
                    </p>
                </div>
                <Badge variant="outline" className="capitalize">{asset.type}</Badge>
            </div>

            <div className="aspect-video bg-muted/50 rounded-lg border border-border flex items-center justify-center overflow-hidden">
                {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                ) : versionUrl ? (
                    asset.type === "video" ? (
                        <video src={versionUrl} controls className="w-full h-full object-contain">
                            <track kind="captions" />
                        </video>
                    ) : (
                        <img src={versionUrl} alt={asset.title ?? "Asset"} className="w-full h-full object-contain" />
                    )
                ) : (
                    <div className="text-muted-foreground flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <span className="text-sm">Preview not available</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function AssetUsagePanel({ asset }: { asset: AssetRow }) {
    const { data: usages = [], isLoading } = useQuery({
        queryKey: ["dam", "asset_usages", asset.id],
        queryFn: () => AssetService.getAssetUsages(asset.id),
    });

    const isUsed = usages.length > 0;
    
    let healthStatus = "Orphaned";
    if (asset.status === "archived") healthStatus = "Archived";
    else if (asset.status !== "ready") healthStatus = "Processing";
    else if (isUsed) healthStatus = "In Use";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Usage & Safety</h3>
                    <div className="flex gap-2 items-center mt-1">
                        <span className={cn(
                            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                            healthStatus === "In Use" ? "bg-emerald-500/10 text-emerald-500" :
                            healthStatus === "Archived" ? "bg-amber-500/10 text-amber-500" :
                            healthStatus === "Processing" ? "bg-blue-500/10 text-blue-500" :
                            "bg-muted text-muted-foreground"
                        )}>
                            ● {healthStatus}
                        </span>
                    </div>
                </div>
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                    <Badge variant={isUsed ? "secondary" : "default"} className={!isUsed ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                        {isUsed ? `${usages.length} Usages` : "Safe to Delete"}
                    </Badge>
                )}
            </div>

            {!isLoading && isUsed && (
                <div className="border rounded-md divide-y overflow-hidden">
                    {usages.map((usage) => (
                        <div key={usage.id} className="flex items-center justify-between p-3 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium capitalize">{usage.entity_type} <span className="text-muted-foreground font-normal">({usage.role})</span></p>
                                    <p className="text-xs text-muted-foreground font-mono">{usage.entity_id}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to={`/admin/${usage.entity_type}s/${usage.entity_id}`}>Edit</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && !isUsed && (
                <div className="p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm">
                    This asset is not currently linked to any CMS entities. It can be safely archived or deleted.
                </div>
            )}
        </div>
    );
}

function AssetVersionPanel({ asset: _asset }: { asset: AssetRow }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Versions</h3>
            <div className="p-4 border rounded-md bg-muted/20 flex items-center justify-between">
                <div>
                    <Badge className="mb-1">v1 (Current)</Badge>
                    <p className="text-xs text-muted-foreground">Version history arriving in Phase 6.</p>
                </div>
            </div>
        </div>
    );
}

function AssetCollectionPanel({ asset, onCollectionFilter, activeCollectionId }: { asset: AssetRow; onCollectionFilter?: (id: string | null) => void; activeCollectionId?: string | null }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: collections = [] } = useQuery({
        queryKey: ["dam", "collections"],
        queryFn: () => CollectionService.getCollections(),
    });

    const assignMutation = useMutation({
        mutationFn: (collectionId: string | null) =>
            CollectionService.assignAssetToCollection(asset.id, collectionId),
        onSuccess: () => {
            toast({ title: "Collection updated" });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    // Determine current collection from loaded assets list
    const currentCollectionId = asset.collection_id;
    const currentCollection = collections.find((c) => c.id === currentCollectionId);

    const [selectedDropdownId, setSelectedDropdownId] = useState<string | undefined>(
        (!asset.collection_id && activeCollectionId) ? activeCollectionId : undefined
    );

    useEffect(() => {
        setSelectedDropdownId((!asset.collection_id && activeCollectionId) ? activeCollectionId : undefined);
    }, [asset.id, asset.collection_id, activeCollectionId]);

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Collection Context</h3>

            {currentCollection ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20">
                    <Folders className="w-5 h-5 text-muted-foreground shrink-0" />
                    <button 
                        type="button"
                        className="flex-1 min-w-0 cursor-pointer hover:underline text-left appearance-none bg-transparent border-none p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                        onClick={() => onCollectionFilter?.(currentCollection.id)}
                    >
                        <p className="text-sm font-medium truncate">{currentCollection.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{currentCollection.type.replace("_", " ")}</p>
                    </button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
                        onClick={() => assignMutation.mutate(null)}
                        disabled={assignMutation.isPending}
                        title="Remove from collection"
                        aria-label="Remove from collection"
                    >
                        {assignMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    </Button>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">Not in any collection.</p>
            )}

            <div className="flex gap-2 items-center">
                <Select
                    value={selectedDropdownId}
                    onValueChange={(v) => setSelectedDropdownId(v)}
                    disabled={assignMutation.isPending || collections.length === 0}
                >
                    <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder={collections.length === 0 ? "No collections" : "Assign to collection…"} />
                    </SelectTrigger>
                    <SelectContent>
                        {collections.map((col) => (
                            <SelectItem key={col.id} value={col.id} className="text-xs">
                                {col.name}
                                <span className="ml-2 text-muted-foreground capitalize text-[10px]">
                                    {col.type.replace("_", " ")}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button 
                    size="sm" 
                    className="h-8 text-xs px-3" 
                    disabled={!selectedDropdownId || assignMutation.isPending}
                    onClick={() => {
                        if (selectedDropdownId) assignMutation.mutate(selectedDropdownId);
                    }}
                >
                    Assign
                </Button>
            </div>
        </div>
    );
}

function AssetMetadataPanel({ asset }: { asset: AssetRow }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground mb-1">Asset ID</p>
                    <p className="font-mono text-xs">{asset.id}</p>
                </div>
                <div>
                    <p className="text-muted-foreground mb-1">Source</p>
                    <p className="capitalize">{asset.source}</p>
                </div>
                <div>
                    <p className="text-muted-foreground mb-1">Updated</p>
                    <p>{new Date(asset.updated_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}

function AssetActionsPanel({ asset }: { asset: AssetRow }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: usages = [], isLoading: usagesLoading } = useQuery({
        queryKey: ["dam", "asset_usages", asset.id],
        queryFn: () => AssetService.getAssetUsages(asset.id),
    });

    const archiveMutation = useMutation({
        mutationFn: () => AssetService.archiveAsset(asset.id),
        onSuccess: () => {
            toast({ title: "Asset Archived" });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
        },
    });

    const restoreMutation = useMutation({
        mutationFn: () => AssetService.restoreAsset(asset.id),
        onSuccess: () => {
            toast({ title: "Asset Restored" });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => AssetService.deleteAsset(asset.id),
        onSuccess: () => {
            toast({ title: "Asset Deleted" });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
            setDeleteDialogOpen(false);
        },
        onError: (err: Error) => {
            if (err.name === "AssetInUseError") {
                toast({ 
                    title: "Asset in Use", 
                    description: err.message, 
                    variant: "destructive" 
                });
            } else {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
            setDeleteDialogOpen(false);
        }
    });

    const isArchived = asset.status === "archived";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Governance</h3>
            <div className="flex gap-3">
                {isArchived ? (
                    <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => restoreMutation.mutate()}
                        disabled={restoreMutation.isPending}
                    >
                        {restoreMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArchiveRestore className="w-4 h-4 mr-2" />}
                        Restore
                    </Button>
                ) : (
                    <Button 
                        variant="outline"
                        size="sm" 
                        className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none" 
                        onClick={() => archiveMutation.mutate()}
                        disabled={archiveMutation.isPending}
                        aria-label="Archive asset"
                    >
                        {archiveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />}
                        Archive
                    </Button>
                )}
                
                <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={usagesLoading}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Asset</DialogTitle>
                        <DialogDescription>
                            {usages.length > 0 
                                ? `Cannot delete — still in use by ${usages.length} context(s). Please remove all references before deleting.`
                                : `Are you sure you want to permanently delete "${asset.title || asset.id}"? This cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {usages.length > 0 && (
                        <div className="border rounded-md divide-y overflow-hidden mt-4">
                            {usages.map((usage) => (
                                <div key={usage.id} className="flex items-center justify-between p-3 bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium capitalize">{usage.entity_type} <span className="text-muted-foreground font-normal">({usage.role})</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending || usages.length > 0}
                        >
                            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
