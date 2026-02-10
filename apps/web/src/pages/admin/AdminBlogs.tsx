import { useState, useEffect } from "react";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RichTextEditor } from "@/components/admin/blogs/RichTextEditor";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { Image as ImageIcon } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const AdminBlogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    is_published: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }
    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting post",
        variant: "destructive",
      });
    } else {
      toast({ title: "Post deleted successfully" });
      fetchPosts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      toast({
        title: editingPost ? "Post updated!" : "Post updated!",
      });

      // Clear draft
      const draftKey = editingPost ? `admin_blog_draft_${editingPost.id}` : "admin_blog_draft_new";
      localStorage.removeItem(draftKey);

      setIsDialogOpen(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (error: any) {
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

  const handleNewPost = () => {
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

  const handleEdit = (post: BlogPost) => {
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
          is_published: post.is_published
        });
      }
    } else {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        cover_image: post.cover_image || "",
        is_published: post.is_published
      });
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      is_published: false
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Blogs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={handleNewPost}>
              <Plus className="w-4 h-4 mr-2" />
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
                        <Loader2 className="w-4 h-4" />
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
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4 text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <MediaPicker
                            onSelect={(url) => setFormData({ ...formData, cover_image: url })}
                            trigger={
                              <Button type="button" variant="outline" className="gap-2">
                                <ImageIcon className="w-4 h-4" />
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
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingPost ? "Update" : "Create"} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_published ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={`text-xs ${post.is_published ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No blog posts yet. Create your first post!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;