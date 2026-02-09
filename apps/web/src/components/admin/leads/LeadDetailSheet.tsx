import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leadStatusOptions } from "@/lib/validations";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadTimeline } from "@/components/admin/leads/LeadTimeline";
import { Mail, Phone, Calendar, MapPin, User, FileText, StickyNote } from "lucide-react";
import { format } from "date-fns";

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    service?: string;
    status: string;
    notes?: string;
    created_at?: string;
    message?: string;
}

interface LeadDetailSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (lead: Lead) => void;
    onDelete: (id: string) => void;
}

export function LeadDetailSheet({ lead, open, onOpenChange, onSave, onDelete }: LeadDetailSheetProps) {
    const [formData, setFormData] = useState<Lead | null>(null);

    useEffect(() => {
        if (lead) {
            setFormData({ ...lead });
        }
    }, [lead]);

    const handleSave = () => {
        if (formData) {
            onSave(formData);
        }
    };

    if (!formData) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-display">Lead Details</SheetTitle>
                    <SheetDescription>View and manage lead information.</SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="details" className="h-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="w-[180px] bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leadStatusOptions.map((status) => (
                                            <SelectItem key={status} value={status} className="capitalize">
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Date Received</div>
                                <div className="font-medium text-sm">
                                    {formData.created_at ? format(new Date(formData.created_at), "PPP") : "N/A"}
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                                <User className="w-4 h-4" /> Client Information
                            </h3>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email</Label>
                                        <Input
                                            id="email"
                                            value={formData.email || ""}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone || ""}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                                <FileText className="w-4 h-4" /> Project Interest
                            </h3>
                            <div className="grid gap-2">
                                <Label htmlFor="service">Interested Service</Label>
                                <Input
                                    id="service"
                                    value={formData.service || ""}
                                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Initial Message</Label>
                                <div className="bg-muted/30 p-3 rounded-md text-sm italic border">
                                    "{formData.message || "No message provided."}"
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                                <StickyNote className="w-4 h-4" /> Internal Notes
                            </h3>
                            <Textarea
                                className="min-h-[100px]"
                                placeholder="Add notes about budget, timeline, or meeting outcomes..."
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="h-[400px] overflow-y-auto pr-4">
                        <LeadTimeline leadId={formData.id} />
                    </TabsContent>
                </Tabs>

                <SheetFooter className="mt-8 gap-2">
                    <Button variant="destructive" onClick={() => onDelete(formData.id)}>Delete Lead</Button>
                    <Button onClick={handleSave} className="bg-[hsl(var(--brand-primary))]">Save Changes</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
