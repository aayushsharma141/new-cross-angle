import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Download,
    Link,
    Trash2,
    Calendar,
    FileText,
    HardDrive,
    X,
    Sparkles,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

    // Update local state when file changes
    if (file && aiMetadata === null && (file.caption || file.alt)) {
        setAiMetadata({ caption: file.caption || "", altText: file.alt || "" });
    }

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
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>File Details</SheetTitle>
                    <SheetDescription className="sr-only">View file details and actions</SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Preview */}
                    <div className="rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center min-h-[300px] relative group">
                        <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-contain max-h-[500px]"
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
                            <h3 className="font-semibold text-lg break-all">{file.name}</h3>
                            <Badge variant="secondary" className="mt-2 capitalize">
                                {file.folder}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <HardDrive className="w-4 h-4" />
                                <span>Size</span>
                            </div>
                            <div className="font-medium">{formatFileSize(file.size)}</div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Uploaded</span>
                            </div>
                            <div className="font-medium">{format(new Date(file.created_at), "PPP p")}</div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                <span>Type</span>
                            </div>
                            <div className="font-medium uppercase">{file.name.split('.').pop() || 'Unknown'}</div>
                        </div>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* AI Features */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-100 rounded-md">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">AI Intelligence</h3>
                                <p className="text-xs text-muted-foreground">Auto-generate captions & alt text</p>
                            </div>
                        </div>
                        {!isReadOnly && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateCaption}
                                disabled={isGenerating}
                                className="h-8 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 transition-colors"
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
                        <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white p-4 space-y-4 shadow-sm">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Caption</span>
                                    <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-purple-50/50">
                                        AI Generated
                                    </Badge>
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed bg-white/50 p-2 rounded-md border border-purple-100/50">
                                    {aiMetadata.caption}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Alt Text</span>
                                <p className="text-sm text-muted-foreground italic bg-white/50 p-2 rounded-md border border-purple-100/50">
                                    {aiMetadata.altText}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed p-6 text-center bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                                Generate AI metadata to improve SEO and accessibility.
                            </p>
                        </div>
                    )}
                </div>

                <Separator className="my-6" />

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => onCopyUrl(file.url)} className="w-full">
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
                    }} className="w-full">
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
            </SheetContent>
        </Sheet>
    );
}
