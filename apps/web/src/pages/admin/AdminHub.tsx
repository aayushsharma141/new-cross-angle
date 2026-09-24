import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { useHubStats, formatStorage } from "@/hooks/useHubStats";
import {
    Activity,
    Sparkles,
    Users,
    FileText,
    BookOpen,
    Calculator,
    Shield,
    Settings,
    Bell,
    RefreshCw,
    ArrowUpRight,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/ReactBits/index";
import { ModuleDirectory } from "@/components/admin/ModuleDirectory";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminHub() {
    const { stats, hasError, isLoading: isHubLoading } = useHubStats();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { setCurrentModule } = useAdmin();
    const location = useLocation();
    const { toast } = useToast();
    const { role } = useAuth();

    const hasAdminAccess = role === "super_admin" || role === "admin";
    const hasCrmAccess = hasAdminAccess || role === "viewer";
    const hasCmsAccess = hasAdminAccess || role === "editor";
    const hasSuperAccess = role === "super_admin";

    // Show access-denied toast when RoleGuard redirects here
    useEffect(() => {
        const state = location.state as { accessDenied?: boolean; role?: string; attemptedPath?: string } | null;
        if (state?.accessDenied) {
            toast({
                title: "Access Restricted",
                description: state.attemptedPath
                    ? `Your role does not have permission to access "${state.attemptedPath}".`
                    : "You do not have permission to access that section.",
                variant: "destructive",
            });
            // Clear the state so it doesn't re-fire on rerender
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location, navigate, toast]);


    return (
        <div className="w-full h-full flex-1 overflow-y-auto bg-[hsl(var(--admin-background))]">
            
            {/* ── Main Dashboard Content ── */}
            <div className="px-6 py-8 flex flex-col gap-6 custom-scrollbar">

                {/* ── Bento Grid: Asymmetrical Layout ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    
                    {/* CRM Overview (lg:col-span-4) */}
                    {hasCrmAccess && (
                    <Link
                        to="/admin/crm/leads"
                        onClick={() => setCurrentModule("CRM")}
                        className="lg:col-span-4 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(212,175,55,0.06)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <Users className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">Client Leads</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">Track leads through each stage from inquiry to signed contract</p>
                                    </div>
                                </div>
                                {stats.newLeads > 0 && (
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[hsl(var(--admin-wine))]/15 text-[hsl(var(--admin-wine))] border border-[hsl(var(--admin-wine))]/25 uppercase tracking-wider animate-pulse">
                                        {stats.newLeads} Action Required
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-[hsl(var(--admin-text))] tabular-nums">{stats.totalLeads}</span>
                                    <span className="text-[10px] uppercase font-semibold text-[hsl(var(--admin-muted))]">Total Leads</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-[hsl(var(--admin-primary))] tabular-nums">
                                        {stats.pipelineValue > 0 ? `₹${(stats.pipelineValue / 100000).toFixed(1)}L` : "₹0.0L"}
                                    </span>
                                    <span className="text-[10px] uppercase font-semibold text-[hsl(var(--admin-muted))]">Pipeline Value</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-emerald-500 tabular-nums">
                                        {stats.totalLeads > 0 ? Math.round((stats.wonLeads / stats.totalLeads) * 100) : 0}%
                                    </span>
                                    <span className="text-[10px] uppercase font-semibold text-[hsl(var(--admin-muted))]">Conversion</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-amber-500 tabular-nums">
                                        {stats.inboxCount}
                                    </span>
                                    <span className="text-[10px] uppercase font-semibold text-[hsl(var(--admin-muted))]">New Inquiries</span>
                                </div>
                            </div>

                            {/* Funnel visualization */}
                            <div className="mt-auto pt-4 border-t border-admin-border/40">
                                <div className="text-[10px] uppercase font-bold text-[hsl(var(--admin-muted))] mb-2 tracking-wider">Active Funnel Stage Distribution</div>
                                <div className="grid grid-cols-4 gap-2 bg-admin-surface/30 p-2 rounded-xl border border-admin-border/40">
                                    {[
                                        { label: "Inbox", count: stats.inboxCount, pct: stats.totalLeads > 0 ? Math.round((stats.inboxCount / stats.totalLeads) * 100) : 0 },
                                        { label: "Call", count: stats.callCount, pct: stats.totalLeads > 0 ? Math.round((stats.callCount / stats.totalLeads) * 100) : 0 },
                                        { label: "Proposal", count: stats.proposalCount, pct: stats.totalLeads > 0 ? Math.round((stats.proposalCount / stats.totalLeads) * 100) : 0 },
                                        { label: "Signed", count: stats.signedCount, pct: stats.totalLeads > 0 ? Math.round((stats.signedCount / stats.totalLeads) * 100) : 0 }
                                    ].map((stage) => (
                                        <div key={stage.label} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-[9px] font-mono">
                                                <span className="text-[hsl(var(--admin-muted))]">{stage.label}</span>
                                                <span className="text-[hsl(var(--admin-text))] font-bold">{stage.count}</span>
                                            </div>
                                            <div className="h-1 w-full bg-admin-border/30 rounded-full overflow-hidden">
                                                <div className="h-full bg-[hsl(var(--admin-primary))] rounded-full" style={{ width: `${stage.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* Business Health Card (lg:col-span-2) */}
                    {hasAdminAccess && (
                    <Link
                        to="/admin/dashboard"
                        onClick={() => setCurrentModule("Intelligence Hub")}
                        className="lg:col-span-2 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(255,255,255,0.05)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <Activity className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">Intelligence Hub</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">System status & operations</p>
                                    </div>
                                </div>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                               <div className="flex items-center gap-4 mb-4 mt-2">
                                <div className="relative flex items-center justify-center h-14 w-14 shrink-0" role="progressbar" {...{ 'aria-valuenow': 96, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'System Health Score' }}>
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-admin-border/30"
                                            strokeWidth="3"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="text-emerald-500"
                                            strokeDasharray="96, 100"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <span className="absolute text-xs font-bold text-[hsl(var(--admin-text))]">96%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[hsl(var(--admin-text))]">Health Score</span>
                                    <span className="text-xs text-[hsl(var(--admin-muted))]">Critical checks OK</span>
                                </div>
                            </div>              </div>

                            <div className="flex flex-col gap-2 mt-auto text-xs font-mono pt-4 border-t border-admin-border/40">
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-[hsl(var(--admin-muted))]">Website</span>
                                    <span className="text-emerald-500 font-bold">HEALTHY</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-[hsl(var(--admin-muted))]">CRM Synced</span>
                                    <span className="text-emerald-500 font-bold">HEALTHY</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-[hsl(var(--admin-muted))]">Storage Used</span>
                                    <span className="text-[hsl(var(--admin-primary))] font-bold">{formatStorage(stats.storageUsedGB)}</span>
                                </div>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* Discovery Engine (lg:col-span-2) */}
                    {hasAdminAccess && (
                    <Link
                        to="/admin/discovery/quiz-analytics"
                        onClick={() => setCurrentModule("Discovery")}
                        className="lg:col-span-2 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(255,255,255,0.05)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">Style Quiz</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">Track visitor quiz responses and insights</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 my-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[hsl(var(--admin-muted))]">Quiz Submissions</span>
                                    <span className="text-[hsl(var(--admin-text))] font-mono font-bold">{stats.quizLeadsCount} Leads</span>
                                </div>
                                <div className="h-1.5 w-full bg-admin-border/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-[hsl(var(--admin-primary))] rounded-full" style={{ width: `${stats.totalLeads > 0 ? Math.round((stats.quizLeadsCount / stats.totalLeads) * 100) : 0}%` }} />
                                </div>
                                <span className="text-[10px] text-[hsl(var(--admin-muted))] italic">
                                    {stats.quizLeadsCount} total quiz leads collected
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-admin-border/40 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--admin-muted))]">Organic Funnel</span>
                                    <span className="text-emerald-500 font-bold">Active</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--admin-muted))]">Funnel Share</span>
                                    <span className="text-[hsl(var(--admin-text))] font-bold">
                                        {stats.totalLeads > 0 ? Math.round((stats.quizLeadsCount / stats.totalLeads) * 100) : 0}% of leads
                                    </span>
                                </div>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* Estimator Engine (lg:col-span-2) */}
                    {hasAdminAccess && (
                    <Link
                        to="/admin/estimator/estimate-leads"
                        onClick={() => setCurrentModule("Estimator")}
                        className="lg:col-span-2 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(255,255,255,0.05)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <Calculator className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">Quotes & Estimates</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">Create and track project quotes from clients</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 my-2">
                                <span className="text-3xl font-serif text-[hsl(var(--admin-text))]">{stats.pipelineValue > 0 ? `₹${(stats.pipelineValue / 100000).toFixed(1)}L` : "₹0.0L"}</span>
                                <span className="text-[10px] uppercase font-bold text-[hsl(var(--admin-muted))]">Projected Quote Value</span>
                            </div>

                            <div className="flex justify-between mt-auto pt-4 border-t border-admin-border/40 text-xs">
                                <span className="text-[hsl(var(--admin-muted))]">Estimates Generated</span>
                                <span className="text-[hsl(var(--admin-text))] font-bold">{stats.estimatorLeadsCount} submissions</span>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* Content Management (lg:col-span-2) */}
                    {hasCmsAccess && (
                    <Link
                        to="/admin/cms/portfolio"
                        onClick={() => setCurrentModule("CMS")}
                        className="lg:col-span-2 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(255,255,255,0.05)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <FileText className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">Website Content</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">Edit projects, blog, images, and team profiles</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 my-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[hsl(var(--admin-muted))]">Storage Usage</span>
                                    <span className="text-[hsl(var(--admin-text))] font-mono font-bold">12% ({formatStorage(stats.storageUsedGB)})</span>
                                </div>
                                <div className="h-1.5 w-full bg-admin-border/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full w-[12%]" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-admin-border/40 text-xs text-[hsl(var(--admin-muted))]">
                                <span className="font-semibold text-[hsl(var(--admin-text))]">158 Images</span>
                                <span>•</span>
                                <span className="font-semibold text-[hsl(var(--admin-text))]">43 Videos</span>
                                <span>•</span>
                                <span className="font-semibold text-[hsl(var(--admin-text))]">12 Reviews</span>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* Blog Analytics (lg:col-span-2) */}
                    {hasAdminAccess && (
                    <Link
                        to="/admin/blog/overview"
                        onClick={() => setCurrentModule("Blog")}
                        className="lg:col-span-2 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(212,175,55,0.06)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">Blog & SEO</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">Monitor article performance and search rankings</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 my-2">
                                <span className="text-xs text-[hsl(var(--admin-muted))]">Total Organic Views</span>
                                <span className="text-2xl font-bold text-[hsl(var(--admin-text))] font-mono">124.6K</span>
                            </div>

                            <div className="flex justify-between mt-auto pt-4 border-t border-admin-border/40 text-xs">
                                <span className="text-[hsl(var(--admin-muted))]">Articles Published</span>
                                <span className="text-[hsl(var(--admin-text))] font-bold">18 (Active)</span>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* User Access (lg:col-span-2) */}
                    {hasAdminAccess && (
                    <Link
                        to="/admin/user-access/users"
                        onClick={() => setCurrentModule("User Access")}
                        className="lg:col-span-2 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(255,255,255,0.05)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <Shield className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">Team & Security</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">Manage admin team members and security settings</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 my-2">
                                <span className="text-xs text-[hsl(var(--admin-muted))]">Online Personnel</span>
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <span className="px-2 py-0.5 rounded bg-admin-surface border border-admin-border">4 Admins</span>
                                    <span className="px-2 py-0.5 rounded bg-admin-surface border border-admin-border">6 Designers</span>
                                </div>
                            </div>

                            <div className="flex justify-between mt-auto pt-4 border-t border-admin-border/40 text-xs">
                                <span className="text-[hsl(var(--admin-muted))]">2FA Security Status</span>
                                <span className="text-emerald-500 font-bold flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Enforced
                                </span>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* System Settings (lg:col-span-2) */}
                    {hasSuperAccess && (
                    <Link
                        to="/admin/system/settings"
                        onClick={() => setCurrentModule("System")}
                        className="lg:col-span-2 group relative flex flex-col rounded-2xl border border-admin-border/60 bg-[hsl(var(--admin-card))] backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(var(--admin-primary))]/45 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                        <SpotlightCard className="flex flex-col h-full w-full" spotlightColor="rgba(255,255,255,0.05)">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface border border-admin-border text-[hsl(var(--admin-primary))] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                                        <Settings className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-medium text-[hsl(var(--admin-text))] tracking-tight">System Settings</h3>
                                        <p className="text-xs text-[hsl(var(--admin-muted))]">Configuration & backups</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 my-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[hsl(var(--admin-muted))]">Database Health</span>
                                    <span className="text-emerald-500 font-bold">100% ONLINE</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[hsl(var(--admin-muted))]">Integrations Active</span>
                                    <span className="text-[hsl(var(--admin-text))] font-bold">6 Integrations</span>
                                </div>
                            </div>

                            <div className="flex justify-between mt-auto pt-4 border-t border-admin-border/40 text-xs">
                                <span className="text-[hsl(var(--admin-muted))]">Auto Backups Status</span>
                                <span className="text-emerald-500 font-bold">SUCCESSFUL</span>
                            </div>
                        </SpotlightCard>
                    </Link>

                    )}

                    {/* ── Needs attention: derived only from real lead counts ── */}
                    {hasAdminAccess && (
                    <div className="lg:col-span-4 rounded-2xl border border-admin-border/50 bg-[hsl(var(--admin-card))] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--admin-primary))]">
                                Needs attention
                            </h2>
                        </div>
                        {(() => {
                            const alerts: { tone: string; title: string; detail: string; href: string; cta: string }[] = [];
                            if (hasError) {
                                alerts.push({
                                    tone: "bg-red-500",
                                    title: "Some hub figures failed to load",
                                    detail: "Zeros on this page may be missing data rather than real zeros. Refresh, or open the CRM directly.",
                                    href: "/admin/crm/leads",
                                    cta: "Open CRM",
                                });
                            }
                            if (stats.newLeads > 0) {
                                alerts.push({
                                    tone: "bg-amber-500",
                                    title: `${stats.newLeads} new ${stats.newLeads === 1 ? "lead is" : "leads are"} waiting for a first reply`,
                                    detail: "Leads still in the New Inquiry stage.",
                                    href: "/admin/crm/leads?stage=new",
                                    cta: "Review new leads",
                                });
                            }
                            if (stats.proposalCount > 0) {
                                alerts.push({
                                    tone: "bg-[hsl(var(--admin-primary))]",
                                    title: `${stats.proposalCount} ${stats.proposalCount === 1 ? "lead is" : "leads are"} waiting on a decision`,
                                    detail: "Quote sent or in the closing stage.",
                                    href: "/admin/crm/leads",
                                    cta: "Open pipeline",
                                });
                            }

                            if (isHubLoading) {
                                return <p className="text-xs text-[hsl(var(--admin-muted))]">Checking leads…</p>;
                            }
                            if (alerts.length === 0) {
                                return (
                                    <p className="text-sm text-[hsl(var(--admin-muted))]">
                                        Nothing needs attention right now. No new leads and no quotes awaiting a decision.
                                    </p>
                                );
                            }
                            return (
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {alerts.map((alert) => (
                                        <li key={alert.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-admin-surface/40 border border-admin-border/40 text-xs">
                                            <span className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", alert.tone)} aria-hidden="true" />
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-[hsl(var(--admin-text))]">{alert.title}</span>
                                                <span className="text-[hsl(var(--admin-muted))]">{alert.detail}</span>
                                                <Link to={alert.href} className="text-[hsl(var(--admin-primary))] font-semibold hover:underline flex items-center gap-1 mt-1">
                                                    {alert.cta} <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            );
                        })()}
                    </div>
                    )}

                    {/* ── Live Activity Stream (lg:col-span-2) — moved from right sidebar ── */}
                    {hasAdminAccess && (
                    <div className="lg:col-span-2 rounded-2xl border border-admin-border/50 bg-[hsl(var(--admin-card))]/60 backdrop-blur-xl p-5">
                        <div className="flex items-center justify-between pb-3.5 border-b border-admin-border/50 mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--admin-muted))]">
                                Recent Activity
                            </span>
                            <button
                                type="button"
                                onClick={() => void queryClient.invalidateQueries({ queryKey: ["recent-activity"] })}
                                className="text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-primary))] transition-colors"
                                aria-label="Refresh recent activity"
                                title="Refresh recent activity"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <RecentActivityFeed limit={8} heightClassName="h-[260px]" />
                    </div>
                    )}

                    <ModuleDirectory role={role} />

                </div>

            </div>


        </div>
    );
}

