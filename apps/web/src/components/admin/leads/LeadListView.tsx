import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/components/Table";
import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/design-system/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { Card } from "@/design-system/components/Card";
import { MoreHorizontal, Eye, Mail, Phone, Trash2, Flame, Thermometer, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadTemperature, Lead } from "@/lib/scoring/leadScoring";
import { icons } from "@/design-system/tokens/icons";
import {
  CRM_STAGE_LABELS,
  CRM_STAGE_BADGE_CLASSES,
  HOT_LEAD_THRESHOLD,
  getCrmLeadTypeLabel,
  getCrmSourceLabel,
} from "@/lib/crm";

const EM_DASH = "\u2014";

function TemperatureIcon({ score }: { score: number }) {
  if (score >= HOT_LEAD_THRESHOLD) return <Flame className={`${icons.xs} text-error`} />;
  if (score >= 40) return <Thermometer className={`${icons.xs} text-primary`} />;
  return <Snowflake className={`${icons.xs} text-blue-400`} />;
}

interface LeadListViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDeleteClick?: (id: string) => void;
}

export function LeadListView({ leads, onLeadClick, onDeleteClick }: LeadListViewProps) {
  return (
    <Card className="overflow-hidden shadow-none border border-[hsl(var(--admin-border))]/60 bg-transparent rounded-xl">
        <Table>
        <TableHeader className="bg-[hsl(var(--admin-surface))]/50 border-b border-[hsl(var(--admin-border))]/60">
          <TableRow className="h-11 hover:bg-transparent border-0">
            <TableHead className="px-6 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap">Lead</TableHead>
            <TableHead className="px-4 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap">Type</TableHead>
            <TableHead className="px-4 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap">Source</TableHead>
            <TableHead className="px-4 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap">City</TableHead>
            <TableHead className="px-4 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap">Score</TableHead>
            <TableHead className="px-4 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap">Status</TableHead>
            <TableHead className="px-4 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap">Date</TableHead>
            <TableHead className="px-6 text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))] whitespace-nowrap text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const score = lead.score || 0;
            const temp = getLeadTemperature(score);
            const leadType = lead.category || lead.lead_type;
            const leadSource = lead.source || lead.lead_source;

            return (
              <TableRow
                key={lead.id}
                className="cursor-pointer group hover:bg-[hsl(var(--admin-surface))] h-20 transition-colors border-b border-[hsl(var(--admin-border))]/40"
                onClick={() => onLeadClick(lead)}
              >
                <TableCell className="align-middle px-6">
                  <div className="flex flex-col justify-center">
                    <p className="font-semibold text-[hsl(var(--admin-text))] text-[14px] group-hover:text-[hsl(var(--admin-primary))] transition-colors tracking-tight">{lead.name}</p>
                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-1">{lead.email}</p>
                  </div>
                </TableCell>

                <TableCell className="align-middle px-4 whitespace-nowrap">
                  <span className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-text))]/80 transition-colors">
                    {leadType ? getCrmLeadTypeLabel(leadType) : EM_DASH}
                  </span>
                </TableCell>

                <TableCell className="align-middle px-4 whitespace-nowrap">
                  <span className="text-[13px] text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-text))]/80 transition-colors">
                    {leadSource ? getCrmSourceLabel(leadSource) : EM_DASH}
                  </span>
                </TableCell>

                <TableCell className="align-middle px-4 whitespace-nowrap">
                  <span className="text-[13px] text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-text))]/80 transition-colors">{lead.city || EM_DASH}</span>
                </TableCell>

                <TableCell className="align-middle px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--admin-background))] border border-[hsl(var(--admin-border))]/50">
                      <TemperatureIcon score={score} />
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-[hsl(var(--admin-text))]">{score}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border-0", temp.color, "bg-[hsl(var(--admin-background))]")}
                    >
                      {temp.label}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell className="align-middle px-4 whitespace-nowrap">
                  <Badge
                    className={cn(
                      "capitalize px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full border border-transparent shadow-none",
                      CRM_STAGE_BADGE_CLASSES[lead.status as keyof typeof CRM_STAGE_BADGE_CLASSES] || "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-border))]/50"
                    )}
                    variant="secondary"
                  >
                    {CRM_STAGE_LABELS[lead.status as keyof typeof CRM_STAGE_LABELS] || lead.status}
                  </Badge>
                </TableCell>

                <TableCell className="align-middle px-4 whitespace-nowrap text-[13px] text-[hsl(var(--admin-text-muted))] font-medium group-hover:text-foreground/80 transition-colors">
                  {lead.created_at
                    ? format(new Date(lead.created_at), "MMM d, yyyy")
                    : EM_DASH}
                </TableCell>

                <TableCell className="px-6 align-middle text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 h-8 w-8 p-0 text-[hsl(var(--admin-text-muted))] hover:text-foreground hover:bg-[hsl(var(--admin-border))]/30 transition-all rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeadClick(lead);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {lead.email ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(lead.email ?? "");
                          }}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Copy Email
                        </DropdownMenuItem>
                      ) : null}
                      {lead.phone ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(lead.phone ?? "");
                          }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Copy Phone
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      {onDeleteClick && (
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick(lead.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Lead
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
