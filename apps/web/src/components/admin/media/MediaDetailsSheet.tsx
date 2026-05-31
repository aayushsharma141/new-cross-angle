import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/primitives/dialog";
import { Button } from "@/components/ui/primitives/button";
import { Separator } from "@/components/ui/primitives/separator";
import {
    Download,
    Link,
    Trash2,
    Calendar,
    FileText,
    HardDrive,
    Sparkles,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/primitives/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { getOptimizedUrl } from "@/lib/cdn";

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

interface MediaDetailsSheetProps {
    file: MediaFile | null;
    open: boolean;
    onClose: () => void;
    onDelete: (file: MediaFile) => void;
    onCopyUrl: (url: string) => void;
    isReadOnly?: boolean;
}

export function MediaDetailsSheet({ file, open, onClose, onDelete, onCopyUrl, isReadOnly = false }: MediaDetailsSheetProps) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiMetadata, setAiMetadata] = useState<{ caption: string; altText: string } | null>(
        file ? { caption: file.caption || "", altText: file.alt || "" } : null
    );

    // Reset AI metadata when viewing a different file
    useEffect(() => {
        if (file) {
            setAiMetadata({ caption: file.caption || "", altText: file.alt || "" });
        } else {
            setAiMetadata(null);
        }
    }, [file?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!file) return null;

    const handleGenerateCaption = async () => {
        setIsGenerating(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-caption', {
                body: {
                    imageUrl: file.url,
                    filePath: `${file.folder}/${file.name}`
                }
            });

            if (error) throw error;

            const newMetadata = { caption: data.caption, altText: data.caption };
            setAiMetadata(newMetadata);

            // Persist to DB
            const { error: updateError } = await supabase.from('media').update({
                title: data.caption,
                alt: data.caption
            }).eq('id', file.id);

            if (updateError) throw updateError;

            toast({ title: "AI Caption Generated!", description: "Metadata updated successfully." });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({
                title: "Generation Failed",
                description: error.message || "Could not generate caption.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden border-admin-border bg-admin-card text-admin-text sm:rounded-xl p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-zinc-800 shrink-0">
                    <DialogTitle className="text-lg font-display text-white">File Details</DialogTitle>
                    <DialogDescription className="sr-only">View file details and actions</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Preview */}
                    <div className="rounded-lg border border-zinc-800 bg-muted/30 overflow-hidden flex items-center justify-center min-h-[300px] relative group">
                        <img
                            src={getOptimizedUrl(file.url, { width: 1200, quality: 82 })}
                            alt={file.name}
                            className="w-full h-full object-contain max-h-[400px]"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" onClick={() => window.open(file.url, '_blank')}>
                                Open Original
                            </Button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg break-all text-white">{file.name}</h3>
                            <Badge variant="secondary" className="mt-2 capitalize">
                                {file.folder}
                            </Badge>
                        </div>

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
                            <div className="font-medium text-zinc-200">{format(new Date(file.created_at), "PPP p")}</div>

                            <div className="flex items-center gap-2 text-zinc-500">
                                <FileText className="w-4 h-4" />
                                <span>Type</span>
                            </div>
                            <div className="font-medium text-zinc-200 uppercase">{file.name.split('.').pop() || 'Unknown'}</div>
                        </div>
                    </div>

                    {/* AI Features */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-900/30 rounded-md">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-white">AI Intelligence</h3>
                                    <p className="text-xs text-zinc-500">Auto-generate captions & alt text</p>
                                </div>
                            </div>
                            {!isReadOnly && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateCaption}
                                    disabled={isGenerating}
                                    className="h-8 border-purple-800 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40 hover:text-purple-200 transition-colors"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3 h-3 mr-2" />
                                            Generate Metadata
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        {aiMetadata ? (
                            <div className="rounded-xl border border-purple-900 bg-gradient-to-br from-purple-950/50 to-zinc-900 p-4 space-y-4 shadow-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Caption</span>
                                        <Badge variant="outline" className="text-[10px] border-purple-800 text-purple-400 bg-purple-950/50">
                                            AI Generated
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed bg-black/20 p-2 rounded-md border border-purple-900/30">
                                        {aiMetadata.caption}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Alt Text</span>
                                    <p className="text-sm text-zinc-500 italic bg-black/20 p-2 rounded-md border border-purple-900/30">
                                        {aiMetadata.altText}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center bg-muted/10">
                                <p className="text-sm text-zinc-500">
                                    Generate AI metadata to improve SEO and accessibility.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
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
            </DialogContent>
        </Dialog>
    );
}
