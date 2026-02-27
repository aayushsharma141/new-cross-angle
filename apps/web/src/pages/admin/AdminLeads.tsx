import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadPipeline } from "@/components/admin/leads/LeadPipeline";
import { LeadDetailSheet } from "@/components/admin/leads/LeadDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2,
  Download,
  Search,
  Plus,
  Users,
  Flame,
  Thermometer,
  Snowflake,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { calculateLeadScore, getLeadTemperature, Lead } from "@/lib/leadScoring";
import { EmptyState } from "@/components/admin/EmptyState";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  qualified: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  proposal: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  lost: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const SOURCE_LABELS: Record<string, string> = {
  website_contact: "Website",
  estimator: "Estimator",
  style_quiz: "Style Quiz",
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
  if (score >= 70) return <Flame className="w-3.5 h-3.5 text-rose-400" />;
  if (score >= 40) return <Thermometer className="w-3.5 h-3.5 text-amber-400" />;
  return <Snowflake className="w-3.5 h-3.5 text-blue-400" />;
}

export default function AdminLeads() {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const leadsWithScore = (data as unknown as Lead[]).map((lead) => ({
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
      const { error } = await supabase.from("leads").update(updates).eq("id", id);
      if (error) throw error;
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
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
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
        return [
          l.name,
          l.email,
          l.phone || "",
          l.status,
          SOURCE_LABELS[l.lead_source || ""] || l.lead_source || "",
          TYPE_LABELS[l.lead_type || ""] || l.lead_type || "",
          l.city || "",
          l.budget || "",
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
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">
            Leads CRM
          </h2>
          <p className="text-[hsl(var(--admin-muted))]">
            Manage and qualify your sales pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => { setSelectedLead(null); setIsSheetOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Mini KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: kpis.total, color: "text-admin-foreground" },
          { label: "Hot Leads", value: kpis.hot, color: "text-rose-400", icon: <Flame className="w-4 h-4 text-rose-400" /> },
          { label: "New Leads", value: kpis.new, color: "text-blue-400" },
          { label: "Won", value: kpis.won, color: "text-emerald-400" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-lg border border-admin-border bg-admin-card px-4 py-3 flex items-center justify-between"
          >
            <span className="text-xs text-admin-muted uppercase tracking-wider">{k.label}</span>
            <div className="flex items-center gap-1.5">
              {k.icon}
              <span className={cn("text-xl font-display font-bold", k.color)}>{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={view} onValueChange={(v) => setView(v as "board" | "list")}>
          <TabsList>
            <TabsTrigger value="board">
              <LayoutGrid className="mr-2 h-4 w-4" /> Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListIcon className="mr-2 h-4 w-4" /> List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start capturing leads to build your sales pipeline"
          }
          primaryAction={{ label: "Add Lead", onClick: () => setIsSheetOpen(true), icon: Plus }}
        />
      ) : (
        <div className="flex-1 overflow-hidden">
          {view === "board" ? (
            <LeadPipeline
              leads={filteredLeads}
              onLeadMove={handleDragMove}
              onLeadClick={(lead) => { setSelectedLead(lead); setIsSheetOpen(true); }}
            />
          ) : (
            <div className="rounded-xl border border-admin-border bg-admin-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-admin-border hover:bg-transparent">
                      <TableHead className="text-admin-muted font-medium">Lead</TableHead>
                      <TableHead className="text-admin-muted font-medium">Type</TableHead>
                      <TableHead className="text-admin-muted font-medium">Source</TableHead>
                      <TableHead className="text-admin-muted font-medium">City</TableHead>
                      <TableHead className="text-admin-muted font-medium">Score</TableHead>
                      <TableHead className="text-admin-muted font-medium">Status</TableHead>
                      <TableHead className="text-admin-muted font-medium">Date</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => {
                      const score = lead.score || 0;
                      const temp = getLeadTemperature(score);
                      return (
                        <TableRow
                          key={lead.id}
                          className="cursor-pointer border-admin-border hover:bg-admin-surface/50 transition-colors"
                          onClick={() => { setSelectedLead(lead); setIsSheetOpen(true); }}
                        >
                          {/* Lead name + email */}
                          <TableCell>
                            <div>
                              <p className="font-medium text-admin-foreground text-sm">{lead.name}</p>
                              <p className="text-xs text-admin-muted">{lead.email}</p>
                            </div>
                          </TableCell>

                          {/* Lead Type */}
                          <TableCell>
                            <span className="text-xs text-admin-muted">
                              {TYPE_LABELS[lead.lead_type || ""] || lead.lead_type || "—"}
                            </span>
                          </TableCell>

                          {/* Lead Source */}
                          <TableCell>
                            <span className="text-xs text-admin-muted">
                              {SOURCE_LABELS[lead.lead_source || ""] || lead.lead_source || "—"}
                            </span>
                          </TableCell>

                          {/* City */}
                          <TableCell>
                            <span className="text-xs text-admin-muted">{lead.city || "—"}</span>
                          </TableCell>

                          {/* Score with temperature */}
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <TemperatureIcon score={score} />
                              <span className="text-xs font-medium text-admin-foreground">
                                {score}
                              </span>
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium border", temp.color)}>
                                {temp.label}
                              </span>
                            </div>
                          </TableCell>

                          {/* Status badge */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn("capitalize text-xs border", STATUS_COLORS[lead.status] || "")}
                            >
                              {lead.status}
                            </Badge>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <span className="text-xs text-admin-muted">
                              {lead.created_at
                                ? format(new Date(lead.created_at), "MMM d, yyyy")
                                : "—"}
                            </span>
                          </TableCell>

                          {/* View action */}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-admin-gold hover:text-admin-gold/80 text-xs"
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
              </div>
            </div>
          )}
        </div>
      )}

      <LeadDetailSheet
        lead={selectedLead}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={(updated) => updateMutation.mutate(updated)}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}