import { useState, useEffect, useMemo } from "react";
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
    ArchiveRestore,
    Search,
    Upload,
    Trash2,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/primitives/select";
import { useToast } from "@/hooks/useToast";
import { getOptimizedUrl } from "@/lib/cdn";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/primitives/dialog";
import { MediaUploadZone } from "@/components/admin/media/MediaUploadZone";
import { MediaService } from "@/services/MediaService";
import { supabase } from "@/integrations/supabase/client";

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
    const [insightFilter, setInsightFilter] = useState<"all" | "unused" | "failed" | "recent" | "duplicates">("all");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [filterDomain, setFilterDomain] = useState<string>("all");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [filterTags, setFilterTags] = useState<string[]>([]);

    // Upload state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadDomain, setUploadDomain] = useState<string>("system");
    const [uploadEntityType, setUploadEntityType] = useState<string>("system");
    const [uploadRole, setUploadRole] = useState<string>("general");
    const [uploadStats, setUploadStats] = useState<{ current: number; total: number; percent: number } | null>(null);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: damAssets = [], isLoading: damLoading } = useQuery({
        queryKey: ["dam", "assets", activeCollectionId, debouncedQuery, insightFilter, filterDomain, filterRole, filterTags],
        queryFn: () => {
            const opts: { searchQuery?: string; unused?: boolean; status?: AssetRow["status"]; recent?: boolean; domain?: string; role?: string; tags?: string[] } = {};
            if (debouncedQuery) opts.searchQuery = debouncedQuery;
            if (insightFilter === "unused") opts.unused = true;
            if (insightFilter === "failed") opts.status = "failed";
            if (insightFilter === "recent") opts.recent = true;
            if (filterDomain !== "all") opts.domain = filterDomain;
            if (filterRole !== "all") opts.role = filterRole;
            if (filterTags.length > 0) opts.tags = filterTags;
            return AssetService.getAssets(activeCollectionId, opts);
        },
    });

    const { data: tags = [] } = useQuery({
        queryKey: ["dam", "tags"],
        queryFn: () => AssetService.getTags(),
    });

    const { data: legacyFiles = [], isLoading: legacyLoading } = useQuery({
        queryKey: ["dam", "legacy-files", debouncedQuery],
        queryFn: () => MediaService.getFiles(),
        enabled: tab === "assets" && !activeCollectionId,
    });

    const assets = useMemo(() => {
        const mapped: AssetRow[] = legacyFiles.map((f) => ({
            id: f.id,
            collection_id: f.folderId,
            title: f.name,
            type: f.mimeType.startsWith("video/") ? "video" : f.mimeType.startsWith("image/") ? "image" : "document" as AssetRow["type"],
            source: "uploaded" as AssetRow["source"],
            status: "ready" as AssetRow["status"],
            created_at: f.createdAt,
            updated_at: f.createdAt,
            asset_versions: [{ id: f.id, url: f.url, version_number: 1, file_id: f.id }],
            asset_usages: [{ count: 0 }],
        }));
        let all = [...damAssets, ...mapped];
        if (debouncedQuery) {
            const q = debouncedQuery.toLowerCase();
            all = all.filter((a) => (a.title || "").toLowerCase().includes(q));
        }
        if (insightFilter === "unused") all = all.filter((a) => !a.asset_usages?.[0]?.count);
        if (insightFilter === "duplicates") {
            const sizeMap = new Map<number, AssetRow[]>();
            for (const a of all) {
                const size = a.asset_versions?.[0]?.size_bytes;
                if (size) {
                    if (!sizeMap.has(size)) sizeMap.set(size, []);
                    sizeMap.get(size)!.push(a);
                }
            }
            all = [];
            for (const group of sizeMap.values()) {
                if (group.length > 1) {
                    all.push(...group);
                }
            }
        }
        return all;
    }, [damAssets, legacyFiles, debouncedQuery, insightFilter]);

    const assetsLoading = damLoading || legacyLoading;

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

    const uploadMutation = useMutation({
        mutationFn: async (fileList: File[]) => {
            let successCount = 0;
            const errors: string[] = [];

            setUploadStats({ current: 0, total: fileList.length, percent: 0 });

            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                try {
                    const { url, filePath } = await MediaService.uploadDamAsset({
                        file,
                        title: file.name,
                        domain: uploadDomain,
                        entityType: uploadEntityType,
                        entityId: null,
                        role: uploadRole,
                        collectionId: activeCollectionId,
                        onProgress: (p) => setUploadStats({ current: i + 1, total: fileList.length, percent: p })
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
                        errors.push(`${file.name}: Legacy DB Error - ${dbError.message}`);
                        continue;
                    }

                    successCount++;
                } catch (e: unknown) {
                    errors.push(`${file.name}: ${e instanceof Error ? e.message : String(e)}`);
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
            setIsUploadModalOpen(false);
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
        },
        onError: (err: unknown) => {
            if (err && typeof err === "object" && "errors" in err && Array.isArray((err as Record<string, unknown>).errors)) {
                const payload = err as { errors: string[]; successCount?: number; total?: number };
                const msg = payload.errors.join("; ");
                setUploadError(msg);
                toast({
                    title: `${payload.successCount || 0} of ${payload.total || 0} file(s) uploaded`,
                    description: `Failed: ${msg}`,
                    variant: "default",
                });
                void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
                void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
            } else {
                toast({ title: "Error", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
            }
        },
    });

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            {/* Tab switcher */}
            <div className="flex-shrink-0 border-b border-border" role="tablist" aria-label="Sidebar sections">
                <div className="flex">
                    <button
                        role="tab"
                        {...({ "aria-selected": tab === "assets" })}
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
                        {...({ "aria-selected": tab === "collections" })}
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
                        {...({ "aria-selected": tab === "archived" })}
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
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex items-center gap-1 hover:text-foreground font-medium px-2 py-0.5 rounded border border-primary/20 bg-primary/10 transition-colors"
                            >
                                <Upload className="w-3 h-3 shrink-0" />
                                Upload
                            </button>
                            <button
                                onClick={() => onCollectionFilter(null)}
                                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                                aria-label="Clear collection filter"
                            >
                                <X className="w-3 h-3 shrink-0" />
                            </button>
                        </div>
                    )}
                    <div className="flex-shrink-0 p-3 border-b border-border space-y-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search assets�"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <Button
                                size="sm"
                                variant={isFiltersOpen ? "secondary" : "outline"}
                                className="h-[30px] px-2 border-border/60"
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                title="Filters"
                            >
                                <Filter className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-[30px] px-2 border-border/60 hover:bg-muted"
                                onClick={() => setIsUploadModalOpen(true)}
                                title="Upload Asset"
                            >
                                <Upload className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                        {isFiltersOpen && (
                            <div className="p-2 bg-muted/30 rounded-md border border-border/60 space-y-2 animate-in fade-in slide-in-from-top-1">
                                <div className="flex gap-2">
                                    <Select value={filterDomain} onValueChange={setFilterDomain}>
                                        <SelectTrigger className="h-7 text-xs flex-1"><SelectValue placeholder="Domain" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Domains</SelectItem>
                                            <SelectItem value="portfolio">Portfolio</SelectItem>
                                            <SelectItem value="services">Services</SelectItem>
                                            <SelectItem value="discovery">Discovery</SelectItem>
                                            <SelectItem value="blog">Blog</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterRole} onValueChange={setFilterRole}>
                                        <SelectTrigger className="h-7 text-xs flex-1"><SelectValue placeholder="Role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="hero">Hero</SelectItem>
                                            <SelectItem value="gallery">Gallery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1">Tags</p>
                                    <div className="flex flex-wrap gap-1">
                                        {tags.map(t => (
                                            <button 
                                                key={t.id} 
                                                onClick={() => setFilterTags(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])}
                                                className={cn("px-1.5 py-0.5 rounded text-[10px] border transition-colors", filterTags.includes(t.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted")}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                        {tags.length === 0 && <span className="text-[10px] text-muted-foreground">No tags available</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setInsightFilter("all")}
                                className={cn("text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary", insightFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setInsightFilter("recent")}
                                className={cn("text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary", insightFilter === "recent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                            >
                                Recent
                            </button>
                            <button
                                onClick={() => setInsightFilter("unused")}
                                className={cn("text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary", insightFilter === "unused" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                            >
                                Unused
                            </button>
                            <button
                                onClick={() => setInsightFilter("duplicates")}
                                className={cn("text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary", insightFilter === "duplicates" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                            >
                                Duplicates
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
                                {archivedAssets.map((asset) => (
                                    <ArchivedAssetCard
                                        key={asset.id}
                                        asset={asset}
                                        collections={collections}
                                        isSelected={asset.id === selectedAssetId}
                                        onSelect={() => onSelect(asset.id === selectedAssetId ? null : asset.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>{activeCollectionId ? "Upload to Collection" : "Upload Asset"}</DialogTitle>
                        <DialogDescription>
                            Upload a new asset to the Digital Asset Manager.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="flex gap-4 p-4 border border-border/50 rounded-xl bg-muted/50">
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
                            folderName="collection"
                            errorMessage={uploadError}
                            collectionId={activeCollectionId}
                        />
                        {uploadMutation.isPending && uploadStats && (
                            <div className="text-xs text-center text-muted-foreground animate-pulse">
                                Uploading {uploadStats.current} / {uploadStats.total} files ({Math.round(uploadStats.percent)}%)
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
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
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(collection.name);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const updateMutation = useMutation({
        mutationFn: () => CollectionService.updateCollection(collection.id, { name: newName.trim() }),
        onSuccess: () => {
            toast({ title: "Collection renamed", description: newName });
            setIsRenaming(false);
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => CollectionService.deleteCollection(collection.id),
        onSuccess: () => {
            toast({ title: "Collection deleted" });
            setIsDeleteDialogOpen(false);
            void queryClient.invalidateQueries({ queryKey: ["dam", "collections"] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const handleRenameSubmit = () => {
        if (!newName.trim() || newName.trim() === collection.name) {
            setIsRenaming(false);
            return;
        }
        updateMutation.mutate();
    };

    return (
        <>
            <div
                className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors group relative",
                    isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <button 
                    aria-label={`Select collection: ${collection.name}`}
                    className="flex-1 min-w-0 flex items-center gap-2.5 outline-none"
                    onClick={() => {
                        if (isRenaming) return;
                        onClick();
                    }}
                >
                    <Folders className="w-3.5 h-3.5 shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                        {isRenaming ? (
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-6 text-xs px-1.5 py-0 bg-background/50"
                                // eslint-disable-next-line jsx-a11y/no-autofocus -- Focus is required for inline editing UX
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.stopPropagation();
                                        handleRenameSubmit();
                                    }
                                    if (e.key === "Escape") {
                                        e.stopPropagation();
                                        setIsRenaming(false);
                                        setNewName(collection.name);
                                    }
                                }}
                                onBlur={() => {
                                    setIsRenaming(false);
                                    setNewName(collection.name);
                                }}
                                disabled={updateMutation.isPending}
                            />
                        ) : (
                            <button 
                                type="button"
                                className={cn("text-xs font-medium truncate cursor-text", isActive ? "text-primary" : "text-foreground")}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsRenaming(true);
                                }}
                                title="Click to rename"
                            >
                                {collection.name}
                            </button>
                        )}
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
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDeleteDialogOpen(true);
                        }}
                        className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors text-muted-foreground"
                        title="Delete collection"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {!isRenaming && (
                        <ChevronRight className="w-3 h-3 shrink-0 opacity-60 text-muted-foreground" />
                    )}
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Collection</DialogTitle>
                        <DialogDescription>
                            This will unassign {collection.asset_count || 0} assets. Assets will remain in the Media Library.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </Button>
        </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── ArchivedAssetCard ────────────────────────────────────────────────────────
// Extracted component so each card can hold its own restore mutation state.

function ArchivedAssetCard({
    asset,
    collections,
    isSelected,
    onSelect,
}: {
    asset: AssetRow;
    collections: CollectionRow[];
    isSelected: boolean;
    onSelect: () => void;
}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const restoreMutation = useMutation({
        mutationFn: () => AssetService.restoreAsset(asset.id),
        onSuccess: () => {
            toast({ title: "Asset restored", description: asset.title || asset.id });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets"] });
            void queryClient.invalidateQueries({ queryKey: ["dam", "assets", "archived"] });
        },
        onError: (err: Error) => {
            toast({ title: "Restore failed", description: err.message, variant: "destructive" });
        },
    });

    const thumbUrl = asset.asset_versions?.[0]?.url;
    const collection = collections.find((c) => c.id === asset.collection_id);
    const isImage = asset.type === "image";
    const isVideo = asset.type === "video";

    return (
        <div className="relative group">
            <button
                onClick={onSelect}
                className={cn(
                    "w-full aspect-square flex flex-col items-center justify-center rounded-md border bg-muted/50 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary transition-all",
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

                {/* Collection badge */}
                {collection && (
                    <div className="absolute top-1.5 left-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md border bg-background/80 text-foreground border-border font-medium">
                            {collection.name}
                        </span>
                    </div>
                )}

                {/* Archived badge */}
                <div className="absolute top-1.5 right-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm backdrop-blur-md text-white border bg-amber-500/80 border-amber-500/20">
                        Archived
                    </span>
                </div>

                {/* Hover footer: title + restore */}
                <div
                    className={cn(
                        "absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm p-1.5 flex items-center justify-between gap-1 transform transition-transform",
                        isSelected ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                    )}
                >
                    <p className="text-[10px] truncate font-medium flex-1">{asset.title}</p>
                    <button
                        type="button"
                        aria-label="Restore asset"
                        onClick={(e) => {
                            e.stopPropagation();
                            restoreMutation.mutate();
                        }}
                        disabled={restoreMutation.isPending}
                        className="flex-shrink-0 p-0.5 rounded hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                        title="Restore asset"
                    >
                        {restoreMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <ArchiveRestore className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </button>
        </div>
    );
}
