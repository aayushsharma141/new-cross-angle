import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

import {
    Sheet,
    SheetContent,
} from "@/components/ui/primitives/sheet";
import { Button } from "@/components/ui/primitives/button";
import { Label } from "@/components/ui/primitives/label";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { leadSchema, formatZodErrors } from "@/lib/validation/validations";
import { useState, useEffect, useRef, useCallback } from "react";
import FocusLock from "react-focus-lock";
import { LeadTimeline } from "@/components/admin/leads/LeadTimeline";
import {
  Mail, Phone, Copy,
  CheckCircle2,
  Clock,
  Send, Loader2, CheckCheck, MessageCircle, Trash2,
  ChevronDown, Target, AlertTriangle, Lightbulb, Info,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";
import type { Lead } from "@/lib/scoring/leadScoring";
import { cn } from "@/lib/utils";
import { useSendEmail } from "@/hooks/useSendEmail";
import { CRM_STAGES, CRM_STAGE_LABELS, isCrmStageId, type CrmStageId, FOLLOW_UP_SLA, STAGE_PLAYBOOK, STAGE_SUB_STATUSES } from "@/lib/crm/stages";
import { getCrmSourceLabel } from "@/lib/crm/sources";
import { LeadTaskList } from "@/components/admin/leads/LeadTaskList";
import { ObjectionTracker } from "@/components/admin/leads/ObjectionTracker";

interface LeadDetailSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (lead: Lead) => void;
    onDelete?: (id: string) => void;
    isReadOnly?: boolean;
}

type DetailTab = "activity" | "details" | "tasks" | "email";

const NEXT_ACTION_BY_STAGE: Record<CrmStageId, string> = {
    new: "Send the initial response and confirm project basics.",
    in_conversation: "Capture budget, city, and preferred meeting time.",
    meeting_planned: "Prepare the meeting agenda and project references.",
    quote_sent: "Follow up on quote feedback and decision timing.",
    closing: "Confirm the final blocker, owner, and next step.",
    won: "Add a closing note and hand off to delivery.",
    lost: "Record the loss reason for win/loss reporting.",
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

export function LeadDetailSheet({ lead, open, onOpenChange, onSave, onDelete, isReadOnly = false }: LeadDetailSheetProps) {
    const [formData, setFormData] = useState<Lead | null>(null);
    const [sentTemplates, setSentTemplates] = useState<Record<string, "sending" | "sent" | "error">>({});
    const [activeTab, setActiveTab] = useState<DetailTab>("activity");
    const [showPlaybook, setShowPlaybook] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isNewLead = formData?.id === "__new__";
    const sendEmailMutation = useSendEmail();

    const hasLoggedViewRef = useRef(false);

    useEffect(() => {
        if (lead) {
            setFormData({ ...lead, status: isCrmStageId(lead.status) ? lead.status : "new" });
            setActiveTab(lead.id === "__new__" ? "details" : "activity");
            hasLoggedViewRef.current = false;
        }
    }, [lead]);

    useEffect(() => {
        if (!open) {
            hasLoggedViewRef.current = false;
        }
    }, [open]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logActivity = useCallback(async (type: string, description: string, metadata: any = {}) => {
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
            queryClient.invalidateQueries({ queryKey: ['lead-timeline', formData.id] });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    }, [formData?.id, queryClient]);

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

    const setStage = (stage: CrmStageId) => {
        if (!formData || isReadOnly) return;
        setFormData({ ...formData, status: stage });
    };

    const activeStage: CrmStageId = formData && isCrmStageId(formData.status) ? formData.status : "new";

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

    // Log view activity when sheet opens for an existing lead
    useEffect(() => {
        if (open && formData?.id && formData.id !== "__new__" && !hasLoggedViewRef.current) {
            hasLoggedViewRef.current = true;
            logActivity("lead_viewed", "Viewed lead details");
        }
    }, [open, formData?.id, logActivity]);

    if (!formData) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="admin-theme w-[95vw] sm:max-w-[880px] p-0 flex flex-col h-full bg-admin-bg border-l border-admin-border gap-0 z-[100] shadow-2xl text-admin-text">
                <FocusLock returnFocus className="flex flex-col h-full overflow-hidden">
                {/* Stage progress */}
                <div className="px-5 pt-4 pb-3 border-b border-admin-border">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[11px] text-admin-text-muted flex items-center gap-2">
                            <span>Lead in <span className="text-admin-text font-medium">{CRM_STAGE_LABELS[activeStage] || "New Inquiry"}</span></span>
                            {STAGE_SUB_STATUSES[activeStage]?.length > 0 && (
                                <>
                                    <span className="text-admin-border-subtle">â€¢</span>
                                    <select
                                        value={formData.sub_status || ""}
                                        onChange={(e) => setFormData({ ...formData, sub_status: e.target.value })}
                                        disabled={isReadOnly}
                                        title="Sub-status"
                                        aria-label="Sub-status"
                                        className="bg-transparent text-admin-text border-none focus:ring-0 text-[11px] font-medium p-0 cursor-pointer w-auto pr-4"
                                    >
                                        <option value="" className="bg-admin-surface text-admin-text-muted">- Set Sub-status -</option>
                                        {STAGE_SUB_STATUSES[activeStage].map(sub => (
                                            <option key={sub} value={sub} className="bg-admin-surface text-admin-text">{sub}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Stage stepper */}
                    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                        {CRM_STAGES.map((stage, idx) => {
                            const isActive = activeStage === stage.id;
                            const activeIndex = CRM_STAGES.findIndex(s => s.id === activeStage);
                            const isPast = activeIndex > idx; // strictly past
                            const isCompleted = isPast;

                            return (
                                <div key={stage.id} className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setStage(stage.id)}
                                        disabled={isReadOnly}
                                        className={cn(
                                            "flex items-center gap-1.5 h-7 px-3 rounded-md text-[11px] whitespace-nowrap transition-all border",
                                            isActive 
                                                ? "bg-blue-500/20 border-blue-500/40 text-blue-100 font-medium shadow-sm" 
                                                : isCompleted 
                                                    ? "bg-blue-500/5 border-blue-500/15 text-blue-300 hover:bg-blue-500/10" 
                                                    : "bg-admin-surface border-admin-border text-admin-text-subtle hover:text-admin-text-muted hover:border-admin-border-subtle"
                                        )}
                                    >
                                        {isActive ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
                                        ) : isCompleted ? (
                                            <CheckCircle2 className="w-3 h-3 text-blue-400/80" />
                                        ) : null}
                                        {stage.shortLabel}
                                    </button>
                                    {idx < CRM_STAGES.length - 1 && (
                                        <div className={cn(
                                            "w-3 h-px mx-1",
                                            activeIndex >= idx + 1 ? "bg-blue-500/30" : "bg-admin-border"
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Header: name + actions */}
                <div className="px-5 py-4 border-b border-admin-border flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 uppercase">
                                {formData.source ? getCrmSourceLabel(formData.source) : "MANUAL"}
                            </span>
                            {formData.score !== undefined && (
                                <span className={cn(
                                    "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider",
                                    (formData.score ?? 0) >= 70 ? "text-rose-300 bg-rose-500/10 border-rose-500/20" :
                                    (formData.score ?? 0) >= 40 ? "text-amber-300 bg-amber-500/10 border-amber-500/20" :
                                    "text-blue-300 bg-blue-500/10 border-blue-500/20"
                                )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm",
                                        (formData.score ?? 0) >= 70 ? "bg-[#EF4444]" :
                                        (formData.score ?? 0) >= 40 ? "bg-[#F59E0B]" :
                                        "bg-[#3B82F6]"
                                    )} />
                                    {(formData.score ?? 0) >= 70 ? "Hot" : (formData.score ?? 0) >= 40 ? "Warm" : "Cold"}
                                </span>
                            )}
                        </div>
                        {isNewLead ? (
                            <Input
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter lead name"
                                className="text-[20px] font-semibold text-admin-text h-9 mt-1 bg-transparent border-admin-border-subtle focus-visible:ring-1 px-1 -ml-1"
                            />
                        ) : (
                            <h2 className="text-[20px] font-semibold text-admin-text leading-tight">
                                {formData.name || "Unknown Lead"}
                            </h2>
                        )}
                        <div className="mt-2 text-[12px] text-admin-text-muted flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3" />
                                {isNewLead ? (
                                    <Input
                                        value={formData.phone || ""}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Phone number"
                                        className="h-7 text-[12px] bg-transparent border-admin-border-subtle w-32 px-1 -ml-1"
                                    />
                                ) : (
                                    formData.phone || "No phone"
                                )}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3" />
                                {isNewLead ? (
                                    <Input
                                        value={formData.email || ""}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Email address"
                                        className="h-7 text-[12px] bg-transparent border-admin-border-subtle w-48 px-1 -ml-1"
                                    />
                                ) : (
                                    formData.email || "No email"
                                )}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 shrink-0 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </span>
                                {isNewLead ? (
                                    <Input
                                        value={formData.city || ""}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="City / Location"
                                        className="h-7 text-[12px] bg-transparent border-admin-border-subtle w-32 px-1 -ml-1"
                                    />
                                ) : (
                                    formData.city || "No location"
                                )}
                            </span>
                        </div>
                    </div>
                    {!isNewLead && (
                        <div className="flex items-center gap-1.5 shrink-0 mt-8">
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 text-[12px] font-medium" onClick={() => formData.phone && window.open(`tel:${formData.phone}`, '_blank')}>
                                <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-md bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/30 text-teal-300 text-[12px] font-medium" onClick={() => {
                                const cleanPhone = formData.phone?.replace(/\D/g, "");
                                if (cleanPhone) window.open(`https://wa.me/${cleanPhone}`, '_blank');
                            }}>
                                <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300 text-[12px] font-medium" onClick={() => setActiveTab("email")}>
                                <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
                            </Button>
                        </div>
                    )}
                </div>

                {/* NEXT ACTION banner */}
                {!isNewLead && NEXT_ACTION_BY_STAGE[activeStage] && (
                    <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold mb-0.5">Recommended Action</div>
                            <div className="text-[14px] text-white font-medium">{NEXT_ACTION_BY_STAGE[activeStage]}</div>
                            {FOLLOW_UP_SLA[activeStage]?.hours > 0 && (
                                <div className="text-[11px] text-amber-200/70 mt-1 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> Follow up within <span className="font-semibold text-amber-200">{FOLLOW_UP_SLA[activeStage].label}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stage Playbook Guide */}
                {!isNewLead && STAGE_PLAYBOOK[activeStage] && (
                    <div className="mx-5 mt-2">
                        <button
                            type="button"
                            onClick={() => setShowPlaybook(!showPlaybook)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-admin-text-muted hover:text-admin-text hover:bg-white/[0.03] transition-colors"
                        >
                            <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Stage Guide: {CRM_STAGE_LABELS[activeStage]}</span>
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showPlaybook && "rotate-180")} />
                        </button>
                        {showPlaybook && (
                            <div className="mt-1 p-3 rounded-lg bg-admin-bg border border-admin-border grid grid-cols-2 gap-3 text-[11px] animate-in fade-in slide-in-from-top-1 duration-200">
                                <div>
                                    <div className="text-admin-text-subtle uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><Target className="w-3 h-3" /> Goal</div>
                                    <div className="text-white">{STAGE_PLAYBOOK[activeStage].goal}</div>
                                </div>
                                <div>
                                    <div className="text-admin-text-subtle uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Exit Criteria</div>
                                    <div className="text-white">{STAGE_PLAYBOOK[activeStage].exitCriteria}</div>
                                </div>
                                <div>
                                    <div className="text-admin-text-subtle uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Common Mistake</div>
                                    <div className="text-amber-200/80">{STAGE_PLAYBOOK[activeStage].commonMistake}</div>
                                </div>
                                <div>
                                    <div className="text-admin-text-subtle uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><Lightbulb className="w-3 h-3 text-blue-400" /> What This Means</div>
                                    <div className="text-blue-200/80">{STAGE_PLAYBOOK[activeStage].meaning}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div className="mt-4 px-5 border-b border-admin-border flex items-center gap-1 shrink-0">
                    <button 
                        onClick={() => setActiveTab("details")}
                        className={cn("h-9 px-3 text-[12px] font-medium -mb-px transition-colors", activeTab === "details" ? "text-admin-text border-b-2 border-admin-primary" : "text-admin-text-muted hover:text-admin-text")}>
                        Details
                    </button>
                    {!isNewLead && (
                        <button 
                            onClick={() => setActiveTab("activity")}
                            className={cn("h-9 px-3 text-[12px] font-medium -mb-px transition-colors", activeTab === "activity" ? "text-admin-text border-b-2 border-admin-primary" : "text-admin-text-muted hover:text-admin-text")}>
                            Activity
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveTab("email")}
                        className={cn("h-9 px-3 text-[12px] font-medium -mb-px transition-colors", activeTab === "email" ? "text-admin-text border-b-2 border-admin-primary" : "text-admin-text-muted hover:text-admin-text")}>
                        Email Drafts
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-admin-card">
                    
                    {activeTab === "details" && (
                        <>
                            {/* Project Section */}
                            <section>
                                <h4 className="text-[11px] uppercase tracking-wider text-admin-text-subtle mb-2 font-semibold">Project</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-admin-surface border border-admin-border rounded-md p-3">
                                        <Label className="text-[10px] text-admin-text-subtle uppercase tracking-wider mb-1 block">Type</Label>
                                        <Input
                                            value={formData.category || ""}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            readOnly={isReadOnly}
                                            placeholder="e.g. Living Room + Kitchen"
                                            className="h-8 text-[13px] text-admin-text bg-transparent border-0 px-0 focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="bg-admin-surface border border-admin-border rounded-md p-3">
                                        <Label className="text-[10px] text-admin-text-subtle uppercase tracking-wider mb-1 block">Budget</Label>
                                        <Input
                                            value={formData.budget || ""}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            readOnly={isReadOnly}
                                            placeholder="e.g. â‚¹3 - 5 L"
                                            className="h-8 text-[13px] text-admin-text bg-transparent border-0 px-0 focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="bg-admin-surface border border-admin-border rounded-md p-3">
                                        <Label className="text-[10px] text-admin-text-subtle uppercase tracking-wider mb-1 block">Move-in by</Label>
                                        <Input
                                            value={formData.timeline || ""}
                                            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                            readOnly={isReadOnly}
                                            placeholder="e.g. August 2026"
                                            className="h-8 text-[13px] text-admin-text bg-transparent border-0 px-0 focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="bg-admin-surface border border-admin-border rounded-md p-3">
                                        <Label className="text-[10px] text-admin-text-subtle uppercase tracking-wider mb-1 block">Assigned to</Label>
                                        <div className="text-[13px] text-admin-text-muted mt-1 h-8 flex items-center">
                                            Auto-assigned
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Source Section */}
                            <section>
                                <h4 className="text-[11px] uppercase tracking-wider text-admin-text-subtle mb-2 font-semibold">Source</h4>
                                <div className="bg-admin-surface border border-admin-border rounded-md p-3">
                                    <div className="text-[13px] text-admin-text mb-1">
                                        {formData.source ? getCrmSourceLabel(formData.source) : "Manual Entry"}
                                    </div>
                                    <div className="text-[11px] text-admin-text-muted">
                                        Added on {formData.created_at ? format(new Date(formData.created_at), "PPP 'at' p") : "Just now"}
                                    </div>
                                </div>
                            </section>

                            {/* Notes / Message Section */}
                            <section>
                                <h4 className="text-[11px] uppercase tracking-wider text-admin-text-subtle mb-2 font-semibold">Internal Notes & Message</h4>
                                <Textarea
                                    value={formData.message || formData.notes || ""}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    readOnly={isReadOnly}
                                    placeholder="Add notes, requirements, or copy their initial message here..."
                                    className="min-h-[120px] bg-admin-surface border-admin-border text-[13px] text-admin-text placeholder:text-admin-text-subtle"
                                />
                            </section>

                            {/* Objection Tracker Section */}
                            {!isNewLead && (
                                <section className="pt-4 border-t border-admin-border">
                                    <ObjectionTracker leadId={formData.id} isReadOnly={isReadOnly} />
                                </section>
                            )}
                        </>
                    )}

                    {activeTab === "tasks" && !isNewLead && (
                        <div className="bg-admin-surface rounded-md border border-admin-border p-4 h-full">
                            <LeadTaskList leadId={formData.id} isReadOnly={isReadOnly} />
                        </div>
                    )}

                    {activeTab === "activity" && !isNewLead && (
                        <div className="bg-admin-surface rounded-md border border-admin-border p-4 h-full min-h-[300px]">
                            <LeadTimeline leadId={formData.id} />
                        </div>
                    )}

                    {activeTab === "email" && (
                         <div className="space-y-4">
                            {EMAIL_TEMPLATES.map(template => {
                                const { body, subject } = processTemplate(template.body, template.subject);
                                const sendState = sentTemplates[template.id];
                                
                                return (
                                    <div key={template.id} className="bg-admin-surface rounded-md border border-admin-border overflow-hidden">
                                        <div className="bg-admin-surface-hover px-4 py-3 border-b border-admin-border flex justify-between items-center">
                                            <div className="font-semibold text-[13px] text-admin-text flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-admin-text-muted" />
                                                {template.name}
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold uppercase text-admin-text-muted hover:text-admin-text" onClick={() => copyToClipboard(body, template.name)}>
                                                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Draft
                                            </Button>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="text-[13px] font-medium text-admin-text">
                                                <span className="text-admin-text-subtle mr-2">Subject:</span> {subject}
                                            </div>
                                            <div className="text-[13px] text-admin-text-muted whitespace-pre-wrap bg-admin-card p-3 rounded border border-admin-border leading-relaxed">
                                                {body}
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <Button 
                                                    size="sm" 
                                                    className={cn(
                                                        "h-8 px-4 text-[12px] font-semibold transition-all",
                                                        sendState === "sent" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-admin-primary text-black hover:bg-admin-primary-hover"
                                                    )}
                                                    onClick={() => {
                                                        if (!formData?.email) {
                                                            toast({ variant: "destructive", title: "Missing Email", description: "Cannot send email without an address." });
                                                            return;
                                                        }
                                                        setSentTemplates(prev => ({ ...prev, [template.id]: "sending" }));
                                                        sendEmailMutation.mutate(
                                                            {
                                                                lead_id: formData.id,
                                                                to_email: formData.email,
                                                                to_name: formData.name || "there",
                                                                subject,
                                                                body,
                                                                template_id: template.id,
                                                            },
                                                            {
                                                                onSuccess: () => {
                                                                    setSentTemplates(prev => ({ ...prev, [template.id]: "sent" }));
                                                                    logActivity("email_sent", `Sent email template: ${template.name}`, { template: template.name, subject });
                                                                    toast({ title: "Email Sent", description: `Sent to ${formData.email}` });
                                                                },
                                                                onError: () => setSentTemplates(prev => ({ ...prev, [template.id]: "error" }))
                                                            }
                                                        );
                                                    }}
                                                    disabled={sendState === "sending" || sendState === "sent" || !formData?.email}
                                                >
                                                    {sendState === "sending" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : 
                                                     sendState === "sent" ? <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> : 
                                                     <Send className="w-3.5 h-3.5 mr-1.5" />}
                                                    {sendState === "sending" ? "Sending..." : sendState === "sent" ? "Sent Successfully" : "Send via CrossAngle"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-admin-border bg-admin-surface px-5 py-4 flex items-center justify-between shrink-0">
                    <div className="text-[11px] text-admin-text-subtle">
                        {isNewLead ? "New Lead Entry" : "Editing Lead Details"}
                    </div>
                    <div className="flex items-center gap-2">
                        {onDelete && !isNewLead && (
                            <Button variant="ghost" className="h-9 px-3 rounded-md text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => onDelete(formData.id || "")}>
                                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                            </Button>
                        )}
                        <Button variant="ghost" className="h-9 px-4 rounded-md text-[13px] font-medium text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-hover" onClick={() => onOpenChange(false)}>
                            Discard
                        </Button>
                        {!isReadOnly && (
                            <Button className="h-9 px-5 rounded-md bg-admin-primary hover:bg-admin-primary-hover text-black text-[13px] font-bold shadow-md" onClick={handleSave}>
                                Save changes
                            </Button>
                        )}
                    </div>
                </div>
                </FocusLock>
            </SheetContent>
        </Sheet>
    );
}
