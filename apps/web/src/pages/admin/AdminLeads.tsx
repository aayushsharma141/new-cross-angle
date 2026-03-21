import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadRepo } from "@/repositories";
import { LeadPipeline } from "@/components/admin/leads/LeadPipeline";
import { LeadDetailSheet } from "@/components/admin/leads/LeadDetailSheet";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/layout/PageHeader";
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
} from "@/components/ui/select";
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
} from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { icons } from "@/design-system/tokens/icons";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { calculateLeadScore, getLeadTemperature, Lead } from "@/lib/leadScoring";
import { EmptyState, LoadingState } from "@/design-system/components/states";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  qualified: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  proposal: "bg-primary/10 text-primary border-primary/20",
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

function TemperatureIcon({ score }: { score: number }) {
  if (score >= 70) return <Flame className={`${icons.xs} text-error`} />;
  if (score >= 40) return <Thermometer className={`${icons.xs} text-primary`} />;
  return <Snowflake className={`${icons.xs} text-blue-400`} />;
}

export default function AdminLeads() {
  const [view, setView] = useState<"board" | "list">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { isViewer } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update Lead Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }): Promise<void> => {
      await leadRepo.updateLeadStatus(id, updates.status ?? "");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Updated", description: "Changes saved successfully." });
      setIsSheetOpen(false);
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
    updateMutation.mutate({ id: leadId, status: newStatus });
  };

  const handleExport = (): void => {
    const csvContent = [
      ["Name", "Email", "Phone", "Status", "Source", "Type", "City", "Budget", "Score", "Date"],
      ...leads.map((l) => {
        const temp = getLeadTemperature(l.score || 0);
        const lSource = l.source || l.lead_source || "";
        const lType = l.category || l.lead_type || "";
        const lBudget = l.budget || (l as any).budget_range || "";

        return [
          l.name,
          l.email,
          l.phone || "",
          l.status,
          SOURCE_LABELS[lSource] || lSource,
          TYPE_LABELS[lType] || lType,
          l.city || "",
          lBudget,
          `${l.score || 0} (${temp.label})`,
          format(new Date(l.created_at || ""), "yyyy-MM-dd"),
        ];
      }),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // KPI summary
  const kpis = {
    total: leads.length,
    hot: leads.filter((l) => (l.score || 0) >= 70).length,
    won: leads.filter((l) => l.status === "won").length,
    new: leads.filter((l) => l.status === "new").length,
  };

  return (
    <div className="h-full flex flex-col pt-2 space-y-6">
      {/* Actions */}
      <div className="flex justify-end gap-3 w-full">
        <Button variant="outline" onClick={handleExport}>
          <Download className={`${icons.sm} mr-2`} /> Export CSV
        </Button>
        {!isViewer && (
          <Button variant="primary" onClick={() => { setSelectedLead(null); setIsSheetOpen(true); }}>
            <Plus className={`${icons.sm} mr-2`} /> Add Lead
          </Button>
        )}
      </div>

      {/* Mini KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: kpis.total, color: "text-zinc-100" },
          { label: "Hot Leads", value: kpis.hot, color: "text-red-500", icon: <Flame className={`${icons.sm} text-red-500`} /> },
          { label: "New Leads", value: kpis.new, color: "text-blue-400" },
          { label: "Won", value: kpis.won, color: "text-emerald-500" },
        ].map((k) => (
          <Card
            key={k.label}
            className="px-4 py-4 flex items-center justify-between shadow-none bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md"
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{k.label}</span>
            <div className="flex items-center gap-1.5">
              {k.icon}
              <span className={cn("text-2xl font-serif font-bold", k.color)}>{k.value}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/50">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search leads..."
            className="pl-10 bg-black/40 border-zinc-700/50 focus:border-primary/50 transition-all rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-black/40 border-zinc-700/50 rounded-xl h-10 text-zinc-300">
              <Users className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(v) => setView(v as "board" | "list")} className="w-[140px]">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-black/40 border-zinc-700/50 border shadow-none rounded-xl">
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
        <LoadingState text="Loading leads..." className="py-20 bg-surface-card rounded-xl border border-border" />
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description={
            search || statusFilter !== "all"
              ? "We couldn't find any leads matching your criteria."
              : "Start capturing leads to build your sales pipeline."
          }
          action={
            !isViewer ? (
              <Button variant="primary" onClick={() => setIsSheetOpen(true)}>
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
                            {TYPE_LABELS[leadType || ""] || leadType || "—"}
                          </span>
                        </TableCell>

                        {/* Lead Source */}
                        <TableCell>
                          <span className="text-sm">
                            {SOURCE_LABELS[leadSource || ""] || leadSource || "—"}
                          </span>
                        </TableCell>

                        {/* City */}
                        <TableCell>
                          <span className="text-sm">{lead.city || "—"}</span>
                        </TableCell>

                        {/* Score with temperature */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TemperatureIcon score={score} />
                            <span className="text-sm font-semibold">
                              {score}
                            </span>
                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", temp.color, "bg-transparent")}>
                              {temp.label}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Status badge */}
                        <TableCell>
                          <Badge
                            className={cn("capitalize px-2.5 py-1 text-[11px] font-semibold", STATUS_COLORS[lead.status] || "bg-surface-muted text-text-primary border-border")}
                            variant="secondary"
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-sm text-text-muted">
                          {lead.created_at
                            ? format(new Date(lead.created_at), "MMM d, yyyy")
                            : "—"}
                        </TableCell>

                        {/* View action */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                              setIsSheetOpen(true);
                            }}
                          >
                            View
                          </Button>
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
        onSave={(updated) => updateMutation.mutate(updated)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isReadOnly={isViewer}
      />
    </div>
  );
}