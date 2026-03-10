import { useState, useMemo, useEffect, useRef, JSX } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioFormDialog } from "@/components/admin/portfolio/PortfolioFormDialog";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { EmptyState, LoadingState } from "@/design-system/components/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/components/Table";
import { Badge } from "@/components/ui/badge";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { icons } from "@/design-system/tokens/icons";
import { Loader2, Plus, Search, Pencil, Trash2, Image as ImageIcon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";
import type { Database } from "@/integrations/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Category = Database["public"]["Tables"]["project_categories"]["Row"];

export interface ProjectWithCategory extends Project {
  project_categories: { name: string } | null;
}

export default function AdminPortfolio(): JSX.Element {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const deepLinkHandled = useRef(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectWithCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Categories for Filter
  const { data: categories = [] } = useQuery({
    queryKey: ["project_categories"],
    queryFn: async (): Promise<Pick<Category, "id" | "name">[]> => {
      const { data, error } = await supabase
        .from("project_categories")
        .select("id, name")
        .order("display_order");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectWithCategory[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_categories(name)")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as ProjectWithCategory[]) || [];
    },
  });

  // Deep-link from command palette: ?edit=<slug>
  useEffect(() => {
    if (!editSlug || deepLinkHandled.current || projects.length === 0) return;
    const target = projects.find((p) => p.slug === editSlug);
    if (target) {
      deepLinkHandled.current = true;
      setEditingItem(target);
      setIsFormOpen(true);
    }
  }, [editSlug, projects]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} projects?`)) return;

    setIsBulkUpdating(true);
    const { error } = await supabase
      .from('projects')
      .delete()
      .in('id', Array.from(selectedIds));

    if (error) {
      toast({ title: "Error deleting projects", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Projects deleted", description: `Successfully deleted ${selectedIds.size} projects.` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
    setIsBulkUpdating(false);
  };

  const handleBulkStatusUpdate = async (status: 'live' | 'draft') => {
    setIsBulkUpdating(true);
    const updates = Array.from(selectedIds).map(id => ({
      id,
      status
    }));

    const { error } = await supabase
      .from('projects')
      .upsert(updates as { id: string; status: 'live' | 'draft' }[]);

    if (error) {
      toast({ title: "Error updating projects", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Projects updated", description: `Successfully marked ${selectedIds.size} projects as ${status === 'live' ? 'published' : 'draft'}.` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
    setIsBulkUpdating(false);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm) ||
        (project.client_name?.toLowerCase().includes(searchTerm) ?? false);

      const matchesCategory =
        categoryFilter === "All" || project.category_id === categoryFilter;

      const statusToCheck = statusFilter === "published" ? "live" : statusFilter;
      const matchesStatus =
        statusFilter === "all" || (project.status || "draft") === statusToCheck;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, search, categoryFilter, statusFilter]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project Deleted", description: "Project has been removed." });
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const handleEdit = (item: ProjectWithCategory): void => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCreate = (): void => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: 'Portfolio' }]} />
      <PageHeader
        title="Portfolio"
        description="Manage your project showcase."
      >
        <Button onClick={handleCreate} variant="primary">
          <Plus className={`${icons.sm} mr-2`} /> Add Project
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex flex-1 w-full gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className={`absolute left-2.5 top-2.5 ${icons.sm} text-[hsl(var(--admin-muted))]`} />
            <Input
              placeholder="Search projects..."
              className="pl-9 bg-white/5 border-white/10 text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted))]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-[hsl(var(--admin-foreground))]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-[300px]"
          >
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-[hsl(var(--admin-foreground))]">All</TabsTrigger>
              <TabsTrigger value="published" className="data-[state=active]:bg-white/10 data-[state=active]:text-[hsl(var(--admin-foreground))]">Published</TabsTrigger>
              <TabsTrigger value="draft" className="data-[state=active]:bg-white/10 data-[state=active]:text-[hsl(var(--admin-foreground))]">Drafts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Loading projects…" />
      ) : (
        <div className="rounded-md border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/10">
              <TableRow className="border-white/10 hover:bg-transparent text-[hsl(var(--admin-muted))]">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Project Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState
                      icon={ImageIcon}
                      title="No projects found"
                      description="You haven't added any projects yet, or none match your search."
                      action={
                        <Button onClick={handleCreate} variant="outline">
                          <Plus className={`${icons.sm} mr-2`} />
                          Add Project
                        </Button>
                      }
                      className="border-0 rounded-none bg-transparent"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((item) => (
                  <TableRow key={item.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="w-12 h-12 rounded overflow-hidden relative border border-white/10 bg-black/20">
                        {item.cover_image_url ? (
                          <img
                            src={item.cover_image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className={`${icons.sm} text-white/30`} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--admin-foreground))]">{item.title}</span>
                        {item.client_name && (
                          <span className="text-xs text-[hsl(var(--admin-muted))]">
                            {item.client_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-black/20 border-white/10 text-[hsl(var(--admin-foreground))]">
                        {item.project_categories?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[hsl(var(--admin-foreground))]">
                      {item.year_completed || "N/A"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status === 'live' ? 'published' : 'draft'} />
                    </TableCell>
                    <TableCell>
                      {item.featured ? (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                          <Star className={`${icons.xs} mr-1 fill-yellow-400`} /> Featured
                        </Badge>
                      ) : (
                        <span className="text-[hsl(var(--admin-muted))] text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="hover:bg-white/10 text-[hsl(var(--admin-foreground))]"
                        >
                          <Pencil className={icons.sm} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          className="hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className={icons.sm} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <PortfolioFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingItem}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          setIsFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Project?"
        description="This action cannot be undone. The project will be permanently removed from the showcase."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        variant="destructive"
        confirmText="Delete"
      />

      {isFormOpen && (
        <PortfolioFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          editingItem={editingItem}
          categories={categories}
        />
      )}

      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        label="projects"
        onClear={() => setSelectedIds(new Set())}
        onDelete={handleBulkDelete}
        onPublish={() => handleBulkStatusUpdate('live')}
        onArchive={() => handleBulkStatusUpdate('draft')}
        isUpdating={isBulkUpdating}
        isDeleting={isBulkUpdating}
      />
    </div>
  );
}
