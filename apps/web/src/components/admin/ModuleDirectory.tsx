import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { isAppRole } from "@/lib/auth/rbac";
import { getVisibleModules } from "@/lib/admin/moduleNav";

const COLLAPSED_COUNT = 4;

export const ModuleDirectory = ({ role }: { role: string | null | undefined }) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const modules = getVisibleModules(isAppRole(role) ? role : null);

    if (modules.length === 0) return null;

    const toggle = (id: string) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <section
            aria-labelledby="module-directory-heading"
            className="lg:col-span-6 rounded-2xl border border-admin-border/50 bg-[hsl(var(--admin-card))] p-6"
        >
            <div className="flex items-baseline justify-between mb-5">
                <h2
                    id="module-directory-heading"
                    className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--admin-muted))]"
                >
                    Everything you can manage
                </h2>
                <span className="text-xs text-[hsl(var(--admin-muted))]">
                    Press <kbd className="px-1.5 py-0.5 rounded border border-admin-border bg-admin-surface font-mono text-[11px]">Ctrl K</kbd> to search
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {modules.map((module) => {
                    const Icon = module.icon;
                    const isOpen = expanded.has(module.id);
                    const hidden = module.sections.length - COLLAPSED_COUNT;
                    const shown = isOpen ? module.sections : module.sections.slice(0, COLLAPSED_COUNT);

                    return (
                        <div key={module.id} className="flex flex-col min-w-0">
                            <Link
                                to={module.sections[0].path}
                                className="group flex items-center gap-2.5 mb-2 text-[hsl(var(--admin-text))] hover:text-[hsl(var(--admin-primary))] transition-colors"
                            >
                                <Icon className="w-4 h-4 text-[hsl(var(--admin-primary))] shrink-0" strokeWidth={1.5} />
                                <span className="text-sm font-serif font-medium tracking-tight">{module.name}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>

                            <ul className="flex flex-col border-l border-admin-border/40 ml-2 pl-4">
                                {shown.map((section) => (
                                    <li key={section.path}>
                                        <Link
                                            to={section.path}
                                            className="block py-1 text-[13px] text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))] transition-colors truncate"
                                        >
                                            {section.label}
                                        </Link>
                                    </li>
                                ))}
                                {hidden > 0 && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => toggle(module.id)}
                                            aria-expanded={isOpen}
                                            className="py-1 text-xs font-semibold text-[hsl(var(--admin-primary))] hover:underline"
                                        >
                                            {isOpen ? "Show less" : `+${hidden} more`}
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
