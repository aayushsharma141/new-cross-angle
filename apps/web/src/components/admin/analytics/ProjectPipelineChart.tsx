
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STATUS_COLORS: Record<string, string> = {
    draft: "hsl(var(--admin-muted))",
    live: "hsl(var(--brand-secondary))",
    archived: "hsl(var(--brand-primary))",
};

export function ProjectPipelineChart() {
    const { data: chartData = [], isLoading } = useQuery({
        queryKey: ["project-pipeline-stats"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("status");

            if (error) throw error;

            // Group by status
            const counts: Record<string, number> = {};
            for (const row of data || []) {
                const s = row.status || "draft";
                counts[s] = (counts[s] || 0) + 1;
            }

            return Object.entries(counts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                rawName: name,
                value,
                color: STATUS_COLORS[name] ?? "hsl(var(--admin-foreground))",
            }));
        },
    });

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-admin-border bg-admin-card">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Project Pipeline</CardTitle>
                <p className="text-sm text-admin-muted">Active projects by status</p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-admin-muted text-sm">
                        Loading…
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-admin-muted text-sm">
                        No projects found.
                    </div>
                ) : (
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
                                    cursor={{ fill: "hsl(var(--admin-muted)/0.1)" }}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--admin-card))",
                                        border: "1px solid hsl(var(--admin-border))",
                                        color: "hsl(var(--admin-foreground))",
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
                )}
            </CardContent>
        </Card>
    );
}
