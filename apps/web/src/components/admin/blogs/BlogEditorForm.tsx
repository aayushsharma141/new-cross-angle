import React from 'react';
import { useState, useEffect } from "react";
import { Loader2, RotateCcw, Trash2, Star, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Textarea } from "@/components/primitives/interactive";
import { Label } from "@/components/ui/primitives/label";
import { Switch } from "@/components/ui/primitives/switch";
import { RichTextEditor } from "@/components/admin/blogs/RichTextEditor";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { Image } from "@/components/ui/enhanced/image";
import { supabase } from "@/integrations/supabase/client";
import { auditService } from "@/services/AuditService";
import { useToast } from "@/hooks/useToast";
import { icons } from "@/design-system/tokens/icons";
import { BlogPost, BlogFormData, BlogStatus } from "@/types/blog";
import { blogPostSchema, formatZodErrors } from "@/lib/validation/validations";

interface BlogEditorFormProps {
  post: BlogPost | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function BlogEditorForm({ post, onSaved, onCancel }: BlogEditorFormProps) {
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
    scheduled_at: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      const savedDraft = localStorage.getItem(`admin_blog_draft_${post.id}`);
      if (savedDraft) {
        try {
          setFormData(JSON.parse(savedDraft));
          toast({ title: "Draft Restored", description: "Restored your unsaved changes." });
        } catch {
          initializeForm(post);
        }
      } else {
        initializeForm(post);
      }
    } else {
      const savedDraft = localStorage.getItem("admin_blog_draft_new");
      if (savedDraft) {
        try {
          setFormData(JSON.parse(savedDraft));
          toast({ title: "Draft Restored", description: "Restored your unsaved draft." });
        } catch {
          resetForm();
        }
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  const initializeForm = (p: BlogPost) => {
    setFormData({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      content: typeof p.content === 'string' ? p.content : "",
      cover_image_url: p.cover_image_url || "",
      status: (p.status as BlogStatus) || "draft",
      featured: p.featured ?? false,
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      tags: p.tags?.join(", ") ?? "",
      scheduled_at: p.scheduled_at ?? "",
    });
  };

  const resetForm = () => {
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
      scheduled_at: "",
    });
  };

  // Auto-save logic
  useEffect(() => {
    const saveDraft = setTimeout(() => {
      const draftKey = post ? `admin_blog_draft_${post.id}` : "admin_blog_draft_new";
      if (formData.title || formData.content || formData.excerpt) {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }
    }, 1000);
    return () => clearTimeout(saveDraft);
  }, [formData, post]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      ...(!post ? { slug: generateSlug(title) } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod schema before saving
    const validation = blogPostSchema.safeParse({
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      cover_image: formData.cover_image_url,
      status: formData.status,
      is_published: formData.status === "published",
    });
    if (!validation.success) {
      toast({ title: "Validation Error", description: formatZodErrors(validation.error), variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content || null,
        // TODO(ADR-0002): move to asset_usages; deprecated_cover_image_url is
        // the post-DAM-v3 name of this column.
        deprecated_cover_image_url: formData.cover_image_url || null,
        status: formData.status,
        featured: formData.featured,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        // NOTE: blog_posts has no scheduled_at column. Sending it rejected the
        // whole write, so scheduling is not persisted until the column exists.
      };

      if (post) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', post.id);
        if (error) throw error;
        void auditService.writeAudit('UPDATE', 'blog', post.id, { title: postData.title, status: postData.status });
      } else {
        const { data: inserted, error } = await supabase.from('blog_posts').insert(postData).select('id').single();
        if (error) throw error;
        void auditService.writeAudit('CREATE', 'blog', inserted?.id ?? null, { title: postData.title, status: postData.status });
      }

      toast({ title: post ? "Post updated!" : "Post created!" });
      
      const draftKey = post ? `admin_blog_draft_${post.id}` : "admin_blog_draft_new";
      localStorage.removeItem(draftKey);
      onSaved();
    } catch (err) {
      toast({ title: "Error saving post", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="blog-title" className="text-[hsl(var(--admin-text))]">Title</Label>
              <span className={`text-xs ${formData.title.length > 60 ? "text-[hsl(var(--admin-danger))]" : "text-[hsl(var(--admin-muted))]"}`}>
                {formData.title.length}/60
              </span>
            </div>
            <Input
              id="blog-title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="Enter a catchy title�"
              className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="blog-slug" className="text-[hsl(var(--admin-text))]">Slug</Label>
              {post && (
                <span className="text-xs text-[hsl(var(--admin-muted))]">URL locked — edit manually below</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="blog-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                className="font-mono text-sm bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                className="border-[hsl(var(--admin-border))] bg-transparent"
                title="Regenerate slug from title"
              >
                <RotateCcw className={icons.sm} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-content" className="text-[hsl(var(--admin-text))]">Content</Label>
            <RichTextEditor
              content={formData.content || ""}
              onChange={(content) => setFormData({ ...formData, content })}
              className="min-h-[500px]"
            />
          </div>
          
          <div className="border-t border-[hsl(var(--admin-border))] pt-4 mt-6">
            <h3 className="text-sm font-medium text-[hsl(var(--admin-text))] mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title" className="text-[hsl(var(--admin-text))]">SEO Title</Label>
                <Input
                  id="seo-title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  placeholder="Leave empty to use post title"
                  className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-description" className="text-[hsl(var(--admin-text))]">SEO Description</Label>
                <Textarea
                  id="seo-description"
                  value={formData.seo_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                  placeholder="Meta description for search engines"
                  rows={2}
                  className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-tags" className="text-[hsl(var(--admin-text))]">Tags (comma separated)</Label>
                <Input
                  id="blog-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="interior, design, luxury"
                  className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] space-y-4">
            <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Publishing Settings</h3>
            <div className="space-y-3">
              <Label htmlFor="blog-status" className="flex flex-col gap-1 text-[hsl(var(--admin-text))]">Status</Label>
              <select
                id="blog-status"
                title="Publishing Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BlogStatus })}
                className="w-full h-10 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))]"
              >
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="published">Published</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--admin-border))]">
              <Label htmlFor="featured-switch" className="flex flex-col gap-1 cursor-pointer text-[hsl(var(--admin-text))]">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Featured Post
                </span>
              </Label>
              <Switch
                id="featured-switch"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>

            {formData.status === "draft" && (
              <div className="space-y-2 pt-4 border-t border-[hsl(var(--admin-border))]">
                <Label htmlFor="scheduled-at" className="text-[hsl(var(--admin-text))]">Schedule Publishing</Label>
                <Input
                  id="scheduled-at"
                  type="datetime-local"
                  value={formData.scheduled_at ? formData.scheduled_at.slice(0, 16) : ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                  className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
                />
                {formData.scheduled_at && (
                  <p className="text-xs text-[hsl(var(--admin-muted))]">
                    Will publish at {new Date(formData.scheduled_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="blog-excerpt" className="text-[hsl(var(--admin-text))]">Excerpt</Label>
              <span className={`text-xs ${formData.excerpt.length > 160 ? "text-[hsl(var(--admin-danger))]" : "text-[hsl(var(--admin-muted))]"}`}>
                {formData.excerpt.length}/160
              </span>
            </div>
            <Textarea
              id="blog-excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={5}
              placeholder="Short summary for SEO and previews�"
              className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[hsl(var(--admin-text))]">Cover Image</Label>
            <div className="border-2 border-dashed border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]/50 rounded-xl p-4 text-center">
              {formData.cover_image_url ? (
                <div className="relative group rounded-lg overflow-hidden">
                  <Image 
                    src={formData.cover_image_url} 
                    alt="Cover" 
                    className="h-40 w-full" 
                    imageClassName="object-cover"
                    width={720}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-[hsl(var(--admin-muted))] text-sm flex flex-col items-center gap-3">
                  <MediaPicker
                    onSelect={(url) => setFormData({ ...formData, cover_image_url: url })}
                    trigger={
                      <Button type="button" variant="outline" className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select from Library
                      </Button>
                    }
                  />
                  <span className="text-xs">or paste image URL</span>
                  <Input
                    value={formData.cover_image_url || ""}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://�"
                    className="mt-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-[hsl(var(--admin-border))] mt-8">
        <Button type="button" variant="outline" onClick={onCancel} className="bg-transparent border-[hsl(var(--admin-border))]">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving} 
          className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/90] text-black font-semibold shadow-lg"
        >
          {isSaving ? <Loader2 className={`${icons.sm} animate-spin mr-2`} /> : null}
          {post ? "Update Article" : "Publish Article"}
        </Button>
      </div>
    </form>
  );
}
