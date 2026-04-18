import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadRepo } from "@/repositories";
import { LeadPipeline } from "@/components/admin/leads/LeadPipeline";
import { LeadDetailSheet } from "@/components/admin/leads/LeadDetailSheet";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { PageSkeleton } from "@/components/ui/enhanced/PageSkeleton";
import { Card } from "@/design-system/components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/components/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import {
  LayoutGrid,
  List as ListIcon,
  Download,
  Search,
  Plus,
  Users,
  Flame,
  Thermometer,
  Snowflake,
  TrendingUp,
  MoreHorizontal,
  Copy,
  Trash2,
  Eye,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { icons } from "@/design-system/tokens/icons";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/primitives/badge";
import { calculateLeadScore, getLeadTemperature, getLeadHealth, buildForecast, formatINR, Lead } from "@/lib/scoring/leadScoring";
import { validateStageAdvance, type LeadStatus } from "@/lib/validation/validations";
import { EmptyState, LoadingState } from "@/design-system/components/states";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLeadsRealtime } from "@/hooks/useLeadsRealtime";
import { LastUpdatedBar } from "@/components/admin/leads/LastUpdatedBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { AnalyticsKpiRow } from "@/components/admin/analytics/AnalyticsKpiRow";
import type { LucideIcon } from "lucide-react";

const NEW_LEAD_ID = "__new__";
const EM_DASH = "\u2014";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  qualified: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  proposal: "bg-primary/10 text-primary border-primary/20",
  negotiation: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  won: "bg-success/10 text-success border-success/20",
  lost: "bg-error/10 text-error border-error/20",
};

const SOURCE_LABELS: Record<string, string> = {
  website_contact: "Website",
  estimator: "Estimator",
  style_quiz: "Style Quiz",
  welcome_popup: "Welcome Popup",
  discovery_engine: "Discovery Engine",
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

/** Format a numeric INR budget value to a compact label like "₹4.5L" or "₹1.2Cr" */
function formatBudgetINR(val: number | null | undefined): string | null {
  if (!val || val <= 0) return null;
  if (val >= 10_000_000) return `\u20b9${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000) return `\u20b9${(val / 100_000).toFixed(1)}L`;
  return `\u20b9${val.toLocaleString("en-IN")}`;
}

function TemperatureIcon({ score }: { score: number }) {
  if (score >= 70) return <Flame className={`${icons.xs} text-error`} />;
  if (score >= 40) return <Thermometer className={`${icons.xs} text-primary`} />;
  return <Snowflake className={`${icons.xs} text-blue-400`} />;
}

export default function AdminLeads() {
  const [view, setView] = useState<"board" | "list">("list");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input — 300ms delay prevents re-filtering on every keystroke
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

  const { isEditor } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isReadOnly = !isEditor;

  // Hybrid realtime: subscribe to changes, expose pending-update flag
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

  // Filter Leads — search + status + temperature + source
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

  // Update Lead Mutation — saves ALL editable fields (not just status)
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Lead> & { id: string }): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Delete Lead Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string): Promise<void> => leadRepo.deleteLead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Deleted", description: "Lead removed permanently." });
      setIsSheetOpen(false);
    },
  });

  const handleDragMove = (leadId: string, newStatus: string): void => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    // Hygiene gate: validate required fields for stage advancement
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

  // KPI summary
  const forecast = buildForecast(leads);
  const pipelineValue = forecast.totalOpenValue;
  const staleCount = forecast.stale.length;
  const hotCount = leads.filter((l) => (l.score || 0) >= 70).length;
  const wonCount = leads.filter((l) => l.status === "won").length;

  const kpiMetrics: Parameters<typeof AnalyticsKpiRow>[0]["metrics"] = [
    {
      title: "Total Leads",
      value: String(leads.length),
      numericValue: leads.length,
      icon: Users as LucideIcon,
      variant: "secondary",
    },
    {
      title: "Hot Leads",
      value: String(hotCount),
      numericValue: hotCount,
      icon: Flame as LucideIcon,
      variant: "accent",
      change: `${Math.round((hotCount / Math.max(leads.length, 1)) * 100)}% of pipeline`,
      trend: hotCount > 0 ? "up" : "neutral",
    },
    {
      title: "Stale",
      value: String(staleCount),
      numericValue: staleCount,
      icon: AlertTriangle as LucideIcon,
      variant: "accent",
      change: staleCount > 0 ? "Needs follow-up" : "All fresh",
      trend: staleCount > 0 ? "down" : "up",
    },
    {
      title: "Pipeline Value",
      value: pipelineValue > 0 ? formatINR(pipelineValue) : EM_DASH,
      icon: TrendingUp as LucideIcon,
      variant: "gold",
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Action Bar + Realtime indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1">
          <LastUpdatedBar
            lastUpdated={lastUpdated}
            hasPendingUpdate={hasPendingUpdate}
            isConnected={isConnected}
            onRefresh={refresh}
            isRefreshing={isFetching}
          />
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className={`${icons.sm} mr-2`} /> Export CSV
        </Button>
        {!isReadOnly && (
          <Button variant="primary" onClick={openNewLead}>
            <Plus className={`${icons.sm} mr-2`} /> Add Lead
          </Button>
        )}
      </div>

      {/* KPI Row */}
      <AnalyticsKpiRow metrics={kpiMetrics} isLoading={isLoading} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/40 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/50 analytics-glass">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search by name or email…"
            className="pl-10 bg-black/40 border-zinc-700/50 focus:border-primary/50 transition-all rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto flex-wrap">
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-black/40 border-zinc-700/50 rounded-xl h-9 text-zinc-300 text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          {/* Temperature filter */}
          <Select value={tempFilter} onValueChange={setTempFilter}>
            <SelectTrigger className="w-[120px] bg-black/40 border-zinc-700/50 rounded-xl h-9 text-zinc-300 text-xs">
              <Thermometer className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
              <SelectValue placeholder="Heat" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Temps</SelectItem>
              <SelectItem value="hot">🔥 Hot (70+)</SelectItem>
              <SelectItem value="warm">🌡️ Warm (40+)</SelectItem>
              <SelectItem value="cold">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>

          {/* Source filter */}
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[130px] bg-black/40 border-zinc-700/50 rounded-xl h-9 text-zinc-300 text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Sources</SelectItem>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <Tabs value={view} onValueChange={(v) => setView(v as "board" | "list")} className="w-[100px]">
            <TabsList className="grid w-full grid-cols-2 h-9 bg-black/40 border-zinc-700/50 border shadow-none rounded-xl">
              <TabsTrigger value="list" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all">
                <ListIcon className={icons.sm} />
              </TabsTrigger>
              <TabsTrigger value="board" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all">
                <LayoutGrid className={icons.sm} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <PageSkeleton variant="admin-content" />
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description={
            search || statusFilter !== "all" || tempFilter !== "all" || sourceFilter !== "all"
              ? "We couldn't find any leads matching your filters."
              : "Start capturing leads to build your sales pipeline."
          }
          action={
            !isReadOnly ? (
              <Button variant="primary" onClick={openNewLead}>
                <Plus className={`${icons.sm} mr-2`} /> Add your first lead
              </Button>
            ) : null
          }
          className="bg-surface-card border-border"
        />
      ) : (
        <div className="flex-1 overflow-hidden min-h-[500px]">
          {view === "board" ? (
            <LeadPipeline
              leads={filteredLeads}
              onLeadMove={handleDragMove}
              onLeadClick={(lead) => { setSelectedLead(lead); setIsSheetOpen(true); }}
            />
          ) : (
            <Card className="overflow-hidden shadow-none border">
              <Table>
                <TableHeader className="bg-surface">
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const score = lead.score || 0;
                    const temp = getLeadTemperature(score);
                    const leadType = lead.category || lead.lead_type;
                    const leadSource = lead.source || lead.lead_source;

                    return (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer group"
                        onClick={() => { setSelectedLead(lead); setIsSheetOpen(true); }}
                      >
                        {/* Lead name + email */}
                        <TableCell>
                          <div>
                            <p className="font-semibold text-text-primary text-sm group-hover:text-primary transition-colors">{lead.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{lead.email}</p>
                          </div>
                        </TableCell>

                        {/* Lead Type */}
                        <TableCell>
                          <span className="text-sm">
                            {TYPE_LABELS[leadType || ""] || leadType || EM_DASH}
                          </span>
                        </TableCell>

                        {/* Lead Source */}
                        <TableCell>
                          <span className="text-sm">
                            {SOURCE_LABELS[leadSource || ""] || leadSource || EM_DASH}
                          </span>
                        </TableCell>

                        {/* City */}
                        <TableCell>
                          <span className="text-sm">{lead.city || EM_DASH}</span>
                        </TableCell>

                        {/* Score with temperature badge */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TemperatureIcon score={score} />
                            <span className="text-sm font-semibold tabular-nums">{score}</span>
                            <Badge
                              variant="outline"
                              className={cn("text-[10px] uppercase font-bold", temp.color, "bg-transparent")}
                            >
                              {temp.label}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Status badge */}
                        <TableCell>
                          <Badge
                            className={cn(
                              "capitalize px-2.5 py-1 text-[11px] font-semibold",
                              STATUS_COLORS[lead.status] || "bg-surface-muted text-text-primary border-border"
                            )}
                            variant="secondary"
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-sm text-text-muted">
                          {lead.created_at
                            ? format(new Date(lead.created_at), "MMM d, yyyy")
                            : EM_DASH}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setIsSheetOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {lead.email ? (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(lead.email ?? "");
                                  }}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Copy Email
                                </DropdownMenuItem>
                              ) : null}
                              {lead.phone ? (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(lead.phone ?? "");
                                  }}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Copy Phone
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-400 focus:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(lead.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      <LeadDetailSheet
        lead={selectedLead}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={(updated) => {
          if (updated.id === NEW_LEAD_ID) {
            createMutation.mutate(updated);
            return;
          }
          updateMutation.mutate(updated);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
        isReadOnly={isReadOnly}
        allLeads={leads}
        onViewLead={(matchedLead) => {
          // Close current sheet, then open the matched lead
          setIsSheetOpen(false);
          setTimeout(() => {
            setSelectedLead(matchedLead);
            setIsSheetOpen(true);
          }, 150);
        }}
      />
    </div>
  );
}
