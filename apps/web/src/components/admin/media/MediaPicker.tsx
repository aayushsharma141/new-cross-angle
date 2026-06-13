import React from 'react';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/primitives/dialog";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { ScrollArea } from "@/components/ui/primitives/scroll-area";
import { Search, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getOptimizedUrl } from "@/lib/cdn";

interface MediaFile {
    id: string;
    name: string;
    url: string;
    folder: string;
    created_at: string;
}

interface MediaPickerProps {
    onSelect: (url: string) => void;
    trigger?: React.ReactNode;
}

const FOLDERS = ["portfolio", "services", "blogs", "general"];
const BUCKET_NAME = "media";

export function MediaPicker({ onSelect, trigger }: MediaPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen]);

    const fetchFiles = async () => {
        setIsLoading(true);
        const allFiles: MediaFile[] = [];

        for (const folder of FOLDERS) {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .list(folder, { limit: 50, sortBy: { column: "created_at", order: "desc" } });

            if (data && !error) {
                const folderFiles = data
                    .filter((file) => file.name !== ".emptyFolderPlaceholder")
                    .map((file) => {
                        const { data: { publicUrl } } = supabase.storage
                            .from(BUCKET_NAME)
                            .getPublicUrl(`${folder}/${file.name}`);

                        return {
                            id: file.id || `${folder}-${file.name}`,
                            name: file.name,
                            url: publicUrl,
                            folder,
                            created_at: file.created_at || new Date().toISOString(),
                        };
                    });
                allFiles.push(...folderFiles);
            }
        }

        setFiles(allFiles);
        setIsLoading(false);
    };

    const filteredFiles = files.filter((file) => {
        const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name); // Only show images for picker
        return matchesFolder && matchesSearch && isImage;
    });

    const handleSelect = () => {
        if (selectedFile) {
            onSelect(selectedFile);
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Select Image</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 bg-admin-card border-admin-border text-admin-text">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Select Media</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4 px-6 py-4 border-b bg-muted/10">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        aria-label="Filter by folder"
                        title="Filter by folder"
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                    >
                        <option value="all">All Folders</option>
                        {FOLDERS.map(f => (
                            <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                        ))}
                    </select>

                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-10 w-10 shrink-0" 
                        onClick={async () => {
                            await fetchFiles();
                        }} 
                        disabled={isLoading}
                        title="Refresh Media"
                    >
                        <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'hidden'}`} />
                        <svg className={`w-4 h-4 ${isLoading ? 'hidden' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full min-h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-primary))]" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
                            <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                            <p>No images found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className={cn(
                                        "group relative aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all hover:border-[hsl(var(--admin-primary))]",
                                        selectedFile === file.url && "ring-2 ring-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary))]"
                                    )}
                                    onClick={() => setSelectedFile(file.url)}
                                >
                                    <img
                                        src={getOptimizedUrl(file.url, { width: 360, quality: 72 })}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {selectedFile === file.url && (
                                        <div className="absolute inset-0 bg-[hsl(var(--admin-primary)/0.2)] flex items-center justify-center">
                                            <div className="bg-[hsl(var(--admin-primary))] text-black rounded-full p-1">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                        {file.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t flex justify-end gap-2 bg-muted/10">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSelect} disabled={!selectedFile}>Select Image</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
