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
    isReadOnly?: boolean;
}

export const MediaGrid = ({
    files,
    viewMode,
    selectedFiles,
    onToggleSelection,
    onPreview,
    onDelete,
    onCopyUrl,
    copiedUrl,
    isReadOnly = false
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
            <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-muted">
                <div className="bg-muted p-4 rounded-full inline-block mb-3">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-medium">No files found</p>
                <p className="text-sm mt-1">Try adjusting your filters or upload new files.</p>
            </div>
        );
    }

    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {files.map((file, index) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                    >
                        <Card
                            className={`group overflow-hidden relative transition-all duration-300 hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md ${selectedFiles.has(file.id)
                                ? 'ring-2 -admin-primary -admin-primary/50 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                                : 'hover:-admin-primary/30'
                                }`}
                        >
                            {!isReadOnly && (
                                <div className="absolute top-2 left-2 z-20">
                                    <Checkbox
                                        checked={selectedFiles.has(file.id)}
                                        onCheckedChange={() => onToggleSelection(file.id)}
                                        className="bg-black/40 border-zinc-700 data-[state=checked]:-admin-primary data-[state=checked]:-admin-primary shadow-sm"
                                    />
                                </div>
                            )}

                            <div className="aspect-square relative bg-secondary/50 cursor-pointer overflow-hidden" onClick={() => onPreview(file)}>
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                                    <div className="flex items-center justify-center gap-2 mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-zinc-900/90 hover:-admin-primary hover:text-white text-zinc-300 border border-zinc-800 shadow-xl transition-all" onClick={(e) => { e.stopPropagation(); onPreview(file); }} title="Preview">
                                            <Maximize2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-zinc-900/90 hover:-admin-primary hover:text-white text-zinc-300 border border-zinc-800 shadow-xl transition-all" onClick={(e) => { e.stopPropagation(); onCopyUrl(file.url); }} title="Copy URL">
                                            {copiedUrl === file.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </Button>
                                        {!isReadOnly && (
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-xl bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all" onClick={(e) => { e.stopPropagation(); onDelete(file); }} title="Delete">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-zinc-400 text-[10px] font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity delay-100">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <CardContent className="p-3">
                                <p className="text-xs font-medium truncate mb-1" title={file.name}>{file.name}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                                        {file.folder}
                                    </span>
                                </div>
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
                    className={`flex items-center gap-4 p-3 border rounded-xl hover:-admin-primary/5 transition-all duration-300 group ${selectedFiles.has(file.id) ? 'ring-1 -admin-primary -admin-primary/50 -admin-primary/10' : 'border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm'
                        }`}
                >
                    {!isReadOnly && (
                        <Checkbox
                            checked={selectedFiles.has(file.id)}
                            onCheckedChange={() => onToggleSelection(file.id)}
                            className="border-zinc-700 data-[state=checked]:-admin-primary"
                        />
                    )}
                    <div
                        className="w-12 h-12 rounded-md bg-secondary overflow-hidden flex-shrink-0 cursor-pointer border relative"
                        onClick={() => onPreview(file)}
                    >
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                {file.folder}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                        <Button size="sm" variant="ghost" onClick={() => onPreview(file)} className="h-8 w-8 p-0">
                            <Maximize2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onCopyUrl(file.url)} className="h-8 w-8 p-0">
                            {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        {!isReadOnly && (
                            <Button size="sm" variant="ghost" onClick={() => onDelete(file)} className="h-8 w-8 p-0 hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
