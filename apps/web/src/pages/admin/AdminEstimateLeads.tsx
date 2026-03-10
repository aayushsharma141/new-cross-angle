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
        <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-20">
            <AdminBreadcrumb items={[{ label: 'Estimate Leads' }]} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))] flex items-center gap-3">
                        <Users className={`${icons.xl} text-primary`} />
                        Estimate Leads
                    </h2>
                    <p className="text-[hsl(var(--admin-muted))] mt-1">
                        View and manage leads generated from the cost estimator.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="overflow-x-auto relative z-10">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/10 bg-black/20 text-slate-300 hover:bg-black/20">
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Name</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Email</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Phone</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Project Type</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Area (sqft)</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Quality Tier</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Min Estimate</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Max Estimate</TableHead>
                                <TableHead className="text-left font-medium py-4 px-4 whitespace-nowrap">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-white/5">
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === 'new' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                lead.status === 'contacted' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                    'bg-slate-500/20 text-slate-300 border border-slate-500/30'
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
