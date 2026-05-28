import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTabSlider } from "@/components/admin/ui/AdminTabSlider";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { leadRepo } from "@/repositories";
import { LeadPipeline } from "@/components/admin/leads/LeadPipeline";
import { LeadDetailSheet } from "@/components/admin/leads/LeadDetailSheet";
import { Button } from "@/design-system/components/Button";
import { PageSkeleton } from "@/components/ui/enhanced/PageSkeleton";
import {
  LayoutGrid,
  List as ListIcon,
  Download,
  Plus,
  Users,
  Flame,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { icons } from "@/design-system/tokens/icons";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { calculateLeadScore, getLeadTemperature, buildForecast, formatINR, Lead } from "@/lib/scoring/leadScoring";
import { validateStageAdvance, type LeadStatus } from "@/lib/validation/validations";
import { EmptyState } from "@/design-system/components/states";
import { usePermissions } from "@/hooks/usePermissions";
import { useLeadsRealtime } from "@/hooks/useLeadsRealtime";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LastUpdatedBar } from "@/components/admin/leads/LastUpdatedBar";
import { AnalyticsKpiRow } from "@/components/admin/analytics/AnalyticsKpiRow";
import { LeadListView } from "@/components/admin/leads/LeadListView";
import { LeadToolbar } from "@/components/admin/leads/LeadToolbar";
import type { LucideIcon } from "lucide-react";

const NEW_LEAD_ID = "__new__";
const EM_DASH = "\u2014";

const SOURCE_LABELS: Record<string, string> = {
  website_contact: "Website",
  estimator: "Estimator",
  style_quiz: "Aesthetic Discovery Engine",
  aesthetic_discovery_engine: "Aesthetic Discovery Engine",
  welcome_popup: "Welcome Popup",
  discovery_engine: "Aesthetic Discovery Engine",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  referral: "Referral",
  other: "Other",
};

const TYPE_LABELS: Record<string, string> = {
  interior: "Interior",
  renovation: "Renovation",
  consultation: "Consultation",
  commercial: "Commercial",
};

export default function AdminLeads() {

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [tempFilter, setTempFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { can } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canCreate = can('leads', 'create');
  const canDelete = can('leads', 'delete');

  const { lastUpdated, hasPendingUpdate, isConnected, refresh } = useLeadsRealtime();

  const { data: leads = [], isLoading, isFetching } = useQuery({
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

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      lead.email?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    const score = lead.score || 0;
    const temp = getLeadTemperature(score);
    const matchesTemp = tempFilter === "all" || temp.priority === tempFilter;

    const leadSource = lead.source || lead.lead_source || "";
    const matchesSource = sourceFilter === "all" || leadSource === sourceFilter;

    return matchesSearch && matchesStatus && matchesTemp && matchesSource;
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Lead> & { id: string }): Promise<void> => {
      const { score, created_at, updated_at, service, source_url, internal_notes, score_details, ...saveable } = patch;
      await leadRepo.updateLead(id, saveable);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Updated", description: "All changes saved successfully." });
      setIsSheetOpen(false);
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (draft: Lead): Promise<void> => {
      await leadRepo.submitLead({
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Deleted", description: "Lead removed permanently." });
      setIsSheetOpen(false);
      setDeleteTargetId(null);
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Delete Failed", description: err.message });
    },
  });

  const handleDragMove = (leadId: string, newStatus: string): void => {
    if (!can('leads', 'edit')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to edit leads.",
      });
      return;
    }
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const errors = validateStageAdvance(
      lead as unknown as Record<string, unknown>,
      newStatus as LeadStatus
    );
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: `Cannot advance to "${newStatus}"`,
        description: errors.join(" · "),
      });
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
          SOURCE_LABELS[lSource] || lSource,
          TYPE_LABELS[lType] || lType,
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

  const openNewLead = useCallback(() => {
    setSelectedLead({
      id: NEW_LEAD_ID,
      name: "",
      email: "",
      status: "new",
      created_at: new Date().toISOString(),
    });
    setIsSheetOpen(true);
  }, []);

  const forecast = buildForecast(leads);
  const pipelineValue = forecast.totalOpenValue;
  const staleCount = forecast.stale.length;
  const hotCount = leads.filter((l) => (l.score || 0) >= 70).length;

  // Operations-focused KPIs — answer "what needs attention NOW?"
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadsToday = leads.filter((l) => new Date(l.created_at) >= today).length;
  const unassigned = leads.filter((l) => !l.assigned_to && l.status !== "won" && l.status !== "lost").length;
  const wonCount = leads.filter((l) => l.status === "won").length;
  const conversionRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0;

  const kpiMetrics: Parameters<typeof AnalyticsKpiRow>[0]["metrics"] = [
    {
      title: "Leads Today",
      value: String(leadsToday),
      numericValue: leadsToday,
      icon: Users as LucideIcon,
      variant: "secondary",
      change: leadsToday > 0 ? "New inquiries" : "No new leads yet",
      trend: leadsToday > 0 ? "up" : "neutral",
    },
    {
      title: "Hot Leads",
      value: String(hotCount),
      numericValue: hotCount,
      icon: Flame as LucideIcon,
      variant: "accent",
      change: hotCount > 0 ? "Ready to close" : "None right now",
      trend: hotCount > 0 ? "up" : "neutral",
    },
    {
      title: "Unassigned",
      value: String(unassigned),
      numericValue: unassigned,
      icon: AlertTriangle as LucideIcon,
      variant: unassigned > 0 ? "accent" : "secondary",
      change: unassigned > 0 ? "Needs assignment!" : "All assigned ✓",
      trend: unassigned > 0 ? "down" : "up",
    },
    {
      title: "Stale Leads",
      value: String(staleCount),
      numericValue: staleCount,
      icon: AlertTriangle as LucideIcon,
      variant: staleCount > 0 ? "accent" : "secondary",
      change: staleCount > 0 ? "Overdue follow-up" : "All fresh ✓",
      trend: staleCount > 0 ? "down" : "up",
    },
    {
      title: "Conversion",
      value: `${conversionRate}%`,
      icon: TrendingUp as LucideIcon,
      variant: "gold",
      change: `${wonCount} of ${leads.length} won`,
      trend: conversionRate >= 20 ? "up" : conversionRate > 0 ? "neutral" : "down",
    },
    {
      title: "Pipeline Value",
      value: pipelineValue > 0 ? formatINR(pipelineValue) : EM_DASH,
      icon: TrendingUp as LucideIcon,
      variant: "gold",
    },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <ModuleActions>
        <div className="flex items-center gap-3">
          {can('leads', 'export') && (
            <Button variant="outline" onClick={handleExport}>
              <Download className={`${icons.sm} mr-2`} /> Export CSV
            </Button>
          )}
          {canCreate && (
            <Button
              variant="primary"
              className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/90] text-black font-semibold shadow-lg"
              onClick={openNewLead}
            >
              <Plus className={`${icons.sm} mr-2`} /> Add Lead
            </Button>
          )}
        </div>
      </ModuleActions>

      <AdminTabSlider
        contentClassName="overflow-hidden flex flex-col h-full !pt-4"
        header={
          <div className="space-y-4">
            <AnalyticsKpiRow metrics={kpiMetrics} isLoading={isLoading} />
            <LastUpdatedBar
              lastUpdated={lastUpdated}
              hasPendingUpdate={hasPendingUpdate}
              isConnected={isConnected}
              onRefresh={refresh}
              isRefreshing={isFetching}
            />
          </div>
        }
        tabs={[
          {
            id: "board",
            label: "Pipeline Board",
            icon: LayoutGrid,
            content: (
              <div className="flex flex-col space-y-4 h-full">
                <LeadToolbar
                  search={search} setSearch={setSearch}
                  statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                  tempFilter={tempFilter} setTempFilter={setTempFilter}
                  sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
                />
                {isLoading ? (
                  <PageSkeleton variant="admin-content" />
                ) : filteredLeads.length === 0 ? (
                  <EmptyState icon={Users} title="No leads found" description="Start capturing leads to build your sales pipeline." className="bg-surface-card border-border mt-4" />
                ) : (
                  <div className="flex-1 overflow-hidden min-h-[500px]">
                    <LeadPipeline
                      leads={filteredLeads}
                      onLeadMove={handleDragMove}
                      onLeadClick={(lead) => { setSelectedLead(lead); setIsSheetOpen(true); }}
                    />
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "list",
            label: "List View",
            icon: ListIcon,
            content: (
              <div className="flex flex-col space-y-4 h-full">
                <LeadToolbar
                  search={search} setSearch={setSearch}
                  statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                  tempFilter={tempFilter} setTempFilter={setTempFilter}
                  sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
                />
                {isLoading ? (
                  <PageSkeleton variant="admin-content" />
                ) : filteredLeads.length === 0 ? (
                  <EmptyState icon={Users} title="No leads found" description="Start capturing leads to build your sales pipeline." className="bg-surface-card border-border mt-4" />
                ) : (
                  <div className="flex-1 overflow-hidden min-h-[500px]">
                    <LeadListView
                      leads={filteredLeads}
                      onLeadClick={(lead) => { setSelectedLead(lead); setIsSheetOpen(true); }}
                      onDeleteClick={canDelete ? (id) => setDeleteTargetId(id) : undefined}
                    />
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

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
    </div>
  );
}

