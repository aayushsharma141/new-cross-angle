import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, RotateCcw, Star, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/primitives/card";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import { Switch } from "@/components/ui/primitives/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/primitives/dialog";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { icons } from "@/design-system/tokens/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/components/Table";
import { RichTextEditor } from "@/components/admin/blogs/RichTextEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { Image as ImageIcon, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";
import { getOptimizedUrl } from "@/lib/cdn";
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader";

type BlogStatus = "draft" | "review" | "published";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown | null;
  cover_image_url: string | null;
  status: string;
  featured: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: BlogStatus;
  featured: boolean;
  seo_title: string;
  seo_description: string;
  tags: string;
}

const AdminBlogs = () => {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const deepLinkHandled = useRef(false);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    status: "draft",
    featured: false,
    seo_title: "",
    seo_description: "",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterPosts();
    setCurrentPage(1);
  }, [posts, searchQuery, statusFilter]);

  const filterPosts = () => {
    let filtered = [...posts];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(post => post.status === statusFilter);
    }
    
    setFilteredPosts(filtered);
  };

  const fetchPosts = async (): Promise<void> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setPosts(data);
      // Deep-link from command palette: ?edit=<slug>
      if (editSlug && !deepLinkHandled.current) {
        deepLinkHandled.current = true;
        const target = data.find((p: BlogPost) => p.slug === editSlug);
        if (target) {
          setEditingPost(target);
          setFormData({
            title: target.title,
            slug: target.slug,
            excerpt: target.excerpt ?? "",
            content: typeof target.content === 'string' ? target.content : "",
            cover_image_url: target.cover_image_url ?? "",
            status: (target.status as BlogStatus) || "draft",
            featured: target.featured ?? false,
            seo_title: target.seo_title ?? "",
            seo_description: target.seo_description ?? "",
            tags: target.tags?.join(", ") ?? "",
          });
          setIsDialogOpen(true);
        }
      }
    }
    setIsLoading(false);
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string): void => {
    setFormData(prev => ({
      ...prev,
      title,
      ...(editingPost === null ? { slug: generateSlug(title) } : {}),
    }));
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map(p => p.id)));
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

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} posts?`)) return;

    setIsBulkUpdating(true);
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', Array.from(selectedIds));

    if (error) {
      toast({ title: "Error deleting posts", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Posts deleted", description: `Successfully deleted ${selectedIds.size} posts.` });
      setSelectedIds(new Set());
      fetchPosts();
    }
    setIsBulkUpdating(false);
  };

  const handleBulkStatusUpdate = async (status: BlogStatus) => {
    setIsBulkUpdating(true);

    const updates = Array.from(selectedIds).map(id => ({
      id,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null
    }));

    const { error } = await supabase
      .from('blog_posts')
      .upsert(updates as { id: string; status: BlogStatus; published_at: string | null }[])
      .select();

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Successfully updated ${selectedIds.size} posts to ${status}.` });
      setSelectedIds(new Set());
      fetchPosts();
    }
    setIsBulkUpdating(false);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Post deleted successfully" });
      void fetchPosts();
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content || null,
        cover_image_url: formData.cover_image_url || null,
        status: formData.status,
        featured: formData.featured,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);
        if (error) throw error;
      }

      toast({
        title: editingPost ? "Post updated!" : "Post created!",
      });

      // Clear draft
      const draftKey = editingPost ? `admin_blog_draft_${editingPost.id}` : "admin_blog_draft_new";
      localStorage.removeItem(draftKey);

      setIsDialogOpen(false);
      setEditingPost(null);
      resetForm();
      void fetchPosts();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error saving post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save draft logic
  useEffect(() => {
    if (!isDialogOpen) return;

    const saveDraft = setTimeout(() => {
      const draftKey = editingPost ? `admin_blog_draft_${editingPost.id}` : "admin_blog_draft_new";
      if (formData.title || formData.content || formData.excerpt) {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }
    }, 1000);

    return () => clearTimeout(saveDraft);
  }, [formData, editingPost, isDialogOpen]);

  const handleNewPost = (): void => {
    setEditingPost(null);
    const savedDraft = localStorage.getItem("admin_blog_draft_new");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        toast({
          title: "Draft Restored",
          description: "We found an unsaved draft and restored it for you.",
        });
      } catch (e) {
        console.error("Failed to parse draft", e);
        resetForm();
      }
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleEdit = (post: BlogPost): void => {
    setEditingPost(post);
    const savedDraft = localStorage.getItem(`admin_blog_draft_${post.id}`);

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        toast({
          title: "Draft Restored",
          description: "Restored your unsaved changes for this post.",
        });
      } catch (e) {
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          content: typeof post.content === 'string' ? post.content : "",
          cover_image_url: post.cover_image_url || "",
          status: (post.status as BlogStatus) || "draft",
          featured: post.featured ?? false,
          seo_title: post.seo_title ?? "",
          seo_description: post.seo_description ?? "",
          tags: post.tags?.join(", ") ?? "",
        });
      }
    } else {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: typeof post.content === 'string' ? post.content : "",
        cover_image_url: post.cover_image_url || "",
        status: (post.status as BlogStatus) || "draft",
        featured: post.featured ?? false,
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
        tags: post.tags?.join(", ") ?? "",
      });
    }
    setIsDialogOpen(true);
  };

  const resetForm = (): void => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image_url: "",
      status: "draft",
      featured: false,
      seo_title: "",
      seo_description: "",
      tags: "",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'secondary';
      case 'review': return 'warning';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`${icons.xl} animate-spin text-primary`} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ModuleHeader
            title="Articles"
            description="Craft and curate your unit's strategic narratives and industry articles."
            action={
              <DialogTrigger asChild>
                <Button onClick={handleNewPost} className="rounded-xl shadow-lg shadow-primary/20">
                  <Plus className={`${icons.sm} mr-2`} />
                  New Post
                </Button>
              </DialogTrigger>
            }
          />
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Article" : "New Article"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content Column */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="blog-title">Title</Label>
                      <span className={`text-xs ${formData.title.length > 60 ? "text-red-500" : "text-muted-foreground"}`}>
                        {formData.title.length}/60
                      </span>
                    </div>
                    <Input
                      id="blog-title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      placeholder="Enter a catchy title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="blog-slug">Slug</Label>
                      {editingPost && (
                        <span className="text-xs text-muted-foreground">
                          URL locked — edit manually below
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="blog-slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        required
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                        title="Regenerate slug from title"
                      >
                        <RotateCcw className={icons.sm} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-content">Content</Label>
                    <RichTextEditor
                      content={formData.content || ""}
                      onChange={(content) => setFormData({ ...formData, content })}
                      className="min-h-[400px]"
                    />
                  </div>
                  
                  {/* SEO Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">SEO Settings</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="seo-title">SEO Title</Label>
                        <Input
                          id="seo-title"
                          value={formData.seo_title}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                          placeholder="Leave empty to use post title"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="seo-description">SEO Description</Label>
                        <Textarea
                          id="seo-description"
                          value={formData.seo_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                          placeholder="Meta description for search engines"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="blog-tags">Tags (comma separated)</Label>
                        <Input
                          id="blog-tags"
                          value={formData.tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="interior, design, luxury"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="blog-excerpt">Excerpt</Label>
                      <span className={`text-xs ${formData.excerpt.length > 160 ? "text-red-500" : "text-muted-foreground"}`}>
                        {formData.excerpt.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="blog-excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={5}
                      placeholder="Short summary for SEO and previews..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blog-cover-image">Cover Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                      {formData.cover_image_url ? (
                        <div className="relative group">
                          <img src={getOptimizedUrl(formData.cover_image_url, { width: 720, quality: 76 })} alt="Cover" className="h-32 w-full object-cover rounded-md" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                          >
                            <Trash2 className={icons.sm} />
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4 text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <MediaPicker
                            onSelect={(url) => setFormData({ ...formData, cover_image_url: url })}
                            trigger={
                              <Button type="button" variant="outline" className="gap-2">
                                <ImageIcon className={`${icons.sm} mr-2`} />
                                Select from Library
                              </Button>
                            }
                          />
                          <span className="text-xs text-muted-foreground">or paste URL</span>
                          <Input
                            value={formData.cover_image_url || ""}
                            onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                            placeholder="https://..."
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg space-y-4 border">
                    <div className="space-y-3">
                      <Label className="flex flex-col gap-1">
                        <span>Status</span>
                      </Label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as BlogStatus })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Label htmlFor="featured-switch" className="flex flex-col gap-1 cursor-pointer">
                        <span className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Featured
                        </span>
                      </Label>
                      <Switch
                        id="featured-switch"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05]">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-zinc-800">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="rounded-xl shadow-lg shadow-primary/20">
                  {isSaving ? <Loader2 className={`${icons.sm} animate-spin mr-2`} /> : null}
                  {editingPost ? "Update" : "Create"} Article
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BlogStatus | "all")}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onDelete={handleBulkDelete}
          onPublish={() => handleBulkStatusUpdate('published')}
          isDeleting={isBulkUpdating}
        />
      )}

      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl mb-20">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-zinc-700"
                />
              </TableHead>
              <TableHead className="w-[80px]">Cover</TableHead>
              <TableHead>Post Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((post) => (
              <TableRow key={post.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(post.id)}
                    onCheckedChange={() => toggleSelect(post.id)}
                    className="border-zinc-700"
                  />
                </TableCell>
                <TableCell>
                  {post.cover_image_url ? (
                    <img src={getOptimizedUrl(post.cover_image_url, { width: 160, quality: 70 })} alt="" className="h-12 w-16 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-16 bg-zinc-800 rounded flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-white">{post.title}</div>
                  <div className="text-xs text-zinc-500 font-mono">/{post.slug}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={post.status as "draft" | "published" | "archived"} />
                </TableCell>
                <TableCell>
                  {post.featured ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <span className="text-zinc-600">-</span>
                  )}
                </TableCell>
                <TableCell className="text-zinc-400 text-sm">
                  {post.published_at 
                    ? format(new Date(post.published_at), 'MMM d, yyyy')
                    : format(new Date(post.created_at), 'MMM d, yyyy')
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(post)}
                    >
                      <Pencil className={`${icons.sm}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className={`${icons.sm} text-red-400`} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No posts found. {searchQuery || statusFilter !== "all" ? "Try adjusting your filters." : "Create your first post!"}
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-800/50 bg-zinc-900/50">
            <div className="text-sm text-zinc-400">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredPosts.length)} to {Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-zinc-800 text-zinc-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPosts.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredPosts.length / itemsPerPage)}
                className="border-zinc-800 text-zinc-300"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;
