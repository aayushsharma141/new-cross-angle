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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
    id: string;
    name: string;
    role: string; // PRD asks for Designation
    bio: string | null;
    image_url: string | null; // PRD asks for photo_url
    display_order: number;
    // PRD asks for is_published, which is missing in schema, so we omit from DB interface
}

export default function AdminTeamMembers() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: members = [], isLoading } = useQuery<TeamMember[]>({
        queryKey: ["team_members"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("team_members")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as TeamMember[];
        },
    });

    const upsertMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const memberData = {
                name: formData.get("name") as string,
                role: formData.get("designation") as string, // map designation -> role
                bio: formData.get("bio") as string,
                image_url: formData.get("photo_url") as string, // map photo_url -> image_url
                display_order: parseInt(formData.get("display_order") as string) || 0,
            };

            const payload = editingMember ? { id: editingMember.id, ...memberData } : memberData;

            const { data, error } = await supabase
                .from("team_members")
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .upsert(payload, { returning: "minimal" } as any);

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team_members"] });
            toast({ title: "Success", description: "Team member saved successfully." });
            setIsDialogOpen(false);
            setEditingMember(null);
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("team_members").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team_members"] });
            toast({ title: "Deleted", description: "Team member removed." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        upsertMutation.mutate(new FormData(e.currentTarget));
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Team Members</h1>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditingMember(null);
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingMember ? "Edit" : "Add"} Team Member</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input name="name" defaultValue={editingMember?.name} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Designation</label>
                                <Input name="designation" defaultValue={editingMember?.role} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio</label>
                                <Textarea name="bio" defaultValue={editingMember?.bio || ""} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Photo URL</label>
                                <Input name="photo_url" defaultValue={editingMember?.image_url || ""} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Display Order</label>
                                <Input type="number" name="display_order" defaultValue={editingMember?.display_order || 0} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_published" name="is_published" defaultChecked={true} />
                                <label htmlFor="is_published" className="text-sm font-medium leading-none">
                                    Published
                                </label>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={upsertMutation.isPending}>
                                    {upsertMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Photo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Display Order</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto place-self-center" />
                                </TableCell>
                            </TableRow>
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        {member.image_url ? (
                                            <img src={member.image_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs">NA</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>{member.display_order}</TableCell>
                                    <TableCell>Yes</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setEditingMember(member);
                                            setIsDialogOpen(true);
                                        }}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                                            if (confirm("Are you sure you want to delete this team member?")) {
                                                deleteMutation.mutate(member.id);
                                            }
                                        }}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
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
