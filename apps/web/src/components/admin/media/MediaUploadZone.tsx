import { useRef, useCallback, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaUploadZoneProps {
    onUpload: (files: FileList | null) => Promise<void>;
    isUploading: boolean;
    selectedFolder: string;
}

export const MediaUploadZone = ({ onUpload, isUploading, selectedFolder }: MediaUploadZoneProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        onUpload(e.dataTransfer.files);
    }, [onUpload]);

    return (
        <>
            <div className="flex justify-end mb-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onUpload(e.target.files)}
                    accept="image/*"
                    multiple
                    className="hidden"
                />
                <Button variant="gold" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Upload
                </Button>
            </div>

            <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
                    }`}
            >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Drag and drop files here, or click Upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Uploading to: <span className="font-medium capitalize">{selectedFolder === "all" ? "general" : selectedFolder}</span>
                </p>
            </div>
        </>
    );
};
