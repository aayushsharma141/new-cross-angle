import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
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
} from "@/components/ui/table";
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
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
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
    <div className="space-y-8">
      <AdminBreadcrumb items={[{ label: 'Blogs' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={handleNewPost}>
              <Plus className={`${icons.sm} mr-2`} />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Post" : "New Blog Post"}
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
                    <Label>Slug</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                        title="Regenerate from title"
                      >
                        <Loader2 className={icons.sm} />
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

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={isSaving}>
                  {isSaving ? <Loader2 className={`${icons.sm} animate-spin mr-2`} /> : null}
                  {editingPost ? "Update" : "Create"} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden mb-20">
        <Table>
          <TableHeader className="bg-white/5 border-b border-white/10">
            <TableRow className="border-white/10 hover:bg-transparent text-[hsl(var(--admin-muted))]">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === posts.length && posts.length > 0}
                  onCheckedChange={toggleSelectAll}
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
              <TableRow key={post.id} className="border-white/10 hover:bg-white/5 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(post.id)}
                    onCheckedChange={() => toggleSelect(post.id)}
                  />
                </TableCell>
                <TableCell>
                  {post.cover_image ? (
                    <img src={post.cover_image} alt="Cover" className="h-10 w-10 object-cover rounded-md" />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      <ImageIcon className={icons.sm} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-slate-200">
                  {post.title}
                  {post.excerpt && (
                    <p className="text-xs text-slate-400 font-normal line-clamp-1 mt-1">
                      {post.excerpt}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={post.status || (post.is_published ? "published" : "draft")} />
                </TableCell>
                <TableCell className="text-slate-400">
                  {format(new Date(post.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => handleEdit(post)}>
                      <Pencil className={icons.sm} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => handleDelete(post.id)}>
                      <Trash2 className={icons.sm} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                  No blog posts yet. Create your first post!
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
    </div>
  );
};

export default AdminBlogs;