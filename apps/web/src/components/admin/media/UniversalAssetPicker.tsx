import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useMemo } from "react";
import { Upload, Loader2, Image as ImageIcon, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/primitives/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { useToast } from "@/hooks/useToast";
import { AssetService, AssetRow } from "@/services/AssetService";
import { MediaService } from "@/services/MediaService";
import { getOptimizedUrl } from "@/lib/cdn";

export interface UniversalAssetPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (asset: AssetRow, url: string) => void;
    domain?: string;
    entityType?: string;
    role?: string;
}

export function UniversalAssetPicker({ 
    open, 
    onOpenChange, 
    onSelect, 
    domain = "system", 
    entityType = "system", 
    role = "general" 
}: UniversalAssetPickerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("library");
    const [selectedAsset, setSelectedAsset] = useState<AssetRow | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: assets = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["assets", "all"],
        queryFn: () => AssetService.getAssets(),
        enabled: open,
    });

    const uploadMutation = useMutation({
        mutationFn: async (fileList: FileList) => {
            const file = fileList[0];
            // MediaService.uploadDamAsset handles creating the asset, asset_versions, and dual write
            const result = await MediaService.uploadDamAsset({
                file,
                title: file.name,
                domain,
                entityType,
                entityId: null,
                role,
            });

            return { url: result.url, name: file.name };
        },
        onSuccess: () => {
            toast({ title: "Upload successful" });
            void queryClient.invalidateQueries({ queryKey: ["assets"] });
            // Switch back to library tab
            setActiveTab("library");
        },
        onError: (error: Error) => {
            toast({
                title: "Upload failed",
                description: error.message || "Unknown error",
                variant: "destructive",
            });
        }
    });

    const handleUpload = (uploadFiles: FileList | null) => {
        if (!uploadFiles || uploadFiles.length === 0) return;
        uploadMutation.mutate(uploadFiles);
    };

    const handleSelect = (asset: AssetRow) => {
        setSelectedAsset(asset);
    };

    const handleDoubleClick = (asset: AssetRow) => {
        const url = asset.asset_versions?.[0]?.url || "";
        onSelect(asset, url);
        onOpenChange(false);
        setSelectedAsset(null);
    };

    const handleConfirmSelection = () => {
        if (selectedAsset) {
            const url = selectedAsset.asset_versions?.[0]?.url || "";
            onSelect(selectedAsset, url);
            onOpenChange(false);
            setSelectedAsset(null);
        }
    };

    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const title = asset.title || "";
            return title.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [assets, searchQuery]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="admin-theme max-w-5xl max-h-[85vh] flex flex-col bg-[#100D0A] border-admin-border text-admin-text shadow-2xl">
                <DialogHeader>
                    <DialogTitle>Select Asset</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="library">Asset Library</TabsTrigger>
                        <TabsTrigger value="upload">Upload New</TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4 outline-none">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-3 pb-4">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search assets by title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-9"
                                />
                            </div>
                            
                            <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-9 w-9 shrink-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none" 
                                onClick={() => refetch()} 
                                disabled={isLoading || isRefetching}
                                title="Refresh Assets"
                                aria-label="Refresh Assets"
                            >
                                <Loader2 className={`w-4 h-4 ${(isLoading || isRefetching) ? 'animate-spin' : 'hidden'}`} />
                                <svg className={`w-4 h-4 ${(isLoading || isRefetching) ? 'hidden' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </Button>
                        </div>

                        {/* Files Grid */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="w-6 h-6 animate-spin text-admin-primary" />
                                </div>
                            ) : filteredAssets.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p>No assets found</p>
                                    <Button variant="link" onClick={() => setActiveTab("upload")}>Upload a new one</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-1">
                                    {filteredAssets.map((asset) => {
                                        const url = asset.asset_versions?.[0]?.url;
                                        return (
                                            <button
                                                key={asset.id}
                                                onClick={() => handleSelect(asset)}
                                                onDoubleClick={() => handleDoubleClick(asset)}
                                                className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all bg-black/40 group ${selectedAsset?.id === asset.id
                                                        ? "border-admin-primary ring-2 ring-admin-primary/30"
                                                        : "border-transparent hover:border-admin-primary/50"
                                                    }`}
                                            >
                                                {url ? (
                                                    <img
                                                        src={getOptimizedUrl(url, { width: 360, quality: 72 })}
                                                        alt={asset.title || "Asset"}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                                        <ImageIcon className="w-8 h-8 opacity-50 mb-1" />
                                                        <span className="text-xs">No image</span>
                                                    </div>
                                                )}
                                                
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                                                    <p className="text-xs text-white truncate text-left">{asset.title}</p>
                                                </div>

                                                {selectedAsset?.id === asset.id && (
                                                    <div className="absolute inset-0 bg-admin-primary/20 flex items-center justify-center">
                                                        <Check className="w-8 h-8 text-admin-primary bg-background rounded-full p-1" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 flex flex-col min-h-0 mt-4 outline-none">
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-12">
                            <input
                                type="file"
                                title="Upload image file"
                                ref={fileInputRef}
                                onChange={(e) => handleUpload(e.target.files)}
                                className="hidden"
                            />
                            <div className="text-center max-w-md mx-auto space-y-4">
                                <div className="w-16 h-16 bg-admin-primary/20 text-admin-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    {uploadMutation.isPending ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <Upload className="w-8 h-8" />
                                    )}
                                </div>
                                <h3 className="text-xl font-display font-medium">Upload New Asset</h3>
                                <p className="text-sm text-muted-foreground">
                                    Select a file to upload directly to the DAM. It will be immediately available for selection.
                                </p>
                                <Button 
                                    size="lg" 
                                    variant="gold" 
                                    onClick={() => fileInputRef.current?.click()} 
                                    disabled={uploadMutation.isPending}
                                >
                                    {uploadMutation.isPending ? "Uploading..." : "Browse Files"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                {activeTab === "library" && (
                    <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-white/10">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button variant="gold" onClick={handleConfirmSelection} disabled={!selectedAsset}>
                            Select Asset
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
