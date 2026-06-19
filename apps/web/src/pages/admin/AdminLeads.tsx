import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadRepo } from "@/repositories";
import { supabase } from "@/integrations/supabase/client";
import { LeadGridView } from "@/components/admin/leads/LeadGridView";
import { LeadDetailSheet } from "@/components/admin/leads/LeadDetailSheet";
import { LeadListView } from "@/components/admin/leads/LeadListView";
import { PageSkeleton } from "@/components/ui/enhanced/PageSkeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { calculateLeadScore, getLeadTemperature, buildForecast, formatINR, type Lead } from "@/lib/scoring/leadScoring";
import { validateStageAdvance, type LeadStatus } from "@/lib/validation/validations";
import { EmptyState } from "@/design-system/components/states";
import { useSearchParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import {
  CRM_STAGES,
  CRM_SOURCES,
  CRM_SAVED_VIEWS,
  CRM_SORTS,
  CRM_SORT_LABELS,
  CRM_KPIS,
  isCrmStageId,
  isCrmSavedViewId,
  isCrmSortMode,
  getCrmSort,
  getCrmSourceLabel,
  getCrmLeadTypeLabel,
  type CrmStageId,
  type CrmSavedViewId,
  type CrmSortMode,
} from "@/lib/crm";
import {
  Search,
  Grid,
  List as ListIcon,
  Download,
  Plus,
  Users,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Loader2,
} from "lucide-react";

const NEW_LEAD_ID = "__new__";

export default function AdminLeads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  
  const [search, setSearch] = useState(qParam);
  const [debouncedSearch, setDebouncedSearch] = useState(qParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setParam("q", search);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, setParam]);

  const isSearching = search !== debouncedSearch;

  const [activeView, setActiveView] = useState<"card" | "list">("list");
  
  // Read status filter from URL Search Params so the CrmModule sidebar can control it
  const stageParam = searchParams.get("stage");
  const statusFilter: CrmStageId | "all" = stageParam && isCrmStageId(stageParam) ? stageParam : "all";
  const viewParam = searchParams.get("view");
  const viewFilter: CrmSavedViewId = viewParam && isCrmSavedViewId(viewParam) ? viewParam : "all";
  const sourceFilter = searchParams.get("source") || "all";
  const sortParam = searchParams.get("sort");
  const sortMode: CrmSortMode = sortParam && isCrmSortMode(sortParam) ? sortParam : "score_desc";

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { can } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canCreate = can('leads', 'create');
  const canDelete = can('leads', 'delete');



  const setViewFilter = useCallback((view: CrmSavedViewId) => {
    const next = new URLSearchParams(searchParams);
    next.delete("stage");
    if (view === "all") {
      next.delete("view");
    } else {
      next.set("view", view);
    }
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      const raw = await leadRepo.getLeads();
      const leadsWithScore = (raw as unknown as Lead[]).map((lead) => ({
        ...lead,
        score: lead.score ?? calculateLeadScore(lead),
      }));
      return leadsWithScore.sort((a, b) => (b.score || 0) - (a.score || 0));
    },
  });

  const now = new Date();
  const activeSavedView = CRM_SAVED_VIEWS.find((v) => v.id === viewFilter);
  const sortComparator = getCrmSort(sortMode).comparator;

  const filteredLeads = leads
    .filter((lead) => {
      const leadSource = lead.source || lead.lead_source || "";

      const matchesSearch =
        lead.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "all" || leadSource === sourceFilter;
      const matchesView = !activeSavedView || activeSavedView.predicate(lead, now);

      return matchesSearch && matchesStatus && matchesSource && matchesView;
    })
    .sort(sortComparator);

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Lead> & { id: string }): Promise<void> => {
      const { score, created_at, updated_at, service, source_url, internal_notes, score_details, ...saveable } = patch;
      await leadRepo.updateLead(id, saveable);
    },
    onMutate: async (newLead) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousLeads = queryClient.getQueryData(["leads"]);
      queryClient.setQueryData(["leads"], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map((lead) => 
          lead.id === newLead.id ? { ...lead, ...newLead } : lead
        );
      });
      return { previousLeads };
    },
    onError: (err: Error, newLead, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(["leads"], context.previousLeads);
      }
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onSuccess: () => {
      toast({ title: "Lead Updated", description: "All changes saved successfully." });
      setIsSheetOpen(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (draft: Lead): Promise<void> => {
      const newLead = await leadRepo.createLead({
        name: draft.name,
        email: draft.email ?? "",
        phone: draft.phone,
        message: draft.message,
        source: draft.source,
        category: draft.category,
        city: draft.city,
        budget: draft.budget,
        notes: draft.notes,
        lead_source: draft.lead_source,
        lead_type: draft.lead_type,
        scope: draft.scope,
        timeline: draft.timeline,
      });

      await supabase.from("lead_activities").insert({
        lead_id: newLead.id,
        activity_type: "lead_created",
        description: "Lead created by admin",
        metadata: { source: "admin_panel" }
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Created", description: "The new lead has been added to your pipeline." });
      setIsSheetOpen(false);
      setSelectedLead(null);
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string): Promise<void> => leadRepo.deleteLead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousLeads = queryClient.getQueryData(["leads"]);
      queryClient.setQueryData(["leads"], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.filter((lead) => lead.id !== id);
      });
      return { previousLeads };
    },
    onError: (err: Error, id, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(["leads"], context.previousLeads);
      }
      toast({ variant: "destructive", title: "Delete Failed", description: err.message });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onSuccess: () => {
      toast({ title: "Lead Deleted", description: "Lead removed permanently." });
      setIsSheetOpen(false);
      setDeleteTargetId(null);
    },
  });

  const handleDragMove = (leadId: string, newStatus: string): void => {
    if (!can('leads', 'edit')) {
      toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to edit leads." });
      return;
    }
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const errors = validateStageAdvance(lead as unknown as Record<string, unknown>, newStatus as LeadStatus);
    if (errors.length > 0) {
      toast({ variant: "destructive", title: `Cannot advance to "${newStatus}"`, description: errors.join(" Â· ") });
      return;
    }

    updateMutation.mutate({ id: leadId, status: newStatus });
  };

  const handleExport = (): void => {
    const csvContent = [
      ["Name", "Email", "Phone", "Status", "Source", "Type", "City", "Budget", "Score", "Temperature", "Date"],
      ...leads.map((l) => {
        const temp = getLeadTemperature(l.score || 0);
        const lSource = l.source || l.lead_source || "";
        const lType = l.category || l.lead_type || "";
        return [
          l.name,
          l.email,
          l.phone || "",
          l.status,
          getCrmSourceLabel(lSource),
          getCrmLeadTypeLabel(lType),
          l.city || "",
          l.budget || "",
          `${l.score || 0}`,
          temp.label,
          format(new Date(l.created_at || ""), "yyyy-MM-dd"),
        ];
      }),
    ]
      .map((e) => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const openNewLead = useCallback((initialStatus: CrmStageId = "new") => {
    setSelectedLead({
      id: NEW_LEAD_ID,
      name: "",
      email: "",
      status: initialStatus,
      source: "admin_panel",
      created_at: new Date().toISOString(),
    });
    setIsSheetOpen(true);
  }, []);

  const forecast = buildForecast(leads);

  const activeFilterCount = [
    statusFilter !== "all",
    viewFilter !== "all",
    sourceFilter !== "all",
  ].filter(Boolean).length;

  const chipSavedViews = CRM_SAVED_VIEWS.filter((v) => v.showInChips);

  return (
    <>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 lg:px-8 py-5 shrink-0 gap-4">
        <div>
          <h1 className="text-xl font-bold text-admin-text mb-1">Leads</h1>
          <p className="text-[13px] text-admin-text-muted">All your leads from every source, in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          {can('leads', 'export') && (
            <button onClick={handleExport} className="h-9 px-3.5 rounded-md border border-admin-border text-[13px] font-medium text-admin-text-muted hover:bg-admin-surface hover:text-admin-text transition-colors flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Download for Excel
            </button>
          )}
          {canCreate && (
            <button onClick={() => openNewLead()} className="h-9 px-4 rounded-md bg-admin-primary hover:bg-admin-primary-hover text-black text-[13px] font-bold shadow-[0_2px_10px_hsl(var(--admin-primary)/0.3)] transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add lead
            </button>
          )}
        </div>
      </header>

      {/* KPIs */}
      <div className="px-6 lg:px-8 mb-6 shrink-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {CRM_KPIS.map((kpi) => {
          const result = kpi.compute(leads, { now });
          const Icon = kpi.icon;
          const hintToneClass =
            result.hintTone === "good"
              ? "text-admin-success"
              : result.hintTone === "warn"
                ? "text-admin-warning"
                : "text-admin-text-subtle";
          return (
            <div
              key={kpi.id}
              className="bg-admin-surface border border-admin-border rounded-lg p-4 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-admin-text-muted flex items-center gap-1">
                  {kpi.label}
                </span>
                <div className={`w-6 h-6 rounded ${kpi.iconTileClass} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-serif text-admin-text">
                  {result.value}
                  {result.suffix ? (
                    <span className="text-lg text-admin-text-subtle">{result.suffix}</span>
                  ) : null}
                </span>
                <span className={`text-[11px] font-medium flex items-center gap-0.5 ${hintToneClass}`}>
                  {result.hintTone === "good" ? <TrendingUp className="w-3 h-3" /> : null}
                  {result.hint}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Row Toolbar */}
      <div className="px-6 lg:px-8 mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Search and View Toggle */}
        <div className="flex items-center gap-4 flex-1">
          {/* View Toggle */}
          <div className="flex items-center p-0.5 bg-admin-surface border border-admin-border rounded-lg shrink-0">
            <button 
              type="button"
              onClick={() => setActiveView("list")}
              data-state={activeView === "list" ? "active" : "inactive"}
              className={`flex items-center gap-2 px-3 h-8 rounded-md text-[13px] font-medium transition-colors ${activeView === 'list' ? 'bg-admin-surface-hover text-admin-text shadow' : 'text-admin-text-muted hover:text-admin-text'}`}
            >
              <ListIcon className="w-4 h-4" /> List
            </button>
            <button 
              type="button"
              onClick={() => setActiveView("card")}
              data-state={activeView === "card" ? "active" : "inactive"}
              className={`flex items-center gap-2 px-3 h-8 rounded-md text-[13px] font-medium transition-colors ${activeView === 'card' ? 'bg-admin-surface-hover text-admin-text shadow' : 'text-admin-text-muted hover:text-admin-text'}`}
            >
              <Grid className="w-4 h-4" /> Cards
            </button>
          </div>
          
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-subtle" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 bg-admin-surface border border-admin-border rounded-lg pl-9 pr-9 text-[13px] text-admin-text placeholder:text-admin-text-subtle focus:outline-none focus:border-admin-border-subtle focus:ring-1 focus:ring-[hsl(var(--admin-primary)/0.3)] transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-primary animate-spin" />
            )}
          </div>
        </div>
        
        {/* Right Side: Filters/Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 rounded-lg border border-admin-border text-[13px] text-admin-text-muted font-medium hover:bg-admin-surface hover:text-admin-text transition-colors flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Filters
                {activeFilterCount > 0 ? (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-admin-primary text-black text-[10px] grid place-items-center">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="admin-theme w-56 bg-admin-bg border-admin-border text-admin-text">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-admin-text-subtle">Source</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setParam("source", "all")} className={sourceFilter === "all" ? "bg-admin-surface" : ""}>
                All sources
              </DropdownMenuItem>
              {CRM_SOURCES.map((src) => (
                <DropdownMenuItem
                  key={src.id}
                  onClick={() => setParam("source", src.id)}
                  className={sourceFilter === src.id ? "bg-admin-surface" : ""}
                >
                  {src.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 rounded-lg border border-admin-border text-[13px] text-admin-text-muted font-medium hover:bg-admin-surface hover:text-admin-text transition-colors flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5" /> {CRM_SORT_LABELS[sortMode]}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-admin-bg border-admin-border text-admin-text">
              {CRM_SORTS.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => setParam("sort", s.id)}
                  className={sortMode === s.id ? "bg-admin-surface" : ""}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(activeFilterCount > 0 || debouncedSearch) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchParams(new URLSearchParams());
              }}
              className="ml-2 h-9 px-3 rounded-lg text-[12px] font-medium border border-dashed border-admin-border-subtle text-admin-text-subtle hover:border-admin-text-muted hover:text-admin-text-muted transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* List/Card Content */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {isLoading ? (
          <div className="p-6 h-full">
            <PageSkeleton variant="admin-content" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-6 h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-admin-surface border border-admin-border-subtle flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-admin-text-subtle" />
            </div>
            <h3 className="text-lg font-bold text-admin-text mb-2">No leads found in this view</h3>
            <p className="text-admin-text-muted text-[13px] max-w-sm mb-6">
              {(activeFilterCount > 0 || debouncedSearch) 
                ? "Your current filter combination didn't return any results. This can happen if you are in a specific stage with no active leads." 
                : "You don't have any leads yet. Once you capture leads, they will appear here."}
            </p>
            {(activeFilterCount > 0 || debouncedSearch) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchParams(new URLSearchParams());
                }}
                className="h-9 px-5 rounded-md bg-admin-primary hover:bg-[hsl(var(--admin-primary)/0.9)] text-black text-[13px] font-bold shadow-md transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : activeView === "card" ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-8 pb-4">
            <LeadGridView
              leads={filteredLeads}
              onLeadClick={(lead) => { setSelectedLead(lead); setIsSheetOpen(true); }}
              onDeleteClick={canDelete ? (id) => setDeleteTargetId(id) : undefined}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar px-6 lg:px-8 pb-4">
            <LeadListView
              leads={filteredLeads}
              onLeadClick={(lead) => { setSelectedLead(lead); setIsSheetOpen(true); }}
              onDeleteClick={canDelete ? (id) => setDeleteTargetId(id) : undefined}
            />
          </div>
        )}
      </div>

      <LeadDetailSheet
        lead={selectedLead}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={(updated) => {
          if (updated.id === NEW_LEAD_ID) {
            if (!canCreate) {
              toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to create leads." });
              return;
            }
            createMutation.mutate(updated);
            return;
          }
          if (!can('leads', 'edit')) {
            toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to edit leads." });
            return;
          }
          updateMutation.mutate(updated);
        }}
        onDelete={canDelete ? (id) => setDeleteTargetId(id) : undefined}
        isReadOnly={!can('leads', 'edit')}
        allLeads={leads}
        onViewLead={(matchedLead) => {
          setIsSheetOpen(false);
          setTimeout(() => { setSelectedLead(matchedLead); setIsSheetOpen(true); }, 150);
        }}
      />

      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        title="Delete Lead"
        description="This will permanently delete this lead and all associated data. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={async () => { if (deleteTargetId) deleteMutation.mutate(deleteTargetId); }}
      />
    </>
  );
}

// trigger HMR
