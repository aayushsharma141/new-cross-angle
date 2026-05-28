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

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  qualified: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  consultation_scheduled: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  proposal: "bg-primary/10 text-primary border-primary/20",
  proposal_sent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  negotiation: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  final_review: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  won: "bg-success/10 text-success border-success/20",
  lost: "bg-error/10 text-error border-error/20",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New Inquiry",
  initial_contact: "Contact Attempted",
  contacted: "Contact Attempted",
  qualified: "Interested",
  consultation_scheduled: "Req. Gathering",
  proposal: "Proposal Sent",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  final_review: "Final Review",
  won: "Won",
  lost: "Lost",
};

const SOURCE_LABELS: Record<string, string> = {
  website_contact: "Website",
  estimator: "Estimator",
  style_quiz: "Aesthetic Discovery Engine",
  aesthetic_discovery_engine: "Aesthetic Discovery Engine",
  welcome_popup: "Welcome Popup",
  discovery_engine: "Aesthetic Discovery Engine",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  referral: "Referral",
  other: "Other",
};

const TYPE_LABELS: Record<string, string> = {
  interior: "Interior",
  renovation: "Renovation",
  consultation: "Consultation",
  commercial: "Commercial",
};

const EM_DASH = "\u2014";

function TemperatureIcon({ score }: { score: number }) {
  if (score >= 70) return <Flame className={`${icons.xs} text-error`} />;
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
    <Card className="overflow-hidden shadow-none border">
      <Table>
        <TableHeader className="bg-surface">
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                className="cursor-pointer group"
                onClick={() => onLeadClick(lead)}
              >
                <TableCell>
                  <div>
                    <p className="font-semibold text-text-primary text-sm group-hover:text-primary transition-colors">{lead.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{lead.email}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {TYPE_LABELS[leadType || ""] || leadType || EM_DASH}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {SOURCE_LABELS[leadSource || ""] || leadSource || EM_DASH}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm">{lead.city || EM_DASH}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <TemperatureIcon score={score} />
                    <span className="text-sm font-semibold tabular-nums">{score}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] uppercase font-bold", temp.color, "bg-transparent")}
                    >
                      {temp.label}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    className={cn(
                      "capitalize px-2.5 py-1 text-[11px] font-semibold",
                      STATUS_COLORS[lead.status] || "bg-surface-muted text-text-primary border-border"
                    )}
                    variant="secondary"
                  >
                    {STAGE_LABELS[lead.status] || lead.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm text-text-muted">
                  {lead.created_at
                    ? format(new Date(lead.created_at), "MMM d, yyyy")
                    : EM_DASH}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
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
