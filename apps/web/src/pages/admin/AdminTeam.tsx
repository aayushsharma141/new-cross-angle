import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Search,
    MoreHorizontal,
    Trash2,
    Edit2,
    ExternalLink,
    Instagram,
    Linkedin,
    Mail,
    Loader2,
    Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOptimizedUrl } from "@/lib/cdn";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

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

import MediaPickerModal from "@/components/admin/MediaPickerModal";

export default function AdminTeam() {
    const [search, setSearch] = useState("");
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
                    // Table doesn't exist yet
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
                .upsert(member)
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

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase())
    );

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
                <pre className="bg-muted p-4 rounded text-left text-xs overflow-auto max-w-2xl mx-auto">
                    {`CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON team_members
  FOR SELECT USING (true);

-- Allow admin write access (update with your auth logic)
CREATE POLICY "Allow admin full access" ON team_members
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );`}
                </pre>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage the visionaries behind Cross Angle Interior.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingMember(null);
                        setSelectedImage(null);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Add Member
                        </Button>
                    </DialogTrigger>
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
                                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                                        <Input id="name" name="name" defaultValue={editingMember?.name} required placeholder="Full Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="role" className="text-sm font-medium">Role</label>
                                        <Input id="role" name="role" defaultValue={editingMember?.role} required placeholder="Visionary Designation" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                                    <Textarea id="bio" name="bio" defaultValue={editingMember?.bio || ""} placeholder="A short, visionary biography..." rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Profile Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 rounded-full overflow-hidden border bg-muted flex-shrink-0">
                                            {(editingMember?.image_url || selectedImage) ? (
                                                <img
                                                    src={getOptimizedUrl(selectedImage || editingMember?.image_url || "", { width: 160, height: 160, quality: 78 })}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
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
                                        <label htmlFor="instagram_url" className="text-sm font-medium">Instagram</label>
                                        <Input id="instagram_url" name="instagram_url" defaultValue={editingMember?.instagram_url || ""} placeholder="#" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="linkedin_url" className="text-sm font-medium">LinkedIn</label>
                                        <Input id="linkedin_url" name="linkedin_url" defaultValue={editingMember?.linkedin_url || ""} placeholder="#" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                                        <Input id="email" name="email" type="email" defaultValue={editingMember?.email || ""} placeholder="name@crossangle.in" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="display_order" className="text-sm font-medium">Display Order</label>
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
            </div>

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

            <div className="bg-card rounded-xl border shadow-sm">
                <div className="p-4 border-b flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or role..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Member</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="hidden md:table-cell">Socials</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={getOptimizedUrl(member.image_url || "", { width: 96, height: 96, quality: 76 })} />
                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{member.role}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex gap-2">
                                            {member.instagram_url && <Instagram className="w-4 h-4 opacity-50" />}
                                            {member.linkedin_url && <Linkedin className="w-4 h-4 opacity-50" />}
                                            {member.email && <Mail className="w-4 h-4 opacity-50" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" aria-label="Team options">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingMember(member);
                                                    setIsDialogOpen(true);
                                                }}>
                                                    <Edit2 className="mr-2 w-4 h-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to remove this visionary?")) {
                                                            deleteMutation.mutate(member.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 w-4 h-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
