import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Plus, Pencil, LayoutGrid } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminTabSlider } from "@/components/admin/ui/AdminTabSlider";
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
          setEditingPost(data);
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
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <AdminTabSlider
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        header={
          <AdminPageHeader
            title="Blog Posts"
            description="Create, edit, and publish engaging content for the CrossAngle Interiors blog."
            breadcrumbs={[]}
            actions={
              <Button
                type="button"
                size="lg"
                className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/90] text-black font-semibold shadow-lg"
                onClick={handleNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            }
          />
        }
        tabs={[
          {
            id: "all",
            label: "All Posts",
            icon: LayoutGrid,
            content: (
              <BlogList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
            ),
          },
          {
            id: "editor",
            label: editingPost ? "Edit Post" : "New Post",
            icon: editingPost ? Pencil : Plus,
            content: (
              <BlogEditorForm
                post={editingPost}
                onSaved={handleSaved}
                onCancel={handleCancel}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default AdminBlogs;
