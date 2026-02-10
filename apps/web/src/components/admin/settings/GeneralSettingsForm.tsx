
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
import { Loader2, Save, Globe, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

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
            address: "",
            social_facebook: "",
            social_instagram: "",
            social_twitter: "",
            social_linkedin: "",
        },
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsFetching(true);
            const { data, error } = await supabase
                .from("site_content")
                .select("*")
                .eq("section_key", "settings")
                .single();

            if (error && error.code !== "PGRST116") { // PGRST116 is "Row not found"
                throw error;
            }

            if (data) {
                form.reset({
                    site_name: data.title || "",
                    site_description: data.content || "",
                    contact_email: (data.metadata as any)?.contact_email || "",
                    contact_phone: (data.metadata as any)?.contact_phone || "",
                    address: (data.metadata as any)?.address || "",
                    social_facebook: (data.metadata as any)?.social_facebook || "",
                    social_instagram: (data.metadata as any)?.social_instagram || "",
                    social_twitter: (data.metadata as any)?.social_twitter || "",
                    social_linkedin: (data.metadata as any)?.social_linkedin || "",
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

            const { data: userData } = await supabase.auth.getUser();

            const metadata = {
                contact_email: values.contact_email,
                contact_phone: values.contact_phone,
                address: values.address,
                social_facebook: values.social_facebook,
                social_instagram: values.social_instagram,
                social_twitter: values.social_twitter,
                social_linkedin: values.social_linkedin,
            };

            // Check if exists first (upsert)
            const { error } = await supabase
                .from("site_content")
                .upsert({
                    section_key: "settings",
                    title: values.site_name,
                    content: values.site_description,
                    metadata: metadata,
                    updated_by: userData.user?.id,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "section_key" });

            if (error) throw error;

            toast({
                title: "Settings saved",
                description: "Your site settings have been updated successfully.",
            });
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to save settings.",
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
