import { Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FunnelLayer {
    name: string;
    value: number;
    conversion?: string;
    color: string;
}

interface FunnelWidgetProps {
    data: FunnelLayer[];
    title: string;
    description?: string;
    className?: string;
    isLoading?: boolean;
}

export function FunnelWidget({
    data,
    title,
    description,
    className,
    isLoading = false
}: FunnelWidgetProps) {
    return (
        <Card className={cn("border-admin-border bg-admin-card analytics-glass analytics-card-glow", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-display text-admin-foreground">{title}</CardTitle>
                {description && <p className="text-sm text-admin-muted">{description}</p>}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-admin-muted text-sm italic">
                        Processing Analytics…
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 10, right: 40, left: 40, bottom: 5 }}
                            >
                                <XAxis
                                    type="number"
                                    hide
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="hsl(var(--admin-muted))"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(212, 175, 55, 0.05)" }}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--admin-card))",
                                        border: "1px solid hsl(var(--admin-border))",
                                        borderRadius: "8px",
                                        color: "hsl(var(--admin-foreground))",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 4, 4, 0]}
                                    maxBarSize={32}
                                    className="filter drop-shadow-sm"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            fillOpacity={0.85}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="conversion"
                                        position="right"
                                        fill="hsl(var(--admin-muted))"
                                        fontSize={10}
                                        className="font-medium"
                                        offset={8}
                                    />
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
