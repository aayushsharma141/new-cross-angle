import { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, Loader2, FileImage, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/primitives/alert";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

interface MediaUploadZoneProps {
    onUpload: (files: File[]) => Promise<void>;
    isUploading: boolean;
    selectedFolder: string;
    errorMessage?: string | null;
    onError?: (message: string) => void;
}

export const MediaUploadZone = ({ onUpload, isUploading, selectedFolder, errorMessage, onError }: MediaUploadZoneProps) => {
    const onDrop = useCallback((acceptedFiles: File[], rejections: FileRejection[]) => {
        if (rejections.length > 0) {
            const msgs = rejections.map(r => {
                const name = r.file.name;
                const errs = r.errors.map(e => e.code === 'file-too-large' ? 'File too large' : e.message).join(', ');
                return `${name}: ${errs}`;
            });
            onError?.(msgs.join('\n'));
            return;
        }
        // Additional per-type size validation
        const oversized = acceptedFiles.filter(f => {
            if (f.type.startsWith('video/')) return f.size > MAX_VIDEO_SIZE;
            return f.size > MAX_IMAGE_SIZE;
        });
        if (oversized.length > 0) {
            onError?.(oversized.map(f => `${f.name}: exceeds ${f.type.startsWith('video/') ? '100MB' : '10MB'} limit`).join('\n'));
            return;
        }
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles);
        }
    }, [onUpload, onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'video/*': []
        },
        maxSize: MAX_VIDEO_SIZE, // Use the larger limit; per-type check is above
        disabled: isUploading,
        multiple: true
    });

    return (
        <div className="space-y-4">
            {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Upload Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${isDragActive ? "border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.05)] scale-[1.01]" : "border-border hover:border-[hsl(var(--admin-primary)/0.5)] hover:bg-muted/50"
                    } ${isUploading ? "opacity-50 cursor-not-allowed" : ""} ${errorMessage ? "border-destructive/50 bg-destructive/5" : ""}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className={`p-4 rounded-full ${isDragActive ? "bg-[hsl(var(--admin-primary)/0.1)]" : "bg-muted"}`}>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--admin-primary))]" />
                        ) : (
                            <Upload className={`w-8 h-8 ${isDragActive ? "text-[hsl(var(--admin-primary))]" : "text-muted-foreground"}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">
                            {isUploading ? "Uploading files..." : isDragActive ? "Drop files here" : "Drag & drop files here"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                            Or click to select files. Images up to 10MB, videos up to 100MB.
                        </p>
                    </div>

                    {!isUploading && (
                        <div className="mt-2 text-xs px-3 py-1 bg-secondary rounded-full inline-flex items-center gap-2">
                            <FileImage className="w-3 h-3" />
                            Uploading to: <span className="font-medium capitalize text-[hsl(var(--admin-primary))]">{selectedFolder === "all" ? "general" : selectedFolder}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
