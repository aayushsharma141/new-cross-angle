import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    BarChart3,
    Users,
    FileText,
    Sparkles,
    Calculator,
    ArrowRight,
    Settings,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { icons } from "@/design-system/tokens/icons";

/* ───────────────────────────────────────────────
   Module Tile Component
   ─────────────────────────────────────────────── */
interface ModuleTileProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    index: number;
}

const ModuleTile = ({ title, description, icon: Icon, href, index }: ModuleTileProps) => {
    const navigate = useNavigate();

    return (
        <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.35, ease: "easeOut" }}
            onClick={() => navigate(href)}
            className={cn(
                "group relative flex flex-col items-start gap-4 rounded-2xl border border-zinc-200/80",
                "bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
                "transition-all duration-300 ease-out cursor-pointer",
                "hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(124,41,87,0.08)] hover:border-[#7c2957]/25",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c2957]/40 focus-visible:ring-offset-2",
                "min-h-[160px] sm:min-h-[180px]"
            )}
        >
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 text-[#7c2957]/70 group-hover:bg-[#7c2957]/5 group-hover:text-[#7c2957] group-hover:border-[#7c2957]/15 transition-colors duration-300">
                <Icon className={icons.lg} strokeWidth={1.75} />
            </div>

            {/* Text */}
            <div className="flex-1 space-y-1.5">
                <h3 className="text-base font-semibold text-zinc-900 tracking-tight group-hover:text-[#7c2957] transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Arrow indicator */}
            <div className="absolute bottom-5 right-5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className={icons.sm} />
            </div>
        </motion.button>
    );
};

/* ───────────────────────────────────────────────
   Module definitions
   ─────────────────────────────────────────────── */
const MODULES: Omit<ModuleTileProps, "index">[] = [
    {
        title: "Main Dashboard",
        description: "View key metrics, recent activity, and overall system health.",
        icon: BarChart3,
        href: "/admin/dashboard",
    },
    {
        title: "CMS",
        description: "Create, edit, and publish website pages, blog posts, portfolio, and media.",
        icon: FileText,
        href: "/admin/cms",
    },
    {
        title: "CRM",
        description: "Track incoming leads, manage client pipelines, and monitor users.",
        icon: Users,
        href: "/admin/crm",
    },
    {
        title: "Discovery Engine",
        description: "Configure style quiz rules, view analytics, and discover insights.",
        icon: Sparkles,
        href: "/admin/discovery",
    },
    {
        title: "Estimator Engine",
        description: "Generate project scopes, automate quotes, and manage pricing.",
        icon: Calculator,
        href: "/admin/estimator",
    },
    {
        title: "System Settings",
        description: "Monitor active sessions, security logs, team access and configuration.",
        icon: Settings,
        href: "/admin/system",
    },
];

/* ───────────────────────────────────────────────
   Admin Hub Page
   ─────────────────────────────────────────────── */
export default function AdminHub() {
    const { user } = useAdminAuth();

    const displayName =
        (user?.user_metadata?.full_name as string | undefined) ||
        user?.email?.split("@")[0] ||
        "Administrator";

    return (
        <div className="py-6 px-2 sm:px-4 md:px-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <AdminBreadcrumb items={[]} />

            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-1"
            >
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
                    Welcome back, <span className="text-[#7c2957]">{displayName}</span>
                </h1>
                <p className="text-sm sm:text-base text-zinc-500 font-medium">
                    Select a module to continue.
                </p>
            </motion.div>

            {/* Tile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {MODULES.map((mod, i) => (
                    <ModuleTile key={mod.title} {...mod} index={i} />
                ))}
            </div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-100 text-xs text-zinc-400"
            >
                <span className="font-medium bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full">
                    Crossangle Intelligence · v2.1.4
                </span>
                <div className="flex items-center gap-4">
                    <a href="#" className="hover:text-[#7c2957] transition-colors">Documentation</a>
                    <span className="text-zinc-200">·</span>
                    <a href="#" className="hover:text-[#7c2957] transition-colors">System Status</a>
                    <span className="text-zinc-200">·</span>
                    <a href="#" className="hover:text-[#7c2957] transition-colors">Support</a>
                </div>
            </motion.footer>
        </div>
    );
}
