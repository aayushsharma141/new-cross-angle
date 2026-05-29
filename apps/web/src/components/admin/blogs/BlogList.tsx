import { useState, useEffect, useMemo } from "react";
import { Loader2, Pencil, Trash2, Star, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/components/Table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";
import { Image } from "@/components/ui/enhanced/image";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { auditService } from "@/services/AuditService";
import { useToast } from "@/hooks/useToast";
import { icons } from "@/design-system/tokens/icons";
import { BlogPost, BlogStatus } from "@/types/blog";

interface BlogListProps {
  refreshTrigger: number;
  onEdit: (post: BlogPost) => void;
}

export function BlogList({ refreshTrigger, onEdit }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [posts, searchQuery, statusFilter]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error fetching posts", description: error.message, variant: "destructive" });
    } else if (data) {
      setPosts(data);
    }
    setIsLoading(false);
  };

  const filteredPosts = useMemo(() => {
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
    return filtered;
  }, [posts, searchQuery, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} posts?`)) return;
    setIsBulkUpdating(true);
    const { error } = await supabase.from('blog_posts').delete().in('id', Array.from(selectedIds));

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
    const ids = Array.from(selectedIds);
    const updatePayload = {
      status,
      published_at: status === 'published' ? new Date().toISOString() : null
    };

    const { error } = await supabase.from('blog_posts').update(updatePayload).in('id', ids);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Successfully updated ${selectedIds.size} posts to ${status}.` });
      void Promise.all(
        Array.from(selectedIds).map(id =>
          auditService.writeAudit('STATUS_CHANGE', 'blog', id, { new_status: status, bulk: true })
        )
      );
      setSelectedIds(new Set());
      fetchPosts();
    }
    setIsBulkUpdating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    } else {
      void auditService.writeAudit('DELETE', 'blog', id, { action: 'delete_post' });
      toast({ title: "Post deleted successfully" });
      fetchPosts();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`${icons.xl} animate-spin text-[hsl(var(--admin-primary))]`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]"
          />
        </div>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BlogStatus | "all")}
          className="h-10 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))]"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="published">Published</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onDelete={handleBulkDelete}
          onPublish={() => handleBulkStatusUpdate('published')}
          isDeleting={isBulkUpdating}
        />
      )}

      <div className="rounded-xl border border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-surface))]/30 backdrop-blur-md overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-[hsl(var(--admin-surface))]/50 border-b border-[hsl(var(--admin-border))]">
            <TableRow className="border-none hover:bg-transparent text-[hsl(var(--admin-muted))] uppercase text-[10px] font-bold tracking-widest">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-[hsl(var(--admin-border))]"
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
              <TableRow key={post.id} className="border-b border-[hsl(var(--admin-border))]/30 hover:bg-[hsl(var(--admin-surface))]/40">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(post.id)}
                    onCheckedChange={() => toggleSelect(post.id)}
                    className="border-[hsl(var(--admin-border))]"
                  />
                </TableCell>
                <TableCell>
                  {post.cover_image_url ? (
                    <Image 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="h-12 w-16 rounded border border-[hsl(var(--admin-border))]/50" 
                      imageClassName="object-cover"
                      width={160}
                      quality={70}
                    />
                  ) : (
                    <div className="h-12 w-16 bg-[hsl(var(--admin-surface))] rounded flex items-center justify-center border border-[hsl(var(--admin-border))]/50">
                      <ImageIcon className="w-4 h-4 text-[hsl(var(--admin-muted))]" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-[hsl(var(--admin-text))]">{post.title}</div>
                  <div className="text-xs text-[hsl(var(--admin-muted))] font-mono">/{post.slug}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={post.status as "draft" | "published" | "archived"} />
                </TableCell>
                <TableCell>
                  {post.featured ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <span className="text-[hsl(var(--admin-muted))]">-</span>
                  )}
                </TableCell>
                <TableCell className="text-[hsl(var(--admin-muted))] text-sm">
                  {post.published_at 
                    ? format(new Date(post.published_at), 'MMM d, yyyy')
                    : format(new Date(post.created_at ?? new Date()), 'MMM d, yyyy')
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(post)}
                      className="hover:bg-[hsl(var(--admin-primary))]/10 hover:text-[hsl(var(--admin-primary))]"
                    >
                      <Pencil className={`${icons.sm}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                      className="hover:bg-[hsl(var(--admin-danger))]/10 hover:text-[hsl(var(--admin-danger))]"
                    >
                      <Trash2 className={`${icons.sm} text-[hsl(var(--admin-danger))]`} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-[hsl(var(--admin-muted))]">
            No posts found. {searchQuery || statusFilter !== "all" ? "Try adjusting your filters." : "Create your first post!"}
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-4 border-t border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-surface))]/20">
            <div className="text-sm text-[hsl(var(--admin-muted))]">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredPosts.length)} to {Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-[hsl(var(--admin-border))] bg-transparent"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPosts.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredPosts.length / itemsPerPage)}
                className="border-[hsl(var(--admin-border))] bg-transparent"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
