
import { Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CRM_STAGES } from "@/lib/crm/stages";

// Derive from canonical CRM_STAGES — single source of truth
const FUNNEL_ORDER = CRM_STAGES.map((s) => s.id);
const STATUS_LABELS = Object.fromEntries(CRM_STAGES.map((s) => [s.id, s.shortLabel]));

const COLORS: Record<string, string> = {
  new: "hsl(var(--admin-primary))",
  in_conversation: "hsl(var(--admin-primary))",
  meeting_planned: "hsl(var(--admin-primary))",
  quote_sent: "hsl(var(--admin-primary))",
  closing: "hsl(var(--admin-primary))",
  won: "hsl(var(--admin-success))",
  lost: "hsl(var(--admin-error))"
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
                .filter((s) => counts[s] !== undefined || s === 'new') // Keep at least 'new' layer visible if some exists
                .map((s, idx, arr) => {
                    const val = counts[s] || 0;
                    const prevVal = idx > 0 ? (counts[arr[idx - 1]] || val) : val;
                    const conversion = prevVal > 0 ? Math.round((val / prevVal) * 100) : 100;
                    return {
                        name: STATUS_LABELS[s] ?? (s.charAt(0).toUpperCase() + s.slice(1)),
                        value: val,
                        conversion: idx === 0 ? "100%" : `${conversion}%`,
                        color: COLORS[s] ?? "hsl(var(--admin-foreground))",
                    };
                });
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
                    <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-admin-border/50 rounded-xl bg-[hsl(var(--admin-surface))]/30">
                        <div className="w-12 h-12 bg-[hsl(var(--admin-success))]/10 rounded-full flex items-center justify-center mb-4 text-[hsl(var(--admin-success))]">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <h4 className="text-[hsl(var(--admin-foreground))] font-medium mb-2">Your funnel is ready</h4>
                        <p className="text-[hsl(var(--admin-muted))] text-sm max-w-[280px]">
                            Leads will appear here as they enter the CRM pipeline. Funnel conversion rates update automatically.
                        </p>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 50, bottom: 5 }}>
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
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <LabelList dataKey="conversion" position="right" fill="hsl(var(--admin-muted))" fontSize={11} formatter={(val: string) => val !== "100%" ? val : ""} />
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
