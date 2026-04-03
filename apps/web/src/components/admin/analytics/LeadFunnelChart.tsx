
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FUNNEL_ORDER = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const FUNNEL_COLORS: Record<string, string> = {
    new: "hsl(var(--admin-info))",
    contacted: "hsl(var(--admin-primary))",
    qualified: "hsl(var(--admin-success))",
    proposal: "hsl(var(--admin-warning))",
    won: "hsl(142 71% 45%)",
    lost: "hsl(var(--admin-danger))",
};

export function LeadFunnelChart() {
    const { data: chartData = [], isLoading } = useQuery({
        queryKey: ["lead-funnel-stats"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("leads")
                .select("status");

            if (error) throw error;

            const counts: Record<string, number> = {};
            for (const row of data || []) {
                const s = row.status || "new";
                counts[s] = (counts[s] || 0) + 1;
            }

            return FUNNEL_ORDER
                .filter((s) => counts[s] !== undefined)
                .map((s) => ({
                    name: s.charAt(0).toUpperCase() + s.slice(1),
                    value: counts[s],
                    color: FUNNEL_COLORS[s] ?? "hsl(var(--admin-foreground))",
                }));
        },
    });

    return (
        <Card className="col-span-1 border-admin-border bg-admin-card">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Lead Funnel</CardTitle>
                <p className="text-sm text-admin-muted">Leads by acquisition stage</p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-admin-muted text-sm">
                        Loading…
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-admin-muted text-sm">
                        No leads found.
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 50, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--admin-border))" />
                                <XAxis
                                    type="number"
                                    stroke="hsl(var(--admin-muted))"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="hsl(var(--admin-muted))"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={70}
                                />
                                <Tooltip
                                    cursor={{ fill: "hsl(var(--admin-muted)/0.1)" }}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--admin-card))",
                                        border: "1px solid hsl(var(--admin-border))",
                                        color: "hsl(var(--admin-foreground))",
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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
