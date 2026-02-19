
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

export function LeadsByCityList() {
    const { data: cityData = [] } = useQuery({
        queryKey: ["leads-by-city"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("leads")
                .select("city");

            if (error) throw error;

            // Aggregating data
            const counts: Record<string, number> = {};
            data.forEach((lead) => {
                const city = lead.city || "Unknown";
                counts[city] = (counts[city] || 0) + 1;
            });

            return Object.entries(counts)
                .map(([city, count]) => ({ city, count }))
                .sort((a, b) => b.count - a.count); // Sort by count desc
        }
    });

    return (
        <Card className="col-span-1 border-admin-border bg-admin-card shadow-sm h-full">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Leads by City</CardTitle>
                <p className="text-sm text-admin-muted">Geographic distribution of inquiries</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {cityData.length === 0 ? (
                        <p className="text-sm text-admin-muted">No location data available.</p>
                    ) : (
                        cityData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-admin-surface/50 p-2 rounded-full">
                                        <MapPin className="w-4 h-4 text-admin-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-admin-foreground">{item.city}</span>
                                </div>
                                <span className="text-sm font-bold text-admin-primary">{item.count}</span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
