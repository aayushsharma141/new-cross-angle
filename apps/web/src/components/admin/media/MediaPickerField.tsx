import React, { useState } from "react";
import { Input } from "@/components/ui/primitives/input";
import { Button } from "@/components/ui/primitives/button";
import { Image as ImageIcon, X } from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { getOptimizedUrl } from "@/lib/cdn";

interface MediaPickerFieldProps {
    value: string;
    onChange: (url: string) => void;
    id?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    previewClassName?: string;
    domain?: string;
    entityType?: string;
    damRole?: string;
}

export function MediaPickerField({
    value,
    onChange,
    id,
    name,
    placeholder = "Select an image...",
    disabled = false,
    className = "",
    previewClassName = "h-32 object-cover",
    domain = "system",
    entityType = "system",
    damRole = "general"
}: MediaPickerFieldProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex gap-2">
                <Input
                    id={id}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                    disabled={disabled}
                >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Browse
                </Button>
            </div>
            {value && (
                <div className="relative inline-block mt-2 rounded-md overflow-hidden border border-border group">
                    <img 
                        src={getOptimizedUrl(value, { width: 300, quality: 70 })} 
                        alt="Preview" 
                        className={previewClassName}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                            (e.target as HTMLImageElement).className = `p-4 bg-muted ${previewClassName.replace('object-cover', 'object-contain')}`;
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Clear image"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            <MediaPickerModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSelect={(file) => {
                    onChange(file.url);
                    setIsModalOpen(false);
                }}
                domain={domain}
                entityType={entityType}
                role={damRole}
            />
        </div>
    );
}
