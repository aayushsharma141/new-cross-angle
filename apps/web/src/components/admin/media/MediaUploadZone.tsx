import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, FileImage, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/primitives/alert";

interface MediaUploadZoneProps {
    onUpload: (files: File[]) => Promise<void>;
    isUploading: boolean;
    selectedFolder: string;
    errorMessage?: string | null;
}

export const MediaUploadZone = ({ onUpload, isUploading, selectedFolder, errorMessage }: MediaUploadZoneProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'video/*': []
        },
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
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${isDragActive ? "-admin-primary -admin-primary/5 scale-[1.01]" : "border-border hover:-admin-primary/50 hover:bg-muted/50"
                    } ${isUploading ? "opacity-50 cursor-not-allowed" : ""} ${errorMessage ? "border-destructive/50 bg-destructive/5" : ""}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className={`p-4 rounded-full ${isDragActive ? "-admin-primary/10" : "bg-muted"}`}>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin -admin-primary" />
                        ) : (
                            <Upload className={`w-8 h-8 ${isDragActive ? "-admin-primary" : "text-muted-foreground"}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">
                            {isUploading ? "Uploading files..." : isDragActive ? "Drop files here" : "Drag & drop files here"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                            Or click to select files. Supports JPG, PNG, WebP, and MP4.
                        </p>
                    </div>

                    {!isUploading && (
                        <div className="mt-2 text-xs px-3 py-1 bg-secondary rounded-full inline-flex items-center gap-2">
                            <FileImage className="w-3 h-3" />
                            Uploading to: <span className="font-medium capitalize -admin-primary">{selectedFolder === "all" ? "general" : selectedFolder}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
