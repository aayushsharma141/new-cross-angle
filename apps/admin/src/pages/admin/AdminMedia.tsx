import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, Trash2, Copy, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "@repo/ui";

interface MediaFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        eTag: string;
        size: number;
        mimetype: string;
        cacheControl: string;
        lastModified: string;
        contentLength: number;
        httpStatusCode: number;
    };
}

const AdminMedia = () => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from('media')
                .list('portfolio', {
                    limit: 100,
                    offset: 0,
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `portfolio/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            toast({ title: "File uploaded successfully" });
            fetchFiles();
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

    const handleDelete = async (fileName: string) => {
        if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) return;

        try {
            const { error } = await supabase.storage
                .from('media')
                .remove([`portfolio/${fileName}`]);

            if (error) throw error;

            toast({ title: "File deleted successfully" });
            setFiles(files.filter(f => f.name !== fileName));
        } catch (error: any) {
            toast({
                title: "Delete failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const copyToClipboard = (fileName: string) => {
        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(`portfolio/${fileName}`);

        navigator.clipboard.writeText(publicUrl);
        toast({ title: "URL copied to clipboard" });
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold">Media Library</h1>
                    <p className="text-muted-foreground mt-1">Manage your images and assets</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                            <Button variant="gold" disabled={isUploading} className="pointer-events-none">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                Upload New
                            </Button>
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredFiles.map((file, index) => {
                        const { data: { publicUrl } } = supabase.storage
                            .from('media')
                            .getPublicUrl(`portfolio/${file.name}`);

                        return (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
                                    <div className="aspect-square relative bg-secondary/20">
                                        <Image
                                            src={publicUrl}
                                            alt={file.name}
                                            imageClassName="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => copyToClipboard(file.name)}
                                                title="Copy URL"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => handleDelete(file.name)}
                                                title="Delete File"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-3">
                                        <p className="text-sm font-medium truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {(file.metadata.size / 1024).toFixed(1)} KB
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}

                    {filteredFiles.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No files found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminMedia;
