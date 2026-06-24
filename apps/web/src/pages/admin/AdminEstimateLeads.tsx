import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import {
  Loader2, Trash2, MoreVertical, Search, Download,
  Target, Phone, Mail, X, ArrowUpDown, Brain, Sparkles, FileText, Printer, Copy
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
import { AdminPageHeader, AdminMetricsPanel } from '@/components/admin/shared';
import { auditService } from '@/services/AuditService';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { generateDesignerBrief } from '@/addons/calculators/components/data/engines/brief-generator';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'created_at' | 'estimated_min' | 'lead_score'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [showBrief, setShowBrief] = useState(false);

  const briefData = useMemo(() => {
    if (!detailLead) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return generateDesignerBrief(detailLead as any);
  }, [detailLead]);

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

  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['estimator-funnel'],
    queryFn: async () => {
      const fromIso = subDays(new Date(), 30).toISOString();
      const toIso = new Date().toISOString();
      const res = await supabase.functions.invoke("posthog-query", {
        body: { action: "funnel-estimator", from: fromIso, to: toIso }
      });
      if (res.error) throw res.error;
      const labels: Record<string, string> = {
        calculator_started: 'Started',
        calculator_step_1: 'Property Details',
        calculator_step_2: 'Condition',
        calculator_step_3: 'Services',
        calculator_step_4: 'Review',
        calculator_complete: 'Completed'
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawData = (res.data || []).map((d: any) => ({
        step: labels[d.step] || d.step,
        count: d.count,
        rawStep: d.step
      }));
      const sortOrder = ['Started', 'Property Details', 'Condition', 'Services', 'Review', 'Completed'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rawData.sort((a: any, b: any) => {
        let iA = sortOrder.indexOf(a.step);
        let iB = sortOrder.indexOf(b.step);
        if (iA === -1) iA = 99;
        if (iB === -1) iB = 99;
        return iA - iB;
      });
    }
  });

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

      {/* PostHog Funnel */}
      {funnelData && funnelData.length > 0 && (
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest flex items-center gap-2"><Target className="w-3.5 h-3.5"/>Estimator Funnel (30d)</h3>
            {funnelLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[hsl(var(--admin-text-muted))]" />}
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData}>
                <defs>
                  <linearGradient id="funnelColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--admin-primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--admin-primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--admin-border))" />
                <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--admin-text-muted))', fontSize: 10 }} dy={10} />
                <Tooltip contentStyle={{ background: 'hsl(var(--admin-card))', border: '1px solid hsl(var(--admin-border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--admin-primary))" strokeWidth={2} fillOpacity={1} fill="url(#funnelColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
                  <TableCell className="py-3 px-4 font-medium text-[hsl(var(--admin-text))]"
                  >
                    <div>{lead.name}</div>
                    {(lead as Record<string, unknown>).discovery_archetype && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Brain className="w-2.5 h-2.5 text-[hsl(var(--admin-primary))]/60" />
                        <span className="text-[9px] font-semibold text-[hsl(var(--admin-primary))]/60 uppercase tracking-wider">
                          {(lead as Record<string, unknown>).discovery_archetype as string}
                        </span>
                      </div>
                    )}
                  </TableCell>
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
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" role="button" tabIndex={0} aria-label="Close details" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDetailLead(null); }} onClick={() => setDetailLead(null)} />
          <div className="relative w-full max-w-md bg-[hsl(var(--admin-background))] border-l border-[hsl(var(--admin-border))] overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-[hsl(var(--admin-background))] border-b border-[hsl(var(--admin-border))] p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-[hsl(var(--admin-text))]">Lead Details</h2>
              <div className="flex items-center gap-2">
                {(detailLead as Record<string, unknown>).discovery_archetype && (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/leads/${detailLead.id}/workspace`)} className="gap-1.5 h-8 text-xs border-[hsl(var(--admin-primary))]/30 text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/10">
                    <Sparkles className="w-3.5 h-3.5" /> Open Project Intelligence &rarr;
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setDetailLead(null)}><X className="w-4 h-4" /></Button>
              </div>
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

              {/* Discovery Intelligence Panel */}
              {(detailLead as Record<string, unknown>).discovery_archetype && (
                <div className="rounded-xl bg-[hsl(var(--admin-primary))]/5 border border-[hsl(var(--admin-primary))]/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-primary))] flex items-center gap-1.5">
                      <Brain className="w-3 h-3" /> Aesthetic Profile
                    </p>
                    {(detailLead as Record<string, unknown>).discovery_confidence && (
                      <span className="text-[10px] font-bold text-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success))]/10 px-2 py-0.5 rounded-full">
                        {Math.round(((detailLead as Record<string, unknown>).discovery_confidence as number) * 100)}% match
                      </span>
                    )}
                  </div>

                  {/* Archetype + Emotional Goal */}
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--admin-text))]">
                      {(detailLead as Record<string, unknown>).discovery_archetype as string}
                    </p>
                    {(detailLead as Record<string, unknown>).discovery_emotional_goal && (
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5 italic">
                        &ldquo;{(detailLead as Record<string, unknown>).discovery_emotional_goal as string}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Lifestyle */}
                  {(detailLead as Record<string, unknown>).discovery_lifestyle && (() => {
                    const ls = (detailLead as Record<string, unknown>).discovery_lifestyle as Record<string, unknown>;
                    const chips = [
                      ls.familyType,
                      ls.members ? `${ls.members} members` : null,
                      ls.hostingFreq ? `Hosts ${String(ls.hostingFreq).toLowerCase()}` : null,
                      ls.cookingRole === 'Daily Ritual' ? 'Daily cooking' : null,
                      ls.workFromHome ? 'WFH' : null,
                      ls.children ? `${ls.children} child${Number(ls.children) > 1 ? 'ren' : ''}` : null,
                    ].filter(Boolean) as string[];
                    return chips.length > 0 ? (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-1">Lifestyle</p>
                        <div className="flex flex-wrap gap-1">
                          {chips.map((c, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))] border border-[hsl(var(--admin-border))]">{c}</span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Room Priorities */}
                  {(detailLead as Record<string, unknown>).discovery_priorities && (() => {
                    const p = (detailLead as Record<string, unknown>).discovery_priorities as Record<string, unknown>;
                    const must = Array.isArray(p.mustHave) ? (p.mustHave as string[]).slice(0, 4) : [];
                    return must.length > 0 ? (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-1">Must-Have Rooms</p>
                        <div className="flex flex-wrap gap-1">
                          {must.map((r, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))]/20 font-semibold">{r}</span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Sensory */}
                  {(detailLead as Record<string, unknown>).discovery_sensory && (() => {
                    const s = (detailLead as Record<string, unknown>).discovery_sensory as Record<string, unknown>;
                    const items = [
                      s.lighting ? `Lighting: ${s.lighting}` : null,
                      s.luxuryResolvedAs ? `Luxury: ${String(s.luxuryResolvedAs).replace(/_/g, ' ')}` : null,
                      Array.isArray(s.textures) && (s.textures as string[]).length > 0
                        ? `Textures: ${(s.textures as string[]).slice(0, 2).join(', ')}` : null,
                    ].filter(Boolean) as string[];
                    return items.length > 0 ? (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-1 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Sensory Profile
                        </p>
                        <div className="space-y-0.5">
                          {items.map((item, i) => (
                            <p key={i} className="text-[10px] text-[hsl(var(--admin-text))]">{item}</p>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* ALCS Recommendation Explainability */}
              {(detailLead as Record<string, unknown>).alcs_execution_path && (
                <div className="rounded-xl bg-[hsl(var(--admin-success))]/5 border border-[hsl(var(--admin-success))]/20 p-4 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-success))] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> AI Recommendation
                    </p>
                    {(detailLead as Record<string, unknown>).alcs_confidence && (
                      <span className="text-[10px] font-bold text-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success))]/10 px-2 py-0.5 rounded-full">
                        {Math.round(((detailLead as Record<string, unknown>).alcs_confidence as number) * 100)}% Confidence
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--admin-text))] capitalize">
                      {String((detailLead as Record<string, unknown>).alcs_execution_path).replace(/_/g, ' ')}
                    </p>
                    {(detailLead as Record<string, unknown>).alcs_reasoning && (
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1 leading-relaxed">
                        {(detailLead as Record<string, unknown>).alcs_reasoning as string}
                      </p>
                    )}
                  </div>

                  {(detailLead as Record<string, unknown>).alcs_evidence && (
                    <div className="pt-2 border-t border-[hsl(var(--admin-success))]/10">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-2">Why this recommendation?</p>
                      <div className="space-y-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {((detailLead as Record<string, unknown>).alcs_evidence as any[]).map((ev, i) => (
                          <div key={i} className="flex gap-2 items-start bg-[hsl(var(--admin-surface))]/50 p-2 rounded-lg border border-[hsl(var(--admin-border))]/50">
                            <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5",
                                ev.scoreImpact > 0 ? "bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))]" : "bg-[hsl(var(--admin-danger))]/10 text-[hsl(var(--admin-danger))]"
                            )}>
                              {ev.scoreImpact > 0 ? '+' : ''}{ev.scoreImpact}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-[hsl(var(--admin-text))]">{ev.signal}</p>
                              <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-0.5 leading-tight">{ev.rationale}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

      {/* Designer Brief Modal */}
      {showBrief && briefData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" role="button" tabIndex={0} title="Close brief" aria-label="Close brief" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowBrief(false); }} onClick={() => setShowBrief(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[hsl(var(--admin-background))] rounded-xl border border-[hsl(var(--admin-border))] shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-[hsl(var(--admin-background))] border-b border-[hsl(var(--admin-border))] p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--admin-text))] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[hsl(var(--admin-primary))]" />
                  Designer Brief: {briefData.identity.name}
                </h2>
                <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1 capitalize">
                  {briefData.identity.archetype.replace(/_/g, ' ')} • {briefData.identity.propertyType} • {briefData.identity.confidence}% Match
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => {
                  const text = `DESIGNER BRIEF: ${briefData.identity.name}\n\nSTRATEGY: ${briefData.strategy.recommendedPath.replace(/_/g, ' ')}\n${briefData.strategy.conversationStarters.join('\n')}\n\nWATCH OUTS:\n${briefData.strategy.watchOuts.map(w => '- ' + w).join('\n')}`;
                  navigator.clipboard.writeText(text);
                  toast({ title: "Copied to clipboard" });
                }}>
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5" /> Print
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowBrief(false)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
            
            <div className="p-6 space-y-8" id="printable-brief">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-3 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[hsl(var(--admin-primary))]" /> Strategy
                  </h3>
                  <div className="bg-[hsl(var(--admin-surface))]/50 p-4 rounded-lg border border-[hsl(var(--admin-border))]/50 h-full">
                    <p className="text-sm font-bold text-[hsl(var(--admin-text))] capitalize mb-3 border-b border-[hsl(var(--admin-border))] pb-2">
                      Path: {briefData.strategy.recommendedPath.replace(/_/g, ' ')}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] mb-1 uppercase tracking-wider">Conversation Starters</p>
                        <ul className="text-xs text-[hsl(var(--admin-text))] space-y-1.5">
                          {briefData.strategy.conversationStarters.map((s, i) => (
                            <li key={i} className="italic text-muted-foreground">{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[hsl(var(--admin-danger))] mb-1 uppercase tracking-wider">Watch Outs</p>
                        <ul className="text-xs text-[hsl(var(--admin-text))] space-y-1 list-disc pl-3">
                          {briefData.strategy.watchOuts.map((w, i) => (
                            <li key={i} className="text-muted-foreground">{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[hsl(var(--admin-primary))]" /> Sensory Preferences
                  </h3>
                  <div className="bg-[hsl(var(--admin-surface))]/50 p-4 rounded-lg border border-[hsl(var(--admin-border))]/50 h-full space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Lighting</p>
                      <p className="text-xs font-medium text-[hsl(var(--admin-text))]">{briefData.sensory.lighting}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Textures</p>
                      <p className="text-xs font-medium text-[hsl(var(--admin-text))]">{briefData.sensory.textures}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Luxury Mode</p>
                      <p className="text-xs font-medium text-[hsl(var(--admin-text))]">{briefData.sensory.luxuryMode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-3 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-[hsl(var(--admin-primary))]" /> Lifestyle Context
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-[hsl(var(--admin-surface))]/50 p-4 rounded-lg border border-[hsl(var(--admin-border))]/50">
                  <div>
                    <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-2">Key Drivers</p>
                    <ul className="text-xs text-[hsl(var(--admin-text))] space-y-1 list-disc pl-3">
                      {briefData.lifestyle.summary.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-2">Priority Spaces</p>
                    {briefData.lifestyle.priorityRooms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {briefData.lifestyle.priorityRooms.map((r, i) => (
                          <span key={i} className="text-[10px] font-medium bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] px-2 py-0.5 rounded-full capitalize">
                            {r.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] italic">Not specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
