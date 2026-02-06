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

import { Pagination } from "@repo/ui";

const ITEMS_PER_PAGE = 9;

const AdminBlogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
  }, [currentPage]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) {
      setPosts(data);
    }

    if (count) {
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
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

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover_image: post.cover_image || "",
      is_published: post.is_published
    });
    setIsDialogOpen(true);
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
        title: editingPost ? "Post updated!" : "Post created!",
      });

      setIsDialogOpen(false);
      setEditingPost(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        cover_image: "",
        is_published: false
      });
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

  const handleNewPost = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      is_published: false
    });
    setIsDialogOpen(true);
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Post" : "New Blog Post"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label>Publish immediately</Label>
              </div>
              <div className="flex justify-end gap-2">
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

      {totalPages > 1 && (
        <div className="py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;