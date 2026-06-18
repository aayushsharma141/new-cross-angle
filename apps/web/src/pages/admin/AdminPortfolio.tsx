import { useState, useMemo, useEffect, useRef, JSX } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/primitives/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectRepo } from "@/repositories";
import { PortfolioFormDialog } from "@/components/admin/portfolio/PortfolioFormDialog";
import { AdminMetricsPanel, AdminFilterBar, AdminSafeAction, AdminEmptyState, AdminSkeletonCard } from "@/components/admin/shared";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { AdminAddCard } from "@/components/admin/shared/AdminEmptyState";
import { DataLoadingBoundary } from "@/components/ui/enhanced/DataLoadingBoundary";
import { Pencil, Trash2, Image as ImageIcon, Star, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { ProjectWithCategory } from "@/repositories";
import { Image } from "@/components/ui/enhanced/image";

type ProjectFilter = "All" | "Published" | "Drafts" | "Featured";

export default function AdminPortfolio(): JSX.Element {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const deepLinkHandled = useRef(false);

  const [statusFilter, setStatusFilter] = useState<ProjectFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectWithCategory | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (project.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      
      if (statusFilter === "Published") return project.status === "live";
      if (statusFilter === "Drafts") return project.status !== "live";
      if (statusFilter === "Featured") return project.featured;
      return true; // "All"
    });
  }, [projects, statusFilter, searchQuery]);

  const activeCount = projects.filter(p => p.status === 'live').length;
  const draftCount = projects.length - activeCount;
  const featuredCount = projects.filter(p => p.featured).length;

  const metrics = [
    { label: "Total Projects", value: String(projects.length), dotColor: "info" as const },
    { label: "Published", value: String(activeCount), dotColor: "success" as const },
    { label: "Drafts", value: String(draftCount), dotColor: draftCount > 0 ? "warning" as const : "success" as const },
    { label: "Featured", value: String(featuredCount), dotColor: "accent" as const },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectRepo.deleteProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project Deleted", description: "Project has been removed." });
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
              title="Portfolio Projects"
              icon={Briefcase}
              badgeCount={activeCount > 0 ? `${activeCount} published` : undefined}
              filters={["All", "Published", "Drafts", "Featured"]}
              activeFilter={statusFilter}
              onFilterChange={(f) => setStatusFilter(f as ProjectFilter)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
          />
      </div>

      <DataLoadingBoundary 
        isLoading={isLoading} 
        loadingMessage="FETCHING PORTFOLIO..."
        subMessage="Decrypting and loading project data"
        skeleton={
          <>
            <AdminSkeletonCard size="lg" />
            <AdminSkeletonCard size="lg" />
            <AdminSkeletonCard size="lg" />
          </>
        }
      >
        <div className="flex flex-col gap-[10px]">
          {filteredProjects.length === 0 ? (
          <div className="fade-up-3 mt-4">
              <AdminEmptyState 
                  icon={ImageIcon}
                  title="No projects found"
                  description="You don't have any portfolio projects matching this filter yet."
              />
          </div>
        ) : (
          filteredProjects.map((item, i) => {
            const delayClass = `fade-up-${Math.min((i % 4) + 1, 4)}`;

            return (
              <div key={item.id} className={`${delayClass} group`}>
                <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-200 grid grid-cols-[80px_1fr_auto] gap-5 items-center">
                  
                  {/* Image */}
                  <div className="w-[80px] h-[60px] rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center shrink-0 overflow-hidden relative">
                    {item.cover_image_url ? (
                      <Image
                        src={item.cover_image_url}
                        alt={item.title}
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
                      <span className="text-[16px] font-bold text-[hsl(var(--admin-text))]">
                        {item.title}
                      </span>
                      
                      {item.featured && (
                        <span className="bg-[hsl(var(--admin-accent)/0.1)] border border-[hsl(var(--admin-accent)/0.2)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-accent))] tracking-wide uppercase flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      )}

                      {item.status === 'live' ? (
                        <span className="bg-[hsl(var(--admin-success)/0.12)] border border-[hsl(var(--admin-success)/0.25)] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-success))] tracking-wide uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-success))] shadow-[0_0_4px_hsl(var(--admin-success))]" />
                          Published
                        </span>
                      ) : (
                        <span className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-[7px] py-[1px] text-[10px] font-semibold text-[hsl(var(--admin-text-muted))] tracking-wide uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    
                    <div className="text-[13px] text-[hsl(var(--admin-text-muted))] flex gap-3 items-center mt-2">
                      {item.client_name && (
                        <span className="flex items-center">
                          Client: <strong className="ml-1 text-[hsl(var(--admin-text))]">{item.client_name}</strong>
                        </span>
                      )}
                      
                      <span className="bg-[hsl(var(--admin-surface))] px-2 py-0.5 rounded text-[11px] font-medium text-[hsl(var(--admin-text))] capitalize border border-[hsl(var(--admin-border))]">
                        {item.project_categories?.name || "Uncategorized"}
                      </span>
                      
                      {item.year_completed && (
                        <span>Year: <strong className="text-[hsl(var(--admin-text))]">{item.year_completed}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-2.5 py-2 rounded-[7px] text-[12px] font-normal bg-transparent border border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-150 flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-[13px] h-[13px]" />
                      Edit
                    </button>
                    
                    <AdminSafeAction
                      icon={Trash2}
                      label="Delete"
                      confirmLabel="Delete project?"
                      onConfirm={async () => {
                        await deleteMutation.mutateAsync(item.id);
                      }}
                      danger
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </DataLoadingBoundary>

      {!isLoading && (
          <div className="fade-up-4 mt-[10px]">
              <AdminAddCard 
                  label="Add a new project"
                  onClick={handleCreate}
              />
          </div>
      )}

      <PortfolioFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingItem}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["projects"] });
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}
