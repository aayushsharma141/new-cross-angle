import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, RotateCcw } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
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
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";

type BlogStatus = "draft" | "published" | "archived";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  is_published: boolean;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  is_published: boolean;
  status: BlogStatus;
}

const AdminBlogs = () => {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const deepLinkHandled = useRef(false);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    is_published: false,
    status: "draft",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async (): Promise<void> => {
    const { data, error } = await supabase
      .from('blogs')
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
            content: target.content ?? "",
            cover_image: target.cover_image ?? "",
            is_published: target.is_published,
            status: target.status,
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
      // Only auto-generate slug for new posts — never rewrite the slug of a
      // published post (that would break all existing inbound links).
      ...(editingPost === null ? { slug: generateSlug(title) } : {}),
    }));
  };


  const toggleSelectAll = () => {
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map(p => p.id)));
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
      .from('blogs')
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

    // Preparation for bulk update
    const updates = Array.from(selectedIds).map(id => ({
      id,
      status,
      is_published: status === 'published',
      published_at: status === 'published' ? new Date().toISOString() : null
    }));

    const { error } = await supabase
      .from('blogs')
      .upsert(updates as { id: string; status: BlogStatus; is_published: boolean; published_at: string | null }[])
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
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await supabase.functions.invoke('cda-api', {
        body: { action: 'invalidate', resource: 'blogs' }
      });
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
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.cover_image || null,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blogs')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert(postData);
        if (error) throw error;
      }

      await supabase.functions.invoke('cda-api', {
        body: { action: 'invalidate', resource: 'blogs' }
      });
      await supabase.functions.invoke('cda-api', {
        body: { action: 'invalidate', resource: 'blogs', slug: formData.slug }
      });

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
      // Only save if there's actual content to save
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
          content: post.content || "",
          cover_image: post.cover_image || "",
          is_published: post.is_published,
          status: (post.status ?? (post.is_published ? "published" : "draft")) as BlogFormData["status"],
        });
      }
    } else {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        cover_image: post.cover_image || "",
        is_published: post.is_published,
        status: (post.status ?? (post.is_published ? "published" : "draft")) as BlogFormData["status"],
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
      cover_image: "",
      is_published: false,
      status: "draft",
    });
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
      <AdminBreadcrumb items={[{ label: 'Blogs' }]} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-white tracking-tight">Articles</h1>
          <p className="text-sm text-zinc-500 font-sans max-w-sm">Craft and curate your unit's strategic narratives and industry articles.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="primary" onClick={handleNewPost} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className={`${icons.sm} mr-2`} />
              New Post
            </Button>
          </DialogTrigger>
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
                      <Label>Title</Label>
                      <span className={`text-xs ${formData.title.length > 60 ? "text-red-500" : "text-muted-foreground"}`}>
                        {formData.title.length}/60
                      </span>
                    </div>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      placeholder="Enter a catchy title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Slug</Label>
                      {editingPost && (
                        <span className="text-xs text-muted-foreground">
                          URL locked — edit manually below
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
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
                    <Label>Content</Label>
                    <RichTextEditor
                      content={formData.content || ""}
                      onChange={(content) => setFormData({ ...formData, content })}
                      className="min-h-[400px]"
                    />
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Excerpt</Label>
                      <span className={`text-xs ${formData.excerpt.length > 160 ? "text-red-500" : "text-muted-foreground"}`}>
                        {formData.excerpt.length}/160
                      </span>
                    </div>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={5}
                      placeholder="Short summary for SEO and previews..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                      {formData.cover_image ? (
                        <div className="relative group">
                          <img src={formData.cover_image} alt="Cover" className="h-32 w-full object-cover rounded-md" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setFormData({ ...formData, cover_image: "" })}
                          >
                            <Trash2 className={icons.sm} />
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4 text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <MediaPicker
                            onSelect={(url) => setFormData({ ...formData, cover_image: url })}
                            trigger={
                              <Button type="button" variant="outline" className="gap-2">
                                <ImageIcon className={`${icons.sm} mr-2`} />
                                Select from Library
                              </Button>
                            }
                          />
                          <span className="text-xs text-muted-foreground">or paste URL</span>
                          <Input
                            value={formData.cover_image || ""}
                            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                            placeholder="https://..."
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg space-y-4 border">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="publish-switch" className="flex flex-col gap-1 cursor-pointer">
                        <span>Publish Status</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {formData.is_published ? "Visible to public" : "Draft mode"}
                        </span>
                      </Label>
                      <Switch
                        id="publish-switch"
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05]">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-zinc-800">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving} className="rounded-xl shadow-lg shadow-primary/20">
                  {isSaving ? <Loader2 className={`${icons.sm} animate-spin mr-2`} /> : null}
                  {editingPost ? "Update" : "Create"} Article
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl mb-20">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === posts.length && posts.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-zinc-700"
                />
              </TableHead>
              <TableHead className="w-[80px]">Cover</TableHead>
              <TableHead>Post Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(post.id)}
                    onCheckedChange={() => toggleSelect(post.id)}
                    className="border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:text-white rounded-md transition-all"
                  />
                </TableCell>
                <TableCell>
                  <div className="w-10 h-10 rounded overflow-hidden border border-zinc-800 bg-black/40">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className={`${icons.sm} text-zinc-700`} />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-zinc-200 tracking-tight">{post.title}</span>
                    {post.excerpt && (
                      <p className="text-[10px] text-zinc-500 line-clamp-1 font-medium">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={post.status || (post.is_published ? "published" : "draft")} />
                </TableCell>
                <TableCell className="text-zinc-400 font-medium">
                  {format(new Date(post.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/5 transition-colors"
                      onClick={() => handleEdit(post)}
                    >
                      <Pencil className={icons.sm} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className={icons.sm} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500 font-medium">
                  No articles yet. Create your first article!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        label="blog posts"
        onClear={() => setSelectedIds(new Set())}
        onDelete={handleBulkDelete}
        onPublish={() => handleBulkStatusUpdate('published')}
        onArchive={() => handleBulkStatusUpdate('draft')}
        isUpdating={isBulkUpdating}
        isDeleting={isBulkUpdating}
      />
    </div >
  );
};

export default AdminBlogs;