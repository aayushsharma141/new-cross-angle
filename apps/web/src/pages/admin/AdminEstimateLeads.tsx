import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Download,
    Search,
    Loader2,
    Calculator,
    Flame,
    Thermometer,
    Snowflake,
    ArrowUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { EmptyState } from "@/components/admin/EmptyState";
import { EstimateStatsRow } from "@/components/admin/estimates/EstimateStatsRow";
import { EstimateLeadDetailSheet } from "@/components/admin/estimates/EstimateLeadDetailSheet";

type SortField = "created_at" | "lead_score" | "estimate_total_max" | "area" | "name";
type SortDir = "asc" | "desc";

const categoryConfig = {
    HOT: { icon: Flame, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    WARM: { icon: Thermometer, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    COLD: { icon: Snowflake, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

const statusColors: Record<string, string> = {
    new: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    contacted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    converted: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    archived: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function AdminEstimateLeads() {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch estimate leads
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ["estimate-leads"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("estimate_leads")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updates }: any) => {
            const { error } = await supabase
                .from("estimate_leads")
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["estimate-leads"] });
            toast({ title: "Lead Updated", description: "Changes saved successfully." });
            setIsSheetOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("estimate_leads").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["estimate-leads"] });
            toast({ title: "Lead Deleted", description: "Estimate lead removed." });
            setIsSheetOpen(false);
        },
    });

    // Filter & sort
    const filteredLeads = useMemo(() => {
        let result = [...leads];

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (l: any) =>
                    l.name?.toLowerCase().includes(q) ||
                    l.email?.toLowerCase().includes(q) ||
                    l.city?.toLowerCase().includes(q) ||
                    l.phone?.includes(q)
            );
        }

        if (categoryFilter !== "all") {
            result = result.filter((l: any) => l.lead_category === categoryFilter);
        }

        if (statusFilter !== "all") {
            result = result.filter((l: any) => l.status === statusFilter);
        }

        result.sort((a: any, b: any) => {
            const aVal = a[sortField] ?? 0;
            const bVal = b[sortField] ?? 0;
            if (typeof aVal === "string") {
                return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        });

        return result;
    }, [leads, search, categoryFilter, statusFilter, sortField, sortDir]);

    // Stats
    const stats = useMemo(() => {
        const total = leads.length;
        const hot = leads.filter((l: any) => l.lead_category === "HOT").length;
        const converted = leads.filter((l: any) => l.status === "converted").length;
        const avgEstimate =
            total > 0
                ? leads.reduce((sum: number, l: any) => sum + ((l.estimate_total_min + l.estimate_total_max) / 2 || 0), 0) / total
                : 0;
        const conversionRate = total > 0 ? (converted / total) * 100 : 0;
        return { total, hot, avgEstimate, conversionRate };
    }, [leads]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("desc");
        }
    };

    const handleExport = () => {
        const csvContent = [
            ["Name", "Email", "Phone", "City", "Area", "Budget", "Design Package", "Timeline", "Est Min", "Est Max", "Score", "Category", "Status", "Date"],
            ...leads.map((l: any) => [
                l.name, l.email, l.phone, l.city, l.area, l.budget, l.design_package, l.timeline,
                l.estimate_total_min, l.estimate_total_max, l.lead_score, l.lead_category, l.status,
                l.created_at,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `estimate_leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
        link.click();
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Estimate Leads</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">
                        Estimate Leads
                    </h2>
                    <p className="text-[hsl(var(--admin-muted))]">
                        Manage leads from the cost estimator.
                    </p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Stats */}
            <EstimateStatsRow
                totalLeads={stats.total}
                hotLeads={stats.hot}
                avgEstimate={stats.avgEstimate}
                conversionRate={stats.conversionRate}
                isLoading={isLoading}
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, city..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="HOT">🔥 Hot</SelectItem>
                        <SelectItem value="WARM">🌡️ Warm</SelectItem>
                        <SelectItem value="COLD">❄️ Cold</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredLeads.length === 0 ? (
                <EmptyState
                    icon={Calculator}
                    title="No estimate leads found"
                    description={
                        search || categoryFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Leads will appear here when users submit estimates"
                    }
                />
            ) : (
                <div className="border rounded-lg bg-card overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort("name")}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort("area")}
                                >
                                    <div className="flex items-center gap-1">
                                        Area
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort("estimate_total_max")}
                                >
                                    <div className="flex items-center gap-1">
                                        Estimate
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort("lead_score")}
                                >
                                    <div className="flex items-center gap-1">
                                        Score
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort("created_at")}
                                >
                                    <div className="flex items-center gap-1">
                                        Date
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.map((lead: any) => {
                                const cat = categoryConfig[lead.lead_category as keyof typeof categoryConfig] || categoryConfig.COLD;
                                const CatIcon = cat.icon;
                                return (
                                    <TableRow
                                        key={lead.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            setIsSheetOpen(true);
                                        }}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{lead.name}</p>
                                                <p className="text-xs text-muted-foreground">{lead.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>{lead.city || "—"}</p>
                                                {lead.city_tier && (
                                                    <p className="text-xs text-muted-foreground">{lead.city_tier}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {lead.area?.toLocaleString()} sq ft
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {formatCurrency(lead.estimate_total_min)} –{" "}
                                            {formatCurrency(lead.estimate_total_max)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                    {lead.lead_score}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${cat.bg} ${cat.color} ${cat.border}`}>
                                                <CatIcon className="w-3 h-3 mr-1" />
                                                {lead.lead_category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`capitalize ${statusColors[lead.status] || ""}`}>
                                                {lead.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(lead.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            <EstimateLeadDetailSheet
                lead={selectedLead}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onSave={(updated) => updateMutation.mutate(updated)}
                onDelete={(id) => deleteMutation.mutate(id)}
            />
        </div>
    );
}
