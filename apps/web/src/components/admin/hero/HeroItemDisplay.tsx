import React from "react";
import { 
    GripVertical, 
    Video, 
    Image as ImageIcon, 
    Clock, 
    Sparkles, 
    MousePointerClick, 
    Switch, 
    ArrowUp, 
    ArrowDown, 
    Pencil, 
    Trash2, 
    Play, 
    Check,
    Pencil as PencilIcon
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Image } from "@/components/ui/enhanced/image";
import { Switch as CustomSwitch } from "@/components/ui/primitives/switch";
import { HeroMediaItem, AnimationEffect, ANIMATION_EFFECTS } from "./types";
import { HeroItemFormFields } from "./HeroItemFormFields";

interface HeroItemDisplayProps {
    item: HeroMediaItem;
    index: number;
    isEditing: boolean;
    canEdit: boolean;
    isSaving: boolean;
    itemsLength: number;
    onStartEdit: (item: HeroMediaItem) => void;
    onCancelEdit: () => void;
    onSaveEdit: (item: HeroMediaItem) => void;
    onToggleActive: (item: HeroMediaItem) => void;
    onMoveItem: (index: number, direction: "up" | "down") => void;
    onDeleteClick: (item: HeroMediaItem) => void;
    onPreviewClick: (item: HeroMediaItem) => void;
    onBrowseMedia: () => void;

    // Editing states passed from parent
    editTitle: string;
    setEditTitle: (val: string) => void;
    editUrl: string;
    setEditUrl: (val: string) => void;
    editType: "video" | "image";
    setEditType: (val: "video" | "image") => void;
    editDuration: number;
    setEditDuration: (val: number) => void;
    editEffect: AnimationEffect;
    setEditEffect: (val: AnimationEffect) => void;
    editHeadline: string;
    setEditHeadline: (val: string) => void;
    editCtaText: string;
    setEditCtaText: (val: string) => void;
    editCtaLink: string;
    setEditCtaLink: (val: string) => void;
}

const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
const getEffectLabel = (effect: AnimationEffect) =>
    ANIMATION_EFFECTS.find(e => e.value === effect)?.label || "None";

export function HeroItemDisplay({
    item,
    index,
    isEditing,
    canEdit,
    isSaving,
    itemsLength,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onToggleActive,
    onMoveItem,
    onDeleteClick,
    onPreviewClick,
    onBrowseMedia,

    editTitle,
    setEditTitle,
    editUrl,
    setEditUrl,
    editType,
    setEditType,
    editDuration,
    setEditDuration,
    editEffect,
    setEditEffect,
    editHeadline,
    setEditHeadline,
    editCtaText,
    setEditCtaText,
    editCtaLink,
    setEditCtaLink,
}: HeroItemDisplayProps) {
    if (isEditing) {
        return (
            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <PencilIcon className="w-3.5 h-3.5 text-site-crimson" />
                        Editing: {item.title || "Untitled"}
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="bg-site-crimson hover:bg-[#A30E28] h-8 text-xs"
                            onClick={() => onSaveEdit(item)}
                            disabled={isSaving}
                        >
                            <Check className="w-3.5 h-3.5 mr-1" /> Save
                        </Button>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 text-xs" 
                            onClick={onCancelEdit}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
                <HeroItemFormFields
                    isEdit
                    url={editUrl}
                    setUrl={setEditUrl}
                    title={editTitle}
                    setTitle={setEditTitle}
                    type={editType}
                    setType={setEditType}
                    duration={editDuration}
                    setDuration={setEditDuration}
                    effect={editEffect}
                    setEffect={setEditEffect}
                    headline={editHeadline}
                    setHeadline={setEditHeadline}
                    ctaText={editCtaText}
                    setCtaText={setEditCtaText}
                    ctaLink={editCtaLink}
                    setCtaLink={setEditCtaLink}
                    onBrowse={onBrowseMedia}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 p-4">
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0">
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Order Badge */}
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                {index + 1}
            </div>

            {/* Thumbnail */}
            <div
                className="w-28 h-18 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 relative group cursor-pointer"
                onClick={() => onPreviewClick(item)}
            >
                {item.media_type === "video" ? (
                    <>
                        <video
                            src={item.media_url}
                            muted
                            className="w-full h-full object-cover"
                            preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                    </>
                ) : (
                    <Image
                        src={item.media_url}
                        width={720}
                        quality={76}
                        alt={item.title || "Hero media"}
                        imageClassName="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {item.media_type === "video" ? (
                        <Video className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium text-zinc-200 truncate">
                        {item.title || "Untitled"}
                    </p>
                </div>
                <p className="text-xs text-zinc-600 truncate max-w-md">{item.media_url}</p>
                {/* Headline & CTA preview */}
                {item.headline && (
                    <p className="text-[11px] text-zinc-400 mt-1 truncate max-w-md italic">
                        "{item.headline.replace(/\n/g, ' ')}"
                    </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <Clock className="w-3 h-3" /> {formatDuration(item.duration_ms)}
                    </span>
                    {item.animation_effect && item.animation_effect !== "none" && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400/70 bg-amber-400/5 px-1.5 py-0.5 rounded-full">
                            <Sparkles className="w-2.5 h-2.5" /> {getEffectLabel(item.animation_effect)}
                        </span>
                    )}
                    {item.cta_text && (
                        <span className="flex items-center gap-1 text-[10px] text-blue-400/70 bg-blue-400/5 px-1.5 py-0.5 rounded-full">
                            <MousePointerClick className="w-2.5 h-2.5" /> {item.cta_text}
                        </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-600"}`}>
                        {item.is_active ? "Active" : "Hidden"}
                    </span>
                </div>
            </div>

            {/* Toggle Active */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <CustomSwitch
                    checked={item.is_active}
                    onCheckedChange={() => onToggleActive(item)}
                    disabled={!canEdit}
                />
            </div>

            {/* Actions */}
            {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => onMoveItem(index, "up")}
                        disabled={index === 0}
                        title="Move up"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => onMoveItem(index, "down")}
                        disabled={index === itemsLength - 1}
                        title="Move down"
                    >
                        <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-blue-400"
                        onClick={() => onStartEdit(item)}
                        title="Edit"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400"
                        onClick={() => onDeleteClick(item)}
                        title="Delete"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
