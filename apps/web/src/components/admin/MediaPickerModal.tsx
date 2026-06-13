import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useMemo } from "react";
import { Upload, Loader2, Image as ImageIcon, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/primitives/dialog";
import { useToast } from "@/hooks/useToast";
import { MediaService, MediaFile } from "@/services/MediaService";
import { getOptimizedUrl } from "@/lib/cdn";

interface MediaPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (file: MediaFile) => void;
}

const MediaPickerModal = ({ open, onOpenChange, onSelect }: MediaPickerModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: files = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["media", "files", "all"],
        queryFn: () => MediaService.getFiles(),
        enabled: open,
    });

    const uploadMutation = useMutation({
        mutationFn: async (fileList: FileList) => {
            const file = fileList[0];
            return MediaService.upload({ file, folderId: null });
        },
        onSuccess: (data) => {
            toast({ title: "Upload successful" });
            void queryClient.invalidateQueries({ queryKey: ["media", "files"] });
            // Cannot directly select because upload only returns {id, url, name}. 
            // We just refetch and close.
            onOpenChange(false);
        },
        onError: (error: Error) => {
            toast({
                title: "Upload failed",
                description: error.message || "Unknown error",
                variant: "destructive",
            });
        }
    });

    const handleUpload = (uploadFiles: FileList | null) => {
        if (!uploadFiles || uploadFiles.length === 0) return;
        uploadMutation.mutate(uploadFiles);
    };

    const handleSelect = (file: MediaFile) => {
        setSelectedFile(file);
    };

    const handleConfirmSelection = () => {
        if (selectedFile) {
            onSelect(selectedFile);
            onOpenChange(false);
            setSelectedFile(null);
        }
    };

    const filteredFiles = useMemo(() => {
        return files.filter((file) => {
            const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [files, searchQuery]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="admin-theme max-w-4xl max-h-[85vh] flex flex-col bg-[#100D0A] border-admin-border text-admin-text shadow-2xl">
                <DialogHeader>
                    <DialogTitle>Select Media</DialogTitle>
                </DialogHeader>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 py-2">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                    
                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-9 w-9 shrink-0" 
                        onClick={() => refetch()} 
                        disabled={isLoading || isRefetching}
                        title="Refresh Media"
                    >
                        <Loader2 className={`w-4 h-4 ${(isLoading || isRefetching) ? 'animate-spin' : 'hidden'}`} />
                        <svg className={`w-4 h-4 ${(isLoading || isRefetching) ? 'hidden' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </Button>

                    <input
                        type="file"
                        title="Upload image file"
                        ref={fileInputRef}
                        onChange={(e) => handleUpload(e.target.files)}
                        className="hidden"
                    />
                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        Upload
                    </Button>
                </div>

                {/* Files Grid */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 animate-spin text-admin-primary" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No media files found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                            {filteredFiles.map((file) => (
                                <button
                                    key={file.id}
                                    onClick={() => handleSelect(file)}
                                    className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all bg-black/40 ${selectedFile?.id === file.id
                                            ? "border-admin-primary ring-2 ring-admin-primary/30"
                                            : "border-transparent hover:border-admin-primary/50"
                                        }`}
                                >
                                    {file.mimeType.startsWith('video') ? (
                                        <video src={file.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img
                                            src={getOptimizedUrl(file.url, { width: 360, quality: 72 })}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    )}
                                    {selectedFile?.id === file.id && (
                                        <div className="absolute inset-0 bg-admin-primary/20 flex items-center justify-center">
                                            <Check className="w-8 h-8 text-admin-primary bg-background rounded-full p-1" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="gold" onClick={handleConfirmSelection} disabled={!selectedFile}>
                        Select Media
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MediaPickerModal;
