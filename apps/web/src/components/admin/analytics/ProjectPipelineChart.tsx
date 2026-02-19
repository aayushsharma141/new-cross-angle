
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mock data as fallback
const mockData = [
    { name: "Concept", value: 4, color: "hsl(var(--admin-foreground))" },
    { name: "Schematic", value: 3, color: "hsl(var(--brand-primary))" },
    { name: "Design Dev", value: 5, color: "hsl(var(--brand-secondary))" },
    { name: "Docs", value: 2, color: "hsl(var(--admin-muted))" },
    { name: "Construction", value: 6, color: "hsl(var(--brand-primary))" },
];

export function ProjectPipelineChart() {
    // In a real scenario, we would aggregate this from the 'projects' table
    const { data: chartData = mockData } = useQuery({
        queryKey: ["project-pipeline-stats"],
        queryFn: async () => {
            // Mock aggregation for now until we have real project phases in DB
            return mockData;
        }
    });

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-admin-border bg-admin-card">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Project Pipeline</CardTitle>
                <p className="text-sm text-admin-muted">Active projects by design phase</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--admin-border))" />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--admin-muted))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--admin-muted))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--admin-muted)/0.1)' }}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--admin-card))",
                                    border: "1px solid hsl(var(--admin-border))",
                                    color: "hsl(var(--admin-foreground))"
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
