import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    Users,
    FileText,
    BookOpen,
    Sparkles,
    Calculator,
    Shield,
    Settings,
    type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ───────────────────────────────────────────────
   Hub Stats — shared between AdminHub and AdminLayout
   ─────────────────────────────────────────────── */
export interface HubStats {
    actionsToday: number;
    newLeads: number;
    storageUsedGB: number;
    storageTotalGB: number;
    pipelineValue: number;
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    inboxCount: number;
    callCount: number;
    proposalCount: number;
    signedCount: number;
    quizLeadsCount: number;
    estimatorLeadsCount: number;
}

export interface ModuleTileProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    index: number;
    badge?: string;
    featured?: boolean;
    urgent?: boolean;
    insight?: { type: "alert" | "info" | "success"; text: string };
    primaryAction?: { label: string; href: string };
    quickStats?: { label: string; value: string | number }[];
}

async function fetchHubStats(): Promise<HubStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
        { count: activityCount, error: e1 },
        { count: versionCount, error: e2 },
        { count: newLeadCount, error: e3 },
        { data: mediaData, error: e4 },
        { data: leadsData, error: e5 },
    ] = await Promise.all([
        supabase
            .from("lead_activities")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart.toISOString()),
        supabase
            .from("content_versions")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart.toISOString()),
        supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
        supabase.from("media_files").select("size_bytes"),
        supabase
            .from("leads")
            .select("status, lead_source, estimated_min"),
    ]);

    if (e1 || e2 || e3 || e4 || e5) {
        console.error("Hub stats partial failure", { e1, e2, e3, e4, e5 });
    }

    const totalBytes = (mediaData ?? []).reduce(
        (sum: number, m: { size_bytes: number | null }) => sum + (m.size_bytes ?? 0),
        0
    );
    const usedGB = totalBytes / (1024 * 1024 * 1024);

    const leads = leadsData ?? [];
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === "won").length;
    const lostLeads = leads.filter(l => l.status === "lost").length;
    const inboxCount = leads.filter(l => l.status === "new").length;
    const callCount = leads.filter(l => l.status === "in_conversation" || l.status === "meeting_planned").length;
    const proposalCount = leads.filter(l => l.status === "quote_sent" || l.status === "closing").length;
    const signedCount = wonLeads;

    const quizLeadsCount = leads.filter(l => l.lead_source === "style_quiz" || l.lead_source === "aesthetic_discovery_engine").length;
    const estimatorLeadsCount = leads.filter(l => l.lead_source === "estimator").length;

    const pipelineValue = leads
        .filter(l => l.lead_source === "estimator")
        .reduce((sum: number, l) => sum + (Number(l.estimated_min) || 0), 0);

    return {
        actionsToday: (activityCount ?? 0) + (versionCount ?? 0),
        newLeads: newLeadCount ?? 0,
        storageUsedGB: usedGB,
        storageTotalGB: 20,
        pipelineValue,
        totalLeads,
        wonLeads,
        lostLeads,
        inboxCount,
        callCount,
        proposalCount,
        signedCount,
        quizLeadsCount,
        estimatorLeadsCount,
    };
}

const DEFAULT_STATS: HubStats = {
    actionsToday: 0,
    newLeads: 0,
    storageUsedGB: 0,
    storageTotalGB: 20,
    pipelineValue: 0,
    totalLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    inboxCount: 0,
    callCount: 0,
    proposalCount: 0,
    signedCount: 0,
    quizLeadsCount: 0,
    estimatorLeadsCount: 0,
};

export function useHubStats() {
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["hub-stats"],
        queryFn: fetchHubStats,
        refetchInterval: 60_000,
    });

    return { stats: data ?? DEFAULT_STATS, isRefreshing: isFetching, refresh: refetch };
}

export const formatStorage = (usedGB: number): string => {
    if (usedGB < 0.001) return "0 MB";
    if (usedGB < 1) return `${(usedGB * 1024).toFixed(1)} MB`;
    return `${usedGB.toFixed(1)} GB`;
};

export const getModules = (
    stats: HubStats
): (Omit<ModuleTileProps, "index"> & { allowedRoles?: string[] })[] => [
    {
        title: "Intelligence Hub",
        description: "Website activity, server health, and business analytics in one view.",
        icon: Activity,
        href: "/admin/dashboard",
        badge: "Control",
        featured: true,
        quickStats: [
            { label: "Today's Activity", value: stats.actionsToday },
            { label: "System Status", value: "Optimal" },
        ],
        insight: { type: "success", text: "All systems operational" },
        primaryAction: { label: "View Dashboard", href: "/admin/dashboard" },
    },
    {
        title: "CRM",
        description: "Lead pipeline management. Track high-intent enquiries and client details.",
        icon: Users,
        href: "/admin/crm/leads",
        allowedRoles: ["super_admin", "admin"],
        urgent: stats.newLeads > 0,
        insight:
            stats.newLeads > 0
                ? { type: "alert", text: `${stats.newLeads} new lead${stats.newLeads > 1 ? "s" : ""} waiting` }
                : { type: "success", text: "Pipeline up to date" },
        quickStats: [
            {
                label: "Pipeline",
                value:
                    stats.pipelineValue > 0
                        ? `₹${(stats.pipelineValue / 100000).toFixed(1)}L`
                        : "₹0",
            },
            { label: "New Leads", value: stats.newLeads },
        ],
        primaryAction:
            stats.newLeads > 0
                ? { label: "Review Leads", href: "/admin/crm/leads?filter=new" }
                : { label: "View Pipeline", href: "/admin/crm/leads" },
    },
    {
        title: "Content Management",
        description: "Portfolio, services, media assets, and testimonials management.",
        icon: FileText,
        href: "/admin/cms/portfolio",
        allowedRoles: ["super_admin", "admin"],
        insight:
            stats.actionsToday > 0
                ? { type: "info", text: `${stats.actionsToday} content edits today` }
                : { type: "info", text: "Content up to date" },
        quickStats: [
            { label: "Storage Used", value: `${stats.storageUsedGB < 0.01 ? "0" : stats.storageUsedGB.toFixed(1)}GB` },
            { label: "Quota", value: `${stats.storageTotalGB}GB` },
        ],
        primaryAction: { label: "Media Library", href: "/admin/cms/media-library" },
    },
    {
        title: "Blog Analytics",
        description: "Publish articles, manage drafts, and track content performance.",
        icon: BookOpen,
        href: "/admin/blog/overview",
        allowedRoles: ["super_admin", "admin"],
        featured: true,
        quickStats: [
            { label: "Published", value: "Active" },
            { label: "Analytics", value: "↑ On" },
        ],
        insight: { type: "info", text: "Content intelligence ready" },
        primaryAction: { label: "Overview", href: "/admin/blog/overview" },
    },
    {
        title: "Discovery Engine",
        description: "Analytics and style funnel breakdown for the interactive quiz.",
        icon: Sparkles,
        href: "/admin/discovery/quiz-analytics",
        allowedRoles: ["super_admin", "admin"],
        quickStats: [
            { label: "Funnel", value: "Active" },
            { label: "Leads", value: stats.newLeads },
        ],
        insight: { type: "info", text: "Style quiz converting" },
        primaryAction: { label: "View Funnel", href: "/admin/discovery/quiz-analytics" },
    },
    {
        title: "Estimator Engine",
        description: "Pricing configuration, stage builder, and project scope logic.",
        icon: Calculator,
        href: "/admin/estimator/estimate-leads",
        allowedRoles: ["super_admin", "admin"],
        quickStats: [
            { label: "Pipeline", value: stats.pipelineValue > 0 ? `₹${(stats.pipelineValue / 100000).toFixed(1)}L` : "₹0" },
            { label: "Submissions", value: "Live" },
        ],
        insight: { type: "info", text: "Pricing engine online" },
        primaryAction: { label: "Estimate Leads", href: "/admin/estimator/estimate-leads" },
    },
    {
        title: "User Access",
        description: "Manage admin users, roles, security credentials, and permissions.",
        icon: Shield,
        href: "/admin/user-access/users",
        allowedRoles: ["super_admin", "admin"],
        quickStats: [
            { label: "Login Security", value: "Active" },
            { label: "2-Step Verify", value: "On" },
        ],
        insight: { type: "success", text: "Access controls enforced" },
        primaryAction: { label: "Manage Users", href: "/admin/user-access/users" },
    },
    {
        title: "System Settings",
        description: "Global site config, integrations, audit logs, and diagnostics.",
        icon: Settings,
        href: "/admin/system/settings",
        allowedRoles: ["super_admin"],
        featured: true,
        quickStats: [
            { label: "Integrations", value: "Live" },
            { label: "Audit Trail", value: "On" },
        ],
        insight: { type: "success", text: "All integrations active" },
        primaryAction: { label: "Open Settings", href: "/admin/system/settings" },
    },
];
