import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    Loader2,
    Plus,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    Video,
    Image as ImageIcon,
    Play,
    Save,
    X,
    Pencil,
    Check,
    ExternalLink,
    Clock,
    ArrowUp,
    ArrowDown,
    FolderOpen,
    Search,
    Sparkles,
    Type,
    Link as LinkIcon,
    MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getOptimizedUrl } from "@/lib/cdn";

/* ─── Types ─── */
type AnimationEffect = "none" | "ken-burns-in" | "ken-burns-out" | "pan-left" | "pan-right";

interface HeroMediaItem {
    id: string;
    media_url: string;
    media_type: "video" | "image";
    title: string | null;
    headline: string | null;
    cta_text: string | null;
    cta_link: string | null;
    display_order: number;
    is_active: boolean;
    duration_ms: number;
    animation_effect: AnimationEffect;
    created_at: string;
    updated_at: string;
}

interface MediaLibraryFile {
    id: string;
    name: string;
    url: string;
    type: "video" | "image";
}

/* ─── Constants ─── */
const ANIMATION_EFFECTS: { value: AnimationEffect; label: string; description: string }[] = [
    { value: "none", label: "None", description: "Static display" },
    { value: "ken-burns-in", label: "Ken Burns — Zoom In", description: "Slow zoom into the image" },
    { value: "ken-burns-out", label: "Ken Burns — Zoom Out", description: "Starting zoomed, slowly pulling back" },
    { value: "pan-left", label: "Slow Pan Left", description: "Gentle horizontal pan to the left" },
    { value: "pan-right", label: "Slow Pan Right", description: "Gentle horizontal pan to the right" },
];

/* ─── Helpers ─── */
const isValidUrl = (str: string) => {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
};

const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const getFileType = (name: string): "video" | "image" => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return ["mp4", "webm", "ogg", "mov"].includes(ext) ? "video" : "image";
};

const getEffectLabel = (effect: AnimationEffect) =>
    ANIMATION_EFFECTS.find(e => e.value === effect)?.label || "None";

/* ─── Media Picker Modal ─── */
function MediaPickerModal({ open, onClose, onSelect }: {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string, type: "video" | "image", name: string) => void;
}) {
    const [files, setFiles] = useState<MediaLibraryFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) return;
        (async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("media")
                    .select("id, file_name, url")
                    .order("created_at", { ascending: false });
                if (error) throw error;
                setFiles((data || []).map(f => ({
                    id: f.id,
                    name: f.file_name,
                    url: f.url,
                    type: getFileType(f.file_name),
                })));
            } catch {
                setFiles([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [open]);

    const filtered = files.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!open) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-700/50 rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <FolderOpen className="w-5 h-5 text-site-crimson" />
                        <h2 className="text-lg font-semibold text-white">Media Library</h2>
                        <span className="text-xs text-zinc-500">{filtered.length} files</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-zinc-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search media files..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-site-crimson" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <FolderOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400">No media files found</p>
                            <p className="text-zinc-600 text-xs mt-1">Upload files in the Media tab first</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filtered.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => onSelect(file.url, file.type, file.name)}
                                    className="group relative aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/50 hover:border-site-crimson/50 transition-all duration-200 hover:ring-2 hover:ring-site-crimson/20"
                                    title={file.name}
                                >
                                    {file.type === "video" ? (
                                        <>
                                            <video src={file.url} muted preload="metadata" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white/70" />
                                            </div>
                                        </>
                                    ) : (
                                        <img src={getOptimizedUrl(file.url, { width: 360, quality: 72 })} alt={file.name} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <p className="text-[10px] text-white/80 truncate">{file.name.split("/").pop()}</p>
                                    </div>
                                    <div className="absolute top-1.5 right-1.5">
                                        {file.type === "video"
                                            ? <Video className="w-3 h-3 text-blue-400" />
                                            : <ImageIcon className="w-3 h-3 text-emerald-400" />
                                        }
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Component ─── */
const AdminHero = () => {
    const { toast } = useToast();
    const { isAdmin, isEditor } = useAdminAuth();
    const canEdit = isAdmin || isEditor;

    const [items, setItems] = useState<HeroMediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<HeroMediaItem | null>(null);
    const [previewItem, setPreviewItem] = useState<HeroMediaItem | null>(null);

    // Inline editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editType, setEditType] = useState<"video" | "image">("video");
    const [editDuration, setEditDuration] = useState(3000);
    const [editEffect, setEditEffect] = useState<AnimationEffect>("none");
    const [editHeadline, setEditHeadline] = useState("");
    const [editCtaText, setEditCtaText] = useState("");
    const [editCtaLink, setEditCtaLink] = useState("");

    // Add form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<"video" | "image">("video");
    const [newDuration, setNewDuration] = useState(4000);
    const [newEffect, setNewEffect] = useState<AnimationEffect>("none");
    const [newHeadline, setNewHeadline] = useState("");
    const [newCtaText, setNewCtaText] = useState("");
    const [newCtaLink, setNewCtaLink] = useState("");
    const [urlError, setUrlError] = useState("");

    // Media picker
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<"add" | "edit">("add");

    const addUrlRef = useRef<HTMLInputElement>(null);

    /* ─── Fetch ─── */
    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("hero_media")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            setItems((data as HeroMediaItem[]) || []);
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    /* ─── Add ─── */
    const handleAdd = async () => {
        const url = newUrl.trim();
        if (!url) {
            setUrlError("Media URL is required");
            addUrlRef.current?.focus();
            return;
        }
        if (!isValidUrl(url)) {
            setUrlError("Please enter a valid URL (https://...)");
            addUrlRef.current?.focus();
            return;
        }
        setUrlError("");

        try {
            setIsSaving(true);
            const nextOrder = items.length > 0
                ? Math.max(...items.map(i => i.display_order)) + 1
                : 0;

            const { error } = await supabase.from("hero_media").insert({
                media_url: url,
                media_type: newType,
                title: newTitle.trim() || null,
                headline: newHeadline.trim() || null,
                cta_text: newCtaText.trim() || null,
                cta_link: newCtaLink.trim() || null,
                display_order: nextOrder,
                is_active: true,
                duration_ms: newDuration,
                animation_effect: newType === "image" ? newEffect : "none",
            });

            if (error) throw error;

            toast({ title: "✓ Added", description: `"${newTitle.trim() || "New item"}" added to hero rotation.` });
            setNewUrl("");
            setNewTitle("");
            setNewType("video");
            setNewDuration(4000);
            setNewEffect("none");
            setNewHeadline("");
            setNewCtaText("");
            setNewCtaLink("");
            setShowAddForm(false);
            fetchItems();
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    /* ─── Inline Edit ─── */
    const startEditing = (item: HeroMediaItem) => {
        setEditingId(item.id);
        setEditTitle(item.title || "");
        setEditUrl(item.media_url);
        setEditType(item.media_type);
        setEditDuration(item.duration_ms);
        setEditEffect(item.animation_effect || "none");
        setEditHeadline(item.headline || "");
        setEditCtaText(item.cta_text || "");
        setEditCtaLink(item.cta_link || "");
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEditing = async (item: HeroMediaItem) => {
        if (isSaving) return;
        const url = editUrl.trim();
        if (!url || !isValidUrl(url)) {
            toast({ title: "Invalid URL", description: "Please enter a valid URL", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const updatePayload = {
                title: editTitle.trim() || null,
                headline: editHeadline.trim() || null,
                cta_text: editCtaText.trim() || null,
                cta_link: editCtaLink.trim() || null,
                media_url: url,
                media_type: editType,
                duration_ms: editDuration,
                animation_effect: editType === "image" ? editEffect : "none",
            };

            const { error } = await supabase
                .from("hero_media")
                .update(updatePayload)
                .eq("id", item.id);

            if (error) throw error;

            // Optimistically update local state to avoid full re-render flash
            setItems((prev) =>
                prev.map((i) =>
                    i.id === item.id
                        ? { ...i, ...updatePayload } as HeroMediaItem
                        : i
                )
            );
            setEditingId(null);
            toast({ title: "✓ Updated", description: `Changes saved for "${editTitle.trim() || "Untitled"}"` });

            // Quiet background refresh (no isLoading flicker)
            const { data } = await supabase
                .from("hero_media")
                .select("*")
                .order("display_order", { ascending: true });
            if (data) setItems(data as HeroMediaItem[]);
        } catch (error) {
            const err = error as Error;
            if (err.name === "AbortError") return; // Ignore abort errors
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    /* ─── Toggle Active ─── */
    const handleToggleActive = async (item: HeroMediaItem) => {
        try {
            const { error } = await supabase
                .from("hero_media")
                .update({ is_active: !item.is_active })
                .eq("id", item.id);
            if (error) throw error;
            setItems(prev =>
                prev.map(i => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
            );
            toast({
                title: item.is_active ? "Hidden" : "Visible",
                description: `"${item.title || "Item"}" is now ${item.is_active ? "hidden" : "visible"} on the homepage.`,
            });
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    /* ─── Delete ─── */
    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { error } = await supabase
                .from("hero_media")
                .delete()
                .eq("id", itemToDelete.id);
            if (error) throw error;
            toast({ title: "✓ Deleted", description: `"${itemToDelete.title || "Item"}" has been removed.` });
            fetchItems();
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    /* ─── Reorder (debounced) ─── */
    const reorderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleReorder = (newOrder: HeroMediaItem[]) => {
        setItems(newOrder);

        // Debounce: only persist after 600ms of no further dragging
        if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
        reorderTimeoutRef.current = setTimeout(async () => {
            try {
                const updates = newOrder.map((item, index) =>
                    supabase
                        .from("hero_media")
                        .update({ display_order: index })
                        .eq("id", item.id)
                );
                await Promise.all(updates);
                toast({ title: "✓ Order saved" });
            } catch (error) {
                const err = error as Error;
                toast({ title: "Error saving order", description: err.message, variant: "destructive" });
                fetchItems();
            }
        }, 600);
    };

    /* ─── Move Up/Down (button-based reorder) ─── */
    const moveItem = async (index: number, direction: "up" | "down") => {
        const newItems = [...items];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        handleReorder(newItems);
    };

    /* ─── Loading State ─── */
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-site-crimson" />
            </div>
        );
    }

    const activeCount = items.filter(i => i.is_active).length;
    const hiddenCount = items.filter(i => !i.is_active).length;

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">Hero Media</h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Manage the rotating visuals in your homepage hero section. Drag to reorder.
                    </p>
                </div>
                {canEdit && (
                    <Button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setUrlError("");
                        }}
                        className={showAddForm
                            ? "bg-zinc-700 hover:bg-zinc-600"
                            : "bg-site-crimson hover:bg-[#A30E28]"
                        }
                    >
                        {showAddForm ? (
                            <><X className="w-4 h-4 mr-2" /> Cancel</>
                        ) : (
                            <><Plus className="w-4 h-4 mr-2" /> Add Media</>
                        )}
                    </Button>
                )}
            </div>

            {/* ─── Add Form ─── */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-6 space-y-5">
                            <h2 className="text-base font-semibold text-white flex items-center gap-2">
                                <Plus className="w-4 h-4 text-site-crimson" />
                                Add New Hero Media
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Media URL <span className="text-site-crimson">*</span></Label>
                                    <div className="flex gap-2">
                                        <Input
                                            ref={addUrlRef}
                                            placeholder="https://videos.pexels.com/..."
                                            value={newUrl}
                                            onChange={(e) => {
                                                setNewUrl(e.target.value);
                                                if (urlError) setUrlError("");
                                            }}
                                            className={`flex-1 ${urlError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="shrink-0"
                                            onClick={() => { setPickerTarget("add"); setPickerOpen(true); }}
                                        >
                                            <FolderOpen className="w-4 h-4 mr-2" /> Browse
                                        </Button>
                                    </div>
                                    {urlError && <p className="text-xs text-red-400">{urlError}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Title</Label>
                                    <Input
                                        placeholder="e.g. Living Room Reveal"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Media Type</Label>
                                    <Select value={newType} onValueChange={(v) => setNewType(v as "video" | "image")}>
                                        <SelectTrigger>
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
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Display Duration</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1000}
                                            max={30000}
                                            step={500}
                                            value={newDuration}
                                            onChange={(e) => setNewDuration(Math.max(1000, parseInt(e.target.value) || 4000))}
                                        />
                                        <span className="text-xs text-zinc-500 whitespace-nowrap">{formatDuration(newDuration)}</span>
                                    </div>
                                </div>

                                {/* Animation Effect (image only) */}
                                {newType === "image" && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-zinc-300 flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            Animation Effect
                                        </Label>
                                        <Select value={newEffect} onValueChange={(v) => setNewEffect(v as AnimationEffect)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ANIMATION_EFFECTS.map(eff => (
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
                                )}

                                {/* ─── Headline & CTA Fields (Add Form) ─── */}
                                <div className="md:col-span-2 border-t border-zinc-800 pt-4 mt-1">
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Type className="w-3.5 h-3.5" /> Slide Content (Optional)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-zinc-300">Headline</Label>
                                            <Textarea
                                                placeholder={"Don't just change your space.\nChange how you live in it."}
                                                value={newHeadline}
                                                onChange={(e) => setNewHeadline(e.target.value)}
                                                rows={2}
                                                className="resize-none"
                                            />
                                            <p className="text-[10px] text-zinc-600">Use line breaks for multi-line headlines. Leave blank for media-only slides.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300 flex items-center gap-1.5">
                                                <MousePointerClick className="w-3.5 h-3.5 text-blue-400" /> CTA Button Text
                                            </Label>
                                            <Input
                                                placeholder="e.g. Start Your Project"
                                                value={newCtaText}
                                                onChange={(e) => setNewCtaText(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300 flex items-center gap-1.5">
                                                <LinkIcon className="w-3.5 h-3.5 text-blue-400" /> CTA Link
                                            </Label>
                                            <Input
                                                placeholder="/contact or https://..."
                                                value={newCtaLink}
                                                onChange={(e) => setNewCtaLink(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* URL Preview */}
                            {newUrl && isValidUrl(newUrl) && (
                                <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-4">
                                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                                        {newType === "video" ? (
                                            <video src={newUrl} muted className="w-full h-full object-cover" preload="metadata" />
                                        ) : (
                                            <img src={getOptimizedUrl(newUrl, { width: 360, quality: 72 })} alt="Preview" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        <p className="font-medium text-zinc-300 mb-1">Preview</p>
                                        <p className="truncate max-w-sm">{newUrl}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <Button onClick={handleAdd} disabled={isSaving} className="bg-site-crimson hover:bg-[#A30E28]">
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Add to Hero
                                </Button>
                                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Status Bar ─── */}
            <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-widest">
                <span className="text-zinc-400">{items.length} total</span>
                <span className="text-emerald-500">{activeCount} active</span>
                {hiddenCount > 0 && <span className="text-zinc-600">{hiddenCount} hidden</span>}
            </div>

            {/* ─── Items List ─── */}
            {items.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
                    <Video className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-400 text-lg font-medium">No hero media yet</p>
                    <p className="text-zinc-600 text-sm mt-2">Click "Add Media" to create your first hero slide.</p>
                </div>
            ) : (
                <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={handleReorder}
                    className="space-y-3"
                >
                    {items.map((item, index) => {
                        const isEditing = editingId === item.id;

                        return (
                            <Reorder.Item
                                key={item.id}
                                value={item}
                                className={`
                                    rounded-xl border transition-all duration-200
                                    ${isEditing
                                        ? "bg-zinc-800/80 border-site-crimson/50 ring-1 ring-site-crimson/20"
                                        : item.is_active
                                            ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                                            : "bg-zinc-950/40 border-zinc-900 opacity-50"
                                    }
                                `}
                            >
                                {isEditing ? (
                                    /* ─── Inline Edit Mode ─── */
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                <Pencil className="w-3.5 h-3.5 text-site-crimson" />
                                                Editing: {item.title || "Untitled"}
                                            </h3>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-site-crimson hover:bg-[#A30E28] h-8 text-xs"
                                                    onClick={() => saveEditing(item)}
                                                >
                                                    <Check className="w-3.5 h-3.5 mr-1" /> Save
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={cancelEditing}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-zinc-400">Title</Label>
                                                <Input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    placeholder="Title"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-zinc-400">Media URL</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={editUrl}
                                                        onChange={(e) => setEditUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="shrink-0 h-9"
                                                        onClick={() => { setPickerTarget("edit"); setPickerOpen(true); }}
                                                    >
                                                        <FolderOpen className="w-3.5 h-3.5 mr-1.5" /> Browse
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-zinc-400">Type</Label>
                                                <Select value={editType} onValueChange={(v) => setEditType(v as "video" | "image")}>
                                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="video"><span className="flex items-center gap-2"><Video className="w-3 h-3" /> Video</span></SelectItem>
                                                        <SelectItem value="image"><span className="flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Image</span></SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-zinc-400">Duration</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min={1000}
                                                        max={30000}
                                                        step={500}
                                                        value={editDuration}
                                                        onChange={(e) => setEditDuration(Math.max(1000, parseInt(e.target.value) || 4000))}
                                                        className="h-9"
                                                    />
                                                    <span className="text-xs text-zinc-500">{formatDuration(editDuration)}</span>
                                                </div>
                                            </div>

                                            {/* Animation Effect (image only) */}
                                            {editType === "image" && (
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label className="text-xs text-zinc-400 flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                                        Animation Effect
                                                    </Label>
                                                    <Select value={editEffect} onValueChange={(v) => setEditEffect(v as AnimationEffect)}>
                                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {ANIMATION_EFFECTS.map(eff => (
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
                                            )}

                                            {/* ─── Headline & CTA Fields (Edit Form) ─── */}
                                            <div className="md:col-span-2 border-t border-zinc-700/50 pt-3 mt-1">
                                                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <Type className="w-3 h-3" /> Slide Content
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="space-y-1 md:col-span-2">
                                                        <Label className="text-xs text-zinc-400">Headline</Label>
                                                        <Textarea
                                                            value={editHeadline}
                                                            onChange={(e) => setEditHeadline(e.target.value)}
                                                            placeholder="Multi-line headline text..."
                                                            rows={2}
                                                            className="resize-none text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-zinc-400">CTA Button Text</Label>
                                                        <Input
                                                            value={editCtaText}
                                                            onChange={(e) => setEditCtaText(e.target.value)}
                                                            placeholder="e.g. View Portfolio"
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-zinc-400">CTA Link</Label>
                                                        <Input
                                                            value={editCtaLink}
                                                            onChange={(e) => setEditCtaLink(e.target.value)}
                                                            placeholder="/contact-us"
                                                            className="h-9"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* ─── Display Mode ─── */
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
                                            onClick={() => setPreviewItem(item)}
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
                                                <img
                                                    src={getOptimizedUrl(item.media_url, { width: 720, quality: 76 })}
                                                    alt={item.title || "Hero media"}
                                                    className="w-full h-full object-cover"
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
                                                {item.media_type === "image" && item.animation_effect && item.animation_effect !== "none" && (
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
                                            <Switch
                                                checked={item.is_active}
                                                onCheckedChange={() => handleToggleActive(item)}
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
                                                    onClick={() => moveItem(index, "up")}
                                                    disabled={index === 0}
                                                    title="Move up"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                                                    onClick={() => moveItem(index, "down")}
                                                    disabled={index === items.length - 1}
                                                    title="Move down"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-500 hover:text-blue-400"
                                                    onClick={() => startEditing(item)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-500 hover:text-red-400"
                                                    onClick={() => {
                                                        setItemToDelete(item);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            )}

            {/* ─── Preview Modal ─── */}
            <AnimatePresence>
                {previewItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={() => setPreviewItem(null)}
                    >
                        <div className="max-w-5xl w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
                            {/* Close */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-12 right-0 text-white/60 hover:text-white"
                                onClick={() => setPreviewItem(null)}
                            >
                                <X className="w-6 h-6" />
                            </Button>

                            {/* Title */}
                            <div className="text-center mb-4">
                                <p className="text-white font-medium">{previewItem.title || "Untitled"}</p>
                                <p className="text-zinc-500 text-xs mt-1">{previewItem.media_type} · {formatDuration(previewItem.duration_ms)}</p>
                            </div>

                            {/* Media */}
                            <div className="rounded-xl overflow-hidden bg-zinc-900 aspect-video">
                                {previewItem.media_type === "video" ? (
                                    <video
                                        src={getOptimizedUrl(previewItem.media_url, { width: 1400, quality: 84 })}
                                        controls
                                        autoPlay
                                        muted
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={previewItem.media_url}
                                        alt={previewItem.title || "Preview"}
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>

                            {/* URL */}
                            <div className="mt-3 flex items-center justify-center gap-2">
                                <a href={previewItem.media_url} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors">
                                    <ExternalLink className="w-3 h-3" /> Open in new tab
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Hero Media"
                description={`Are you sure you want to delete "${itemToDelete?.title || "this item"}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />

            {/* Media Picker Modal */}
            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(url, type, name) => {
                    if (pickerTarget === "add") {
                        setNewUrl(url);
                        setNewType(type);
                        if (!newTitle) setNewTitle(name.split("/").pop()?.replace(/\.[^.]+$/, "") || "");
                    } else {
                        setEditUrl(url);
                        setEditType(type);
                    }
                    setPickerOpen(false);
                }}
            />
        </div>
    );
};

export default AdminHero;
