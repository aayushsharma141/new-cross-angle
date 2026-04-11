import { LucideIcon } from "lucide-react";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";

interface KpiData {
    title: string;
    value: string | number;
    numericValue?: number;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: LucideIcon;
    variant?: "gold" | "secondary" | "accent";
    sparklineData?: number[];
}

interface AnalyticsKpiRowProps {
    metrics: KpiData[];
    isLoading?: boolean;
}

export function AnalyticsKpiRow({ metrics, isLoading = false }: AnalyticsKpiRowProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
                <AdminKPI
                    key={index}
                    {...metric}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
}
