import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

interface SparklineChartProps {
    data: number[];
    color?: string;
}

export function SparklineChart({ data, color = "hsl(var(--admin-primary))" }: SparklineChartProps) {
    if (!data || data.length === 0) return null;

    const chartData = data.map((val, i) => ({ value: val, index: i }));

    return (
        <div className="h-10 w-20 opacity-80 mix-blend-plus-lighter">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1500}
                        strokeLinecap="round"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
