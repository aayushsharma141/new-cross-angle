import { useQuery } from "@tanstack/react-query";
import { AssetService } from "@/services/AssetService";
import { Loader2, Image as ImageIcon, File as FileIcon, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetSidebarProps {
    selectedAssetId: string | null;
    onSelect: (id: string | null) => void;
}

export function AssetSidebar({ selectedAssetId, onSelect }: AssetSidebarProps) {
    const { data: assets = [], isLoading } = useQuery({
        queryKey: ["dam", "assets"],
        queryFn: AssetService.getAssets,
    });

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No assets found</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-background sticky top-0 z-10 flex-shrink-0">
                <h2 className="text-sm font-semibold tracking-tight">All Assets</h2>
                <p className="text-xs text-muted-foreground mt-1">{assets.length} items</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset) => {
                        const isSelected = asset.id === selectedAssetId;
                        const isImage = asset.type === "image";
                        const isVideo = asset.type === "video";

                        return (
                            <button
                                key={asset.id}
                                onClick={() => onSelect(isSelected ? null : asset.id)}
                                className={cn(
                                    "group relative aspect-square flex flex-col items-center justify-center rounded-md border bg-muted/50 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary",
                                    isSelected ? "ring-2 ring-primary border-transparent" : "border-border hover:border-primary/50 hover:bg-muted"
                                )}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {isImage ? (
                                        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                                    ) : isVideo ? (
                                        <FileVideo className="w-8 h-8 text-muted-foreground/50" />
                                    ) : (
                                        <FileIcon className="w-8 h-8 text-muted-foreground/50" />
                                    )}
                                    {/* TODO: If we want real thumbnails, we need to fetch asset_versions or use the legacy url if available */}
                                </div>
                                <div className={cn(
                                    "absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur-sm p-2 transform transition-transform",
                                    isSelected ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                                )}>
                                    <p className="text-xs truncate font-medium">{asset.title}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
