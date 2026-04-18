import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Loader2, Users, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { icons } from '@/design-system/tokens/icons';
import { Button } from '@/components/ui/primitives/button';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/primitives/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { useToast } from '@/hooks/useToast';
import { BulkActionsToolbar } from '@/components/admin/BulkActionsToolbar';
import { ModuleHeader } from '@/components/admin/layout/ModuleHeader';

// Estimate leads are now a filtered view of the unified `leads` table
type Lead = Database['public']['Tables']['leads']['Row'];
type EstimateLeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export default function AdminEstimateLeads() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: EstimateLeadStatus }) => {
            const { data, error } = await supabase
                .from('leads')
                .update({ status })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estimate-leads'] });
            toast({ title: "Status updated successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estimate-leads'] });
            toast({ title: "Lead deleted successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error deleting lead", description: error.message, variant: "destructive" });
        },
    });

    const handleStatusChange = (id: string, status: EstimateLeadStatus) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            deleteMutation.mutate(id);
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === (data?.length || 0)) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(data?.map(d => d.id) || []));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} leads?`)) return;

        const idsToDelete = Array.from(selectedIds);
        const results = await Promise.allSettled(
            idsToDelete.map(id => supabase.from('leads').delete().eq('id', id))
        );

        const failed = results.filter(
            (r): r is PromiseFulfilledResult<{ error: { message: string } }> =>
                r.status === 'fulfilled' && r.value.error != null
        );
        const errored = results.filter(r => r.status === 'rejected');
        const totalFailed = failed.length + errored.length;
        const succeeded = idsToDelete.length - totalFailed;

        queryClient.invalidateQueries({ queryKey: ['estimate-leads'] });

        if (totalFailed === 0) {
            setSelectedIds(new Set());
            toast({ title: `${succeeded} lead${succeeded !== 1 ? 's' : ''} deleted` });
        } else {
            // Clear only the ids that were successfully deleted
            const failedIds = new Set(
                idsToDelete.filter((_, i) => {
                    const r = results[i];
                    return r.status === 'rejected' || (r.status === 'fulfilled' && (r.value as { error: unknown }).error != null);
                })
            );
            setSelectedIds(failedIds);
            const messages = [
                ...failed.map(r => r.value.error.message),
                ...errored.map(r => r.status === 'rejected' ? String((r as PromiseRejectedResult).reason) : ''),
            ].filter(Boolean).slice(0, 3).join('; ');
            toast({
                title: `${succeeded} deleted, ${totalFailed} failed`,
                description: messages || 'Some leads could not be deleted. Check permissions.',
                variant: 'destructive',
            });
        }
    };

    const getStatusBadgeClass = (status: string | null) => {
        switch (status) {
            case 'new': 
                return 'bg-primary/20 text-primary border border-primary/30';
            case 'contacted': 
                return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
            case 'qualified':
                return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'won':
                return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            case 'lost':
                return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default:
                return 'bg-zinc-900/50 text-zinc-500 border border-zinc-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className={`${icons.xl} animate-spin text-primary`} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <p className="text-red-400 font-medium">Error loading leads data</p>
                <p className="text-slate-500 text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
            <ModuleHeader
                title="Estimate Leads"
                description="Leads generated via computational cost estimation modules."
                action={
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-zinc-400">
                        <Users className={icons.sm} />
                        <span className="text-xs font-bold uppercase tracking-widest">{data?.length || 0} Records</span>
                    </div>
                }
            />

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <BulkActionsToolbar
                    selectedCount={selectedIds.size}
                    onClear={() => setSelectedIds(new Set())}
                    onDelete={handleBulkDelete}
                />
            )}

            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="overflow-x-auto relative z-10">
                    <Table>
                        <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                            <TableRow className="border-zinc-800 hover:bg-transparent text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                                <TableHead className="py-4 px-4 w-[40px]">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all leads"
                                        checked={selectedIds.size === (data?.length || 0) && (data?.length || 0) > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-zinc-700"
                                    />
                                </TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Name</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Email</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Phone</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Project Type</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Area (sqft)</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Quality Tier</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Min Estimate</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Max Estimate</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Status</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500 w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                                        No leads found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.map((lead) => (
                                    <TableRow key={lead.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                        <TableCell className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                aria-label={`Select lead ${lead.name ?? lead.id}`}
                                                checked={selectedIds.has(lead.id)}
                                                onChange={() => toggleSelect(lead.id)}
                                                className="rounded border-zinc-700"
                                            />
                                        </TableCell>
                                        <TableCell className="py-3 px-4 font-medium text-slate-200">{lead.name}</TableCell>
                                        <TableCell className="py-3 px-4">{lead.email}</TableCell>
                                        <TableCell className="py-3 px-4">{lead.phone}</TableCell>
                                        <TableCell className="py-3 px-4 capitalize">{lead.property_type?.replace('_', ' ') ?? '-'}</TableCell>
                                        <TableCell className="py-3 px-4">{lead.area ?? '-'}</TableCell>
                                        <TableCell className="py-3 px-4 capitalize">{lead.budget}</TableCell>
                                        <TableCell className="py-3 px-4 text-emerald-400 font-medium">
                                            {lead.estimated_min ? `₹${lead.estimated_min.toLocaleString('en-IN')}` : '-'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-emerald-400 font-medium">
                                            {lead.estimated_max ? `₹${lead.estimated_max.toLocaleString('en-IN')}` : '-'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <select
                                                aria-label={`Status for ${lead.name ?? lead.id}`}
                                                value={lead.status || 'new'}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value as EstimateLeadStatus)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border-0 ${getStatusBadgeClass(lead.status)}`}
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="won">Won</option>
                                                <option value="lost">Lost</option>
                                            </select>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem 
                                                        onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                                                    >
                                                        Call
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => window.open(`mailto:${lead.email}`, '_self')}
                                                    >
                                                        Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(lead.id)}
                                                        className="text-red-400"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
