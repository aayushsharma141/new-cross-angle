import { format } from "date-fns";
import { Card } from "@/design-system/components/Card";
import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/design-system/components/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/primitives/dropdown-menu";
import { MoreHorizontal, Eye, Mail, Phone, Flame, Thermometer, Snowflake, Trash2, MapPin } from "lucide-react";
import { getLeadTemperature, Lead } from "@/lib/scoring/leadScoring";
import { icons } from "@/design-system/tokens/icons";
import {
  CRM_STAGE_LABELS,
  CRM_STAGE_BADGE_CLASSES,
  HOT_LEAD_THRESHOLD,
  getCrmLeadTypeLabel,
  getCrmSourceLabel,
} from "@/lib/crm";

function TemperatureIcon({ score }: { score: number }) {
  if (score >= HOT_LEAD_THRESHOLD) return <Flame className={`${icons.xs} text-error`} />;
  if (score >= 40) return <Thermometer className={`${icons.xs} text-primary`} />;
  return <Snowflake className={`${icons.xs} text-blue-400`} />;
}

interface LeadGridViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDeleteClick?: (id: string) => void;
}

export function LeadGridView({ leads, onLeadClick, onDeleteClick }: LeadGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {leads.map((lead) => {
        const score = lead.score || 0;
        const temp = getLeadTemperature(score);
        const leadType = lead.category || lead.lead_type;
        const leadSource = lead.source || lead.lead_source;
        const stageLabel = lead.status ? CRM_STAGE_LABELS[lead.status as keyof typeof CRM_STAGE_LABELS] || lead.status : "New Inquiry";
        const badgeColor = CRM_STAGE_BADGE_CLASSES[(lead.status as keyof typeof CRM_STAGE_BADGE_CLASSES) || "new"] || CRM_STAGE_BADGE_CLASSES.new;

        return (
          <Card 
            key={lead.id} 
            className="group overflow-hidden shadow-sm hover:shadow-md border border-admin-border/60 bg-admin-card rounded-xl transition-all hover:border-[hsl(var(--admin-primary)/0.3)] cursor-pointer flex flex-col"
            onClick={() => onLeadClick(lead)}
          >
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className={`font-medium tracking-wide ${badgeColor} border bg-transparent text-[10px] uppercase`}>
                  {stageLabel}
                </Badge>
                
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-admin-text-muted hover:text-admin-text hover:bg-admin-surface">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="admin-theme w-40 bg-admin-bg border-admin-border text-admin-text">
                      <DropdownMenuItem onClick={() => onLeadClick(lead)} className="hover:bg-admin-surface">
                        <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)} className="hover:bg-admin-surface">
                        <Mail className="w-3.5 h-3.5 mr-2" /> Email Lead
                      </DropdownMenuItem>
                      {lead.phone && (
                        <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)} className="hover:bg-admin-surface">
                          <Phone className="w-3.5 h-3.5 mr-2" /> Call Lead
                        </DropdownMenuItem>
                      )}
                      {onDeleteClick && (
                        <>
                          <DropdownMenuSeparator className="bg-admin-border" />
                          <DropdownMenuItem onClick={() => onDeleteClick(lead.id)} className="text-admin-danger hover:bg-admin-danger-muted focus:bg-admin-danger-muted">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-admin-text text-[15px] group-hover:text-admin-primary transition-colors tracking-tight mb-1">{lead.name}</h3>
                <p className="text-[13px] text-admin-text-muted">{lead.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                {leadType && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-admin-text-subtle font-medium mb-1">Type</span>
                    <span className="text-[12px] text-admin-text truncate">{getCrmLeadTypeLabel(leadType)}</span>
                  </div>
                )}
                {leadSource && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-admin-text-subtle font-medium mb-1">Source</span>
                    <span className="text-[12px] text-admin-text truncate">{getCrmSourceLabel(leadSource)}</span>
                  </div>
                )}
                {lead.city && (
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] uppercase text-admin-text-subtle font-medium mb-1">City</span>
                    <span className="text-[12px] text-admin-text flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-admin-text-subtle" />
                      {lead.city}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-5 py-3 bg-admin-surface/30 border-t border-admin-border/60 flex items-center justify-between text-[11px] font-medium">
              <div className="flex items-center gap-1.5 text-admin-text">
                <TemperatureIcon score={score} />
                <span>Score: {score}</span>
              </div>
              <span className="text-admin-text-muted">
                {format(new Date(lead.created_at || new Date()), "MMM d, yyyy")}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
