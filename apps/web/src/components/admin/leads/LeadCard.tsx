import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { calculateLeadScore, getLeadTemperature, Lead } from "@/lib/leadScoring";

interface LeadCardProps {
    lead: Lead;
    onClick: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id, data: { ...lead } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const score = lead.score ?? calculateLeadScore(lead);
    const { label, color } = getLeadTemperature(score);

    // Map temperature colors to border colors
    const getBorderColor = () => {
        if (label === "Hot") return "hover:border-l-red-500 border-l-red-500/50";
        if (label === "Warm") return "hover:border-l-orange-500 border-l-orange-500/50";
        return "hover:border-l-blue-500 border-l-blue-500/50";
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card
                className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${getBorderColor()}`}
                onClick={() => onClick(lead)}
            >
                <CardContent className="p-3 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Avatar className="h-8 w-8 shrink-0 border border-muted">
                                <AvatarFallback className="bg-[hsl(var(--admin-background))] text-[hsl(var(--brand-primary))] text-xs font-semibold">
                                    {lead.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h4 className="font-semibold text-sm leading-none truncate">{lead.name}</h4>
                                <p className="text-[10px] text-muted-foreground truncate mt-1">{lead.category || lead.lead_type || "General Inquiry"}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 shrink-0 ${color}`}>
                            {score} {label === "Hot" ? "🔥" : ""}
                        </Badge>
                    </div>

                    <div className="space-y-1 pt-1 opacity-80">
                        {lead.email && (
                            <div className="flex items-center text-[10px] text-muted-foreground">
                                <Mail className="mr-1.5 h-3 w-3 shrink-0" />
                                <span className="truncate">{lead.email}</span>
                            </div>
                        )}
                        {lead.phone && (
                            <div className="flex items-center text-[10px] text-muted-foreground">
                                <Phone className="mr-1.5 h-3 w-3 shrink-0" />
                                <span>{lead.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-[10px] text-muted-foreground">
                        <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {lead.created_at ? format(new Date(lead.created_at), "MMM d") : "N/A"}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
