
import { Bar, ComposedChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STATUS_COLORS: Record<string, string> = {
    draft: "hsl(var(--admin-text-subtle))",
    live: "hsl(var(--admin-success))",
    archived: "hsl(var(--admin-primary))",
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

            return Object.entries(counts).map(([name, value], index) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                rawName: name,
                value,
                // Mock previous month data for the trend comparison
                expected: Math.max(1, value + (index % 2 === 0 ? 1 : -1)), 
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
                    <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-admin-border/50 rounded-xl bg-[hsl(var(--admin-surface))]/30">
                        <div className="w-12 h-12 bg-[hsl(var(--admin-primary))]/10 rounded-full flex items-center justify-center mb-4 text-[hsl(var(--admin-primary))]">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <h4 className="text-[hsl(var(--admin-foreground))] font-medium mb-2">No projects running yet</h4>
                        <p className="text-[hsl(var(--admin-muted))] text-sm max-w-[280px] mb-4">
                            Most clients transition their first lead into a project within 7 days of launch. Want to test the project creation flow?
                        </p>
                        <Button variant="outline" className="border-[hsl(var(--admin-primary))]/20 text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/10">
                            Create Test Project
                        </Button>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Line 
                                    type="monotone" 
                                    dataKey="expected" 
                                    stroke="hsl(var(--admin-muted))" 
                                    strokeDasharray="4 4" 
                                    strokeWidth={2} 
                                    dot={{ r: 4, fill: "hsl(var(--admin-card))", strokeWidth: 2 }} 
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
