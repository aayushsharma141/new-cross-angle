import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Trash2, Globe, Archive } from "lucide-react";
import { icons } from "@/design-system/tokens/icons";

interface BulkActionsToolbarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete?: () => void;
    onPublish?: () => void;
    onArchive?: () => void;
    isDeleting?: boolean;
    isUpdating?: boolean;
    label?: string;
}

export function BulkActionsToolbar({
    selectedCount,
    onClear,
    onDelete,
    onPublish,
    onArchive,
    isDeleting = false,
    isUpdating = false,
    label = "items",
}: BulkActionsToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
                <div className="bg-slate-900/90 border border-white/20 backdrop-blur-md rounded-full shadow-2xl px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 border-r border-white/10 pr-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/50 hover:text-white"
                            onClick={onClear}
                        >
                            <X className={icons.sm} />
                        </Button>
                        <span className="text-white font-medium text-sm">
                            {selectedCount} {label} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
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
