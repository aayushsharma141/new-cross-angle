import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useAdminDisplayName } from "@/hooks/useAdminDisplayName";
import { useAdmin } from "@/context/AdminContext";
import { useSystem } from "@/context/SystemContext";
import { useEffect } from "react";
import { useHubStats, getModules, type ModuleTileProps } from "@/hooks/useHubStats";
import {
    ArrowRight,
    Activity,
    Bell,
    RefreshCw,
    Shield,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/primitives/button";
import { CountUp, SpotlightCard } from "@/components/ReactBits/index";

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
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="h-full"
        >
            <Link
                to={href}
                onClick={() => setCurrentModule(title)}
                className={cn(
                    "group relative flex flex-col rounded-2xl border h-full",
                    urgent
                        ? "border-[hsl(var(--admin-wine))]/40 shadow-[0_20px_40px_rgba(150,0,0,0.12)]"
                        : featured
                        ? "border-[hsl(var(--admin-primary))]/40 shadow-[0_20px_40px_rgba(212,175,55,0.08)]"
                        : "border-[hsl(var(--admin-border))]/60 shadow-[0_10px_30px_rgba(0,0,0,0.05)]",
                    "bg-[hsl(var(--admin-card))] backdrop-blur-xl text-left",
                    "transition-all duration-500 ease-out cursor-pointer overflow-hidden",
                    "hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)]",
                    !featured && !urgent && "hover:border-[hsl(var(--admin-primary))]/40",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-primary))]/50",
                )}
            >
            <SpotlightCard 
                className="flex flex-col flex-1 h-full w-full"
                spotlightColor={urgent ? "rgba(150,0,0,0.15)" : featured ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.05)"}
            >
            {/* Ambient Background Glow */}
            <div
                className={cn(
                    "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 transition-opacity duration-700 group-hover:opacity-20",
                    urgent ? "bg-[hsl(var(--admin-wine))]" : "bg-[hsl(var(--admin-primary))]"
                )}
            />

            {/* ── Zone 1: Header (Icon + Title + Badge) ── */}
            <div className="flex items-center gap-3 p-6 pb-4">
                <div
                    className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-500",
                        urgent
                            ? "bg-[hsl(var(--admin-wine))]/10 text-[hsl(var(--admin-wine))] border-[hsl(var(--admin-wine))]/20 group-hover:bg-[hsl(var(--admin-wine))]/20"
                            : "bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-primary))] group-hover:bg-[hsl(var(--admin-primary))]/10 group-hover:border-[hsl(var(--admin-primary))]/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    )}
                >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>

                <h3 className="flex-1 text-lg font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight group-hover:text-[hsl(var(--admin-primary))] transition-colors duration-300 leading-tight truncate">
                    {title}
                </h3>

                <div className="flex items-center gap-2 shrink-0">
                    {badge && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))]/20 uppercase tracking-wider">
                            {badge}
                        </span>
                    )}
                    {urgent && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[hsl(var(--admin-wine))]/15 text-[hsl(var(--admin-wine))] border border-[hsl(var(--admin-wine))]/25 uppercase tracking-wider animate-pulse">
                            Action Required
                        </span>
                    )}
                </div>
            </div>

            {/* ── Zone 2: Description + Stats ── */}
            <div className="flex-1 px-6 pt-2 pb-4 flex flex-col gap-5">
                <p className="text-sm leading-relaxed text-[hsl(var(--admin-muted))] font-sans opacity-80 group-hover:opacity-100 transition-opacity">
                    {description}
                </p>

                {/* Refined Stat Grid */}
                <div className="grid grid-cols-2 gap-6 mt-auto pt-2">
                    {(quickStats ?? [{ label: "Status", value: "Ready" }]).slice(0, 2).map((stat, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                            {typeof stat.value === "number" ? (
                                <CountUp
                                    to={stat.value}
                                    duration={1.2}
                                    className={cn(
                                        "text-xl font-bold tabular-nums tracking-tight transition-transform duration-300 group-hover:-translate-y-0.5",
                                        urgent
                                            ? "text-[hsl(var(--admin-wine))]"
                                            : featured
                                            ? "text-[hsl(var(--admin-primary))]"
                                            : "text-[hsl(var(--admin-text))]"
                                    )}
                                />
                            ) : (
                                <span
                                    className={cn(
                                        "text-xl font-bold tabular-nums tracking-tight transition-transform duration-300 group-hover:-translate-y-0.5",
                                        urgent
                                            ? "text-[hsl(var(--admin-wine))]"
                                            : featured
                                            ? "text-[hsl(var(--admin-primary))]"
                                            : "text-[hsl(var(--admin-text))]"
                                    )}
                                >
                                    {stat.value}
                                </span>
                            )}
                            <span
                                className={cn(
                                    "text-[11px] font-semibold uppercase tracking-[0.05em] text-[hsl(var(--admin-muted))] transition-colors duration-300 group-hover:text-[hsl(var(--admin-text))]/70",
                                    urgent && "text-[hsl(var(--admin-wine))]/70"
                                )}
                            >
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Zone 3: Insight & Action ── */}
            <div className="px-6 pb-6 pt-5 bg-gradient-to-b from-transparent to-[hsl(var(--admin-surface))]/50 flex flex-col gap-4 relative before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[hsl(var(--admin-border))]/50 before:to-transparent">
                {insight && (
                    <div
                        className={cn(
                            "w-full px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-2 transition-all duration-500 ease-out",
                            "opacity-70 group-hover:opacity-100 group-hover:translate-x-1",
                            insight.type === "alert" &&
                                "bg-[hsl(var(--admin-wine))]/10 text-[hsl(var(--admin-wine))] border border-[hsl(var(--admin-wine))]/20",
                            insight.type === "info" &&
                                "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))]/20",
                            insight.type === "success" &&
                                "bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))] border border-[hsl(var(--admin-success))]/20"
                        )}
                    >
                        <div className="p-1 rounded-full bg-white/5">
                            {insight.type === "alert" && <Bell className="w-3 h-3" />}
                            {insight.type === "info" && <Activity className="w-3 h-3" />}
                            {insight.type === "success" && <Sparkles className="w-3 h-3" />}
                        </div>
                        <span className="truncate flex-1">{insight.text}</span>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    {primaryAction ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 text-xs px-0 hover:bg-transparent group/btn flex items-center gap-2 transition-all font-medium",
                                urgent
                                    ? "text-[hsl(var(--admin-wine))] hover:text-[hsl(var(--admin-wine))]/80"
                                    : "text-[hsl(var(--admin-primary))] hover:text-[hsl(var(--admin-primary))]/80"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(primaryAction.href);
                            }}
                        >
                            <span>{primaryAction.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    ) : (
                        <span className="text-[11px] text-[hsl(var(--admin-muted))]">Explore Module</span>
                    )}
                    
                    {!primaryAction && (
                         <ArrowRight
                         className={cn(
                             "w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
                             urgent ? "text-[hsl(var(--admin-wine))]" : "text-[hsl(var(--admin-primary))]"
                         )}
                     />
                    )}
                </div>
            </div>
            </SpotlightCard>
            </Link>
        </motion.div>
    );
};



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
        "flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300",
        variant === "warning" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
        variant === "success" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        variant === "default" && "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary))]/20",
        variant === "muted" && "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-muted))] border-[hsl(var(--admin-border))]"
    );
    return (
        <Link
            to={href}
            className="group flex items-center gap-3.5 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-[hsl(var(--admin-primary))]/5"
            title={`Go to ${label}`}
        >
            <div className={iconClass}>
                <Icon className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-[11px] text-[hsl(var(--admin-text))] font-bold">{label}</p>
                <p className="text-[13px] font-bold text-[hsl(var(--admin-text))] group-hover:text-[hsl(var(--admin-primary))] transition-colors leading-none">
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
    const { role } = useAdminAuth();
    const { can } = usePermissions();
    const { displayName } = useAdminDisplayName();
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

    const handleRefresh = () => {
        refreshHealth();
        void refresh();
    };

    const allModules = getModules(stats);
    const filteredModules = allModules.filter(
        (m) => !m.allowedRoles || (role && m.allowedRoles.includes(role))
    );

    return (
        <div className="w-full h-full flex-1 flex flex-col overflow-y-auto bg-[hsl(var(--admin-background))]">
            {/* ── Top Intelligence Strip ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-none w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-4 sm:px-6 md:px-8 pt-6 pb-4 border-b border-[hsl(var(--admin-border))]/30 bg-[hsl(var(--admin-background))] backdrop-blur-md sticky top-0 z-30"
            >
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-1 w-1 rounded-full bg-[hsl(var(--admin-primary))]" />
                        <span className="text-[10px] text-[hsl(var(--admin-primary))] uppercase tracking-[0.25em] font-bold">
                            Intelligence Command
                        </span>
                    </div>
                    <h1 className="text-2xl font-serif text-[hsl(var(--admin-text))] tracking-tight leading-tight">
                        Welcome,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--admin-primary))] via-yellow-400 to-[hsl(var(--admin-primary))] italic font-medium">
                            {displayName}
                        </span>
                    </h1>
                </div>

                {/* KPI Action Strip */}
                <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-[hsl(var(--admin-surface))]/40 border border-[hsl(var(--admin-border))]/40 backdrop-blur-md shadow-sm shrink-0">
                    <KpiChip
                        icon={Bell}
                        label="Attention"
                        href="/admin/crm/leads?filter=new"
                        value={isRefreshing ? "…" : stats.newLeads > 0 ? `${stats.newLeads} Priority` : "All Clear"}
                        variant={stats.newLeads > 0 ? "warning" : "muted"}
                    />

                    <div className="h-6 w-px bg-[hsl(var(--admin-border))]/50" />

                    <KpiChip
                        icon={Activity}
                        label="Pulse"
                        href="/admin/dashboard"
                        value={isRefreshing ? "…" : `${stats.actionsToday} Activity`}
                        variant="default"
                    />

                    {can('settings', 'view') && (
                        <>
                            <div className="h-6 w-px bg-[hsl(var(--admin-border))]/50 hidden sm:block" />
                            <div className="hidden sm:block">
                                <KpiChip
                                    icon={Shield}
                                    label="Security"
                                    href="/admin/system/settings"
                                    value={health.status === "healthy" ? "Optimal" : "Check"}
                                    variant={health.status === "healthy" ? "success" : "warning"}
                                />
                            </div>
                        </>
                    )}

                    <div className="h-6 w-px bg-[hsl(var(--admin-border))]/50" />

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh dashboard metrics"
                        className="flex items-center justify-center h-8 w-8 rounded-lg text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/10 transition-all disabled:opacity-50 border border-transparent hover:border-[hsl(var(--admin-primary))]/20"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </button>
                </div>
            </motion.div>

            {/* ── Main Module Grid ── */}
            <div className="flex-1 w-full px-2 py-8 min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                    {filteredModules.map((mod, i) => (
                        <ModuleTile 
                            key={mod.title} 
                            {...mod} 
                            index={i} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
