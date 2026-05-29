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
} from "@/design-system/components/Table";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Label } from "@/components/ui/primitives/label";
import { Textarea } from "@/components/ui/primitives/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/primitives/dialog";
import { Image } from "@/components/ui/enhanced/image";
import { Loader2, Plus, Edit2, Trash2, Shield } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cdn";
import { useToast } from "@/hooks/useToast";
import { Card } from "@/design-system/components/Card";
import { icons } from "@/design-system/tokens/icons";
import { auditService } from "@/services/AuditService";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";

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
                .upsert(payload, { returning: "representation" } as any)
                .select('id')
                .single();

            if (error) throw error;
            return data as { id: string };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["team_members"] });
            const resultId = (data as { id?: string } | null)?.id ?? editingMember?.id ?? null;
            void auditService.writeAudit(
                editingMember ? 'UPDATE' : 'CREATE',
                'team_member',
                resultId,
                { name: editingMember?.name }
            );
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
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ["team_members"] });
            void auditService.writeAudit('DELETE', 'team_member', id, {});
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
        <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingMember(null);
            }}>
                <AdminPageHeader
                    title="Team Members"
                    description="Manage your executive and creative team units."
                    breadcrumbs={[]}
                    actions={
                        <DialogTrigger asChild>
                            <Button variant="primary">
                                <Plus className={icons.sm + " mr-2"} /> Add Member
                            </Button>
                        </DialogTrigger>
                    }
                />
                <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden sm:rounded-xl border-zinc-800">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
                        <DialogTitle className="text-lg font-display">{editingMember ? "Edit" : "Add"} Team Member</DialogTitle>
                    </DialogHeader>
                        <form key={editingMember?.id ?? "new"} onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tm-name" className="text-sm font-medium">Name</Label>
                                    <Input id="tm-name" name="name" defaultValue={editingMember?.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tm-designation" className="text-sm font-medium">Designation</Label>
                                    <Input id="tm-designation" name="designation" defaultValue={editingMember?.role} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tm-bio" className="text-sm font-medium">Bio</Label>
                                    <Textarea id="tm-bio" name="bio" defaultValue={editingMember?.bio || ""} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tm-photo" className="text-sm font-medium">Photo URL</Label>
                                    <Input id="tm-photo" name="photo_url" defaultValue={editingMember?.image_url || ""} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tm-order" className="text-sm font-medium">Display Order</Label>
                                    <Input id="tm-order" type="number" name="display_order" defaultValue={editingMember?.display_order || 0} />
                                </div>

                            </div>
                            <div className="shrink-0 px-6 py-4 border-t border-zinc-800">
                                <Button type="submit" variant="primary" disabled={upsertMutation.isPending} className="w-full">
                                    {upsertMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

            <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                        <TableRow className="border-zinc-800 hover:bg-transparent text-zinc-500">
                            <TableHead className="w-[80px]">Photo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Display Order</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto place-self-center" />
                                </TableCell>
                            </TableRow>
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        {member.image_url ? (
                                            <Image src={member.image_url} alt={member.name} width={96} quality={76} imageClassName="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs">NA</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>{member.display_order}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" aria-label="Edit member" onClick={() => {
                                                setEditingMember(member);
                                                setIsDialogOpen(true);
                                            }} className="hover:bg-primary/5 text-zinc-400 hover:text-primary transition-colors">
                                                <Edit2 className={icons.sm} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-colors" aria-label="Delete member" onClick={() => {
                                                if (confirm("Are you sure you want to delete this team member?")) {
                                                    deleteMutation.mutate(member.id);
                                                }
                                            }}>
                                                <Trash2 className={icons.sm} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
