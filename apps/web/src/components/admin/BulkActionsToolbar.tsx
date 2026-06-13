import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/primitives/button";
import { X, Trash2, Globe, Archive, FolderOpen, Copy, Download } from "lucide-react";
import { icons } from "@/design-system/tokens/icons";

interface BulkActionsToolbarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete?: () => void;
    onPublish?: () => void;
    onArchive?: () => void;
    onMove?: () => void;
    onCopy?: () => void;
    onExport?: () => void;
    isDeleting?: boolean;
    isUpdating?: boolean;
    isMoving?: boolean;
    isCopying?: boolean;
    isExporting?: boolean;
    label?: string;
}

export function BulkActionsToolbar({
    selectedCount,
    onClear,
    onDelete,
    onPublish,
    onArchive,
    onMove,
    onCopy,
    onExport,
    isDeleting = false,
    isUpdating = false,
    isMoving = false,
    isCopying = false,
    isExporting = false,
    label = "items",
}: BulkActionsToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
            >
                <div className="bg-slate-900/95 border border-white/20 backdrop-blur-md rounded-full shadow-2xl px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 border-r border-white/10 pr-4 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/50 hover:text-white"
                            onClick={onClear}
                        >
                            <X className={icons.sm} />
                        </Button>
                        <span className="text-white font-medium text-sm whitespace-nowrap">
                            {selectedCount} {label} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                        {onPublish && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-2"
                                onClick={onPublish}
                                disabled={isUpdating}
                            >
                                <Globe className={icons.sm} />
                                <span className="hidden sm:inline">Publish</span>
                            </Button>
                        )}
                        {onMove && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-2"
                                onClick={onMove}
                                disabled={isMoving}
                            >
                                <FolderOpen className={icons.sm} />
                                <span className="hidden sm:inline">Move</span>
                            </Button>
                        )}
                        {onCopy && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 gap-2"
                                onClick={onCopy}
                                disabled={isCopying}
                            >
                                <Copy className={icons.sm} />
                                <span className="hidden sm:inline">Copy</span>
                            </Button>
                        )}
                        {onExport && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-2"
                                onClick={onExport}
                                disabled={isExporting}
                            >
                                <Download className={icons.sm} />
                                <span className="hidden sm:inline">Export ZIP</span>
                            </Button>
                        )}
                        {onArchive && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-2"
                                onClick={onArchive}
                                disabled={isUpdating}
                            >
                                <Archive className={icons.sm} />
                                <span className="hidden sm:inline">Archive</span>
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                                onClick={onDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 className={icons.sm} />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
