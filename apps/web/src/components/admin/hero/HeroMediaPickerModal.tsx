/* eslint-disable jsx-a11y/aria-role */
import { UniversalAssetPicker } from "@/components/admin/media/UniversalAssetPicker";
import { AssetRow } from "@/services/AssetService";

export interface HeroMediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string, type: "video" | "image", name: string) => void;
}

export function HeroMediaPickerModal({ open, onClose, onSelect }: HeroMediaPickerModalProps) {
    return (
        <UniversalAssetPicker
            open={open}
            onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
            onSelect={(asset: AssetRow, url: string) => {
                const type = asset.type === "video" ? "video" : "image";
                onSelect(url, type, asset.title || "Asset");
            }}
            domain="hero"
            role="background"
        />
    );
}
