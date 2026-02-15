import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MapPin,
    Home,
    Ruler,
    IndianRupee,
    Flame,
    Thermometer,
    Snowflake,
    Calendar,
    Phone,
    Mail,
    Save,
    Trash2,
} from "lucide-react";

interface EstimateLead {
    id: string;
    created_at: string;
    name: string;
    email: string | null;
    phone: string | null;
    property_type: string | null;
    city: string | null;
    city_tier: string | null;
    state: string | null;
    area: number;
    budget: number;
    scopes: string[];
    design_package: string | null;
    timeline: string | null;
    site_visits: number;
    estimate_total_min: number;
    estimate_total_max: number;
    estimate_breakdown: Record<string, any>;
    lead_score: number;
    lead_category: "HOT" | "WARM" | "COLD";
    status: "new" | "contacted" | "converted" | "archived";
    notes: string | null;
    admin_notes: string | null;
}

interface EstimateLeadDetailSheetProps {
    lead: EstimateLead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (updates: Partial<EstimateLead> & { id: string }) => void;
    onDelete: (id: string) => void;
}

const categoryConfig = {
    HOT: { icon: Flame, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    WARM: { icon: Thermometer, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    COLD: { icon: Snowflake, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export function EstimateLeadDetailSheet({
    lead,
    open,
    onOpenChange,
    onSave,
    onDelete,
}: EstimateLeadDetailSheetProps) {
    const [status, setStatus] = useState(lead?.status || "new");
    const [adminNotes, setAdminNotes] = useState(lead?.admin_notes || "");

    // Sync state when lead changes
    if (lead && (status !== lead.status || adminNotes !== (lead.admin_notes || ""))) {
        if (status !== lead.status) setStatus(lead.status);
        if (adminNotes !== (lead.admin_notes || "")) setAdminNotes(lead.admin_notes || "");
    }

    if (!lead) return null;

    const cat = categoryConfig[lead.lead_category];
    const CatIcon = cat.icon;
    const breakdown = lead.estimate_breakdown || {};

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-3">
                        <span>{lead.name}</span>
                        <Badge variant="outline" className={`${cat.bg} ${cat.color} ${cat.border}`}>
                            <CatIcon className="w-3 h-3 mr-1" />
                            {lead.lead_category}
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        Submitted {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </SheetDescription>
                </SheetHeader>

                {/* Contact Info */}
                <div className="space-y-6 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        {lead.email && (
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                            </div>
                        )}
                        {lead.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Property Details */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Property Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm rounded-lg border p-3">
                                <Home className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <p className="font-medium">{lead.property_type || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm rounded-lg border p-3">
                                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="font-medium">{lead.city || "—"}{lead.city_tier ? ` (${lead.city_tier})` : ""}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm rounded-lg border p-3">
                                <Ruler className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Area</p>
                                    <p className="font-medium">{lead.area.toLocaleString()} sq ft</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm rounded-lg border p-3">
                                <IndianRupee className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Budget</p>
                                    <p className="font-medium">{formatCurrency(lead.budget)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Scope & Design */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Selections</h4>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {(lead.scopes || []).map((scope: string) => (
                                    <Badge key={scope} variant="secondary">{scope}</Badge>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Design Package</p>
                                    <p className="font-medium capitalize">{lead.design_package?.replace(/_/g, " ") || "—"}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Timeline</p>
                                    <p className="font-medium">{lead.timeline || "—"}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Site Visits</p>
                                    <p className="font-medium">{lead.site_visits}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Estimate Breakdown */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Estimate Breakdown</h4>
                        <div className="rounded-xl border bg-gradient-to-br from-amber-500/5 to-amber-600/5 p-4 space-y-2">
                            <div className="text-center pb-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimated Total</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {formatCurrency(lead.estimate_total_min)} — {formatCurrency(lead.estimate_total_max)}
                                </p>
                            </div>
                            <Separator />
                            {breakdown.designFee && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Design Fee</span>
                                    <span>{formatCurrency(breakdown.designFee.min)} – {formatCurrency(breakdown.designFee.max)}</span>
                                </div>
                            )}
                            {breakdown.executionCost && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Execution Cost</span>
                                    <span>{formatCurrency(breakdown.executionCost.min)} – {formatCurrency(breakdown.executionCost.max)}</span>
                                </div>
                            )}
                            {breakdown.supervisionFee > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Supervision Fee</span>
                                    <span>{formatCurrency(breakdown.supervisionFee)}</span>
                                </div>
                            )}
                            {breakdown.extraVisitsCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Extra Visits</span>
                                    <span>{formatCurrency(breakdown.extraVisitsCost)}</span>
                                </div>
                            )}
                            {breakdown.contingency && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Contingency (5%)</span>
                                    <span>{formatCurrency(breakdown.contingency.min)} – {formatCurrency(breakdown.contingency.max)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Lead Score */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Lead Score</h4>
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                                    <circle
                                        cx="18" cy="18" r="15.915" fill="none"
                                        stroke="currentColor" strokeWidth="3"
                                        strokeDasharray={`${lead.lead_score} ${100 - lead.lead_score}`}
                                        className={cat.color}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{lead.lead_score}</span>
                            </div>
                            <div>
                                <p className="font-medium">{lead.lead_category} Lead</p>
                                <p className="text-xs text-muted-foreground">Score based on budget, scope, area, timeline & city</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Admin Controls */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Status</label>
                            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-2 block">Admin Notes</label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add internal notes about this lead..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                onClick={() => onSave({ id: lead.id, status, admin_notes: adminNotes })}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => onDelete(lead.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
