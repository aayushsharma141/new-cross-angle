import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import {
  Loader2, Users, Trash2, MoreVertical, Search, Download, Filter,
  TrendingUp, Target, Calculator, Phone, Mail, Eye, X, ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/primitives/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { useToast } from '@/hooks/useToast';
import { BulkActionsToolbar } from '@/components/admin/BulkActionsToolbar';
import { ModuleActions } from '@/components/admin/layout/ModuleLayout';
import { AdminPageHeader, AdminMetricsPanel, type AdminMetric } from '@/components/admin/shared';
import { auditService } from '@/services/AuditService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

type Lead = Database['public']['Tables']['leads']['Row'];
type EstimateLeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

const STATUS_COLORS: Record<string, string> = {
  new: 'hsl(43, 74%, 49%)',
  contacted: 'hsl(200, 70%, 50%)',
  qualified: 'hsl(280, 60%, 55%)',
  won: 'hsl(150, 60%, 45%)',
  lost: 'hsl(0, 60%, 50%)',
};

const formatINR = (val: number | null) =>
  val ? `₹${val.toLocaleString('en-IN')}` : '—';

export default function AdminEstimateLeads() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'created_at' | 'estimated_min' | 'lead_score'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  const { data, isLoading, error } = useQuery<Lead[]>({
    queryKey: ['estimate-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('lead_source', 'estimator')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  // Filtered + sorted data
  const filteredData = useMemo(() => {
    let result = data || [];
    if (statusFilter !== 'all') result = result.filter((l) => l.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.phone || '').includes(q));
    }
    result = [...result].sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      if (sortDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    return result;
  }, [data, statusFilter, searchQuery, sortField, sortDir]);

  // Analytics
  const analytics = useMemo(() => {
    const all = data || [];
    const totalPipeline = all.reduce((s, l) => s + (l.estimated_min || 0), 0);
    const avgEstimate = all.length > 0 ? Math.round(totalPipeline / all.length) : 0;
    const wonCount = all.filter((l) => l.status === 'won').length;
    const convRate = all.length > 0 ? Math.round((wonCount / all.length) * 100) : 0;
    const statusCounts = all.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    return { total: all.length, totalPipeline, avgEstimate, convRate, wonCount, statusCounts };
  }, [data]);

  const statusChartData = Object.entries(analytics.statusCounts).map(([name, value]) => ({
    name, value, color: STATUS_COLORS[name] || 'hsl(0,0%,50%)',
  }));

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EstimateLeadStatus }) => {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { id, status }) => {
      queryClient.invalidateQueries({ queryKey: ['estimate-leads'] });
      void auditService.writeAudit('STATUS_CHANGE', 'estimate', id, { new_status: status });
      toast({ title: "Status updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['estimate-leads'] });
      void auditService.writeAudit('DELETE', 'estimate', id, {});
      toast({ title: "Lead deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} leads?`)) return;
    await Promise.all(Array.from(selectedIds).map((id) => supabase.from('leads').delete().eq('id', id)));
    queryClient.invalidateQueries({ queryKey: ['estimate-leads'] });
    setSelectedIds(new Set());
    toast({ title: `${selectedIds.size} leads deleted` });
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Property', 'Area', 'Budget', 'Min Estimate', 'Max Estimate', 'Status', 'Date']];
    for (const l of filteredData) {
      rows.push([l.name, l.email, l.phone || '', l.property_type || '', String(l.area || ''), l.budget || '', String(l.estimated_min || ''), String(l.estimated_max || ''), l.status, l.created_at ? format(new Date(l.created_at), 'yyyy-MM-dd') : '']);
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `estimator-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--admin-primary))]" /></div>;
  if (error) return <div className="text-center py-20 text-[hsl(var(--admin-danger))]">Error: {(error as Error).message}</div>;


  return (
    <div className="flex flex-col space-y-6">
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

      <AdminPageHeader moduleName="Estimator" tabName="Leads" />

      <div className="fade-up-1">
        <AdminMetricsPanel metrics={[
          { label: "Total Leads", value: analytics.total.toString(), dotColor: "accent" },
          { label: "Pipeline Value", value: `₹${(analytics.totalPipeline / 100000).toFixed(1)}L`, dotColor: "info" },
          { label: "Avg Estimate", value: formatINR(analytics.avgEstimate), dotColor: "success" },
          { label: "Conversion", value: `${analytics.convRate}% (${analytics.wonCount} won)`, dotColor: "warning" },
        ]} />
      </div>

      <div className="fade-up-2 flex flex-col gap-6">
        <ModuleActions>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] border-[hsl(var(--admin-border))] h-9">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </ModuleActions>

      {/* Status Distribution Mini Chart */}
      {statusChartData.length > 0 && (
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mb-3">Pipeline Status</h3>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={statusChartData} layout="vertical" barSize={16}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--admin-text-muted))', fontSize: 10 }} width={70} />
              <Tooltip contentStyle={{ background: 'hsl(var(--admin-card))', border: '1px solid hsl(var(--admin-border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {statusChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--admin-text-muted))]" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:border-[hsl(var(--admin-primary))]/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          title="Filter by status"
          aria-label="Filter by status"
          className="px-3 py-2 text-xs rounded-xl bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <span className="text-xs text-[hsl(var(--admin-text-muted))]">{filteredData.length} results</span>
      </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <BulkActionsToolbar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())} onDelete={handleBulkDelete} />
        )}
      </div>

      <div className="fade-up-3">

      {/* Table */}
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--admin-border))]/50 hover:bg-transparent">
                <TableHead className="w-10 py-3 px-4">
                  <input type="checkbox" title="Select all leads" aria-label="Select all leads" checked={selectedIds.size === filteredData.length && filteredData.length > 0} onChange={() => { if (selectedIds.size === filteredData.length) { setSelectedIds(new Set()); } else { setSelectedIds(new Set(filteredData.map((d) => d.id))); } }} className="rounded" />
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Name</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Contact</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Property</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] cursor-pointer" onClick={() => toggleSort('estimated_min')}>
                  <span className="flex items-center gap-1">Estimate <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] cursor-pointer" onClick={() => toggleSort('lead_score')}>
                  <span className="flex items-center gap-1">Score <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Status</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] cursor-pointer" onClick={() => toggleSort('created_at')}>
                  <span className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-[hsl(var(--admin-text-muted))]">No leads found</TableCell></TableRow>
              ) : filteredData.map((lead) => (
                <TableRow key={lead.id} className="border-[hsl(var(--admin-border))]/30 hover:bg-[hsl(var(--admin-primary))]/5 transition-colors cursor-pointer" onClick={() => setDetailLead(lead)}>
                  <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" title={`Select ${lead.name}`} aria-label={`Select ${lead.name}`} checked={selectedIds.has(lead.id)} onChange={() => { const n = new Set(selectedIds); if (n.has(lead.id)) { n.delete(lead.id); } else { n.add(lead.id); } setSelectedIds(n); }} className="rounded" />
                  </TableCell>
                  <TableCell className="py-3 px-4 font-medium text-[hsl(var(--admin-text))]">{lead.name}</TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="text-xs text-[hsl(var(--admin-text-muted))]">{lead.email}</div>
                    <div className="text-xs text-[hsl(var(--admin-text-muted))]">{lead.phone || '—'}</div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="text-xs text-[hsl(var(--admin-text))] capitalize">{lead.property_type?.replace('_', ' ') || '—'}</div>
                    <div className="text-[10px] text-[hsl(var(--admin-text-muted))]">{lead.area ? `${lead.area} sqft` : ''} {lead.budget ? `• ${lead.budget}` : ''}</div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="text-sm font-bold text-[hsl(var(--admin-success))]">{formatINR(lead.estimated_min)}</div>
                    <div className="text-[10px] text-[hsl(var(--admin-text-muted))]">to {formatINR(lead.estimated_max)}</div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className={cn("text-xs font-bold tabular-nums", (lead.lead_score || 0) >= 70 ? "text-[hsl(var(--admin-success))]" : (lead.lead_score || 0) >= 40 ? "text-[hsl(var(--admin-primary))]" : "text-[hsl(var(--admin-text-muted))]")}>
                      {lead.lead_score || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select value={lead.status} title={`Status for ${lead.name}`} aria-label={`Status for ${lead.name}`} onChange={(e) => updateStatusMutation.mutate({ id: lead.id, status: e.target.value as EstimateLeadStatus })} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border-0 cursor-pointer" style={{ background: `${STATUS_COLORS[lead.status]}20`, color: STATUS_COLORS[lead.status] }}>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[11px] text-[hsl(var(--admin-text-muted))]">{lead.created_at ? format(new Date(lead.created_at), 'MMM d, yy') : '—'}</TableCell>
                  <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailLead(lead)}>View Details</DropdownMenuItem>
                        {lead.phone && <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}>Call</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)}>Email</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(lead.id); }} className="text-red-400">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>


      {/* Detail Panel */}
      {detailLead && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailLead(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[hsl(var(--admin-background))] border-l border-[hsl(var(--admin-border))] overflow-y-auto animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[hsl(var(--admin-background))] border-b border-[hsl(var(--admin-border))] p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-[hsl(var(--admin-text))]">Lead Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setDetailLead(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--admin-text))]">{detailLead.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  {detailLead.phone && <a href={`tel:${detailLead.phone}`} className="flex items-center gap-1 text-xs text-[hsl(var(--admin-primary))] hover:underline"><Phone className="w-3 h-3" />{detailLead.phone}</a>}
                  <a href={`mailto:${detailLead.email}`} className="flex items-center gap-1 text-xs text-[hsl(var(--admin-primary))] hover:underline"><Mail className="w-3 h-3" />{detailLead.email}</a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Status" value={detailLead.status} />
                <DetailField label="Lead Score" value={detailLead.lead_score?.toString() || '—'} />
                <DetailField label="Property Type" value={detailLead.property_type?.replace('_', ' ') || '—'} />
                <DetailField label="Area" value={detailLead.area ? `${detailLead.area} sqft` : '—'} />
                <DetailField label="Budget Tier" value={detailLead.budget || '—'} />
                <DetailField label="City" value={detailLead.city || '—'} />
                <DetailField label="Project Type" value={detailLead.project_type || '—'} />
                <DetailField label="Start Timing" value={(detailLead as Record<string, unknown>).start_timing as string || '—'} />
              </div>

              <div className="rounded-xl bg-[hsl(var(--admin-success))]/5 border border-[hsl(var(--admin-success))]/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-success))] mb-2">Estimate Range</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[hsl(var(--admin-success))]">{formatINR(detailLead.estimated_min)}</span>
                  <span className="text-xs text-[hsl(var(--admin-text-muted))]">to</span>
                  <span className="text-xl font-bold text-[hsl(var(--admin-success))]">{formatINR(detailLead.estimated_max)}</span>
                </div>
              </div>

              {detailLead.message && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-2">Message</p>
                  <p className="text-sm text-[hsl(var(--admin-text))] leading-relaxed">{detailLead.message}</p>
                </div>
              )}

              <div className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                Created: {detailLead.created_at ? format(new Date(detailLead.created_at), 'PPpp') : '—'}
              </div>

              <div className="flex gap-2 pt-4 border-t border-[hsl(var(--admin-border))]">
                {detailLead.phone && <Button size="sm" variant="outline" onClick={() => window.open(`tel:${detailLead.phone}`)} className="gap-1"><Phone className="w-3 h-3" />Call</Button>}
                <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${detailLead.email}`)} className="gap-1"><Mail className="w-3 h-3" />Email</Button>
                <Button size="sm" variant="outline" onClick={() => { if (confirm('Delete?')) { deleteMutation.mutate(detailLead.id); setDetailLead(null); } }} className="gap-1 text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" />Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

        </div>
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">{label}</p>
      <p className="text-sm text-[hsl(var(--admin-text))] capitalize mt-0.5">{value}</p>
    </div>
  );
}
