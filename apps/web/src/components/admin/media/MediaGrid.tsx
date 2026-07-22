import React from 'react';
import { motion } from "framer-motion";
import {
    Check,
    Copy,
    Trash2,
    Maximize2,
    ImageIcon
} from "lucide-react";
import { Surface } from "@/components/primitives/foundation";
import { Button } from "@/components/ui/primitives/button";
import { Checkbox } from "@/components/primitives/interactive";
import { getOptimizedUrl } from "@/lib/cdn";
import { useDraggable } from "@dnd-kit/core";

import { MediaFile } from "@/services/MediaService";
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
    uploadZone?: React.ReactNode;
    hideEmptyState?: boolean;
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
    isReadOnly = false,
    uploadZone,
    hideEmptyState = false
}: MediaGridProps) => {

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    if (files.length === 0 && !uploadZone && !hideEmptyState) {
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

    const DraggableFileItem = ({ file, index, formatFileSize }: { file: MediaFile, index: number, formatFileSize: (bytes: number) => string }) => {
        const { attributes, listeners, setNodeRef, transform } = useDraggable({
            id: file.id,
            data: { type: "file", file }
        });
        const style = transform ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: 50,
        } : undefined;

        return (
            <motion.div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="cursor-grab active:cursor-grabbing"
            >
                <Surface variant="primary" radius="lg" border shadow="sm"
                    className={`group overflow-hidden relative transition-all duration-300 hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md ${selectedFiles.has(file.id)
                        ? 'ring-2 ring-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary)/0.5)] shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                        : 'hover:border-[hsl(var(--admin-primary)/0.3)]'
                        }`}
                >
                    {!isReadOnly && (
                        <div className="absolute top-2 left-2 z-20" onPointerDown={(e) => e.stopPropagation()}>
                            <Checkbox
                                checked={selectedFiles.has(file.id)}
                                onCheckedChange={() => onToggleSelection(file.id)}
                                className="bg-black/40 border-zinc-700 data-[state=checked]:bg-[hsl(var(--admin-primary))] data-[state=checked]:border-[hsl(var(--admin-primary))] shadow-sm"
                            />
                        </div>
                    )}

                    <div role="button" tabIndex={0} className="aspect-square relative bg-secondary/50 overflow-hidden" onPointerDown={(e) => e.stopPropagation()} onClick={() => onPreview(file)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPreview(file); } }}>
                        <img
                            src={getOptimizedUrl(file.url, { width: 420, quality: 72 })}
                            alt={file.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 pointer-events-none">
                            <div className="flex items-center justify-center gap-2 mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-zinc-900/90 hover:bg-[hsl(var(--admin-primary))] hover:text-white text-zinc-300 border border-zinc-800 shadow-xl transition-all" onClick={(e) => { e.stopPropagation(); onPreview(file); }} title="Preview" aria-label={`Preview ${file.name}`}>
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-zinc-900/90 hover:bg-[hsl(var(--admin-primary))] hover:text-white text-zinc-300 border border-zinc-800 shadow-xl transition-all" onClick={(e) => { e.stopPropagation(); onCopyUrl(file.url); }} title="Copy URL" aria-label={`Copy URL for ${file.name}`}>
                                    {copiedUrl === file.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                                {!isReadOnly && (
                                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-xl bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all" onClick={(e) => { e.stopPropagation(); onDelete(file); }} title="Delete" aria-label={`Delete ${file.name}`}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-zinc-400 text-[10px] font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity delay-100 pointer-events-auto">{formatFileSize(file.size)}</p>
                        </div>
                    </div>
                    <div className="p-6 pt-0" className="p-3 pointer-events-none">
                        <p className="text-xs font-medium truncate mb-1" title={file.name}>{file.name}</p>
                    </div>
                </Surface>
            </motion.div>
        );
    };

    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {uploadZone}
                {files.map((file, index) => (
                    <DraggableFileItem key={file.id} file={file} index={index} formatFileSize={formatFileSize} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {uploadZone && <div className="mb-4">{uploadZone}</div>}
            {files.map((file) => (
                <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 border rounded-xl hover:bg-[hsl(var(--admin-primary)/0.05)] transition-all duration-300 group ${selectedFiles.has(file.id) ? 'ring-1 ring-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary)/0.5)] bg-[hsl(var(--admin-primary)/0.1)]' : 'border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm'
                        }`}
                >
                    {!isReadOnly && (
                        <Checkbox
                            checked={selectedFiles.has(file.id)}
                            onCheckedChange={() => onToggleSelection(file.id)}
                            className="border-zinc-700 data-[state=checked]:bg-[hsl(var(--admin-primary))] data-[state=checked]:border-[hsl(var(--admin-primary))]"
                        />
                    )}
                    <div
                        role="button"
                        tabIndex={0}
                        className="w-12 h-12 rounded-md bg-secondary overflow-hidden flex-shrink-0 cursor-pointer border relative"
                        onClick={() => onPreview(file)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPreview(file); } }}
                    >
                        <img src={getOptimizedUrl(file.url, { width: 180, quality: 70 })} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                        <Button size="sm" variant="ghost" onClick={() => onPreview(file)} className="h-8 w-8 p-0" aria-label={`Preview ${file.name}`}>
                            <Maximize2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onCopyUrl(file.url)} className="h-8 w-8 p-0" aria-label={`Copy URL for ${file.name}`}>
                            {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        {!isReadOnly && (
                            <Button size="sm" variant="ghost" onClick={() => onDelete(file)} className="h-8 w-8 p-0 hover:text-destructive" aria-label={`Delete ${file.name}`}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
