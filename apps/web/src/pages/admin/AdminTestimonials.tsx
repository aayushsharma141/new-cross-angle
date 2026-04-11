import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Plus, Pencil, Trash2, Loader2, RotateCcw, Star, Search,
    Image as ImageIcon, CheckSquare, Eye, EyeOff, Grid, List as ListIcon,
    ArrowUpDown, X, MoreVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { getOptimizedUrl } from "@/lib/cdn";
import { icons } from "@/design-system/tokens/icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/design-system/components/Table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

type TestimonialStatus = "active" | "inactive";

interface Testimonial {
    id: string;
    author_name: string;
    author_role: string | null;
    avatar_url: string | null;
    content: string;
    rating: number | null;
    display_order: number;
    active: boolean;
    project_id: string | null;
    city: string | null;
}

interface TestimonialFormData {
    author_name: string;
    author_role: string;
    content: string;
    rating: number;
    avatar_url: string;
    active: boolean;
    city: string;
}

const defaultFormData: TestimonialFormData = {
    author_name: "",
    author_role: "",
    content: "",
    rating: 5,
    avatar_url: "",
    active: true,
    city: "",
};

const AdminTestimonials = () => {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");
    const deepLinkHandled = useRef(false);

    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TestimonialFormData>(defaultFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TestimonialStatus | "all">("all");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const { toast } = useToast();
    const { isEditor } = useAdminAuth();
    const isReadOnly = !isEditor;
    const canWrite = isEditor;

    useEffect(() => {
        fetchTestimonials();
    }, []);

    useEffect(() => {
        filterTestimonials();
        setCurrentPage(1);
    }, [testimonials, searchQuery, statusFilter]);

    useEffect(() => {
        if (editId && !deepLinkHandled.current && testimonials.length > 0) {
            deepLinkHandled.current = true;
            const target = testimonials.find(t => t.id === editId);
            if (target) {
                handleEdit(target);
            }
        }
    }, [editId, testimonials]);

    const filterTestimonials = () => {
        let filtered = [...testimonials];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.author_name.toLowerCase().includes(query) ||
                t.author_role?.toLowerCase().includes(query) ||
                t.content.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(t =>
                statusFilter === "active" ? t.active : !t.active
            );
        }

        setFilteredTestimonials(filtered);
    };

    const fetchTestimonials = async (): Promise<void> => {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching testimonials:", error);
            toast({
                title: "Error fetching testimonials",
                description: error.message,
                variant: "destructive",
            });
        } else if (data) {
            setTestimonials(data);
        }
        setIsLoading(false);
    };

    const handleEdit = (t: Testimonial) => {
        setEditingTestimonial(t);
        setFormData({
            author_name: t.author_name,
            author_role: t.author_role || "",
            content: t.content,
            rating: t.rating || 5,
            avatar_url: t.avatar_url || "",
            active: t.active,
            city: t.city || "",
        });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingTestimonial(null);
        setFormData(defaultFormData);
    };

    const toggleSelectAll = () => {
        const paginatedItems = paginatedTestimonials;
        if (selectedIds.size === paginatedItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedItems.map(t => t.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleSave = async (): Promise<void> => {
        if (!formData.author_name.trim()) {
            toast({ title: "Validation Error", description: "Author name is required.", variant: "destructive" });
            return;
        }
        if (!formData.content.trim()) {
            toast({ title: "Validation Error", description: "Content is required.", variant: "destructive" });
            return;
        }

        setIsSaving(true);

        const payload = {
            author_name: formData.author_name.trim(),
            author_role: formData.author_role.trim() || null,
            content: formData.content.trim(),
            rating: formData.rating,
            avatar_url: formData.avatar_url.trim() || null,
            active: formData.active,
            city: formData.city.trim() || null,
        };

        let error;

        if (editingTestimonial) {
            const { error: updateError } = await supabase
                .from('testimonials')
                .update(payload)
                .eq('id', editingTestimonial.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('testimonials')
                .insert({ ...payload, display_order: testimonials.length });
            error = insertError;
        }

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: editingTestimonial ? "Testimonial updated" : "Testimonial created",
                description: `Successfully ${editingTestimonial ? 'updated' : 'created'} testimonial.`,
            });
            await fetchTestimonials();
            closeDialog();
        }

        setIsSaving(false);
    };

    const handleDelete = async (): Promise<void> => {
        if (!deletingId) return;

        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', deletingId);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Deleted", description: "Testimonial deleted successfully." });
            await fetchTestimonials();
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
        }
    };

    const handleBulkDelete = async (): Promise<void> => {
        const ids = Array.from(selectedIds);

        for (const id of ids) {
            await supabase.from('testimonials').delete().eq('id', id);
        }

        toast({ title: "Deleted", description: `${ids.length} testimonials deleted.` });
        setSelectedIds(new Set());
        await fetchTestimonials();
    };

    const handleBulkToggleActive = async (active: boolean): Promise<void> => {
        const ids = Array.from(selectedIds);

        for (const id of ids) {
            await supabase
                .from('testimonials')
                .update({ active })
                .eq('id', id);
        }

        toast({ title: "Updated", description: `${ids.length} testimonials ${active ? 'activated' : 'deactivated'}.` });
        setSelectedIds(new Set());
        await fetchTestimonials();
    };

    const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
        const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            starSize,
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"
                        )}
                    />
                ))}
            </div>
        );
    };

    const paginatedTestimonials = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTestimonials.slice(start, start + itemsPerPage);
    }, [filteredTestimonials, currentPage]);

    const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);

    const stats = useMemo(() => ({
        total: testimonials.length,
        active: testimonials.filter(t => t.active).length,
        inactive: testimonials.filter(t => !t.active).length,
        avgRating: testimonials.length > 0
            ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.filter(t => t.rating).length || 5).toFixed(1)
            : "—",
    }), [testimonials]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-zinc-500">Loading testimonials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-white tracking-tight">Testimonials</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage client testimonials and reviews</p>
                </div>
                {canWrite && (
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Plus className={`${icons.sm} mr-2`} /> Add Testimonial
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-2xl font-serif text-white">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Active</p>
                        <p className="text-2xl font-serif text-green-400">{stats.active}</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Hidden</p>
                        <p className="text-2xl font-serif text-zinc-400">{stats.inactive}</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Avg Rating</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-serif text-yellow-400">{stats.avgRating}</p>
                            {stats.avgRating !== "—" && renderStars(parseFloat(stats.avgRating as string))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search testimonials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-black/40 border-zinc-700/50 focus:border-primary/50"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {(["all", "active", "inactive"] as const).map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "capitalize",
                                    statusFilter === status && "bg-primary hover:bg-primary/90"
                                )}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs text-zinc-500">{filteredTestimonials.length} results</span>
                    <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("table")}
                            className={cn(
                                "p-2 transition-colors",
                                viewMode === "table" ? "bg-primary text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-2 transition-colors",
                                viewMode === "grid" ? "bg-primary text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                            )}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                    <div className="bg-zinc-900/90 border border-zinc-700 backdrop-blur-md rounded-full shadow-2xl px-6 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 border-r border-zinc-700 pr-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                onClick={() => setSelectedIds(new Set())}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <span className="text-white font-medium text-sm">
                                {selectedIds.size} testimonials selected
                            </span>
                        </div>
                        {canWrite && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                    onClick={() => handleBulkToggleActive(true)}
                                >
                                    <Eye className="w-4 h-4 mr-2" /> Activate
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                    onClick={() => handleBulkToggleActive(false)}
                                >
                                    <EyeOff className="w-4 h-4 mr-2" /> Deactivate
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={handleBulkDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            {viewMode === "table" ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={selectedIds.size === paginatedTestimonials.length && paginatedTestimonials.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Preview</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                {!isReadOnly && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTestimonials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                                        No testimonials found. {canWrite && "Create your first testimonial to get started."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedTestimonials.map((t) => (
                                    <TableRow key={t.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.has(t.id)}
                                                onCheckedChange={() => toggleSelect(t.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {t.avatar_url ? (
                                                    <img
                                                        src={getOptimizedUrl(t.avatar_url, { width: 96, height: 96, quality: 76 })}
                                                        alt={t.author_name}
                                                        className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium">
                                                        {t.author_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-white">{t.author_name}</p>
                                                    <p className="text-xs text-zinc-500">{t.author_role || 'Client'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{renderStars(t.rating || 5)}</TableCell>
                                        <TableCell>
                                            <p className="text-sm text-zinc-400 max-w-xs truncate">{t.content}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "capitalize",
                                                t.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                            )}>
                                                {t.active ? "Active" : "Hidden"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-500 text-sm">
                                            —
                                        </TableCell>
                                        {!isReadOnly && (
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" aria-label="More options">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                                        <DropdownMenuItem onClick={() => handleEdit(t)} className="hover:bg-zinc-800">
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => toggleSelect(t.id)} className="hover:bg-zinc-800">
                                                            {selectedIds.has(t.id) ? <X className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                                                            {selectedIds.has(t.id) ? "Deselect" : "Select"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(t.id)} className="text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedTestimonials.map((t) => (
                        <Card key={t.id} className={cn(
                            "bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors",
                            selectedIds.has(t.id) && "ring-2 ring-primary"
                        )}>
                            <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {t.avatar_url ? (
                                            <img
                                                src={getOptimizedUrl(t.avatar_url, { width: 120, height: 120, quality: 76 })}
                                                alt={t.author_name}
                                                className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium text-lg">
                                                {t.author_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-white">{t.author_name}</p>
                                            <p className="text-xs text-zinc-500">{t.author_role || 'Client'}</p>
                                        </div>
                                    </div>
                                    {canWrite && (
                                        <Checkbox
                                            checked={selectedIds.has(t.id)}
                                            onCheckedChange={() => toggleSelect(t.id)}
                                        />
                                    )}
                                </div>
                                <div>{renderStars(t.rating || 5, "md")}</div>
                                <p className="text-sm text-zinc-400 line-clamp-3">{t.content}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                                    <Badge className={cn(
                                        "capitalize",
                                        t.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                    )}>
                                        {t.active ? "Active" : "Hidden"}
                                    </Badge>
                                    {canWrite && (
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="text-zinc-400 hover:text-white" aria-label="Edit testimonial">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(t.id)} className="text-zinc-400 hover:text-red-400" aria-label="Delete testimonial">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-zinc-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
                        <DialogTitle className="text-xl font-serif">
                            {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {editingTestimonial
                                ? "Update the testimonial details below."
                                : "Add a new client testimonial to showcase on your website."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="author_name">Author Name *</Label>
                            <Input
                                id="author_name"
                                value={formData.author_name}
                                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                className="bg-zinc-800 border-zinc-700 focus:border-primary"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="author_role">Role / Title</Label>
                                <Input
                                    id="author_role"
                                    value={formData.author_role}
                                    onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                                    className="bg-zinc-800 border-zinc-700 focus:border-primary"
                                    placeholder="CEO, Homeowner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating</Label>
                                <div className="flex items-center gap-2 h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-md">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-5 h-5 transition-colors",
                                                    star <= formData.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-zinc-600 hover:text-zinc-400"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Testimonial Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="bg-zinc-800 border-zinc-700 focus:border-primary min-h-[120px]"
                                placeholder="Enter the testimonial text..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar_url">Avatar Image URL</Label>
                            <Input
                                id="avatar_url"
                                value={formData.avatar_url}
                                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                className="bg-zinc-800 border-zinc-700 focus:border-primary"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                            <Switch
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                            />
                            <Label htmlFor="active" className="cursor-pointer">
                                {formData.active ? "Visible on website" : "Hidden from website"}
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City / Location</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="bg-zinc-800 border-zinc-700 focus:border-primary"
                                placeholder="Jamshedpur"
                            />
                        </div>
                    </div>
                    <DialogFooter className="shrink-0 px-6 py-4 border-t border-zinc-800 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isSaving ? "Saving..." : editingTestimonial ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Testimonial</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to delete this testimonial? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminTestimonials;
