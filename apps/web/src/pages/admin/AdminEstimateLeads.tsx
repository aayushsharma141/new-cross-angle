import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminEstimateLeads() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['estimate-leads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('estimate_leads')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading data.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Estimate Leads</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 pr-4">Name</th>
                            <th className="text-left py-2 pr-4">Email</th>
                            <th className="text-left py-2 pr-4">Phone</th>
                            <th className="text-left py-2 pr-4">Project Type</th>
                            <th className="text-left py-2 pr-4">Area (sqft)</th>
                            <th className="text-left py-2 pr-4">Quality Tier</th>
                            <th className="text-left py-2 pr-4">Min Estimate</th>
                            <th className="text-left py-2 pr-4">Max Estimate</th>
                            <th className="text-left py-2 pr-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data?.map((lead: any) => (
                            <tr key={lead.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 pr-4">{lead.name}</td>
                                <td className="py-2 pr-4">{lead.email}</td>
                                <td className="py-2 pr-4">{lead.phone}</td>
                                <td className="py-2 pr-4">{lead.project_type}</td>
                                <td className="py-2 pr-4">{lead.property_size}</td>
                                <td className="py-2 pr-4">{lead.quality_tier}</td>
                                <td className="py-2 pr-4">₹{lead.estimate_total_min?.toLocaleString('en-IN')}</td>
                                <td className="py-2 pr-4">₹{lead.estimate_total_max?.toLocaleString('en-IN')}</td>
                                <td className="py-2 pr-4">{lead.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
