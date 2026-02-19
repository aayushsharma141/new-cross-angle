
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#8b5cf6", "#ec4899"]; // Distinct colors for services

export function ProjectsByServiceChart() {
    const { data: chartData = [] } = useQuery({
        queryKey: ["projects-by-service"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("service_tag");

            if (error) throw error;

            // Aggregating data
            const counts: Record<string, number> = {};
            data.forEach((project) => {
                const tag = project.service_tag || "General";
                counts[tag] = (counts[tag] || 0) + 1;
            });

            return Object.entries(counts).map(([name, value]) => ({ name, value }));
        }
    });

    return (
        <Card className="col-span-1 border-admin-border bg-admin-card shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Projects by Service</CardTitle>
                <p className="text-sm text-admin-muted">Distribution of projects across categories</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
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
