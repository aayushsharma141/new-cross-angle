import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, X, Search, Loader2, Play, Video, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Image } from "@/components/ui/enhanced/image";
import { Input } from "@/components/ui/primitives/input";
import { supabase } from "@/integrations/supabase/client";

interface MediaLibraryFile {
    id: string;
    name: string;
    url: string;
    type: "video" | "image";
}

const getFileType = (name: string): "video" | "image" => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return ["mp4", "webm", "ogg", "mov"].includes(ext) ? "video" : "image";
};

export interface HeroMediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string, type: "video" | "image", name: string) => void;
}

export function HeroMediaPickerModal({ open, onClose, onSelect }: HeroMediaPickerModalProps) {
    const [files, setFiles] = useState<MediaLibraryFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) return;
        (async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("media")
                    .select("id, file_name, url")
                    .order("created_at", { ascending: false });
                if (error) throw error;
                setFiles((data || []).map(f => ({
                    id: f.id,
                    name: f.file_name,
                    url: f.url,
                    type: getFileType(f.file_name),
                })));
            } catch {
                setFiles([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [open]);

    const filtered = files.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!open) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-700/50 rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <FolderOpen className="w-5 h-5 text-site-crimson" />
                        <h2 className="text-lg font-semibold text-white">Media Library</h2>
                        <span className="text-xs text-zinc-500">{filtered.length} files</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-zinc-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search media files..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-site-crimson" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <FolderOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400">No media files found</p>
                            <p className="text-zinc-600 text-xs mt-1">Upload files in the Media tab first</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filtered.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => onSelect(file.url, file.type, file.name)}
                                    className="group relative aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/50 hover:border-site-crimson/50 transition-all duration-200 hover:ring-2 hover:ring-site-crimson/20"
                                    title={file.name}
                                >
                                    {file.type === "video" ? (
                                        <>
                                            <video src={file.url} muted preload="metadata" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white/70" />
                                            </div>
                                        </>
                                    ) : (
                                        <Image 
                                            src={file.url} 
                                            width={360} 
                                            quality={72} 
                                            alt={file.name} 
                                            imageClassName="w-full h-full object-cover" 
                                        />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <p className="text-[10px] text-white/80 truncate">{file.name.split("/").pop()}</p>
                                    </div>
                                    <div className="absolute top-1.5 right-1.5">
                                        {file.type === "video"
                                            ? <Video className="w-3 h-3 text-blue-400" />
                                            : <ImageIcon className="w-3 h-3 text-emerald-400" />
                                        }
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
