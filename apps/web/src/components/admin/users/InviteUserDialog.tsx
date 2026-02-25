
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "editor", "viewer"]).default("editor"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: "",
            role: "editor",
        },
    });

    const onSubmit = async (values: InviteFormValues) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke("invite-user", {
                body: { email: values.email, role: values.role },
            });

            if (error) {
                throw new Error(error.message || "Failed to invite user");
            }

            if (data?.error) {
                throw new Error(data.error);
            }

            toast({
                title: "Invitation sent",
                description: `Successfully invited ${values.email} as ${values.role}. They will receive an email shortly.`,
            });

            form.reset();
            onOpenChange(false);
            onSuccess();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Invite error:", error);
            toast({
                title: "Invitation failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Teammate</DialogTitle>
                    <DialogDescription>
                        Invite a new administrator to collaborate. They will receive an email with login instructions.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="colleague@example.com" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Super Admin</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inviting...
                                    </>
                                ) : (
                                    "Send Invitation"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
