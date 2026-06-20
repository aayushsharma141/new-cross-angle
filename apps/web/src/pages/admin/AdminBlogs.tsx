import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { Button } from "@/components/ui/primitives/button";
import { BlogList } from "@/components/admin/blogs/BlogList";
import { BlogEditorForm } from "@/components/admin/blogs/BlogEditorForm";
import { BlogPost } from "@/types/blog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { captureException } from "@/lib/sentry";

const AdminBlogs = () => {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const deepLinkHandled = useRef(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleDeepLink = async () => {
      if (editSlug && !deepLinkHandled.current) {
        deepLinkHandled.current = true;
        const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', editSlug).single();
        if (error) {
          toast({ title: "Error", description: "Could not load blog post for editing.", variant: "destructive" });
          captureException(error, { tags: { area: "admin-blogs" }, extra: { slug: editSlug } });
          return;
        }
        if (data) {
          setEditingPost(data as unknown as BlogPost);
          setActiveTab("editor");
        }
      }
    };
    void handleDeepLink();
  }, [editSlug, toast]);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setActiveTab("editor");
  };

  const handleNew = () => {
    setEditingPost(null);
    setActiveTab("editor");
  };

  const handleSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingPost(null);
    setActiveTab("all");
  };

  const handleCancel = () => {
    setEditingPost(null);
    setActiveTab("all");
  };

  return (
      <div className="flex flex-col space-y-4 animate-in fade-in duration-700">
            <ModuleActions>
        <div className="flex flex-col sm:flex-row gap-4 justify-between w-full">
          {activeTab === "all" && (
            <div className="flex-1" />
          )}
          <div className="flex gap-2 ml-auto">
            {activeTab === "all" ? (
          <Button
            type="button"
            className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/90] text-black font-semibold shadow-lg"
            onClick={handleNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={handleCancel} className="bg-transparent border-[hsl(var(--admin-border))]">
            Cancel
            </Button>
          )}
          </div>
        </div>
      </ModuleActions>

      {activeTab === "all" ? (
        <BlogList refreshTrigger={refreshTrigger} onEdit={handleEdit} onNew={handleNew} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      ) : (
        <BlogEditorForm
          post={editingPost}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default AdminBlogs;
