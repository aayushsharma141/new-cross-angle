import React from "react";
import { 
    Video, 
    Image as ImageIcon, 
    Sparkles, 
    Type, 
    MousePointerClick, 
    Link as LinkIcon, 
    FolderOpen 
} from "lucide-react";
import { Input } from "@/components/primitives/interactive";
import { Label } from "@/components/ui/primitives/label";
import { Textarea } from "@/components/primitives/interactive";
import { Button } from "@/components/ui/primitives/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/primitives/select";
import { AnimationEffect, ANIMATION_EFFECTS } from "./types";

interface HeroItemFormFieldsProps {
    url: string;
    setUrl: (val: string) => void;
    title: string;
    setTitle: (val: string) => void;
    type: "video" | "image";
    setType: (val: "video" | "image") => void;
    duration: number;
    setDuration: (val: number) => void;
    effect: AnimationEffect;
    setEffect: (val: AnimationEffect) => void;
    headline: string;
    setHeadline: (val: string) => void;
    ctaText: string;
    setCtaText: (val: string) => void;
    ctaLink: string;
    setCtaLink: (val: string) => void;
    urlError?: string;
    onBrowse: () => void;
    urlRef?: React.RefObject<HTMLInputElement>;
    isEdit?: boolean;
}

const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

export function HeroItemFormFields({
    url,
    setUrl,
    title,
    setTitle,
    type,
    setType,
    duration,
    setDuration,
    effect,
    setEffect,
    headline,
    setHeadline,
    ctaText,
    setCtaText,
    ctaLink,
    setCtaLink,
    urlError,
    onBrowse,
    urlRef,
    isEdit = false,
}: HeroItemFormFieldsProps) {
    const spacingClass = isEdit ? "space-y-1.5" : "space-y-2";
    const gridGapClass = isEdit ? "gap-4" : "gap-5";

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridGapClass}`}>
            {/* Title field first in Edit mode, URL first in Add mode */}
            {!isEdit ? (
                <>
                    {/* Media URL */}
                    <div className={spacingClass}>
                        <Label className="text-zinc-300">
                            Media URL <span className="text-site-crimson">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                ref={urlRef}
                                placeholder="https://videos.pexels.com/�"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className={`flex-1 ${
                                    urlError ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="shrink-0"
                                onClick={onBrowse}
                            >
                                <FolderOpen className="w-4 h-4 mr-2" /> Browse
                            </Button>
                        </div>
                        {urlError && <p className="text-xs text-red-400">{urlError}</p>}
                    </div>

                    {/* Title */}
                    <div className={spacingClass}>
                        <Label className="text-zinc-300">Title</Label>
                        <Input
                            placeholder="e.g. Living Room Reveal"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </>
            ) : (
                <>
                    {/* Title (Edit mode) */}
                    <div className={spacingClass}>
                        <Label className="text-xs text-zinc-400">Title</Label>
                        <Input
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Media URL (Edit mode) */}
                    <div className={spacingClass}>
                        <Label className="text-xs text-zinc-400">Media URL</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://�"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 h-9 text-sm"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0 h-9"
                                onClick={onBrowse}
                            >
                                <FolderOpen className="w-3.5 h-3.5 mr-1.5" /> Browse
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Media Type */}
            <div className={spacingClass}>
                <Label className={isEdit ? "text-xs text-zinc-400" : "text-zinc-300"}>Media Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as "video" | "image")}>
                    <SelectTrigger className={isEdit ? "h-9 text-sm" : ""}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="video">
                            <span className="flex items-center gap-2">
                                <Video className="w-3.5 h-3.5 text-blue-400" /> Video
                            </span>
                        </SelectItem>
                        <SelectItem value="image">
                            <span className="flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Image
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Display Duration */}
            <div className={spacingClass}>
                <Label className={isEdit ? "text-xs text-zinc-400" : "text-zinc-300"}>Display Duration</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={1000}
                        max={30000}
                        step={500}
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1000, parseInt(e.target.value) || 4000))}
                        className={isEdit ? "h-9 text-sm" : ""}
                    />
                    <span className="text-xs text-zinc-500 whitespace-nowrap">{formatDuration(duration)}</span>
                </div>
            </div>

            {/* Animation Effect */}
            <div className={`${spacingClass} md:col-span-2`}>
                <Label className={`${isEdit ? "text-xs text-zinc-400" : "text-zinc-300"} flex items-center gap-2`}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Animation Effect
                </Label>
                <Select value={effect} onValueChange={(v) => setEffect(v as AnimationEffect)}>
                    <SelectTrigger className={isEdit ? "h-9 text-sm" : ""}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ANIMATION_EFFECTS.map((eff) => (
                            <SelectItem key={eff.value} value={eff.value}>
                                <span className="flex items-center gap-2">
                                    {eff.label}
                                    <span className="text-zinc-500 text-xs">— {eff.description}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Headline & CTA Optional Content */}
            <div className="md:col-span-2 border-t border-zinc-800 pt-4 mt-1">
                <h3 className={`${
                    isEdit ? "text-[10px]" : "text-xs"
                } font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2`}>
                    <Type className="w-3.5 h-3.5" /> Slide Content {!isEdit && "(Optional)"}
                </h3>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${isEdit ? "gap-3" : "gap-4"}`}>
                    <div className={`${isEdit ? "space-y-1" : "space-y-2"} md:col-span-2`}>
                        <Label className={isEdit ? "text-xs text-zinc-400" : "text-zinc-300"}>Headline</Label>
                        <Textarea
                            placeholder={"Don't just change your space.\nChange how you live in it."}
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            rows={2}
                            className="resize-none text-sm"
                        />
                        {!isEdit && (
                            <p className="text-[10px] text-zinc-600">
                                Use line breaks for multi-line headlines. Leave blank for media-only slides.
                            </p>
                        )}
                    </div>
                    <div className={isEdit ? "space-y-1" : "space-y-2"}>
                        <Label className={`${isEdit ? "text-xs text-zinc-400" : "text-zinc-300"} flex items-center gap-1.5`}>
                            <MousePointerClick className="w-3.5 h-3.5 text-blue-400" /> CTA Button Text
                        </Label>
                        <Input
                            placeholder="e.g. Start Your Project"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            className={isEdit ? "h-9 text-sm" : ""}
                        />
                    </div>
                    <div className={isEdit ? "space-y-1" : "space-y-2"}>
                        <Label className={`${isEdit ? "text-xs text-zinc-400" : "text-zinc-300"} flex items-center gap-1.5`}>
                            <LinkIcon className="w-3.5 h-3.5 text-blue-400" /> CTA Link
                        </Label>
                        <Input
                            placeholder="/contact or https://�"
                            value={ctaLink}
                            onChange={(e) => setCtaLink(e.target.value)}
                            className={isEdit ? "h-9 text-sm" : ""}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
