import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssetService, type AssetRow } from "@/services/AssetService";
import { CollectionService, type CollectionRow, type CollectionType } from "@/services/CollectionService";
import {
    Loader2,
    Image as ImageIcon,
    File as FileIcon,
    FileVideo,
    Folders,
    Plus,
    Check,
    X,
    ChevronRight,
    Archive,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { getOptimizedUrl } from "@/lib/cdn";

const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
    shoot: "Shoot",
    campaign: "Campaign",
    moodboard_set: "Moodboard",
    project_delivery: "Delivery",
};

const COLLECTION_TYPE_COLORS: Record<CollectionType, string> = {
    shoot: "bg-blue-500/15 text-blue-400",
    campaign: "bg-amber-500/15 text-amber-400",
    moodboard_set: "bg-purple-500/15 text-purple-400",
    project_delivery: "bg-emerald-500/15 text-emerald-400",
};

interface AssetSidebarProps {
    selectedAssetId: string | null;
    onSelect: (id: string | null) => void;
    activeCollectionId: string | null;
    onCollectionFilter: (id: string | null) => void;
}

type SidebarTab = "assets" | "collections" | "archived";

export function AssetSidebar({
    selectedAssetId,
    onSelect,
    activeCollectionId,
    onCollectionFilter,
}: AssetSidebarProps) {
    const [tab, setTab] = useState<SidebarTab>("assets");
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionType, setNewCollectionType] = useState<CollectionType>("shoot");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [insightFilter, setInsightFilter] = useState<"all" | "unused" | "failed">("all");

    const { toast } = useToast();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: assets = [], isLoading: assetsLoading } = useQuery({
        queryKey: ["dam", "assets", activeCollectionId, debouncedQuery, insightFilter],
        queryFn: () => {
            const opts: { searchQuery?: string; unused?: boolean; status?: AssetRow["status"] } = {};
            if (debouncedQuery) opts.searchQuery = debouncedQuery;
            if (insightFilter === "unused") opts.unused = true;
            if (insightFilter === "failed") opts.status = "failed";
            return AssetService.getAssets(activeCollectionId, opts);
        },
    });

    const { data: collections = [], isLoading: collectionsLoading } = useQuery({
        queryKey: ["dam", "collections"],
        queryFn: () => CollectionService.getCollectionWithAssetCount(),
    });

    const { data: archivedAssets = [], isLoading: archivedLoading } = useQuery({
        queryKey: ["dam", "assets", "archived"],
        queryFn: () => AssetService.getArchivedAssets(),
    });

    const createMutation = useMutation({
        mutationFn: () => CollectionService.createCollection(newCollectionName.trim(), newCollectionType),
        onSuccess: (created) => {
            toast({ title: "Collection created", description: created.name });
            setIsCreatingCollection(false);
            setNewCollectionName("");
            setNewCollectionType("shoot");
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const handleCreateSubmit = () => {
        if (!newCollectionName.trim()) return;
        createMutation.mutate();
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            {/* Tab switcher */}
            <div className="flex-shrink-0 border-b border-border" role="tablist" aria-label="Sidebar sections">
                <div className="flex">
                    <button
                        role="tab"
                        aria-selected={!!(tab === "assets")}
                        aria-controls="panel-assets"
                        onClick={() => setTab("assets")}
                        className={cn(
                            "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                            tab === "assets"
                                ? "text-foreground border-b-2 border-primary -mb-px"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All Assets
                    </button>
                    <button
                        role="tab"
                        aria-selected={!!(tab === "collections")}
                        aria-controls="panel-collections"
                        onClick={() => setTab("collections")}
                        className={cn(
                            "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                            tab === "collections"
                                ? "text-foreground border-b-2 border-primary -mb-px"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Collections
                    </button>
                    <button
                        role="tab"
                        aria-selected={!!(tab === "archived")}
                        aria-controls="panel-archived"
                        onClick={() => setTab("archived")}
                        className={cn(
                            "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                            tab === "archived"
                                ? "text-foreground border-b-2 border-primary -mb-px"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Archived
                    </button>
                </div>
            </div>

            {/* ─── ALL ASSETS TAB ─────────────────────────────────────── */}
            {tab === "assets" && (
                <div id="panel-assets" role="tabpanel" className="flex-1 flex flex-col overflow-hidden">
                    {activeCollectionId && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-primary/10 border-b border-border text-xs text-primary">
                            <span className="truncate flex-1">Filtered by collection</span>
                            <button
                                onClick={() => onCollectionFilter(null)}
                                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                                aria-label="Clear collection filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    <div className="flex-shrink-0 p-3 border-b border-border space-y-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setInsightFilter("all")}
                                className={cn("text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary", insightFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setInsightFilter("unused")}
                                className={cn("text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary", insightFilter === "unused" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                            >
                                Unused
                            </button>
                            <button
                                onClick={() => setInsightFilter("failed")}
                                className={cn("text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary", insightFilter === "failed" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                            >
                                Failed Uploads
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{assets.length} results</p>
                    </div>

                    {assetsLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No assets found</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="grid grid-cols-2 gap-2">
                                {assets.map((asset) => {
                                    const isSelected = asset.id === selectedAssetId;
                                    const isImage = asset.type === "image";
                                    const isVideo = asset.type === "video";
                                    const thumbUrl = asset.asset_versions?.[0]?.url;

                                    const collection = collections.find(c => c.id === asset.collection_id);
                                    const usagesCount = asset.asset_usages?.[0]?.count || 0;
                                    
                                    let healthStatus = "Orphaned";
                                    if (asset.status === "archived") healthStatus = "Archived";
                                    else if (asset.status !== "ready") healthStatus = "Processing";
                                    else if (usagesCount > 0) healthStatus = "In Use";

                                    return (
                                        <button
                                            key={asset.id}
                                            onClick={() => onSelect(isSelected ? null : asset.id)}
                                            className={cn(
                                                "group relative aspect-square flex flex-col items-center justify-center rounded-md border bg-muted/50 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary transition-all",
                                                isSelected
                                                    ? "ring-2 ring-primary border-transparent"
                                                    : "border-border hover:border-primary/50 hover:bg-muted"
                                            )}
                                        >
                                            {thumbUrl ? (
                                                <img
                                                    src={getOptimizedUrl(thumbUrl, { width: 200, quality: 70 })}
                                                    alt={asset.title || "Asset"}
                                                    className="absolute inset-0 w-full h-full object-cover"
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
                                            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
                                                {collection && (
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); onCollectionFilter(collection.id); setTab("assets"); }}
                                                        className="text-[9px] px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md border bg-background/80 text-foreground border-border font-medium transition-colors hover:bg-background/100"
                                                    >
                                                        {collection.name}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                                                <span className={cn(
                                                    "text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm backdrop-blur-md text-white border",
                                                    healthStatus === "In Use" ? "bg-emerald-500/80 border-emerald-500/20" :
                                                    healthStatus === "Archived" ? "bg-amber-500/80 border-amber-500/20" :
                                                    healthStatus === "Processing" ? "bg-blue-500/80 border-blue-500/20" :
                                                    "bg-background/80 text-muted-foreground border-border"
                                                )}>
                                                    {healthStatus === "In Use" ? `${usagesCount} Usages` : healthStatus}
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm p-1.5 transform transition-transform",
                                                    isSelected ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                                                )}
                                            >
                                                <p className="text-[10px] truncate font-medium">{asset.title}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── COLLECTIONS TAB ────────────────────────────────────── */}
            {tab === "collections" && (
                <div id="panel-collections" role="tabpanel" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-border">
                        <p className="text-xs text-muted-foreground">{collections.length} collections</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 focus-visible:ring-1 focus-visible:ring-primary"
                            onClick={() => setIsCreatingCollection(true)}
                            title="New Collection"
                            aria-label="New Collection"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    {/* Create collection inline form */}
                    {isCreatingCollection && (
                        <div className="flex-shrink-0 p-3 border-b border-border bg-muted/30 space-y-2">
                            <p className="text-xs font-semibold">New Collection</p>
                            <Input
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="Collection name…"
                                className="h-7 text-xs"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateSubmit();
                                    if (e.key === "Escape") setIsCreatingCollection(false);
                                }}
                            />
                            <Select
                                value={newCollectionType}
                                onValueChange={(v) => setNewCollectionType(v as CollectionType)}
                            >
                                <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="shoot">Shoot</SelectItem>
                                    <SelectItem value="campaign">Campaign</SelectItem>
                                    <SelectItem value="moodboard_set">Moodboard</SelectItem>
                                    <SelectItem value="project_delivery">Project Delivery</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-1.5">
                                <Button
                                    size="sm"
                                    className="h-7 text-xs flex-1"
                                    onClick={handleCreateSubmit}
                                    disabled={!newCollectionName.trim() || createMutation.isPending}
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Check className="w-3 h-3" />
                                    )}
                                    Create
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => setIsCreatingCollection(false)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {collectionsLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                            <Folders className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No collections yet</p>
                            <p className="text-xs mt-1 max-w-[160px]">
                                Group assets into collections for easier management.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 h-7 text-xs"
                                onClick={() => setIsCreatingCollection(true)}
                            >
                                <Plus className="w-3 h-3 mr-1" /> New Collection
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {/* "All" row to clear filter */}
                            <button
                                onClick={() => {
                                    onCollectionFilter(null);
                                    setTab("assets");
                                }}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                                    !activeCollectionId
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="flex-1">All Assets</span>
                            </button>

                            {collections.map((col) => (
                                <CollectionRow
                                    key={col.id}
                                    collection={col}
                                    isActive={activeCollectionId === col.id}
                                    onClick={() => {
                                        onCollectionFilter(col.id);
                                        setTab("assets");
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── ARCHIVED TAB ───────────────────────────────────────── */}
            {tab === "archived" && (
                <div id="panel-archived" role="tabpanel" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 p-3 border-b border-border flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{archivedAssets.length} archived assets</p>
                    </div>

                    {archivedLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : archivedAssets.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                            <Archive className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No archived assets</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="grid grid-cols-2 gap-2">
                                {archivedAssets.map((asset) => {
                                    const isSelected = asset.id === selectedAssetId;
                                    const isImage = asset.type === "image";
                                    const isVideo = asset.type === "video";
                                    const thumbUrl = asset.asset_versions?.[0]?.url;

                                    const collection = collections.find(c => c.id === asset.collection_id);

                                    return (
                                        <button
                                            key={asset.id}
                                            onClick={() => onSelect(isSelected ? null : asset.id)}
                                            className={cn(
                                                "group relative aspect-square flex flex-col items-center justify-center rounded-md border bg-muted/50 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary transition-all",
                                                isSelected
                                                    ? "ring-2 ring-primary border-transparent"
                                                    : "border-border hover:border-primary/50 hover:bg-muted"
                                            )}
                                        >
                                            {thumbUrl ? (
                                                <img
                                                    src={getOptimizedUrl(thumbUrl, { width: 200, quality: 70 })}
                                                    alt={asset.title || "Asset"}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {isImage ? (
                                                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                                    ) : isVideo ? (
                                                        <FileVideo className="w-8 h-8 text-muted-foreground/30" />
                                                    ) : (
                                                        <FileIcon className="w-8 h-8 text-muted-foreground/30" />
                                                    )}
                                                </div>
                                            )}
                                            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
                                                {collection && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md border bg-background/80 text-foreground border-border font-medium">
                                                        {collection.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                                                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm backdrop-blur-md text-white border bg-amber-500/80 border-amber-500/20">
                                                    Archived
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm p-1.5 transform transition-transform",
                                                    isSelected ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                                                )}
                                            >
                                                <p className="text-[10px] truncate font-medium">{asset.title}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CollectionRow({
    collection,
    isActive,
    onClick,
}: {
    collection: CollectionRow;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors group",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Folders className="w-3.5 h-3.5 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium truncate", isActive ? "text-primary" : "text-foreground")}>
                    {collection.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                        className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            COLLECTION_TYPE_COLORS[collection.type]
                        )}
                    >
                        {COLLECTION_TYPE_LABELS[collection.type]}
                    </span>
                    {collection.asset_count !== undefined && (
                        <span className="text-[10px] text-muted-foreground">
                            {collection.asset_count} assets
                        </span>
                    )}
                </div>
            </div>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
        </button>
    );
}
