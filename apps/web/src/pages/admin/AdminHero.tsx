import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { usePermissions } from "@/hooks/usePermissions";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import {
    Loader2,
    Plus,
    X,
    Save,
    ExternalLink,
    Video,
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Image } from "@/components/ui/enhanced/image";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getOptimizedUrl } from "@/lib/cdn";

// Decomposed Hero sub-components
import { HeroMediaItem, AnimationEffect } from "@/components/admin/hero/types";
import { HeroItemFormFields } from "@/components/admin/hero/HeroItemFormFields";
import { HeroItemDisplay } from "@/components/admin/hero/HeroItemDisplay";
import { HeroMediaPickerModal } from "@/components/admin/hero/HeroMediaPickerModal";

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

/* ─── Component ─── */
const AdminHero = () => {
    const { toast } = useToast();
    const { can } = usePermissions();
    const canEdit = can('content', 'edit');

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
                animation_effect: newEffect,
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
                animation_effect: editEffect,
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
            {canEdit && (
                <ModuleActions>
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
                </ModuleActions>
            )}
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

                            <HeroItemFormFields
                                url={newUrl}
                                setUrl={(val) => {
                                    setNewUrl(val);
                                    if (urlError) setUrlError("");
                                }}
                                title={newTitle}
                                setTitle={setNewTitle}
                                type={newType}
                                setType={setNewType}
                                duration={newDuration}
                                setDuration={setNewDuration}
                                effect={newEffect}
                                setEffect={setNewEffect}
                                headline={newHeadline}
                                setHeadline={setNewHeadline}
                                ctaText={newCtaText}
                                setCtaText={setNewCtaText}
                                ctaLink={newCtaLink}
                                setCtaLink={setNewCtaLink}
                                urlError={urlError}
                                onBrowse={() => {
                                    setPickerTarget("add");
                                    setPickerOpen(true);
                                }}
                                urlRef={addUrlRef}
                            />

                            {/* URL Preview */}
                            {newUrl && isValidUrl(newUrl) && (
                                <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-4">
                                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                                        {newType === "video" ? (
                                            <video src={newUrl} muted className="w-full h-full object-cover" preload="metadata" />
                                        ) : (
                                            <Image 
                                                src={newUrl} 
                                                width={360} 
                                                quality={72} 
                                                alt="Preview" 
                                                imageClassName="w-full h-full object-cover" 
                                            />
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
                                <HeroItemDisplay
                                    item={item}
                                    index={index}
                                    isEditing={isEditing}
                                    canEdit={canEdit}
                                    isSaving={isSaving}
                                    itemsLength={items.length}
                                    onStartEdit={startEditing}
                                    onCancelEdit={cancelEditing}
                                    onSaveEdit={saveEditing}
                                    onToggleActive={handleToggleActive}
                                    onMoveItem={moveItem}
                                    onDeleteClick={(itm) => {
                                        setItemToDelete(itm);
                                        setDeleteDialogOpen(true);
                                    }}
                                    onPreviewClick={(itm) => setPreviewItem(itm)}
                                    onBrowseMedia={() => {
                                        setPickerTarget("edit");
                                        setPickerOpen(true);
                                    }}
                                    editTitle={editTitle}
                                    setEditTitle={setEditTitle}
                                    editUrl={editUrl}
                                    setEditUrl={setEditUrl}
                                    editType={editType}
                                    setEditType={setEditType}
                                    editDuration={editDuration}
                                    setEditDuration={setEditDuration}
                                    editEffect={editEffect}
                                    setEditEffect={setEditEffect}
                                    editHeadline={editHeadline}
                                    setEditHeadline={setEditHeadline}
                                    editCtaText={editCtaText}
                                    setEditCtaText={setEditCtaText}
                                    editCtaLink={editCtaLink}
                                    setEditCtaLink={setEditCtaLink}
                                />
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
                                    <Image
                                        src={previewItem.media_url}
                                        alt={previewItem.title || "Preview"}
                                        imageClassName="w-full h-full object-contain"
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
            <HeroMediaPickerModal
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
