import { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/primitives/alert";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

interface MediaUploadZoneProps {
    onUpload: (files: File[]) => Promise<void> | void;
    isUploading: boolean;
    folderName: string;
    errorMessage?: string | null;
    onError?: (message: string) => void;
}

export const MediaUploadZone = ({ onUpload, isUploading, folderName, errorMessage, onError }: MediaUploadZoneProps) => {
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
        <div className="relative h-full">
            {errorMessage && (
                <Alert variant="destructive" className="absolute top-0 left-0 right-0 z-50 m-2">
                    <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                </Alert>
            )}

            <div
                {...getRootProps()}
                className={`group h-full min-h-[140px] border-2 border-dashed border-admin-border/50 bg-admin-card/50 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 transition-all duration-300 cursor-pointer 
                ${isDragActive ? "border-admin-primary bg-admin-primary/20 scale-105 ring-2 ring-admin-primary shadow-lg shadow-admin-primary/20" : "hover:border-admin-primary/50 hover:bg-admin-card"} 
                ${isUploading ? "opacity-50 cursor-not-allowed" : ""} 
                ${errorMessage ? "border-destructive/50 bg-destructive/5" : ""}`}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <Loader2 className="w-14 h-14 animate-spin text-admin-primary shrink-0" />
                ) : (
                    <Upload className={`w-14 h-14 shrink-0 transition-transform duration-300 ${isDragActive ? "text-white scale-110" : "text-admin-text-subtle group-hover:text-admin-primary group-hover:scale-110"}`} />
                )}
                <div className="flex flex-col min-w-0 w-full px-2">
                    <span className="font-medium text-sm text-admin-text truncate w-full">
                        {isDragActive ? "Drop here" : "Upload Files"}
                    </span>
                    <span className="text-[10px] text-admin-text-subtle truncate w-full">
                        {folderName !== "root" ? `to "${folderName}" — ` : ""}Max: 10MB (Img) / 100MB (Vid)
                    </span>
                </div>
            </div>
        </div>
    );
};
