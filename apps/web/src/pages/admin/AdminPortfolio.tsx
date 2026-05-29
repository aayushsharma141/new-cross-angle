import { useState, useMemo, useEffect, useRef, JSX } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectRepo } from "@/repositories";
import { PortfolioFormDialog } from "@/components/admin/portfolio/PortfolioFormDialog";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { EmptyState, LoadingState } from "@/design-system/components/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/components/Table";
import { Badge } from "@/components/ui/primitives/badge";
import { icons } from "@/design-system/tokens/icons";
import { Loader2, Plus, Search, Pencil, Trash2, Image as ImageIcon, Star } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { BulkActionsToolbar } from "@/components/admin/BulkActionsToolbar";
import type { ProjectWithCategory } from "@/repositories";
import { getOptimizedUrl } from "@/lib/cdn";
import { Image } from "@/components/ui/enhanced/image";

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
    queryFn: () => projectRepo.getCategories(),
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectRepo.getProjects(),
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
    try {
      await Promise.all(Array.from(selectedIds).map((id) => projectRepo.deleteProject(id)));
      toast({ title: "Projects deleted", description: `Successfully deleted ${selectedIds.size} projects.` });
      setSelectedIds(new Set());
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      toast({ title: "Error deleting projects", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkStatusUpdate = async (status: 'live' | 'draft') => {
    setIsBulkUpdating(true);
    try {
      await projectRepo.bulkUpdateStatus(Array.from(selectedIds), status);
      toast({ title: "Projects updated", description: `Successfully marked ${selectedIds.size} projects as ${status === 'live' ? 'published' : 'draft'}.` });
      setSelectedIds(new Set());
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      toast({ title: "Error updating projects", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsBulkUpdating(false);
    }
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
    mutationFn: (id: string) => projectRepo.deleteProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
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
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
      <ModuleActions>
        <Button onClick={handleCreate} variant="primary" className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className={`${icons.sm} mr-2`} /> Add Project
        </Button>
      </ModuleActions>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-4 rounded-2xl">
        <div className="flex flex-1 w-full gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search projects..."
              className="pl-10 bg-black/40 border-zinc-700/50 focus:border-primary/50 transition-all rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-black/40 border-zinc-700/50 rounded-xl h-10 text-zinc-300">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
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
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-zinc-700/50 rounded-xl p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all">All</TabsTrigger>
              <TabsTrigger value="published" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all">Published</TabsTrigger>
              <TabsTrigger value="draft" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all">Drafts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Loading projects…" />
      ) : (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
              <TableRow className="border-zinc-800 hover:bg-transparent text-zinc-500">
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
                  <TableRow key={item.id} className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                        className="border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:text-white rounded-md transition-all"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="w-12 h-12 rounded overflow-hidden relative border border-zinc-800 bg-black/40">
                        {item.cover_image_url ? (
                          <Image
                            src={item.cover_image_url}
                            alt={item.title}
                            width={160}
                            quality={72}
                            imageClassName="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className={`${icons.sm} text-zinc-700`} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-200 tracking-tight">{item.title}</span>
                        {item.client_name && (
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                            {item.client_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-zinc-800/50 border-zinc-700 text-zinc-400 font-bold text-[10px]">
                        {item.project_categories?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300 font-medium">
                      {item.year_completed || "N/A"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status === 'live' ? 'published' : 'draft'} />
                    </TableCell>
                    <TableCell>
                      {item.featured ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-widest">
                          <Star className={`${icons.xs} mr-1.5 fill-primary`} /> Featured
                        </Badge>
                      ) : (
                        <span className="text-zinc-700 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="hover:bg-primary/10 text-zinc-400 hover:text-primary transition-colors"
                        >
                          <Pencil className={icons.sm} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          className="hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-colors"
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
