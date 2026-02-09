import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
    id: string;
    name: string;
    url: string;
    folder: string;
    size: number;
    created_at: string;
}

interface MediaPreviewDialogProps {
    file: MediaFile | null;
    onClose: () => void;
}

export const MediaPreviewDialog = ({ file, onClose }: MediaPreviewDialogProps) => {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        toast({ title: "URL copied to clipboard" });
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <Dialog open={!!file} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center justify-between">
                        <span className="truncate pr-4">{file?.name}</span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => file && copyToClipboard(file.url)}>
                                {copiedUrl === file?.url ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                Copy URL
                            </Button>
                            <a href={file?.url} target="_blank" rel="noopener noreferrer" download>
                                <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </a>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center p-4 bg-secondary/30 min-h-[400px]">
                    {file && (
                        <img
                            src={file.url}
                            alt={file.name}
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
