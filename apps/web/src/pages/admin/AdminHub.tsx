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
    History,
    Settings,
    ArrowRight,
    Activity,
    Bell,
    Database,
    RefreshCw,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/tokens/icons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const MotionLink = motion(Link);

/* ───────────────────────────────────────────────
   Live Hub Stats
   ─────────────────────────────────────────────── */
interface HubStats {
    actionsToday: number;
    newLeads: number;
    storageUsedGB: number;
    storageTotalGB: number;
}

function useHubStats() {
    const [stats, setStats] = useState<HubStats>({
        actionsToday: 0,
        newLeads: 0,
        storageUsedGB: 0,
        storageTotalGB: 20,
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
            ] = await Promise.all([
                // Today's lead activities
                supabase
                    .from("lead_activities")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", todayStart.toISOString()),
                // Today's content versions (CMS edits)
                supabase
                    .from("content_versions")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", todayStart.toISOString()),
                // New (unread) leads
                supabase
                    .from("leads")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "new"),
                // Storage: sum of media file sizes
                supabase
                    .from("media")
                    .select("size_bytes"),
            ]);

            const totalBytes = (mediaData ?? []).reduce(
                (sum, m) => sum + (m.size_bytes ?? 0),
                0
            );
            const usedGB = totalBytes / (1024 * 1024 * 1024);

            setStats({
                actionsToday: (activityCount ?? 0) + (versionCount ?? 0),
                newLeads: newLeadCount ?? 0,
                storageUsedGB: usedGB,
                storageTotalGB: 20,
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
   Module Tile Component (Intelligence OS Style)
   ─────────────────────────────────────────────── */
interface ModuleTileProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    index: number;
    badge?: string;
}

const ModuleTile = ({ title, description, icon: Icon, href, index, badge }: ModuleTileProps) => {
    const { setCurrentModule } = useAdmin();

    return (
        <MotionLink
            to={href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => {
                setCurrentModule(title);
            }}
            className={cn(
                "group relative flex flex-col items-start gap-4 rounded-xl border border-zinc-800/50",
                "bg-zinc-900/40 backdrop-blur-md p-6 text-left shadow-2xl",
                "transition-all duration-500 ease-out cursor-pointer",
                "hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] hover:border-yellow-500/30",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50",
                "min-h-[160px]"
            )}
        >
            {/* Top Glow Decor */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon & Badge */}
            <div className="flex w-full items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-yellow-500/80 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 group-hover:border-yellow-500/20 transition-all duration-300 shadow-inner">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                {badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest animate-pulse">
                        {badge}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1.5">
                <h3 className="text-lg font-serif font-medium text-zinc-100 tracking-tight group-hover:text-yellow-500 transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-500 line-clamp-2 font-sans">
                    {description}
                </p>
            </div>

            {/* Footer indicator */}
            <div className="w-full flex items-center justify-end pt-2">
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
            </div>
        </MotionLink>
    );
};

/* ───────────────────────────────────────────────
   Launcher Meta Modules (8 Cards)
   ─────────────────────────────────────────────── */
const MODULES: Omit<ModuleTileProps, "index">[] = [
    {
        title: "Intelligence Hub",
        description: "Central command tower. Website activity, server health, and business analytics.",
        icon: Activity,
        href: "/admin/dashboard",
        badge: "Control"
    },
    {
        title: "CMS",
        description: "Complete content management. Portfolio, services, testimonials, and media.",
        icon: FileText,
        href: "/admin/cms/portfolio",
    },
    {
        title: "CRM",
        description: "Lead pipeline management. Track high-intent enquiries and client details.",
        icon: Users,
        href: "/admin/crm/leads",
    },
    {
        title: "Blog Analytics",
        description: "Content intelligence, article reach, and audience discovery metrics.",
        icon: BarChart3,
        href: "/admin/blog/overview",
        badge: "Intelligence"
    },
    {
        title: "Discovery Engine",
        description: "Analytics and stage funnel breakdown for the interactive style quiz.",
        icon: Sparkles,
        href: "/admin/discovery/analytics",
    },
    {
        title: "Estimator Engine",
        description: "Pricing configuration, stage builder, and project scope logic.",
        icon: Calculator,
        href: "/admin/estimator/leads",
    },
    {
        title: "System Settings",
        description: "Global site configuration, integrations, and security policies.",
        icon: Settings,
        href: "/admin/system/settings",
    },
    {
        title: "User Access",
        description: "Manage admin users, role assignment, and account permissions.",
        icon: Shield,
        href: "/admin/access",
    },
    {
        title: "Logs & Audit",
        description: "Detailed system logs, active sessions, and admin activity history.",
        icon: History,
        href: "/admin/system/settings?tab=audit",
    },
];

/* ───────────────────────────────────────────────
   Admin Hub (The Launcher)
   ─────────────────────────────────────────────── */
export default function AdminHub() {
    const { user, role } = useAdminAuth();
    const { health, refreshHealth } = useSystem();
    const { stats, isRefreshing, refresh } = useHubStats();
    const { toast } = useToast();
    const location = useLocation();

    // Handle access denied feedback from RoleGuard
    useEffect(() => {
        const state = location.state as { accessDenied?: boolean; role?: string } | null;
        if (state?.accessDenied) {
            toast({
                title: "Permission Denied",
                description: `Your account (${state.role || 'no role'}) does not have access to that module.`,
                variant: "destructive"
            });
            // Clear state so toast doesn't reappear on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, toast]);

    const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "sharma1.aayu";

    const handleRefresh = () => {
        refreshHealth();
        void refresh();
    };

    const formatStorage = (usedGB: number, totalGB: number): string => {
        if (usedGB < 0.001) return `0 MB of ${totalGB}GB utilized`;
        if (usedGB < 1) return `${(usedGB * 1024).toFixed(1)}MB of ${totalGB}GB utilized`;
        return `${usedGB.toFixed(1)}GB of ${totalGB}GB utilized`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-4">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-yellow-500/50" />
                        <span className="text-[10px] text-yellow-500 uppercase tracking-[0.3em] font-medium">Design Intelligence OS</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-serif text-white tracking-tight">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 italic font-medium">{displayName}</span>
                    </h1>
                    <p className="text-sm text-zinc-500 font-sans max-w-sm">
                        Enterprise command center for CrossAngle Interior business ecosystem. Select a terminal to begin operation.
                    </p>
                </motion.div>

                {/* Quick Status Bar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-6 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl"
                >
                    <div className="space-y-1">
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">System Health</p>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", health.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500')} />
                            <span className="text-xs font-medium text-zinc-300">Operations Normal</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-zinc-800" />
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Security</p>
                        <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 justify-end">
                            <Shield className="w-3 h-3" /> Encrypted
                        </p>
                    </div>
                    <div className="h-8 w-px bg-zinc-800" />
                    {/* Refresh Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh hub statistics"
                        title="Refresh all stats"
                        className="h-9 w-9 text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/5 rounded-lg transition-all"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </Button>
                </motion.div>
            </div>

            {/* 8-Card Grid (4x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MODULES.map((mod, i) => (
                    <ModuleTile key={mod.title} {...mod} index={i} />
                ))}
            </div>

            {/* Bottom Insight Row — Live Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Card 1: Recent Activity */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-xl flex items-center gap-4 group hover:border-yellow-500/20 transition-all">
                    <div className="p-3 bg-zinc-900 rounded-lg text-zinc-500 group-hover:text-yellow-500 transition-colors shadow-inner">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-zinc-100">Recent Activity</p>
                        {isRefreshing ? (
                            <p className="text-[10px] text-zinc-500 mt-0.5 animate-pulse">Refreshing…</p>
                        ) : (
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                {stats.actionsToday === 0
                                    ? "No actions logged today"
                                    : `${stats.actionsToday} action${stats.actionsToday === 1 ? "" : "s"} logged today`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Card 2: Lead Notifications */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-xl flex items-center gap-4 group hover:border-yellow-500/20 transition-all">
                    <div className="p-3 bg-zinc-900 rounded-lg text-zinc-500 group-hover:text-yellow-500 transition-colors shadow-inner">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-zinc-100">Lead Notifications</p>
                        {isRefreshing ? (
                            <p className="text-[10px] text-zinc-500 mt-0.5 animate-pulse">Refreshing…</p>
                        ) : (
                            <p className="text-[10px] mt-0.5 font-medium"
                                style={{ color: stats.newLeads > 0 ? '#f59e0b' : '#71717a' }}
                            >
                                {stats.newLeads === 0
                                    ? "No new leads"
                                    : `${stats.newLeads} new high-intent lead${stats.newLeads === 1 ? "" : "s"}`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Card 3: Storage Status */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-xl flex items-center gap-4 group hover:border-yellow-500/20 transition-all">
                    <div className="p-3 bg-zinc-900 rounded-lg text-zinc-500 group-hover:text-yellow-500 transition-colors shadow-inner">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-zinc-100">Storage Status</p>
                        {isRefreshing ? (
                            <p className="text-[10px] text-zinc-500 mt-0.5 animate-pulse">Refreshing…</p>
                        ) : (
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                {formatStorage(stats.storageUsedGB, stats.storageTotalGB)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Meta */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-12 border-t border-zinc-900 text-[10px] text-zinc-600 uppercase tracking-widest font-medium"
            >
                <div className="flex items-center gap-3">
                    <span className="text-zinc-800">●</span>
                    <span>CrossAngle Intelligence · v3.0.0 Stable</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/admin/dashboard" className="hover:text-yellow-500 transition-colors">Analytics</Link>
                    <Link to="/admin/system/settings" className="hover:text-yellow-500 transition-colors">Settings</Link>
                    <Link to="/admin/system/settings?tab=audit" className="hover:text-yellow-500 transition-colors">Audit Logs</Link>
                </div>
            </motion.footer>
        </div>
    );
}
