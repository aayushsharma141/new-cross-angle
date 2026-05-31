
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/primitives/form";
import { Card, CardContent } from "@/components/ui/primitives/card";
import { AdminFormCard } from "@/components/admin/shared";
import { useToast } from "@/hooks/useToast";
import { auditService } from "@/services/AuditService";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsSchema, SiteSettingsFormData } from "@/lib/validation/validations";
import { Loader2, Save, Globe, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Plus, Trash2, Send, Clock } from "lucide-react";

const PinterestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="12" x2="12" y2="22" />
        <path d="M12 2C6.5 2 2 6.5 2 12c0 4.3 2.7 8 6.5 9.5" />
        <path d="M12 12c.5-1.5 1.5-2.5 2.5-2.5" />
        <path d="M14.5 9.5c1.5 0 2.5 1.5 2.5 3.5 0 2.5-2 4-4.5 4-2.5 0-3.5-1.5-3.5-3.5 0-3 3-5 5-5" />
    </svg>
);

import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

/* ─── Sub-component: Telegram Chat IDs ────────────────────────────────────
 * useState must be called at the top level of a React function component.
 * Previously it was called inside a FormField render callback (invalid hook
 * usage). This dedicated component fixes that violation.
 * ────────────────────────────────────────────────────────────────────────── */
import type { ControllerRenderProps, Control } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

function TelegramChatIdsField({ field }: { field: ControllerRenderProps<SiteSettingsFormData, "telegram_chat_ids"> }) {
    const ids: string[] = field.value ?? [];
    const [newId, setNewId] = useState("");

    const addId = () => {
        const trimmed = newId.trim();
        if (!trimmed || ids.includes(trimmed)) return;
        field.onChange([...ids, trimmed]);
        setNewId("");
    };

    const removeId = (idx: number) => {
        field.onChange(ids.filter((_, i) => i !== idx));
    };

    return (
        <FormItem>
            <FormLabel className="flex items-center gap-2">
                <Send className="h-4 w-4 text-[#229ED9]" />
                Chat IDs
            </FormLabel>
            <FormDescription className="text-xs">
                Get your chat ID by messaging{" "}
                <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#229ED9] hover:underline"
                >
                    @userinfobot
                </a>{" "}
                on Telegram. Use negative IDs for groups/channels (e.g. <code>-1001234567890</code>).
            </FormDescription>

            {/* Existing IDs list */}
            <div className="space-y-2">
                {ids.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">
                        No chat IDs configured — add one below.
                    </p>
                )}
                {ids.map((id, idx) => (
                    <div
                        key={id}
                        className="flex items-center gap-2 rounded-md border border-[hsl(var(--admin-border))] bg-muted/20 px-3 py-2"
                    >
                        <Send className="h-3.5 w-3.5 shrink-0 text-[#229ED9]" />
                        <code className="flex-1 text-sm font-mono">{id}</code>
                        <button
                            type="button"
                            onClick={() => removeId(idx)}
                            className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded"
                            aria-label={`Remove chat ID ${id}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new ID */}
            <div className="flex gap-2 pt-1">
                <Input
                    placeholder="e.g. 1228126069 or -1001234567890"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addId();
                        }
                    }}
                    className="font-mono text-sm"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addId}
                    disabled={!newId.trim()}
                    className="shrink-0 gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </Button>
            </div>
            <FormMessage />
        </FormItem>
    );
}

function OfficeHoursField({ control }: { control: Control<SiteSettingsFormData> }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "office_hours",
    });

    return (
        <FormItem>
            <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Office / Studio Hours
            </FormLabel>
            <FormDescription className="text-xs">
                Manage your visible office timings. These will be shown on the contact page.
            </FormDescription>

            <div className="space-y-3">
                {fields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">
                        No office hours configured — add one below.
                    </p>
                )}
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                        <FormField
                            control={control}
                            name={`office_hours.${index}.days`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="e.g. Mon - Sat" {...field} className="h-9" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`office_hours.${index}.hours`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="e.g. 9 AM - 7 PM" {...field} className="h-9" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 h-9 w-9 text-destructive hover:text-destructive/80"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="pt-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: crypto.randomUUID(), days: "", hours: "" })}
                    className="gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Hours
                </Button>
            </div>
            <FormMessage />
        </FormItem>
    );
}

export function GeneralSettingsForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const form = useForm<SiteSettingsFormData>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: {
            site_name: "",
            site_description: "",
            contact_email: "",
            contact_phone: "",
            contact_whatsapp: "",
            about_video_url: "",
            address: "",
            social_facebook: "",
            social_instagram: "",
            social_twitter: "",
            social_linkedin: "",
            social_youtube: "",
            social_pinterest: "",
            telegram_chat_ids: [],
            office_hours: [],
        },
    });

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSettings = async () => {
        try {
            setIsFetching(true);
            const { data, error } = await supabase
                .from("site_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (data) {
                const socialLinks = data.social_links as Record<string, string> || {};
                form.reset({
                    site_name: data.studio_name || "",
                    site_description: data.seo_description || "",
                    contact_email: data.email || "",
                    contact_phone: data.phone || "",
                    contact_whatsapp: (data as { whatsapp?: string }).whatsapp || "",
                    about_video_url: (data as { about_video_url?: string }).about_video_url || "",
                    address: data.address || "",
                    social_facebook: socialLinks.facebook || "",
                    social_instagram: socialLinks.instagram || "",
                    social_twitter: socialLinks.twitter || "",
                    social_linkedin: socialLinks.linkedin || "",
                    social_youtube: socialLinks.youtube || "",
                    social_pinterest: socialLinks.pinterest || "",
                    telegram_chat_ids: (data as { telegram_chat_ids?: string[] }).telegram_chat_ids || [],
                    office_hours: Array.isArray(data.business_hours) ? data.business_hours as { id: string; days: string; hours: string; }[] : [],
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load settings.",
            });
        } finally {
            setIsFetching(false);
        }
    };

    const onSubmit = async (values: SiteSettingsFormData) => {
        try {
            setIsLoading(true);

            const socialLinks = {
                facebook: values.social_facebook,
                instagram: values.social_instagram,
                twitter: values.social_twitter,
                linkedin: values.social_linkedin,
                youtube: values.social_youtube,
                pinterest: values.social_pinterest,
            };

            // Check if a row exists to decide between insert and update, 
            // but since it's a singleton with a unique index, we can just upsert if we had a fixed ID or constraint.
            // However, the unique index is on ((TRUE)).
            // Let's first check if we have an ID from fetching.
            // Actually, simpler to just get the existing row again or assume one exists if we seeded it.
            // The migration adds a constraint so there is only one row.

            // We can just update if it exists, or insert if not.
            const { data: existingData } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

            let error;
            if (existingData) {
                const { error: updateError } = await supabase
                    .from("site_settings")
                    .update({
                        studio_name: values.site_name,
                        seo_description: values.site_description,
                        email: values.contact_email,
                        phone: values.contact_phone,
                        whatsapp: values.contact_whatsapp || null,
                        about_video_url: values.about_video_url || null,
                        address: values.address,
                        social_links: socialLinks,
                        telegram_chat_ids: values.telegram_chat_ids,
                        business_hours: values.office_hours as unknown as Record<string, unknown>,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingData.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("site_settings")
                    .insert({
                        studio_name: values.site_name,
                        seo_description: values.site_description,
                        email: values.contact_email,
                        phone: values.contact_phone,
                        whatsapp: values.contact_whatsapp || null,
                        about_video_url: values.about_video_url || null,
                        address: values.address,
                        social_links: socialLinks,
                        telegram_chat_ids: values.telegram_chat_ids,
                        business_hours: values.office_hours as unknown as Record<string, unknown>,
                    });
                error = insertError;
            }

            if (error) throw error;

            void auditService.writeAudit(
                'UPDATE',
                'settings',
                existingData?.id || null,
                { action: 'update_general_settings' }
            );

            toast({
                title: "Settings saved",
                description: "Your site settings have been updated successfully.",
            });
        } catch (error) {
            const err = error as Error;
            console.error("Error saving settings:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to save settings.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useKeyboardShortcut("s", (e) => {
        form.handleSubmit(onSubmit)();
    }, { ctrl: true });

    if (isFetching) {
        return (
            <Card className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]">
                <CardContent className="p-8 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form id="general-settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid lg:grid-cols-2 gap-4">
                <AdminFormCard title="General Information" icon={Globe} iconClassName="text-blue-500" contentClassName="grid gap-3">
                        <FormField
                            control={form.control}
                            name="site_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Awesome Website" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="site_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="A brief description of your site for SEO..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                </AdminFormCard>

                <AdminFormCard title="Contact Information" icon={Phone} iconClassName="text-green-500" contentClassName="grid gap-3 grid-cols-2">
                        <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="contact@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Phone
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 (555) 000-0000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact_whatsapp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="919999999999 (country code + number, no +)" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Used for the WhatsApp chat button. Enter digits only (e.g. 917909041132)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="about_video_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> About Video URL
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://www.youtube.com/embed/..." {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Embed URL for the About page video (e.g., YouTube embed link)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Address
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St, City, Country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Office Hours */}
                        <div className="col-span-2 pt-2">
                            <OfficeHoursField control={form.control} />
                        </div>
                </AdminFormCard>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                <AdminFormCard title="Social Media" icon={Globe} iconClassName="text-indigo-500" contentClassName="grid gap-3 grid-cols-2">
                        <FormField
                            control={form.control}
                            name="social_facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Facebook className="w-4 h-4" /> Facebook
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://facebook.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Instagram className="w-4 h-4" /> Instagram
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://instagram.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_twitter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Twitter className="w-4 h-4" /> Twitter (X)
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://twitter.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Linkedin className="w-4 h-4" /> LinkedIn
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_youtube"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Youtube className="w-4 h-4" /> YouTube
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://youtube.com/@..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_pinterest"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <PinterestIcon /> Pinterest
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://pinterest.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                </AdminFormCard>

                {/* ─── Telegram Notifications ─────────────────────────────── */}
                <AdminFormCard title="Telegram Notifications" icon={Send} iconClassName="text-[#229ED9]" contentClassName="space-y-3">
                        <FormField
                            control={form.control}
                            name="telegram_chat_ids"
                            render={({ field }) => (
                                <TelegramChatIdsField field={field} />
                            )}
                        />
                </AdminFormCard>
                </div>

            </form>
        </Form>
    );
}
