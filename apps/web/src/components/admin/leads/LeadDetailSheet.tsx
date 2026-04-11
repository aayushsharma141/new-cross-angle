import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leadStatusOptions, lossReasonOptions, leadSchema, formatZodErrors } from "@/lib/validations";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadTimeline } from "@/components/admin/leads/LeadTimeline";
import {
  Mail, Phone, MapPin, User, FileText, StickyNote, Copy,
  ExternalLink, TrendingUp, CheckCircle2, CircleDot,
  Clock, ArrowRight, ChevronRight, UserCircle, Zap,
  Send, Loader2, CheckCheck,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Lead } from "@/lib/leadScoring";
import type { LeadScoreBreakdown } from "@/lib/leadScoring";
import { STAGE_WIN_PROBABILITY } from "@/lib/leadScoring";
import { cn } from "@/lib/utils";
import { useSendEmail } from "@/hooks/useSendEmail";
import { DuplicateBanner } from "@/components/admin/leads/DuplicateBanner";

interface LeadDetailSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (lead: Lead) => void;
    onDelete: (id: string) => void;
    isReadOnly?: boolean;
    /** All existing leads — used to power real-time duplicate detection */
    allLeads?: Lead[];
    /** Called when user clicks "View" on a matched duplicate */
    onViewLead?: (lead: Lead) => void;
}

const PIPELINE_STAGES = [
  { key: "new", label: "New" },
  { key: "initial_contact", label: "Initial Contact" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "consultation_scheduled", label: "Consultation" },
  { key: "proposal", label: "Proposal" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "negotiation", label: "Negotiation" },
  { key: "final_review", label: "Final Review" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

const FORECAST_OPTIONS = [
  { value: "committed", label: "Committed", color: "text-emerald-500 bg-emerald-500/10" },
  { value: "best_case", label: "Best Case", color: "text-blue-500 bg-blue-500/10" },
  { value: "pipeline", label: "Pipeline", color: "text-amber-500 bg-amber-500/10" },
  { value: "omitted", label: "Omitted", color: "text-muted-foreground bg-muted" },
] as const;

const SCORE_BREAKDOWN_LABELS: Record<keyof LeadScoreBreakdown, string> = {
  budget: "Budget",
  category: "Category fit",
  timeline: "Timeline urgency",
  contactQuality: "Contact quality",
  source: "Lead source",
  recency: "Recency bonus",
};

const SCORE_BREAKDOWN_MAX: Record<keyof LeadScoreBreakdown, number> = {
  budget: 30,
  category: 20,
  timeline: 20,
  contactQuality: 10,
  source: 15,
  recency: 5,
};

const EMAIL_TEMPLATES = [
    {
        id: "initial",
        name: "Initial Response",
        subject: "Re: Your inquiry about {{service}}",
        body: "Hi {{name}},\n\nThank you for reaching out to us regarding {{service}}. We received your message and would love to discuss your project in more detail.\n\nCould we schedule a quick call to understand your requirements better?\n\nBest regards,\nThe Team"
    },
    {
        id: "followup",
        name: "Follow Up",
        subject: "Following up: Your project with us",
        body: "Hi {{name}},\n\nI just wanted to follow up on my previous email. Have you had a chance to review our portfolio? Let me know if you have any questions.\n\nBest,\nThe Team"
    },
    {
        id: "meeting",
        name: "Meeting Request",
        subject: "Meeting to discuss {{service}}",
        body: "Hi {{name}},\n\nAre you available for a brief meeting this week to discuss your {{service}} project? Please let me know what time works best for you.\n\nThanks,\nThe Team"
    }
];

export function LeadDetailSheet({ lead, open, onOpenChange, onSave, onDelete, isReadOnly = false, allLeads = [], onViewLead }: LeadDetailSheetProps) {
    const [formData, setFormData] = useState<Lead | null>(null);
    // Track which template IDs were sent this session (keyed by template.id)
    const [sentTemplates, setSentTemplates] = useState<Record<string, "sending" | "sent" | "error">>({});
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isNewLead = formData?.id === "__new__";
    const sendEmailMutation = useSendEmail();

    useEffect(() => {
        if (lead) {
            setFormData({ ...lead });
        }
    }, [lead]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logActivity = async (type: string, description: string, metadata: any = {}) => {
        if (!formData?.id) return;

        try {
            const { error } = await supabase.from("lead_activities").insert({
                lead_id: formData.id,
                activity_type: type,
                description: description,
                metadata: metadata,
                performed_by: (await supabase.auth.getUser()).data.user?.id
            });

            if (error) throw error;

            // Invalidate timeline query to show new activity
            queryClient.invalidateQueries({ queryKey: ['lead-timeline', formData.id] });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    const handleSave = () => {
        if (!formData) return;

        const validation = leadSchema.safeParse(formData);
        if (!validation.success) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: formatZodErrors(validation.error),
            });
            return;
        }

        onSave(formData);
    };

    const processTemplate = (templateBody: string, templateSubject: string) => {
        if (!formData) return { body: "", subject: "" };

        const body = templateBody
            .replace(/{{name}}/g, formData.name || "there")
            .replace(/{{service}}/g, formData.category || formData.lead_type || "your project");

        const subject = templateSubject
            .replace(/{{service}}/g, formData.category || formData.lead_type || "Project");

        return { body, subject };
    };

    const copyToClipboard = (text: string, templateName: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: "You can now paste it into your email client.",
        });
        logActivity("email_copied", `Copied email template: ${templateName}`, { template: templateName });
    };

    const openMailClient = (template: typeof EMAIL_TEMPLATES[0]) => {
        if (!formData?.email) {
            toast({
                variant: "destructive",
                title: "No email address",
                description: "This lead does not have an email address.",
            });
            return;
        }

        const { body, subject } = processTemplate(template.body, template.subject);
        const mailtoLink = `mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');

        logActivity("email_opened", `Opened mail client for: ${template.name}`, { template: template.name, subject });
    };

    if (!formData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-100 sm:rounded-xl p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-zinc-800 shrink-0">
                    <DialogTitle className="text-xl font-display text-white">Lead Details</DialogTitle>
                    <DialogDescription className="text-zinc-400">View and manage lead information.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-6 pt-4 shrink-0">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <TabsContent value="details" className="space-y-6 mt-0">
                            {/* Status Bar */}
                            <div className="flex flex-col gap-4 bg-muted/50 p-4 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                                            disabled={isReadOnly}
                                        >
                                            <SelectTrigger className="w-[180px] bg-background h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leadStatusOptions.map((status) => (
                                                    <SelectItem key={status} value={status} className="capitalize">
                                                        {status.replace(/_/g, " ")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Score with breakdown tooltip */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-right cursor-help">
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Lead Score</div>
                                                    <div className="flex items-center gap-1">
                                                        <span className={cn(
                                                            "font-bold text-lg",
                                                            (formData.score ?? 0) >= 70 && "text-red-500",
                                                            (formData.score ?? 0) >= 40 && (formData.score ?? 0) < 70 && "text-amber-500",
                                                            (formData.score ?? 0) < 40 && "text-blue-500"
                                                        )}>
                                                            {formData.score ?? "—"}
                                                        </span>
                                                        <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="left" className="w-64 p-0">
                                                <div className="p-3 space-y-2">
                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score Breakdown</div>
                                                    {formData.score_details ? (
                                                        <div className="space-y-1.5">
                                                            {(Object.entries(formData.score_details) as [keyof LeadScoreBreakdown, number][]).map(([key, val]) => (
                                                                <div key={key} className="flex items-center justify-between gap-3 text-xs">
                                                                    <span className="text-muted-foreground">{SCORE_BREAKDOWN_LABELS[key] ?? key}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-[hsl(var(--brand-primary))] rounded-full"
                                                                                style={{ width: `${(val / SCORE_BREAKDOWN_MAX[key]) * 100}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="font-mono font-medium w-6 text-right">{val}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="pt-1.5 border-t border-border flex justify-between text-xs font-semibold">
                                                                <span>Total</span>
                                                                <span className="font-mono">{formData.score ?? 0}/100</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground">Score not yet calculated</div>
                                                    )}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Date Received</div>
                                            <div className="font-medium text-sm">
                                                {formData.created_at ? format(new Date(formData.created_at), "PPP") : "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {formData.status === "lost" && (
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider text-destructive">Loss Reason</Label>
                                        <Select
                                            value={formData.loss_reason || ""}
                                            onValueChange={(val) => setFormData({ ...formData, loss_reason: val })}
                                            disabled={isReadOnly}
                                        >
                                            <SelectTrigger className="w-[280px] bg-background/50 border-destructive/20 data-[state=open]:border-destructive">
                                                <SelectValue placeholder="Select reason for lost lead..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {lossReasonOptions.map((reason) => (
                                                    <SelectItem key={reason} value={reason} className="capitalize">
                                                        {reason.replace(/_/g, " ")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* Duplicate Detection Banner — shown whenever email or phone could match */}
                            {!isReadOnly && (formData.email || formData.phone) && (
                                <DuplicateBanner
                                    candidate={{ email: formData.email, phone: formData.phone }}
                                    allLeads={allLeads}
                                    currentId={isNewLead ? undefined : formData.id}
                                    onViewLead={onViewLead}
                                    className="mb-2"
                                />
                            )}

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm -admin-primary">
                                    <User className="w-4 h-4" /> Client Information
                                </h3>
                                <div className="grid gap-4 p-4 border rounded-lg bg-card">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email</Label>
                                            <Input
                                                id="email"
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                readOnly={isReadOnly}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone || ""}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                readOnly={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm -admin-primary">
                                    <FileText className="w-4 h-4" /> Project Interest
                                </h3>
                                <div className="grid gap-4 p-4 border rounded-lg bg-card">
                                    <div className="grid gap-2">
                                        <Label htmlFor="service">Interested Service</Label>
                                        <Input
                                            id="service"
                                            value={formData.category || ""}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="message">Initial Message</Label>
                                        <div className="bg-muted p-3 rounded-md text-sm italic border">
                                            "{formData.message || "No message provided."}"
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Budget</Label>
                                            <Input
                                                value={formData.budget || ""}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                readOnly={isReadOnly}
                                                placeholder="e.g. 10-15 L"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>City</Label>
                                            <Input
                                                value={formData.city || ""}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                readOnly={isReadOnly}
                                                placeholder="e.g. Mumbai"
                                            />
                                        </div>
                                        <div className="grid gap-2 col-span-2">
                                            <Label>Scope</Label>
                                            <Input
                                                value={formData.scope || ""}
                                                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                                                readOnly={isReadOnly}
                                                placeholder="e.g. 3BHK Full Interior"
                                            />
                                        </div>
                                        <div className="grid gap-2 col-span-2">
                                            <Label>Timeline</Label>
                                            <Input
                                                value={formData.timeline || ""}
                                                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                                readOnly={isReadOnly}
                                                placeholder="e.g. Need to move in 2 months"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm -admin-primary">
                                    <StickyNote className="w-4 h-4" /> Internal Notes
                                </h3>
                                <Textarea
                                    className="min-h-[100px]"
                                    placeholder="Add notes about budget, timeline, or meeting outcomes..."
                                    value={formData.notes || ""}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            {/* CRM Intelligence */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm -admin-primary">
                                    <Zap className="w-4 h-4" /> CRM Intelligence
                                </h3>
                                <div className="grid gap-3 p-4 border rounded-lg bg-card">
                                    <div className="grid gap-2">
                                        <Label htmlFor="next_step" className="flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3" /> Next Step
                                        </Label>
                                        <Input
                                            id="next_step"
                                            placeholder="e.g. Send proposal, Follow up call"
                                            value={formData.next_step || ""}
                                            onChange={(e) => setFormData({ ...formData, next_step: e.target.value })}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="assigned_to" className="flex items-center gap-2">
                                            <UserCircle className="w-3 h-3" /> Assigned To
                                        </Label>
                                        <Input
                                            id="assigned_to"
                                            placeholder="e.g. rahul@crossangle.com"
                                            value={formData.assigned_to || ""}
                                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="forecast_category">Forecast Category</Label>
                                        <Select
                                            value={formData.forecast_category || ""}
                                            onValueChange={(val) => setFormData({ ...formData, forecast_category: val as Lead["forecast_category"] })}
                                            disabled={isReadOnly}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select forecast category..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FORECAST_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium", opt.color)}>
                                                            {opt.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="pipeline" className="mt-0 space-y-6">
                            {/* Stage Stepper */}
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-sm -admin-primary">
                                    <TrendingUp className="w-4 h-4" /> Pipeline Stage
                                </h3>
                                <div className="relative">
                                    <div className="flex overflow-x-auto pb-2 gap-1">
                                        {PIPELINE_STAGES.map((stage, idx) => {
                                            const isActive = formData.status === stage.key;
                                            const isPast = PIPELINE_STAGES.findIndex(s => s.key === formData.status) > idx;
                                            const isWon = formData.status === "won";
                                            const isLost = formData.status === "lost";

                                            return (
                                                <div key={stage.key} className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => !isReadOnly && setFormData({ ...formData, status: stage.key })}
                                                        disabled={isReadOnly}
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all whitespace-nowrap",
                                                            isActive && "bg-[hsl(var(--brand-primary))] text-white border-[hsl(var(--brand-primary))] shadow-sm",
                                                            isPast && !isLost && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                                                            isLost && isPast && "bg-red-500/10 text-red-500 border-red-500/30",
                                                            !isActive && !isPast && "bg-muted/50 text-muted-foreground border-border hover:border-foreground/20",
                                                        )}
                                                    >
                                                        {isActive && <CircleDot className="w-2.5 h-2.5 animate-pulse" />}
                                                        {isPast && !isActive && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                        {!isPast && !isActive && <CircleDot className="w-2.5 h-2.5" />}
                                                        {stage.label}
                                                    </button>
                                                    {idx < PIPELINE_STAGES.length - 1 && (
                                                        <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Days in Stage */}
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="bg-card">
                                    <CardContent className="p-4 pt-3 space-y-1">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Days in Stage</div>
                                        <div className="text-2xl font-display font-bold text-[hsl(var(--brand-primary))]">
                                            {formData.created_at ? Math.max(1, differenceInDays(new Date(), new Date(formData.created_at))) : "—"}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">since creation</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card">
                                    <CardContent className="p-4 pt-3 space-y-1">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Win Probability</div>
                                        <div className="text-2xl font-display font-bold text-emerald-500">
                                            {Math.round((STAGE_WIN_PROBABILITY[formData.status] ?? 0) * 100)}%
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {formData.status === "won" ? "Deal closed" : formData.status === "lost" ? "Deal lost" : "at this stage"}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Forecast Category */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm">Forecast Category</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {FORECAST_OPTIONS.map((opt) => {
                                        const isSelected = formData.forecast_category === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => !isReadOnly && setFormData({ ...formData, forecast_category: opt.value as Lead["forecast_category"] })}
                                                disabled={isReadOnly}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left",
                                                    isSelected
                                                        ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary))]/5 text-foreground"
                                                        : "border-border bg-muted/30 text-muted-foreground hover:border-foreground/20"
                                                )}
                                            >
                                                <span className={cn("w-2 h-2 rounded-full shrink-0", isSelected ? "bg-[hsl(var(--brand-primary))]" : "bg-current opacity-40")} />
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Stage Metadata */}
                            {(formData.stale_flagged_at || formData.closed_at || formData.assigned_to) && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-muted-foreground">Timestamps</h3>
                                    <div className="space-y-1.5 text-xs">
                                        {formData.assigned_to && (
                                            <div className="flex items-center gap-2">
                                                <UserCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                <span className="text-muted-foreground">Assigned:</span>
                                                <span className="font-medium">{formData.assigned_to}</span>
                                            </div>
                                        )}
                                        {formData.stale_flagged_at && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="text-muted-foreground">Stale flagged:</span>
                                                <span className="font-medium text-amber-500">{format(new Date(formData.stale_flagged_at), "PPP")}</span>
                                            </div>
                                        )}
                                        {formData.closed_at && (
                                            <div className="flex items-center gap-2">
                                                {formData.status === "won"
                                                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                    : <CircleDot className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                }
                                                <span className="text-muted-foreground">Closed:</span>
                                                <span className="font-medium">{format(new Date(formData.closed_at), "PPP")}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="email" className="mt-0 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-sm">Email Templates</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        Sends directly to <span className="text-foreground font-medium">{formData.email || "(no email)"}</span> via Resend
                                    </p>
                                </div>
                                {!formData.email && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md">
                                        ⚠️ No email address
                                    </span>
                                )}
                            </div>

                            {/* Template cards */}
                            <div className="grid gap-3">
                                {EMAIL_TEMPLATES.map(template => {
                                    const { body, subject } = processTemplate(template.body, template.subject);
                                    const sendState = sentTemplates[template.id];
                                    const hasSent = sendState === "sent";
                                    const isSending = sendState === "sending";

                                    const handleSend = async (e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        if (!formData.email || !formData.id || isReadOnly) return;
                                        setSentTemplates(p => ({ ...p, [template.id]: "sending" }));
                                        try {
                                            await sendEmailMutation.mutateAsync({
                                                lead_id: formData.id,
                                                to_email: formData.email,
                                                to_name: formData.name || "there",
                                                subject,
                                                body,
                                                template_id: template.id,
                                            });
                                            setSentTemplates(p => ({ ...p, [template.id]: "sent" }));
                                            toast({ title: "Email sent", description: `"${template.name}" delivered to ${formData.email}` });
                                            // Refresh activity timeline
                                            void queryClient.invalidateQueries({ queryKey: ["lead-timeline", formData.id] });
                                        } catch (err) {
                                            setSentTemplates(p => ({ ...p, [template.id]: "error" }));
                                            const msg = err instanceof Error ? err.message : "Send failed";
                                            toast({ variant: "destructive", title: "Send failed", description: msg });
                                        }
                                    };

                                    return (
                                        <Card
                                            key={template.id}
                                            className={cn(
                                                "border transition-colors group",
                                                hasSent ? "border-emerald-500/40 bg-emerald-500/5" : "hover:border-amber-500/30"
                                            )}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className="font-medium text-sm truncate">{template.name}</h4>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                                            Subject: {subject}
                                                        </div>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex gap-1 shrink-0">
                                                        {/* Copy */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7"
                                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(body, template.name); }}
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Copy body</TooltipContent>
                                                        </Tooltip>

                                                        {/* mailto */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7"
                                                                    onClick={(e) => { e.stopPropagation(); openMailClient(template); }}
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Open in mail client</TooltipContent>
                                                        </Tooltip>

                                                        {/* Send via Resend */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    className={cn(
                                                                        "h-7 w-7 transition-all",
                                                                        hasSent
                                                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                                                            : sendState === "error"
                                                                                ? "bg-red-500/20 text-red-400"
                                                                                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                                                                    )}
                                                                    disabled={!formData.email || isSending || isReadOnly}
                                                                    onClick={handleSend}
                                                                >
                                                                    {isSending ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : hasSent ? (
                                                                        <CheckCheck className="h-3 w-3" />
                                                                    ) : (
                                                                        <Send className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {hasSent ? "Sent ✓" : isSending ? "Sending…" : "Send via Resend"}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                                {/* Body preview */}
                                                <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                                                    {body}
                                                </p>

                                                {/* Sent confirmation */}
                                                {hasSent && (
                                                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-500">
                                                        <CheckCheck className="h-3 w-3" />
                                                        Sent to {formData.email}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-0 h-full">
                            <LeadTimeline leadId={formData.id} />
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="px-6 py-4 border-t border-zinc-800 shrink-0 gap-2">
                    {!isReadOnly && (
                        <>
                            {!isNewLead && <Button variant="destructive" onClick={() => onDelete(formData.id)} size="sm">Delete</Button>}
                            <Button onClick={handleSave} className="bg-[hsl(var(--brand-primary))]" size="sm">{isNewLead ? "Create Lead" : "Save Changes"}</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
