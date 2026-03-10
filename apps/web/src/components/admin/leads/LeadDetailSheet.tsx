
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leadStatusOptions } from "@/lib/validations";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadTimeline } from "@/components/admin/leads/LeadTimeline";
import { Mail, Phone, Calendar, MapPin, User, FileText, StickyNote, Copy, ExternalLink, Activity } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    service?: string;
    status: string;
    notes?: string;
    created_at?: string;
    message?: string;
}

interface LeadDetailSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (lead: Lead) => void;
    onDelete: (id: string) => void;
    isReadOnly?: boolean;
}

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
    const { toast } = useToast();
    const queryClient = useQueryClient();

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
        if (formData) {
            onSave(formData);
        }
    };

    const processTemplate = (templateBody: string, templateSubject: string) => {
        if (!formData) return { body: "", subject: "" };

        const body = templateBody
            .replace(/{{name}}/g, formData.name || "there")
            .replace(/{{service}}/g, formData.service || "your project");

        const subject = templateSubject
            .replace(/{{service}}/g, formData.service || "Project");

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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="text-xl font-display">Lead Details</SheetTitle>
                    <SheetDescription>View and manage lead information.</SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <TabsContent value="details" className="space-y-6 mt-0">
                            {/* Status Bar */}
                            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
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
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Date Received</div>
                                    <div className="font-medium text-sm">
                                        {formData.created_at ? format(new Date(formData.created_at), "PPP") : "N/A"}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm text-primary">
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
                                <h3 className="font-semibold flex items-center gap-2 text-sm text-primary">
                                    <FileText className="w-4 h-4" /> Project Interest
                                </h3>
                                <div className="grid gap-4 p-4 border rounded-lg bg-card">
                                    <div className="grid gap-2">
                                        <Label htmlFor="service">Interested Service</Label>
                                        <Input
                                            id="service"
                                            value={formData.service || ""}
                                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="message">Initial Message</Label>
                                        <div className="bg-muted p-3 rounded-md text-sm italic border">
                                            "{formData.message || "No message provided."}"
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm text-primary">
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
                        </TabsContent>

                        <TabsContent value="email" className="mt-0 space-y-4 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Quick Replies</h3>
                                <div className="text-xs text-muted-foreground">
                                    Click to copy or open in mail app
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {EMAIL_TEMPLATES.map(template => {
                                    const { body, subject } = processTemplate(template.body, template.subject);
                                    return (
                                        <Card key={template.id} className="hover:border-primary transition-colors cursor-pointer group">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-sm text-primary">{template.name}</h4>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); copyToClipboard(body, template.name); }} title="Copy Body">
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openMailClient(template); }} title="Open Mail Client">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium text-muted-foreground mb-1">Subject: {subject}</div>
                                                <p className="text-xs text-muted-foreground line-clamp-3 bg-muted p-2 rounded">
                                                    {body}
                                                </p>
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

                <SheetFooter className="px-6 py-4 border-t bg-muted/20 gap-2 shrink-0">
                    {!isReadOnly && (
                        <>
                            <Button variant="destructive" onClick={() => onDelete(formData.id)} size="sm">Delete</Button>
                            <Button onClick={handleSave} className="bg-[hsl(var(--brand-primary))]" size="sm">Save Changes</Button>
                        </>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
