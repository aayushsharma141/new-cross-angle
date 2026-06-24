import React, { useState } from 'react';
import { UniversalAssetPicker } from "@/components/admin/media/UniversalAssetPicker";
import { Button } from "@/components/ui/primitives/button";

interface MediaPickerProps {
    onSelect: (url: string) => void;
    trigger?: React.ReactNode;
}

export function MediaPicker({ onSelect, trigger }: MediaPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="inline-block w-full">
                {trigger || <Button type="button" variant="outline">Select Image</Button>}
            </div>
            
            <UniversalAssetPicker
                open={isOpen}
                onOpenChange={setIsOpen}
                onSelect={(asset, url) => {
                    onSelect(url);
                    setIsOpen(false);
                }}
            />
        </>
    );
}
