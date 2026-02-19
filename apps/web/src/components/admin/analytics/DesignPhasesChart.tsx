
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { name: "Inquiry", value: 45 },
    { name: "Consultation", value: 32 },
    { name: "Concept", value: 20 },
    { name: "Proposal", value: 15 },
    { name: "Signed", value: 8 },
];

export function DesignPhasesChart() {
    return (
        <Card className="col-span-1 border-admin-border bg-admin-card">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Client Acquisition Journey</CardTitle>
                <p className="text-sm text-admin-muted">Conversion from Inquiry to Signed Client</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--brand-secondary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--brand-secondary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--admin-muted))"
                                fontSize={10}
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
                                contentStyle={{
                                    backgroundColor: "hsl(var(--admin-card))",
                                    border: "1px solid hsl(var(--admin-border))",
                                    color: "hsl(var(--admin-foreground))"
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--brand-secondary))"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--admin-border))" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
