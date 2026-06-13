import { useState, useEffect } from "react";
import { ModuleLayout, ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { Button } from "@/components/ui/primitives/button";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

const defaultAutoReplyHtml = `
<div style="font-family: sans-serif; color: #333;">
  <h2>Hi {{lead.name}},</h2>
  <p>Thank you for reaching out to Cross Angle Interior. We have received your inquiry regarding <strong>{{lead.service}}</strong>.</p>
  <p>Our team is reviewing your details and will get back to you within 24 hours to discuss how we can bring your vision to life.</p>
  <p>In the meantime, feel free to browse our <a href="https://crossangleinterior.com/portfolio">latest projects</a> for inspiration.</p>
  <br/>
  <p>Best regards,</p>
  <p><strong>The Cross Angle Team</strong></p>
  <p style="font-size: 12px; color: #888;">Jamshedpur, India</p>
</div>
`.trim();

const AdminEmailTemplates = () => {
    const { toast } = useToast();
    const { settings, refetch } = useSiteSettings();
    const [isSaving, setIsSaving] = useState(false);
    
    const [autoReplyHtml, setAutoReplyHtml] = useState(defaultAutoReplyHtml);
    const [weeklyReportHtml, setWeeklyReportHtml] = useState("Weekly Report templating is managed securely in code. Check back later for visual editor.");

    useEffect(() => {
        if (settings?.integrations) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const integrations = settings.integrations as any;
            if (integrations?.email_templates?.auto_reply_lead) {
                setAutoReplyHtml(integrations.email_templates.auto_reply_lead);
            }
        }
    }, [settings]);

    const handleSave = async () => {
        if (!settings) return;
        try {
            setIsSaving(true);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const integrations = (settings.integrations as any) || {};
            const updatedIntegrations = {
                ...integrations,
                email_templates: {
                    ...(integrations.email_templates || {}),
                    auto_reply_lead: autoReplyHtml
                }
            };

            const { error } = await supabase
                .from("site_settings")
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .update({ integrations: updatedIntegrations as any })
                .eq("id", settings.id);

            if (error) throw error;

            toast({ title: "Email templates updated successfully" });
            await refetch();
        } catch (error) {
            console.error("Failed to save email templates", error);
            toast({ title: "Failed to update templates", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 bg-admin-background min-h-screen text-admin-text">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Email Templates</h1>
                    <p className="text-admin-text-muted mt-1">Manage automated email notifications and auto-replies sent via Resend.</p>
                </div>
                <Button onClick={() => void handleSave()} disabled={isSaving} className="bg-admin-primary text-black">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Templates
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-2">Lead Auto-Reply Template</h2>
                        <p className="text-sm text-admin-text-muted mb-4">
                            This email is sent automatically to any lead that submits a contact form, discovery quiz, or cost estimator.
                        </p>

                        <div className="mb-4">
                            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted mb-2 block">
                                Available Variables:
                            </label>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-admin-background px-2 py-1 rounded border border-admin-border text-admin-primary">
                                    {`{{lead.name}}`}
                                </span>
                                <span className="bg-admin-background px-2 py-1 rounded border border-admin-border text-admin-primary">
                                    {`{{lead.email}}`}
                                </span>
                                <span className="bg-admin-background px-2 py-1 rounded border border-admin-border text-admin-primary">
                                    {`{{lead.phone}}`}
                                </span>
                                <span className="bg-admin-background px-2 py-1 rounded border border-admin-border text-admin-primary">
                                    {`{{lead.service}}`}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-admin-border overflow-hidden focus-within:ring-1 focus-within:ring-admin-primary">
                            <textarea
                                aria-label="Email template HTML"
                                value={autoReplyHtml}
                                onChange={(e) => setAutoReplyHtml(e.target.value)}
                                className="w-full h-[400px] p-4 bg-[#1e1e1e] text-green-400 font-mono text-sm border-none focus:outline-none resize-y"
                                spellCheck="false"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-2">Preview (Auto-Reply)</h2>
                        <div 
                            className="bg-white text-black p-4 rounded-lg border border-gray-200 text-sm overflow-auto"
                            style={{ maxHeight: '500px' }}
                            dangerouslySetInnerHTML={{ 
                                __html: autoReplyHtml
                                    .replace(/\{\{lead\.name\}\}/g, "John Doe")
                                    .replace(/\{\{lead\.service\}\}/g, "Kitchen Renovation")
                                    .replace(/\{\{lead\.email\}\}/g, "john@example.com")
                                    .replace(/\{\{lead\.phone\}\}/g, "+91 9876543210")
                            }}
                        />
                    </div>
                    
                    <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-2">Weekly Report</h2>
                        <p className="text-sm text-admin-text-muted mb-4">
                            The weekly summary email uses a highly complex compiled HTML structure that must be edited carefully in the codebase to avoid breaking mobile responsiveness.
                        </p>
                        <Button variant="outline" className="w-full text-xs" disabled>
                            Managed internally
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmailTemplates;
