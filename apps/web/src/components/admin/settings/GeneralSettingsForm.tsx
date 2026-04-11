
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsSchema, SiteSettingsFormData } from "@/lib/validations";
import { Loader2, Save, Globe, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle } from "lucide-react";

const PinterestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="12" x2="12" y2="22" />
        <path d="M12 2C6.5 2 2 6.5 2 12c0 4.3 2.7 8 6.5 9.5" />
        <path d="M12 12c.5-1.5 1.5-2.5 2.5-2.5" />
        <path d="M14.5 9.5c1.5 0 2.5 1.5 2.5 3.5 0 2.5-2 4-4.5 4-2.5 0-3.5-1.5-3.5-3.5 0-3 3-5 5-5" />
    </svg>
);

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

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
                    });
                error = insertError;
            }

            if (error) throw error;

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Globe className="text-blue-600 h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">General Information</CardTitle>
                                <CardDescription>Basic information about your website.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-4">
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
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Used for meta tags and SEO purposes.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Phone className="text-green-600 h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Contact Information</CardTitle>
                                <CardDescription>How customers can reach you.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-4 md:grid-cols-2">
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
                        <div className="md:col-span-2">
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
                    </CardContent>
                </Card>

                <Card className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Globe className="text-indigo-600 h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Social Media</CardTitle>
                                <CardDescription>Links to your social media profiles.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-4 md:grid-cols-2">
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
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isLoading} className="bg-[hsl(var(--brand-primary))]">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
