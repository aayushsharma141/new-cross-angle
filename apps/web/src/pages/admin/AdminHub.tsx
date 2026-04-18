import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdmin } from "@/context/AdminContext";
import { useSystem } from "@/context/SystemContext";
import { useState, useEffect, useCallback } from "react";
import {
    BarChart3,
    Users,
    FileText,
    Sparkles,
    Calculator,
    Shield,
    Settings,
    ArrowRight,
    Activity,
    Bell,
    Database,
    RefreshCw,
    Image,
    BookOpen,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/primitives/button";

const MotionLink = motion(Link);

/* ───────────────────────────────────────────────
   Live Hub Stats
   ─────────────────────────────────────────────── */
interface HubStats {
    actionsToday: number;
    newLeads: number;
    storageUsedGB: number;
    storageTotalGB: number;
    pipelineValue: number;
}

function useHubStats() {
    const [stats, setStats] = useState<HubStats>({
        actionsToday: 0,
        newLeads: 0,
        storageUsedGB: 0,
        storageTotalGB: 20,
        pipelineValue: 0,
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const [
                { count: activityCount },
                { count: versionCount },
                { count: newLeadCount },
                { data: mediaData },
                { data: estimateData },
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
                supabase.from("media").select("size_bytes"),
                supabase
                    .from("leads")
                    .select("estimated_min, estimated_max")
                    .eq("lead_source", "estimator"),
            ]);

            const totalBytes = (mediaData ?? []).reduce(
                (sum: number, m: { size_bytes: number | null }) => sum + (m.size_bytes ?? 0),
                0
            );
            const usedGB = totalBytes / (1024 * 1024 * 1024);

            const pipelineValue = (estimateData ?? []).reduce(
                (sum: number, e: { estimated_min: number | null; estimated_max: number | null }) =>
                    sum + (e.estimated_min ?? 0) + (e.estimated_max ?? 0),
                0
            );

            setStats({
                actionsToday: (activityCount ?? 0) + (versionCount ?? 0),
                newLeads: newLeadCount ?? 0,
                storageUsedGB: usedGB,
                storageTotalGB: 20,
                pipelineValue,
            });
        } catch (err) {
            console.error("Failed to fetch hub stats", err);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void fetchStats();
    }, [fetchStats]);

    return { stats, isRefreshing, refresh: fetchStats };
}

/* ───────────────────────────────────────────────
   Strict 3-Zone Module Tile
   Zone 1: Header (icon + badge)
   Zone 2: Live stats (quickStats grid)
   Zone 3: Action (insight chip + CTA button)
   ─────────────────────────────────────────────── */
interface ModuleTileProps {
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

const ModuleTile = ({
    title,
    description,
    icon: Icon,
    href,
    index,
    badge,
    featured,
    urgent,
    insight,
    primaryAction,
    quickStats,
}: ModuleTileProps) => {
    const { setCurrentModule } = useAdmin();

    return (
        <MotionLink
            to={href}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setCurrentModule(title)}
            className={cn(
                "group relative flex flex-col rounded-xl border",
                urgent
                    ? "border-[hsl(var(--admin-wine))]/40 shadow-[0_0_20px_rgba(150,0,0,0.15)]"
                    : featured
                    ? "border-[hsl(var(--admin-primary))]/40 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                    : "border-[hsl(var(--admin-border))]",
                "bg-[hsl(var(--admin-card))] backdrop-blur-md text-left shadow-lg",
                "transition-all duration-300 ease-out cursor-pointer",
                "hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(212,175,55,0.08)]",
                !featured && !urgent && "hover:border-[hsl(var(--admin-primary))]/30",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--admin-primary))]/50",
            )}
        >
            {/* Top edge glow */}
            <div
                className={cn(
                    "absolute top-0 left-0 right-0 h-px transition-opacity duration-500",
                    urgent
                        ? "bg-gradient-to-r from-transparent via-[hsl(var(--admin-wine))]/50 to-transparent opacity-80"
                        : "bg-gradient-to-r from-transparent via-[hsl(var(--admin-primary))]/20 to-transparent opacity-0 group-hover:opacity-100"
                )}
            />

            {/* ── Zone 1: Integrated Header (Icon + Title + Badge) ── */}
            <div className="flex items-center gap-3 p-4 pb-3">
                <div
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-inner",
                        "transition-all duration-300",
                        urgent
                            ? "bg-[hsl(var(--admin-wine))]/10 text-[hsl(var(--admin-wine))] border-[hsl(var(--admin-wine))]/20 group-hover:bg-[hsl(var(--admin-wine))]/20"
                            : "bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-primary))]/80 group-hover:bg-[hsl(var(--admin-primary))]/10 group-hover:text-[hsl(var(--admin-primary))] group-hover:border-[hsl(var(--admin-primary))]/20"
                    )}
                >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[13px] font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight group-hover:text-[hsl(var(--admin-primary))] transition-colors duration-200 leading-tight truncate">
                            {title}
                        </h3>
                        {badge && (
                            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))]/20 uppercase tracking-widest shrink-0">
                                {badge}
                            </span>
                        )}
                        {urgent && (
                            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-[hsl(var(--admin-wine))]/15 text-[hsl(var(--admin-wine))] border border-[hsl(var(--admin-wine))]/25 uppercase tracking-widest animate-pulse shrink-0">
                                Urgent
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Zone 2: Description + Live Stats ── */}
            <div className="flex-1 px-4 pb-3 flex flex-col gap-2.5">
                <p className="text-[10px] leading-snug text-[hsl(var(--admin-muted))] line-clamp-2 font-sans">
                    {description}
                </p>

                {/* Stat grid — always rendered, shows — when no data */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                    {(quickStats ?? [{ label: "Status", value: "Ready" }]).slice(0, 2).map((stat, i) => (
                        <div key={i} className="flex flex-col">
                            <span
                                className={cn(
                                    "text-[15px] font-semibold tabular-nums",
                                    urgent
                                        ? "text-[hsl(var(--admin-wine))]"
                                        : featured
                                        ? "text-[hsl(var(--admin-primary))]"
                                        : "text-[hsl(var(--admin-text))]"
                                )}
                            >
                                {stat.value}
                            </span>
                            <span
                                className={cn(
                                    "text-[9px] uppercase tracking-wider",
                                    urgent ? "text-[hsl(var(--admin-wine))]/60" : "text-[hsl(var(--admin-muted))]"
                                )}
                            >
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Zone 3: Insight chip + Action ── */}
            <div className="px-4 pb-4 pt-3 border-t border-[hsl(var(--admin-border))]/60 flex flex-col gap-2">
                {insight && (
                    <div
                        className={cn(
                            "w-full px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5",
                            insight.type === "alert" &&
                                "bg-[hsl(var(--admin-wine))]/10 text-[hsl(var(--admin-wine))] border border-[hsl(var(--admin-wine))]/20",
                            insight.type === "info" &&
                                "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))]/20",
                            insight.type === "success" &&
                                "bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))] border border-[hsl(var(--admin-success))]/20"
                        )}
                    >
                        {insight.type === "alert" && <Bell className="w-3 h-3 shrink-0" />}
                        {insight.type === "info" && <Activity className="w-3 h-3 shrink-0" />}
                        {insight.type === "success" && <Sparkles className="w-3 h-3 shrink-0" />}
                        <span className="truncate">{insight.text}</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    {primaryAction ? (
                        <Button
                            variant={urgent ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "h-7 text-[11px] px-3 font-medium transition-all",
                                urgent
                                    ? "bg-[hsl(var(--admin-wine))] text-white hover:bg-[hsl(var(--admin-wine))]/90 border-transparent shadow-[0_2px_10px_rgba(150,0,0,0.2)]"
                                    : "border-[hsl(var(--admin-primary))]/30 text-[hsl(var(--admin-primary))] bg-transparent hover:bg-[hsl(var(--admin-primary))]/10"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = primaryAction.href;
                            }}
                        >
                            {primaryAction.label}
                        </Button>
                    ) : (
                        <span className="text-[10px] text-[hsl(var(--admin-muted))]">Open module</span>
                    )}
                    <ArrowRight
                        className={cn(
                            "w-3.5 h-3.5 group-hover:translate-x-1 transition-all",
                            urgent ? "text-[hsl(var(--admin-wine))]" : "text-[hsl(var(--admin-primary))]"
                        )}
                    />
                </div>
            </div>
        </MotionLink>
    );
};

/* ───────────────────────────────────────────────
   Module definitions — every tile now has
   quickStats + insight conforming to Zone 2/3
   ─────────────────────────────────────────────── */
const getModules = (
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
        title: "CMS",
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
        primaryAction: { label: "Media Library", href: "/admin/cms/media" },
    },
    {
        title: "Blog Engine",
        description: "Publish articles, manage drafts, and track content performance.",
        icon: BookOpen,
        href: "/admin/blog/overview",
        allowedRoles: ["super_admin", "admin"],
        quickStats: [
            { label: "Published", value: "Active" },
            { label: "Analytics", value: "↑ On" },
        ],
        insight: { type: "info", text: "Content intelligence ready" },
        primaryAction: { label: "Overview", href: "/admin/blog/overview" },
    },
    {
        title: "Discovery",
        description: "Analytics and style funnel breakdown for the interactive quiz.",
        icon: Sparkles,
        href: "/admin/discovery/analytics",
        allowedRoles: ["super_admin", "admin"],
        quickStats: [
            { label: "Funnel", value: "Active" },
            { label: "Leads", value: stats.newLeads },
        ],
        insight: { type: "info", text: "Style quiz converting" },
        primaryAction: { label: "View Funnel", href: "/admin/discovery/analytics" },
    },
    {
        title: "Estimator",
        description: "Pricing configuration, stage builder, and project scope logic.",
        icon: Calculator,
        href: "/admin/estimator/leads",
        allowedRoles: ["super_admin", "admin"],
        quickStats: [
            { label: "Pipeline", value: stats.pipelineValue > 0 ? `₹${(stats.pipelineValue / 100000).toFixed(1)}L` : "₹0" },
            { label: "Submissions", value: "Live" },
        ],
        insight: { type: "info", text: "Pricing engine online" },
        primaryAction: { label: "Estimate Leads", href: "/admin/estimator/leads" },
    },
    {
        title: "User Access",
        description: "Manage admin users, roles, security credentials, and permissions.",
        icon: Shield,
        href: "/admin/access",
        allowedRoles: ["super_admin", "admin"],
        quickStats: [
            { label: "Auth", value: "JWT" },
            { label: "MFA", value: "Active" },
        ],
        insight: { type: "success", text: "Access controls enforced" },
        primaryAction: { label: "Manage Users", href: "/admin/access" },
    },
    {
        title: "Settings",
        description: "Global site config, integrations, audit logs, and diagnostics.",
        icon: Settings,
        href: "/admin/system/settings",
        allowedRoles: ["super_admin"],
        quickStats: [
            { label: "Integrations", value: "Live" },
            { label: "Audit Trail", value: "On" },
        ],
        insight: { type: "success", text: "All integrations active" },
        primaryAction: { label: "Open Settings", href: "/admin/system/settings" },
    },
];

/* ───────────────────────────────────────────────
   Clickable KPI Chip
   ─────────────────────────────────────────────── */
interface KpiChipProps {
    icon: LucideIcon;
    label: string;
    value: string;
    href: string;
    variant?: "default" | "warning" | "success" | "muted";
}

const KpiChip = ({ icon: Icon, label, value, href, variant = "default" }: KpiChipProps) => {
    const iconClass = cn(
        "flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200",
        variant === "warning" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
        variant === "success" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        variant === "default" && "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary))]/20",
        variant === "muted" && "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-muted))] border-[hsl(var(--admin-border))]"
    );
    return (
        <Link
            to={href}
            className="group flex items-center gap-3 rounded-lg px-1 py-0.5 transition-all duration-150 hover:bg-[hsl(var(--admin-primary))]/5"
            title={`Go to ${label}`}
        >
            <div className={iconClass}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[9px] text-[hsl(var(--admin-muted))] uppercase tracking-widest font-medium">{label}</p>
                <p className="text-xs font-semibold text-[hsl(var(--admin-text))] group-hover:text-[hsl(var(--admin-primary))] transition-colors">
                    {value}
                </p>
            </div>
        </Link>
    );
};

/* ───────────────────────────────────────────────
   Admin Hub (The Launcher)
   ─────────────────────────────────────────────── */
export default function AdminHub() {
    const { user, role } = useAdminAuth();
    const { health, refreshHealth } = useSystem();
    const { stats, isRefreshing, refresh } = useHubStats();
    const { toast } = useToast();
    const location = useLocation();

    useEffect(() => {
        const state = location.state as { accessDenied?: boolean; role?: string } | null;
        if (state?.accessDenied) {
            toast({
                title: "Permission Denied",
                description: `Your account (${state.role || "no role"}) does not have access to that module.`,
                variant: "destructive",
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state, toast]);

    const displayName =
        (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Admin";

    const handleRefresh = () => {
        refreshHealth();
        void refresh();
    };

    const formatStorage = (usedGB: number): string => {
        if (usedGB < 0.001) return "0 MB";
        if (usedGB < 1) return `${(usedGB * 1024).toFixed(1)} MB`;
        return `${usedGB.toFixed(1)} GB`;
    };

    const allModules = getModules(stats);
    const filteredModules = allModules.filter(
        (m) => !m.allowedRoles || (role && m.allowedRoles.includes(role))
    );

    return (
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)] py-2 px-1">
            {/* ── Top Intelligence Strip ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-4"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-px w-6 bg-[hsl(var(--admin-primary))]/50" />
                        <span className="text-[9px] text-[hsl(var(--admin-primary))] uppercase tracking-[0.25em] font-medium">
                            CrossAngle Admin
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-[hsl(var(--admin-text))] tracking-tight leading-tight">
                        Welcome,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 italic font-medium" style={{ color: '#F5C542' }}>
                            {displayName}
                        </span>
                    </h1>
                </div>

                {/* KPI Action Strip — chips are now clickable Links */}
                <div className="flex items-center gap-2 sm:gap-4 admin-glass px-4 py-2 rounded-xl shadow-xl shrink-0 border border-[hsl(var(--admin-border))]">
                    {/* Attention → CRM leads */}
                    <KpiChip
                        icon={Bell}
                        label="Attention"
                        href="/admin/crm/leads?filter=new"
                        value={isRefreshing ? "…" : stats.newLeads > 0 ? `${stats.newLeads} Action${stats.newLeads > 1 ? "s" : ""}` : "All Clear"}
                        variant={stats.newLeads > 0 ? "warning" : "muted"}
                    />

                    <div className="h-8 w-px bg-[hsl(var(--admin-border))]" />

                    {/* Pulse → daily activity dashboard */}
                    <KpiChip
                        icon={Activity}
                        label="Pulse"
                        href="/admin/dashboard"
                        value={isRefreshing ? "…" : `${stats.actionsToday} Updates`}
                        variant="default"
                    />

                    <div className="h-8 w-px bg-[hsl(var(--admin-border))] hidden lg:block" />

                    {/* Status → system settings */}
                    <KpiChip
                        icon={Shield}
                        label="Status"
                        href="/admin/system/settings"
                        value={health.status === "healthy" ? "Optimal" : "Degraded"}
                        variant={health.status === "healthy" ? "success" : "warning"}
                    />

                    <div className="h-8 w-px bg-[hsl(var(--admin-border))]" />

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh hub statistics"
                        title="Refresh all stats"
                        className="flex items-center justify-center h-8 w-8 rounded-md text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/5 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </button>
                </div>
            </motion.div>

            {/* ── Module Grid — 4 columns, auto rows, fills remaining height ── */}
            <div className="flex-1 min-h-0 overflow-y-auto sm:overflow-y-visible">
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-full"
                    style={{
                        gridTemplateRows: `repeat(${Math.ceil(filteredModules.length / 4)}, 1fr)`,
                    }}
                >
                    {filteredModules.map((mod, i) => (
                        <ModuleTile key={mod.title} {...mod} index={i} />
                    ))}
                </div>
            </div>

            {/* ── Footer Utility Bar ── */}
            <div className="flex items-center justify-between gap-4 mt-3 px-3 py-2 rounded-lg admin-glass opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 text-[10px] text-[hsl(var(--admin-muted))]">
                    <span className="flex items-center gap-1.5">
                        <Database className="w-3 h-3" />
                        {formatStorage(stats.storageUsedGB)} of {stats.storageTotalGB}GB used
                    </span>
                    <span className="text-[hsl(var(--admin-border))] hidden sm:block">|</span>
                    <span className="hidden sm:block">{filteredModules.length} modules active</span>
                </div>
                <div className="flex items-center gap-4 text-[9px] text-[hsl(var(--admin-muted))] uppercase tracking-widest font-medium">
                    <span>CrossAngle v3.0</span>
                    <span className="text-[hsl(var(--admin-border))]">●</span>
                    <Link to="/admin/dashboard" className="hover:text-[hsl(var(--admin-primary))] transition-colors">
                        Analytics
                    </Link>
                    <Link to="/admin/system/settings" className="hover:text-[hsl(var(--admin-primary))] transition-colors">
                        Settings
                    </Link>
                    <Link to="/admin/system/audit" className="hover:text-[hsl(var(--admin-primary))] transition-colors">
                        Audit Logs
                    </Link>
                </div>
            </div>
        </div>
    );
}
