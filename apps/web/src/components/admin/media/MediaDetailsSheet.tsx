import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/primitives/sheet";
import { Button } from "@/components/ui/primitives/button";
import { Separator } from "@/components/ui/primitives/separator";
import {
    Download,
    Link,
    Trash2,
    Calendar,
    FileText,
    HardDrive,
    ImageIcon,
    VideoIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/primitives/badge";
import { getOptimizedUrl } from "@/lib/cdn";
import { MediaService, type MediaFile } from "@/services/MediaService";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface MediaDetailsSheetProps {
    file: MediaFile | null;
    open: boolean;
    onClose: () => void;
    onDelete: (file: MediaFile) => void;
    onCopyUrl: (url: string) => void;
    onUpdate?: () => void;
    isReadOnly?: boolean;
}

export function MediaDetailsSheet({ file, open, onClose, onDelete, onCopyUrl, onUpdate, isReadOnly = false }: MediaDetailsSheetProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [displayName, setDisplayName] = useState("");
    const [altText, setAltText] = useState("");
    const [caption, setCaption] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (file) {
            setDisplayName(file.name || "");
            setAltText(file.altText || "");
            setCaption(file.caption || "");
        }
    }, [file]);

    if (!file) return null;

    const fileExt = file.name.split('.').pop() || 'Unknown';
    const isVideo = file.mimeType.startsWith('video/');
    const folderName = file.folderId || "root";

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleSaveMetadata = async () => {
        setIsSaving(true);
        try {
            await MediaService.updateMetadata(file.id, {
                displayName,
                altText,
                caption
            });
            toast({ title: "Saved", description: "Metadata updated successfully" });
            queryClient.invalidateQueries({ queryKey: ["media-files"] });
            onUpdate?.();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to save metadata";
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        try {
            const { data, error } = await supabase.functions.invoke("generate-caption", {
                body: { imageUrl: file.url }
            });

            if (error) throw error;
            if (data?.caption) {
                setAltText(data.caption);
                setCaption(data.caption);
                toast({ title: "Generated", description: "AI caption generated successfully! Remember to save." });
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Could not generate AI caption.";
            toast({ title: "Generation failed", description: msg, variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent side="right" className="admin-theme w-full sm:max-w-lg border-l border-admin-border bg-admin-card text-admin-text p-0 gap-0 overflow-hidden">
                <SheetHeader className="px-6 py-4 border-b border-zinc-800 shrink-0">
                    <SheetTitle className="text-lg font-display text-white">File Details</SheetTitle>
                    <SheetDescription className="sr-only">View file details and actions</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Preview */}
                    <div className="rounded-lg border border-zinc-800 bg-muted/30 overflow-hidden flex items-center justify-center min-h-[300px] relative group">
                        {isVideo ? (
                            <div className="w-full h-full flex items-center justify-center min-h-[300px] bg-black/40">
                                <VideoIcon className="w-16 h-16 text-zinc-600" />
                            </div>
                        ) : (
                            <img
                                src={getOptimizedUrl(file.url, { width: 1200, quality: 82 })}
                                alt={file.name}
                                className="w-full h-full object-contain max-h-[400px]"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" onClick={() => window.open(file.url, '_blank')}>
                                Open Original
                            </Button>
                        </div>
                    </div>

                    {/* Metadata info */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg break-all text-white">{file.name}</h3>
                            <Badge variant="secondary" className="mt-2 capitalize">
                                {folderName}
                            </Badge>
                        </div>

                        {!isReadOnly && (
                            <div className="space-y-4 pt-4 border-t border-zinc-800">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Display Name</Label>
                                    <Input 
                                        className="bg-zinc-900 border-zinc-800" 
                                        value={displayName} 
                                        onChange={(e) => setDisplayName(e.target.value)} 
                                        placeholder="Display name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-zinc-400">Alt Text</Label>
                                        {!isVideo && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 text-xs text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 px-2"
                                                onClick={handleGenerateAI}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                                AI Generate
                                            </Button>
                                        )}
                                    </div>
                                    <Input 
                                        className="bg-zinc-900 border-zinc-800" 
                                        value={altText} 
                                        onChange={(e) => setAltText(e.target.value)} 
                                        placeholder="Alt text for SEO"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Caption</Label>
                                    <Textarea 
                                        className="bg-zinc-900 border-zinc-800 resize-none min-h-[80px]" 
                                        value={caption} 
                                        onChange={(e) => setCaption(e.target.value)} 
                                        placeholder="Image caption"
                                    />
                                </div>
                                <Button 
                                    className="w-full" 
                                    onClick={handleSaveMetadata} 
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Save Metadata
                                </Button>
                            </div>
                        )}

                        <Separator className="border-zinc-800" />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <HardDrive className="w-4 h-4" />
                                <span>Size</span>
                            </div>
                            <div className="font-medium text-zinc-200">{formatFileSize(file.size)}</div>

                            <div className="flex items-center gap-2 text-zinc-500">
                                <Calendar className="w-4 h-4" />
                                <span>Uploaded</span>
                            </div>
                            <div className="font-medium text-zinc-200">{format(new Date(file.createdAt), "PPP p")}</div>

                            <div className="flex items-center gap-2 text-zinc-500">
                                <FileText className="w-4 h-4" />
                                <span>Type</span>
                            </div>
                            <div className="font-medium text-zinc-200 uppercase">{fileExt}</div>

                            {file.width && file.height && (
                                <>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Dimensions</span>
                                    </div>
                                    <div className="font-medium text-zinc-200">{file.width} × {file.height}</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Provider info */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="font-medium uppercase tracking-wider">Provider:</span>
                        <Badge variant="outline" className="text-[10px]">
                            {file.provider}
                        </Badge>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" onClick={() => onCopyUrl(file.url)} className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-900">
                            <Link className="w-4 h-4 mr-2" />
                            Copy Link
                        </Button>
                        <Button variant="outline" onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }} className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-900">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        {!isReadOnly && (
                            <Button
                                variant="destructive"
                                onClick={() => { onDelete(file); onClose(); }}
                                className="col-span-2"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete File
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
