import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Label } from "@/components/ui/primitives/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/primitives/dialog";
import { Plus, Loader2, Pencil, Trash2, Instagram, Linkedin, Mail, Users } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Image } from "@/components/ui/enhanced/image";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    image_url: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
    email: string | null;
    display_order: number;
    created_at: string;
}

export default function AdminTeam() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: members = [], isLoading, error } = useQuery<TeamMember[]>({
        queryKey: ["team-members"],
        queryFn: async (): Promise<TeamMember[]> => {
            const { data, error } = await supabase
                .from("team_members")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) {
                if (error.code === "PGRST116" || error.message.includes("does not exist")) {
                    return [];
                }
                throw error;
            }
            return data as TeamMember[];
        },
    });

    const upsertMutation = useMutation({
        mutationFn: async (member: Partial<TeamMember>) => {
            const { data, error } = await supabase
                .from("team_members")
                .upsert(member as Omit<TeamMember, "created_at"> & { id?: string })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast({
                title: "Success",
                description: editingMember ? "Team member updated" : "Team member added",
            });
            setIsDialogOpen(false);
            setEditingMember(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to save team member",
                variant: "destructive",
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("team_members")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast({
                title: "Deleted",
                description: "Team member removed successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const member: Partial<TeamMember> = {
            name: formData.get("name") as string,
            role: formData.get("role") as string,
            bio: formData.get("bio") as string,
            image_url: formData.get("image_url") as string,
            instagram_url: formData.get("instagram_url") as string,
            linkedin_url: formData.get("linkedin_url") as string,
            email: formData.get("email") as string,
            display_order: parseInt(formData.get("display_order") as string) || 0,
        };

        if (editingMember) {
            member.id = editingMember.id;
        }

        upsertMutation.mutate(member);
    };

    if (error && (error as { code?: string }).code !== "PGRST116") {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-destructive mb-2">Database Error</h2>
                <p className="text-muted-foreground mb-4">The `team_members` table might be missing. Please run the SQL migration.</p>
            </div>
        );
    }

    const columns = [
        {
            key: "image_url",
            header: "Member",
            cell: (member: TeamMember) => (
                <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted flex items-center justify-center flex-shrink-0">
                    {member.image_url ? (
                        <Image
                            src={member.image_url}
                            alt={member.name}
                            width={40}
                            height={40}
                            imageClassName="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-sm font-medium">{member.name[0]}</span>
                    )}
                </div>
            )
        },
        {
            key: "name",
            header: "Name",
            cell: (member: TeamMember) => <span className="font-medium">{member.name}</span>
        },
        {
            key: "role",
            header: "Role",
            cell: (member: TeamMember) => (
                <span className="text-muted-foreground">{member.role}</span>
            )
        },
        {
            key: "socials",
            header: "Socials",
            cell: (member: TeamMember) => (
                <div className="flex gap-2 text-muted-foreground">
                    {member.instagram_url && <Instagram className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />}
                    {member.linkedin_url && <Linkedin className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />}
                    {member.email && <Mail className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />}
                </div>
            )
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (member: TeamMember) => (
                <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => {
                        setEditingMember(member);
                        setIsDialogOpen(true);
                    }}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                        if (confirm("Are you sure you want to remove this member?")) {
                            deleteMutation.mutate(member.id);
                        }
                    }}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setEditingMember(null);
                    setSelectedImage(null);
                }
            }}>
                <ModuleActions>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Add Member
                        </Button>
                    </DialogTrigger>
                </ModuleActions>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl border-zinc-800">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
                        <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
                        <DialogDescription>
                            Fill in the details to curate your team profile.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" defaultValue={editingMember?.name} required placeholder="Full Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" name="role" defaultValue={editingMember?.role} required placeholder="Visionary Designation" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" name="bio" defaultValue={editingMember?.bio || ""} placeholder="A short, visionary biography..." rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Profile Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden border bg-muted flex-shrink-0">
                                        {(editingMember?.image_url || selectedImage) ? (
                                            <Image
                                                src={selectedImage || editingMember?.image_url || ""}
                                                alt="Profile"
                                                width={160}
                                                quality={78}
                                                imageClassName="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <Users className="w-8 h-8 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsMediaPickerOpen(true)}
                                            >
                                                Select from Library
                                            </Button>
                                            {(selectedImage || editingMember?.image_url) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setSelectedImage("");
                                                        if (editingMember) setEditingMember({ ...editingMember, image_url: null });
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        <Input
                                            id="image_url"
                                            name="image_url"
                                            value={selectedImage || editingMember?.image_url || ""}
                                            onChange={(e) => {
                                                setSelectedImage(e.target.value);
                                                if (editingMember) setEditingMember({ ...editingMember, image_url: e.target.value });
                                            }}
                                            placeholder="https://..."
                                            className="text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="instagram_url">Instagram</Label>
                                    <Input id="instagram_url" name="instagram_url" defaultValue={editingMember?.instagram_url || ""} placeholder="#" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin_url">LinkedIn</Label>
                                    <Input id="linkedin_url" name="linkedin_url" defaultValue={editingMember?.linkedin_url || ""} placeholder="#" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" defaultValue={editingMember?.email || ""} placeholder="name@crossangle.in" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display_order">Display Order</Label>
                                    <Input id="display_order" name="display_order" type="number" defaultValue={editingMember?.display_order || 0} />
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 px-6 py-4 border-t border-zinc-800">
                            <Button type="submit" disabled={upsertMutation.isPending} className="w-full">
                                {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingMember ? "Save Changes" : "Add Visionary"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <MediaPickerModal
                open={isMediaPickerOpen}
                onOpenChange={setIsMediaPickerOpen}
                onSelect={(url) => {
                    setSelectedImage(url);
                    if (editingMember) {
                        setEditingMember({ ...editingMember, image_url: url });
                    }
                }}
            />

            <DataTable
                data={members}
                columns={columns}
                isLoading={isLoading}
            />
        </div>
    );
}
