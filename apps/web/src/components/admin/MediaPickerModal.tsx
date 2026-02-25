import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Loader2, Image as ImageIcon, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MediaFile {
    id: string;
    name: string;
    url: string;
    folder: string;
}

interface MediaPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

const FOLDERS = ["portfolio", "services", "blogs", "general"];
const BUCKET_NAME = "media";

const MediaPickerModal = ({ open, onOpenChange, onSelect }: MediaPickerModalProps) => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchFiles();
        }
    }, [open]);

    const fetchFiles = async () => {
        setIsLoading(true);
        const allFiles: MediaFile[] = [];

        for (const folder of FOLDERS) {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

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
                        };
                    });
                allFiles.push(...folderFiles);
            }
        }

        setFiles(allFiles);
        setIsLoading(false);
    };

    const handleUpload = async (uploadFiles: FileList | null) => {
        if (!uploadFiles || uploadFiles.length === 0) return;

        setIsUploading(true);
        const folder = selectedFolder === "all" ? "general" : selectedFolder;

        try {
            const file = uploadFiles[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            toast({ title: "Upload successful" });
            onSelect(publicUrl);
            onOpenChange(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSelect = (url: string) => {
        setSelectedUrl(url);
    };

    const handleConfirmSelection = () => {
        if (selectedUrl) {
            onSelect(selectedUrl);
            onOpenChange(false);
            setSelectedUrl(null);
        }
    };

    const filteredFiles = files.filter((file) => {
        const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Image</DialogTitle>
                </DialogHeader>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 py-2">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                    <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Folders</SelectItem>
                            {FOLDERS.map((folder) => (
                                <SelectItem key={folder} value={folder} className="capitalize">
                                    {folder}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleUpload(e.target.files)}
                        accept="image/*"
                        className="hidden"
                    />
                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        Upload
                    </Button>
                </div>

                {/* Files Grid */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No images found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                            {filteredFiles.map((file) => (
                                <button
                                    key={file.id}
                                    onClick={() => handleSelect(file.url)}
                                    className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${selectedUrl === file.url
                                            ? "border-primary ring-2 ring-primary/30"
                                            : "border-transparent hover:border-primary/50"
                                        }`}
                                >
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {selectedUrl === file.url && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <Check className="w-8 h-8 text-primary bg-background rounded-full p-1" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="gold" onClick={handleConfirmSelection} disabled={!selectedUrl}>
                        Select Image
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MediaPickerModal;
