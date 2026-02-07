import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "@repo/ui";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
    name: string;
    id: string;
    metadata: {
        mimetype: string;
        size: number;
    };
}

interface MediaPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

export function MediaPickerModal({ open, onOpenChange, onSelect }: MediaPickerModalProps) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchFiles();
        }
    }, [open]);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from('media')
                .list('portfolio', {
                    limit: 100,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) throw error;
            setFiles(data as unknown as MediaFile[]);
        } catch (error: any) {
            console.error("Error fetching files:", error);
            toast({
                title: "Error fetching files",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (fileName: string) => {
        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(`portfolio/${fileName}`);

        onSelect(publicUrl);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>Select Media</DialogTitle>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                            <p>No images found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredFiles.map((file, index) => {
                                const { data: { publicUrl } } = supabase.storage
                                    .from('media')
                                    .getPublicUrl(`portfolio/${file.name}`);

                                return (
                                    <motion.div
                                        key={file.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="group"
                                    >
                                        <div
                                            className="aspect-square relative bg-secondary/20 rounded-lg overflow-hidden border border-border hover:border-primary cursor-pointer transition-all"
                                            onClick={() => handleSelect(file.name)}
                                        >
                                            <Image
                                                src={publicUrl}
                                                alt={file.name}
                                                imageClassName="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button size="sm" variant="secondary" className="gap-2 pointer-events-none">
                                                    <Check className="w-4 h-4" />
                                                    Select
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 truncate px-1">
                                            {file.name}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-muted/20 flex justify-between items-center text-sm text-muted-foreground">
                    <span>{filteredFiles.length} images found</span>
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
