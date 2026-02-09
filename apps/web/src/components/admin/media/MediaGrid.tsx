import { motion } from "framer-motion";
import {
    MoreVertical,
    Check,
    Copy,
    Trash2,
    Maximize2,
    ImageIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface MediaFile {
    id: string;
    name: string;
    url: string;
    folder: string;
    size: number;
    created_at: string;
}

interface MediaGridProps {
    files: MediaFile[];
    viewMode: "grid" | "list";
    selectedFiles: Set<string>;
    onToggleSelection: (id: string) => void;
    onPreview: (file: MediaFile) => void;
    onDelete: (file: MediaFile) => void;
    onCopyUrl: (url: string) => void;
    copiedUrl: string | null;
}

export const MediaGrid = ({
    files,
    viewMode,
    selectedFiles,
    onToggleSelection,
    onPreview,
    onDelete,
    onCopyUrl,
    copiedUrl
}: MediaGridProps) => {

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    if (files.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No files found</p>
            </div>
        );
    }

    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file, index) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                    >
                        <Card className={`group overflow-hidden relative ${selectedFiles.has(file.id) ? 'ring-2 ring-primary' : ''}`}>
                            <div className="absolute top-2 left-2 z-10">
                                <Checkbox
                                    checked={selectedFiles.has(file.id)}
                                    onCheckedChange={() => onToggleSelection(file.id)}
                                    className="bg-background/80"
                                />
                            </div>
                            <div className="aspect-square relative bg-secondary cursor-pointer" onClick={() => onPreview(file)}>
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); onPreview(file); }}>
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); onCopyUrl(file.url); }}>
                                        {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); onDelete(file); }}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-2">
                                <p className="text-xs truncate" title={file.name}>{file.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{file.folder}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {files.map((file) => (
                <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors ${selectedFiles.has(file.id) ? 'ring-2 ring-primary' : ''}`}
                >
                    <Checkbox
                        checked={selectedFiles.has(file.id)}
                        onCheckedChange={() => onToggleSelection(file.id)}
                    />
                    <div
                        className="w-12 h-12 rounded bg-secondary overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => onPreview(file)}
                    >
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{file.folder} • {formatFileSize(file.size)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => onPreview(file)}>
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onCopyUrl(file.url)}>
                            {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDelete(file)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
