import type { ComponentType } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, UserPlus, FileText, Image as ImageIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_ROUTES } from "@/lib/admin-routes";

export function QuickActionButton({
    icon: Icon,
    label,
    href,
    gradient,
    onClick,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    href?: string;
    gradient: string;
    onClick?: () => void;
}) {
    const navigate = useNavigate();

    const className =
        "group relative overflow-hidden rounded-xl border border-admin-border bg-admin-card p-5 hover:shadow-md transition-all duration-300 w-full";
    const content = (
        <>
            <div
                className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br",
                    gradient,
                )}
            />

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br shadow-sm", gradient)}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-admin-text">{label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-admin-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </>
    );

    if (href) {
        return (
            <Link to={href} onClick={onClick} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={() => {
                if (onClick) {
                    onClick();
                    return;
                }
                navigate(ADMIN_ROUTES.hub.path);
            }}
            className={className}
        >
            {content}
        </button>
    );
}

function QuickActions() {
    const actions = [
        {
            label: "New Project",
            icon: Plus,
            gradient: "from-blue-500 to-blue-600",
            path: ADMIN_ROUTES.cmsPortfolio.path,
        },
        {
            label: "Add Lead",
            icon: UserPlus,
            gradient: "from-green-500 to-green-600",
            path: ADMIN_ROUTES.crmLeads.path,
        },
        {
            label: "New Testimonial",
            icon: FileText,
            gradient: "from-purple-500 to-purple-600",
            path: ADMIN_ROUTES.cmsTestimonials.path,
        },
        {
            label: "Upload Media",
            icon: ImageIcon,
            gradient: "from-orange-500 to-orange-600",
            path: ADMIN_ROUTES.cmsMedia.path,
        },
    ];

    return (
        <div className="rounded-xl border border-admin-border bg-admin-card p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-admin-text">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
                {actions.map((action) => (
                    <QuickActionButton
                        key={action.label}
                        icon={action.icon}
                        label={action.label}
                        href={action.path}
                        gradient={action.gradient}
                    />
                ))}
            </div>
        </div>
    );
}

export default QuickActions;
