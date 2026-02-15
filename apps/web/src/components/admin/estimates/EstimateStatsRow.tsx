import { Calculator, Flame, IndianRupee, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

interface EstimateStatsRowProps {
    totalLeads: number;
    hotLeads: number;
    avgEstimate: number;
    conversionRate: number;
    isLoading?: boolean;
}

const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
};

export function EstimateStatsRow({
    totalLeads,
    hotLeads,
    avgEstimate,
    conversionRate,
    isLoading = false,
}: EstimateStatsRowProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Estimates"
                value={isLoading ? "..." : totalLeads.toString()}
                icon={Calculator}
                gradient="from-blue-500 to-blue-600"
                bgGradient="from-blue-500/10 to-blue-500/5"
                shadowColor="shadow-blue-500/50"
                className="admin-card-hover"
            />
            <StatCard
                title="Hot Leads"
                value={isLoading ? "..." : hotLeads.toString()}
                icon={Flame}
                gradient="from-red-500 to-red-600"
                bgGradient="from-red-500/10 to-red-500/5"
                shadowColor="shadow-red-500/50"
                className="admin-card-hover"
            />
            <StatCard
                title="Avg Estimate"
                value={isLoading ? "..." : formatCurrency(avgEstimate)}
                icon={IndianRupee}
                gradient="from-green-500 to-green-600"
                bgGradient="from-green-500/10 to-green-500/5"
                shadowColor="shadow-green-500/50"
                className="admin-card-hover"
            />
            <StatCard
                title="Conversion Rate"
                value={isLoading ? "..." : `${conversionRate.toFixed(1)}%`}
                icon={TrendingUp}
                gradient="from-purple-500 to-purple-600"
                bgGradient="from-purple-500/10 to-purple-500/5"
                shadowColor="shadow-purple-500/50"
                className="admin-card-hover"
            />
        </div>
    );
}
