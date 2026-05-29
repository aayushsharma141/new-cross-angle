import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { cn } from "@/lib/utils";

interface FunnelLayer {
    name: string;
    value: number;
    conversion?: string;
    dropoff?: string;
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
                    <div className="w-full flex flex-col gap-4 py-2">
                        {data.map((layer, index) => (
                            <div key={layer.name} className="flex flex-col">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-admin-foreground">{layer.name}</span>
                                    <span className="text-xs text-admin-muted">{layer.value} leads ({layer.conversion})</span>
                                </div>
                                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ 
                                          width: layer.conversion || '0%', 
                                          backgroundColor: layer.color,
                                          boxShadow: `0 0 10px ${layer.color}40`
                                      }}
                                    />
                                </div>
                                {index < data.length - 1 && data[index+1] && (
                                    <div className="flex justify-end mt-1">
                                        <span className="text-[10px] text-red-400 font-medium bg-red-400/10 px-2 py-0.5 rounded">
                                            Drop-off: {Math.round(((layer.value - data[index+1].value) / Math.max(layer.value, 1)) * 100)}% from prev stage
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
