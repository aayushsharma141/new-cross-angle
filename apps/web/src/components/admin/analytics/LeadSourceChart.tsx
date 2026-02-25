
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SOURCE_COLORS: Record<string, string> = {
    website_contact: "hsl(var(--brand-secondary))",
    estimator: "hsl(var(--brand-primary))",
    style_quiz: "#22c55e",
    whatsapp: "#25D366",
    instagram: "#E1306C",
    referral: "#f59e0b",
    other: "hsl(var(--admin-muted))",
};

const SOURCE_LABELS: Record<string, string> = {
    website_contact: "Website",
    estimator: "Estimator",
    style_quiz: "Style Quiz",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    referral: "Referral",
    other: "Other",
};

export function LeadSourceChart() {
    const { data: chartData = [], isLoading } = useQuery({
        queryKey: ["lead-source-stats"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("leads")
                .select("lead_source");

            if (error) throw error;

            const counts: Record<string, number> = {};
            for (const row of data || []) {
                const s = row.lead_source || "other";
                counts[s] = (counts[s] || 0) + 1;
            }

            return Object.entries(counts)
                .filter(([, v]) => v > 0)
                .map(([key, value]) => ({
                    name: SOURCE_LABELS[key] ?? key,
                    value,
                    color: SOURCE_COLORS[key] ?? "#888",
                }));
        },
    });

    return (
        <Card className="col-span-1 border-admin-border bg-admin-card">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Lead Sources</CardTitle>
                <p className="text-sm text-admin-muted">Acquisition channel distribution</p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-admin-muted text-sm">
                        Loading…
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-admin-muted text-sm">
                        No source data yet.
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--admin-card))",
                                        border: "1px solid hsl(var(--admin-border))",
                                        color: "hsl(var(--admin-foreground))",
                                    }}
                                    itemStyle={{ color: "hsl(var(--admin-foreground))" }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span style={{ color: "hsl(var(--admin-foreground))", fontSize: "11px" }}>{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
