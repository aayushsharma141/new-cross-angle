import { useQuery } from "@tanstack/react-query";
import { AssetService } from "@/services/AssetService";
import { Loader2, Image as ImageIcon, FileVideo, AlertCircle, Trash2, Download, RefreshCw, Link as LinkIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { ScrollArea } from "@/components/ui/primitives/scroll-area";
import { Separator } from "@/components/ui/primitives/separator";
import { Badge } from "@/components/ui/primitives/badge";
import { formatDistanceToNow } from "date-fns";

interface AssetInspectorProps {
    selectedAssetId: string | null;
}

export function AssetInspector({ selectedAssetId }: AssetInspectorProps) {
    const { data: assets } = useQuery({
        queryKey: ["dam", "assets"],
        queryFn: AssetService.getAssets,
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
                <AssetUsagePanel assetId={asset.id} />
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AssetVersionPanel asset={asset} />
                    <AssetCollectionPanel asset={asset} />
                </div>
                <Separator />
                <AssetMetadataPanel asset={asset} />
                <Separator />
                <AssetActionsPanel asset={asset} />
            </div>
        </ScrollArea>
    );
}

// -- Sub Components -- //

function AssetPreview({ asset }: { asset: any }) {
    // In DAM V3, we load the actual URL from the current_version_id
    const { data: version, isLoading } = useQuery({
        queryKey: ["dam", "asset_versions", asset.current_version_id],
        queryFn: () => AssetService.getAssetVersion(asset.current_version_id),
        enabled: !!asset.current_version_id,
    });

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
                ) : version?.url ? (
                    asset.type === "video" ? (
                        <video src={version.url} controls className="w-full h-full object-contain" />
                    ) : (
                        <img src={version.url} alt={asset.title} className="w-full h-full object-contain" />
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

function AssetUsagePanel({ assetId }: { assetId: string }) {
    const { data: usages = [], isLoading } = useQuery({
        queryKey: ["dam", "asset_usages", assetId],
        queryFn: () => AssetService.getAssetUsages(assetId),
    });

    const isUsed = usages.length > 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Usage & Safety</h3>
                    <p className="text-sm text-muted-foreground">Where is this asset actively used?</p>
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
                            <Button variant="ghost" size="sm">View</Button>
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

function AssetVersionPanel({ asset }: { asset: any }) {
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

function AssetCollectionPanel({ asset }: { asset: any }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Collections</h3>
            <div className="p-4 border border-dashed rounded-md bg-muted/10 text-center">
                <p className="text-xs text-muted-foreground">Collections feature arriving in Phase 7.</p>
                <Button variant="link" size="sm" className="mt-1 h-auto py-0 text-xs" disabled>
                    Assign to Collection
                </Button>
            </div>
        </div>
    );
}

function AssetMetadataPanel({ asset }: { asset: any }) {
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

function AssetActionsPanel({ asset }: { asset: any }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
            <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                </Button>
                <Button variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replace (v2)
                </Button>
                <Button variant="destructive" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Asset
                </Button>
            </div>
        </div>
    );
}
