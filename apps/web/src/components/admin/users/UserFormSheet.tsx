import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    ASSIGNABLE_ROLES,
    AppRole,
    ROLE_DESCRIPTIONS,
    ROLE_LABELS,
    normalizeRole,
} from "@/lib/auth/rbac";
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

const ACTIVE_STATUSES = ["active", "inactive"] as const;

const userFormSchema = z.object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    role: z.enum(["super_admin", "admin", "viewer"]),
    status: z.enum(ACTIVE_STATUSES).default("active"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export interface AdminUserRecord {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    email: string | null;
    role: string | null;
    status: string | null;
    created_at: string | null;
    last_sign_in_at: string | null;
    deleted_at?: string | null;
}

interface UserFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    mode: "add" | "edit";
    actorRole: AppRole | null;
    user?: AdminUserRecord | null;
}

function getAllowedRoles(actorRole: AppRole | null): readonly AppRole[] {
    return ASSIGNABLE_ROLES[normalizeRole(actorRole)];
}

function getDefaultRole(actorRole: AppRole | null, user?: AdminUserRecord | null): AppRole {
    const allowedRoles = getAllowedRoles(actorRole);
    const currentRole = normalizeRole(user?.role);

    if (allowedRoles.includes(currentRole)) {
        return currentRole;
    }

    return allowedRoles[0] ?? "viewer";
}

export function UserFormSheet({
    open,
    onOpenChange,
    onSuccess,
    mode,
    actorRole,
    user,
}: UserFormSheetProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const allowedRoles = useMemo(() => getAllowedRoles(actorRole), [actorRole]);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            role: getDefaultRole(actorRole, user),
            status: "active",
        },
    });

    useEffect(() => {
        form.reset({
            fullName: user?.full_name ?? "",
            email: user?.email ?? "",
            role: getDefaultRole(actorRole, user),
            status: user?.status === "inactive" ? "inactive" : "active",
        });
    }, [actorRole, form, mode, open, user]);

    const onSubmit = async (values: UserFormValues) => {
        setIsSubmitting(true);

        try {
            if (mode === "add") {
                const { data, error } = await supabase.functions.invoke("invite-user", {
                    body: {
                        email: values.email,
                        role: values.role,
                        fullName: values.fullName,
                    },
                });

                if (error) {
                    throw new Error(error.message || "Failed to add user");
                }

                if (data?.error) {
                    throw new Error(data.error);
                }

                toast({
                    title: "User invited",
                    description: `${values.email} will receive an invitation email.`,
                });
            } else if (user) {
                const { data, error } = await supabase.functions.invoke("manage-user", {
                    body: {
                        action: "update",
                        userId: user.id,
                        fullName: values.fullName,
                        role: values.role,
                        status: values.status,
                    },
                });

                if (error) {
                    throw new Error(error.message || "Failed to update user");
                }

                if (data?.error) {
                    throw new Error(data.error);
                }

                toast({
                    title: "User updated",
                    description: `${values.fullName} has been updated successfully.`,
                });
            }

            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast({
                title: mode === "add" ? "Unable to add user" : "Unable to update user",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = mode === "add" ? "Add User" : "Edit User";
    const description = mode === "add"
        ? "Create an account by sending an invite and assigning the initial role."
        : "Update the account profile, role, and access state from a single place.";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-xl">
                <SheetHeader className="space-y-2">
                    <SheetTitle className="font-serif text-2xl text-white">{title}</SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        {description}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex h-full flex-col gap-6">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isSubmitting}
                                            className="border-zinc-800 bg-zinc-900"
                                            placeholder="Avery Kapoor"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isSubmitting || mode === "edit"}
                                            className="border-zinc-800 bg-zinc-900"
                                            placeholder="avery@example.com"
                                        />
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
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isSubmitting}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="border-zinc-800 bg-zinc-900">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allowedRoles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {ROLE_LABELS[role]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-zinc-500">
                                        {ROLE_DESCRIPTIONS[field.value]}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {mode === "edit" ? (
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Access Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-zinc-800 bg-zinc-900">
                                                    <SelectValue placeholder="Select access status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-zinc-500">
                                            Inactive accounts stay on record but cannot access the admin panel.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : null}

                        <SheetFooter className="mt-auto border-t border-zinc-800 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={() => onOpenChange(false)}
                                className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : mode === "add" ? "Send Invite" : "Save Changes"}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
