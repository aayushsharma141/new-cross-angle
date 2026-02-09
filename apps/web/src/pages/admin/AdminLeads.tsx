import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadPipeline } from "@/components/admin/leads/LeadPipeline";
import { LeadDetailSheet } from "@/components/admin/leads/LeadDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List as ListIcon, Loader2, Download, Search, Plus, Users } from "lucide-react";
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
import { calculateLeadScore, Lead } from "@/lib/leadScoring";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AdminLeads() {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const leadsWithScore = (data as unknown as Lead[]).map(lead => ({
        ...lead,
        score: lead.score ?? calculateLeadScore(lead)
      }));

      return leadsWithScore.sort((a, b) => (b.score || 0) - (a.score || 0));
    },
  });

  // Filter Leads
  const filteredLeads = leads.filter((lead) =>
    lead.name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Update Lead Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("leads").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Updated", description: "Changes saved successfully." });
      setIsSheetOpen(false);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // Delete Lead Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Deleted", description: "Lead removed permanently." });
      setIsSheetOpen(false);
    },
  });

  const handleDragMove = (leadId: string, newStatus: string) => {
    // Optimistic update could go here, but for now we'll just trigger mutation
    updateMutation.mutate({ id: leadId, status: newStatus });
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Service", "Status", "Date"],
      ...leads.map((l) => [l.name, l.email, l.phone, l.service, l.status, l.created_at])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Leads</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">Leads CRM</h2>
          <p className="text-[hsl(var(--admin-muted))]">Manage your sales pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as "board" | "list")}>
          <TabsList>
            <TabsTrigger value="board"><LayoutGrid className="mr-2 h-4 w-4" /> Board</TabsTrigger>
            <TabsTrigger value="list"><ListIcon className="mr-2 h-4 w-4" /> List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description={search ? "Try adjusting your search criteria" : "Start capturing leads to build your sales pipeline"}
          primaryAction={{
            label: "Add Lead",
            onClick: () => setIsSheetOpen(true),
            icon: Plus
          }}
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
            <div className="border rounded-md bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedLead(lead); setIsSheetOpen(true); }}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{lead.status}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(lead.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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