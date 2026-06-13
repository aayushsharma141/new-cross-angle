import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, Star, Image as ImageIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { auditService } from "@/services/AuditService";
import { useToast } from "@/hooks/useToast";
import { BlogPost, BlogStatus } from "@/types/blog";
import { Image } from "@/components/ui/enhanced/image";
import { 
  AdminFilterBar,
  AdminSafeAction,
  AdminEmptyState,
  AdminSkeletonCard,
  AdminMetricsPanel
} from "@/components/admin/shared";
import { AdminAddCard } from "@/components/admin/shared/AdminEmptyState";

interface BlogListProps {
  refreshTrigger: number;
  onEdit: (post: BlogPost) => void;
  onNew: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function BlogList({ refreshTrigger, onEdit, onNew, searchQuery = "", onSearchChange }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "All">("All");
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error fetching posts", description: error.message, variant: "destructive" });
    } else if (data) {
      setPosts(data as unknown as BlogPost[]);
    }
    setIsLoading(false);
  };

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.slug?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(post => post.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return filtered;
  }, [posts, statusFilter, searchQuery]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    } else {
      void auditService.writeAudit('DELETE', 'blog', id, { action: 'delete_post' });
      toast({ title: "Post deleted successfully" });
      fetchPosts();
    }
  };

  const activeCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const reviewCount = posts.filter(p => p.status === 'review').length;

  const metrics = [
    { label: "Total Posts", value: String(posts.length), dotColor: "info" as const },
    { label: "Published", value: String(activeCount), dotColor: "success" as const },
    { label: "Drafts", value: String(draftCount), dotColor: draftCount > 0 ? "warning" as const : "success" as const },
    { label: "In Review", value: String(reviewCount), dotColor: reviewCount > 0 ? "accent" as const : "success" as const },
  ];

  return (
    <div className="w-full font-mono">
      <style>{`
          @keyframes fadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
          .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
          .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
          .fade-up-4 { animation: fadeUp var(--anim-duration) var(--anim-stagger-4) var(--anim-ease) both; }
      `}</style>

      <div className="fade-up-1">
          <AdminMetricsPanel metrics={metrics} />
      </div>

      <div className="fade-up-2">
          <AdminFilterBar 
              title="Blog Posts"
              icon={FileText}
              badgeCount={activeCount > 0 ? `${activeCount} published` : undefined}
              filters={["All", "Published", "Draft", "Review"]}
              activeFilter={statusFilter}
              onFilterChange={(f) => setStatusFilter(f as BlogStatus | "All")}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
          />
      </div>

      <div className="flex flex-col gap-[10px] mt-[10px]">
        {isLoading ? (
          <>
            <AdminSkeletonCard size="md" />
            <AdminSkeletonCard size="md" />
            <AdminSkeletonCard size="md" />
          </>
        ) : filteredPosts.length === 0 ? (
          <div className="fade-up-3 mt-4">
              <AdminEmptyState 
                  icon={FileText}
                  title="No posts found"
                  description="You don't have any blog posts matching this filter yet."
              />
          </div>
        ) : (
          filteredPosts.map((post, i) => {
            const delayClass = `fade-up-${Math.min((i % 4) + 1, 4)}`;

            return (
              <div key={post.id} className={`${delayClass} group`}>
                <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-200 grid grid-cols-[80px_1fr_auto] gap-5 items-center">
                  
                  {/* Image */}
                  <div className="w-[80px] h-[60px] rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center shrink-0 overflow-hidden relative">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        width={160}
                        quality={72}
                        imageClassName="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[hsl(var(--admin-text-muted))]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <span className="text-[15px] font-bold text-[hsl(var(--admin-text))]">
                        {post.title}
                      </span>
                      
                      {post.featured && (
                        <span className="bg-[hsl(var(--admin-accent)/0.1)] border border-[hsl(var(--admin-accent)/0.2)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-accent))] tracking-wide uppercase flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      )}

                      {post.status === 'published' ? (
                        <span className="bg-[hsl(var(--admin-success)/0.12)] border border-[hsl(var(--admin-success)/0.25)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-success))] tracking-wide uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-success))] shadow-[0_0_4px_hsl(var(--admin-success))]" />
                          Published
                        </span>
                      ) : post.status === 'review' ? (
                        <span className="bg-[hsl(var(--admin-warning)/0.12)] border border-[hsl(var(--admin-warning)/0.25)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-warning))] tracking-wide uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-warning))] shadow-[0_0_4px_hsl(var(--admin-warning))]" />
                          In Review
                        </span>
                      ) : (
                        <span className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-text-muted))] tracking-wide uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    
                    <div className="text-[13px] text-[hsl(var(--admin-text-muted))] truncate max-w-2xl mt-1.5">
                      /{post.slug}
                    </div>

                    <div className="text-[12px] text-[hsl(var(--admin-text-muted))] mt-1.5">
                      {post.published_at 
                        ? `Published: ${format(new Date(post.published_at), 'MMM d, yyyy')}`
                        : `Created: ${format(new Date(post.created_at ?? new Date()), 'MMM d, yyyy')} `
                      }
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(post)}
                      className="px-2.5 py-2 rounded-[7px] text-[12px] font-normal bg-transparent border border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-150 flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-[13px] h-[13px]" />
                      Edit
                    </button>
                    
                    <AdminSafeAction
                      icon={Trash2}
                      label="Delete"
                      confirmLabel="Delete post?"
                      onConfirm={() => handleDelete(post.id)}
                      danger
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isLoading && (
          <div className="fade-up-4 mt-[10px]">
              <AdminAddCard 
                  label="Add a new post"
                  onClick={onNew}
              />
          </div>
      )}
    </div>
  );
}
