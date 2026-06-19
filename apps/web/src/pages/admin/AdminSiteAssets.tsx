import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/primitives/button";
import { Loader2, Image as ImageIcon, Check, ImagePlus, MonitorPlay } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/primitives/dialog";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import type { MediaFile } from "@/services/MediaService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SiteAsset {
    id: string;
    asset_key: string;
    description: string | null;
    media_file_id: string | null;
    media_files?: {
        url: string;
        mime_type: string;
        display_name: string;
    };
}

export default function AdminSiteAssets() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [pickerOpen, setPickerOpen] = useState(false);
    const [currentEditingAsset, setCurrentEditingAsset] = useState<SiteAsset | null>(null);

    const { data: typedData = [], isLoading } = useQuery({
        queryKey: ['admin-site-assets'],
        queryFn: async (): Promise<SiteAsset[]> => {
            const { data, error } = await supabase
                .from('site_media_assets')
                .select(`
                    id,
                    asset_key,
                    description,
                    media_file_id,
                    media_files ( url, mime_type, display_name )
                `)
                .order('asset_key');
            
            if (error) throw error;
            return data as unknown as SiteAsset[];
        }
    });

    const groupedAssets = useMemo(() => {
        const groups: Record<string, SiteAsset[]> = {};
        typedData.forEach(asset => {
            const prefix = asset.asset_key.split('_')[0] || 'general';
            const formattedPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            if (!groups[formattedPrefix]) groups[formattedPrefix] = [];
            groups[formattedPrefix].push(asset);
        });
        return groups;
    }, [typedData]);

    const handleOpenPicker = (asset: SiteAsset) => {
        setCurrentEditingAsset(asset);
        setPickerOpen(true);
    };

    const updateMutation = useMutation({
        mutationFn: async ({ id, fileId }: { id: string, fileId: string }) => {
            const { error } = await supabase
                .from('site_media_assets')
                .update({ media_file_id: fileId })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Asset updated successfully" });
            setPickerOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-site-assets'] });
        },
        onError: (error: Error) => {
            toast({ variant: "destructive", title: "Error", description: "Update failed: " + error.message });
        }
    });

    const handleSelectMedia = (file: MediaFile) => {
        if (!currentEditingAsset) return;
        updateMutation.mutate({ id: currentEditingAsset.id, fileId: file.id });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-admin-primary to-gold/70 bg-clip-text text-transparent">
                        Site Assets Mapping
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Map your high-quality 4K media directly to specific website sections.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-admin-primary" />
                </div>
            ) : (
                <div className="space-y-10">
                    {Object.entries(groupedAssets).map(([group, groupAssets]) => (
                        <div key={group} className="space-y-4">
                            <h2 className="text-xl font-semibold tracking-wide border-b border-white/10 pb-2 capitalize">
                                {group} Component
                            </h2>
                            <div className="flex flex-col gap-4">
                                {groupAssets.map(asset => (
                                    <div 
                                        key={asset.id} 
                                        className="flex items-center justify-between p-4 bg-card/40 backdrop-blur-md border border-white/5 rounded-xl hover:border-admin-primary/50 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-6">
                                            {/* Preview Thumbnail */}
                                            <div className="w-32 h-20 bg-black/40 rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                                {asset.media_files ? (
                                                    asset.media_files.mime_type.startsWith('video') ? (
                                                        <video 
                                                            src={asset.media_files.url} 
                                                            className="w-full h-full object-cover" 
                                                            autoPlay muted loop playsInline 
                                                        />
                                                    ) : (
                                                        <img 
                                                            src={asset.media_files.url + "?tr=w-200"} 
                                                            alt={asset.asset_key} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    )
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-white/20">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Info */}
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <MonitorPlay className="w-4 h-4 text-admin-primary" />
                                                    <h3 className="font-semibold text-admin-text">
                                                        {asset.asset_key}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                                                    {asset.description || "No description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pr-2">
                                            <Button 
                                                variant={asset.media_files ? "outline" : "default"}
                                                className={!asset.media_files ? "bg-admin-primary text-black hover:bg-admin-primary/90" : ""}
                                                onClick={() => handleOpenPicker(asset)}
                                            >
                                                <ImagePlus className="w-4 h-4 mr-2" />
                                                {asset.media_files ? "Change Media" : "Assign Media"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MediaPickerModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onSelect={handleSelectMedia}
            />
        </div>
    );
}
