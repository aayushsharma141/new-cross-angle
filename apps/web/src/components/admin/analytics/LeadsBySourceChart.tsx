
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#D4AF37", "#C5A028", "#E6C255", "#F2D57E", "#B08D1E"]; // Gold variants

export function LeadsBySourceChart() {
    const { data: chartData = [] } = useQuery({
        queryKey: ["leads-by-source"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("leads")
                .select("lead_source");

            if (error) throw error;

            // Aggregating data
            const counts: Record<string, number> = {};
            data.forEach((lead) => {
                const source = lead.lead_source || "Direct/Unknown";
                counts[source] = (counts[source] || 0) + 1;
            });

            return Object.entries(counts).map(([name, value]) => ({ name, value }));
        }
    });

    return (
        <Card className="col-span-1 border-admin-border bg-admin-card shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Leads by Source</CardTitle>
                <p className="text-sm text-admin-muted">Where are your clients coming from?</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--admin-card))",
                                    borderColor: "hsl(var(--admin-border))",
                                    color: "hsl(var(--admin-foreground))"
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
