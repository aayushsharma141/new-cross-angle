import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Loader2, Users } from 'lucide-react';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { icons } from '@/design-system/tokens/icons';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type EstimateLead = Database['public']['Tables']['estimate_leads']['Row'];

export default function AdminEstimateLeads() {
    const { data, isLoading, error } = useQuery<EstimateLead[]>({
        queryKey: ['estimate-leads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('estimate_leads')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as EstimateLead[];
        },
    });

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
            <AdminBreadcrumb items={[{ label: 'Estimate' }, { label: 'Leads' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif text-white tracking-tight">Estimate Leads</h1>
                    <p className="text-sm text-zinc-500 font-sans max-w-sm">Leads generated via computational cost estimation modules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-zinc-400">
                        <Users className={icons.sm} />
                        <span className="text-xs font-bold uppercase tracking-widest">{data?.length || 0} Records</span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="overflow-x-auto relative z-10">
                    <Table>
                        <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                            <TableRow className="border-zinc-800 hover:bg-transparent text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Name</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Email</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Phone</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Project Type</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Area (sqft)</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Quality Tier</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Min Estimate</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Max Estimate</TableHead>
                                <TableHead className="py-4 px-4 whitespace-nowrap text-zinc-500">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                                        No leads found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.map((lead) => (
                                    <TableRow key={lead.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                        <TableCell className="py-3 px-4 font-medium text-slate-200">{lead.name}</TableCell>
                                        <TableCell className="py-3 px-4">{lead.email}</TableCell>
                                        <TableCell className="py-3 px-4">{lead.phone}</TableCell>
                                        <TableCell className="py-3 px-4 capitalize">{lead.property_type?.replace('_', ' ')}</TableCell>
                                        <TableCell className="py-3 px-4">{lead.area}</TableCell>
                                        <TableCell className="py-3 px-4 capitalize">{lead.budget}</TableCell>
                                        <TableCell className="py-3 px-4 text-emerald-400 font-medium">
                                            {lead.estimate_total_min ? `₹${lead.estimate_total_min.toLocaleString('en-IN')}` : '-'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-emerald-400 font-medium">
                                            {lead.estimate_total_max ? `₹${lead.estimate_total_max.toLocaleString('en-IN')}` : '-'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${lead.status === 'new' ? 'bg-primary/20 text-primary border border-primary/30' :
                                                lead.status === 'contacted' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
                                                    'bg-zinc-900/50 text-zinc-500 border border-zinc-800'
                                                }`}>
                                                {lead.status || 'New'}
                                            </span>
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
