
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { name: "Lighting", value: 35, color: "hsl(var(--brand-secondary))" }, // Gold
    { name: "Flooring", value: 25, color: "hsl(var(--admin-muted))" }, // Grey
    { name: "Furnishing", value: 20, color: "hsl(var(--brand-primary))" }, // Wine
    { name: "Smart Home", value: 15, color: "#1E6E6E" }, // Teal
    { name: "Misc", value: 5, color: "#333" },
];

export function MaterialSpendChart() {
    return (
        <Card className="col-span-1 border-admin-border bg-admin-card">
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">Material Intelligence</CardTitle>
                <p className="text-sm text-admin-muted">Spend distribution by category</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--admin-card))",
                                    border: "1px solid hsl(var(--admin-border))",
                                    color: "hsl(var(--admin-foreground))"
                                }}
                                itemStyle={{ color: "hsl(var(--admin-foreground))" }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span style={{ color: "hsl(var(--admin-foreground))", fontSize: "12px" }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
