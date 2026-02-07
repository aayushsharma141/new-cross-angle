import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Loader2,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  StickyNote,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { leadStatusOptions, type LeadStatus } from "@/lib/validations";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  service: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", color: "bg-blue-500", icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-500", icon: Phone },
  qualified: { label: "Qualified", color: "bg-green-500", icon: UserCheck },
  closed: { label: "Closed", color: "bg-primary", icon: CheckCircle },
  lost: { label: "Lost", color: "bg-gray-500", icon: XCircle },
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching leads",
        description: error.message,
        variant: "destructive",
      });
    }

    if (data) setLeads(data as Lead[]);
    setIsLoading(false);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.phone && lead.phone.includes(searchQuery));

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: leads.length };
    leadStatusOptions.forEach(status => {
      counts[status] = leads.filter(l => l.status === status).length;
    });
    return counts;
  }, [leads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Status updated" });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadToDelete.id);

    if (error) {
      toast({
        title: "Error deleting lead",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Lead deleted" });
      setLeads(prev => prev.filter(l => l.id !== leadToDelete.id));
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;

    const { error } = await supabase
      .from('leads')
      .update({ notes: editNotes, updated_at: new Date().toISOString() })
      .eq('id', selectedLead.id);

    if (error) {
      toast({
        title: "Error saving notes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Notes saved" });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes: editNotes } : l));
      setNotesDialogOpen(false);
    }
  };

  const openNotesDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || "");
    setNotesDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage your inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {leads.length} total leads
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-2">
            All <Badge variant="secondary">{statusCounts.all}</Badge>
          </TabsTrigger>
          {leadStatusOptions.map(status => {
            const config = statusConfig[status];
            return (
              <TabsTrigger key={status} value={status} className="gap-2">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                {config.label}
                <Badge variant="secondary">{statusCounts[status]}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead, i) => {
          const statusInfo = statusConfig[lead.status] || statusConfig.new;
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Lead Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg truncate">{lead.name}</h3>
                        <Badge className={`${statusInfo.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        {lead.service && (
                          <Badge variant="outline">{lead.service}</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Mail size={14} />
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <Phone size={14} />
                            {lead.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(lead.created_at), 'MMM dd, yyyy - h:mm a')}
                        </span>
                      </div>

                      {lead.message && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {lead.message}
                        </p>
                      )}

                      {lead.notes && (
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                          <p className="text-xs text-primary mb-1 flex items-center gap-1">
                            <StickyNote size={12} />
                            Notes
                          </p>
                          <p className="text-sm text-muted-foreground">{lead.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Select
                        value={lead.status}
                        onValueChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {leadStatusOptions.map(status => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${statusConfig[status].color}`} />
                                {statusConfig[status].label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openNotesDialog(lead)}>
                            <StickyNote className="mr-2 h-4 w-4" />
                            {lead.notes ? "Edit Notes" : "Add Notes"}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${lead.email}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </a>
                          </DropdownMenuItem>
                          {lead.phone && (
                            <DropdownMenuItem asChild>
                              <a href={`tel:${lead.phone}`}>
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setLeadToDelete(lead);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "No leads match your filters."
                : "No leads yet. Share your contact form to start receiving inquiries!"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Lead"
        description={`Are you sure you want to delete the lead from "${leadToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLead?.notes ? "Edit Notes" : "Add Notes"} - {selectedLead?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;