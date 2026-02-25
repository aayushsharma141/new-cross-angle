import { useNavigate } from "react-router-dom";
import { Plus, UserPlus, FileText, Image as ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuickActionButton({
    icon: Icon,
    label,
    href,
    gradient,
    onClick
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    href?: string;
    gradient: string;
    onClick?: () => void;
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick();
        if (href) navigate(href);
    };

    return (
        <button
            onClick={handleClick}
            className="group relative overflow-hidden rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5 hover:shadow-md transition-all duration-300 w-full"
        >
            {/* Background gradient on hover */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br",
                gradient
            )} />

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2.5 rounded-lg bg-gradient-to-br shadow-sm",
                        gradient
                    )}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[hsl(var(--admin-foreground))]">{label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-[hsl(var(--admin-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </button>
    );
}

export function QuickActions() {
    const actions = [
        { label: "New Project", icon: Plus, gradient: "from-blue-500 to-blue-600", path: "/admin/portfolio" },
        { label: "Add Lead", icon: UserPlus, gradient: "from-green-500 to-green-600", path: "/admin/leads" },
        { label: "New Testimonial", icon: FileText, gradient: "from-purple-500 to-purple-600", path: "/admin/testimonials" },
        { label: "Upload Media", icon: ImageIcon, gradient: "from-orange-500 to-orange-600", path: "/admin/media" },
    ];

    return (
        <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-[hsl(var(--admin-foreground))]">Quick Actions</h3>
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
