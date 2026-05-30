import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Plus, Pencil, LayoutGrid } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminTabSlider } from "@/components/admin/ui/AdminTabSlider";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { Button } from "@/components/ui/primitives/button";
import { BlogList } from "@/components/admin/blogs/BlogList";
import { BlogEditorForm } from "@/components/admin/blogs/BlogEditorForm";
import { BlogPost } from "@/types/blog";
import { supabase } from "@/integrations/supabase/client";

const AdminBlogs = () => {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const deepLinkHandled = useRef(false);

  const [activeTab, setActiveTab] = useState("all");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleDeepLink = async () => {
      if (editSlug && !deepLinkHandled.current) {
        deepLinkHandled.current = true;
        const { data } = await supabase.from('blog_posts').select('*').eq('slug', editSlug).single();
        if (data) {
          setEditingPost(data as unknown as BlogPost);
          setActiveTab("editor");
        }
      }
    };
    void handleDeepLink();
  }, [editSlug]);

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
    <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
      <ModuleActions>
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
      </ModuleActions>

      {activeTab === "all" ? (
        <BlogList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
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
