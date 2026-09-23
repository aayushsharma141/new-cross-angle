const fs = require('fs');
const file = 'e:/main/apps/web/src/pages/admin/AdminHub.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useAuth')) {
    content = content.replace('import { useAdmin } from "@/context/AdminContext";', 'import { useAdmin } from "@/context/AdminContext";\nimport { useAuth } from "@/components/auth/AuthProvider";');
}

if (!content.includes('const hasAdminAccess')) {
    content = content.replace('const { toast } = useToast();', 'const { toast } = useToast();\n    const { role } = useAuth();\n\n    const hasAdminAccess = role === "super_admin" || role === "admin";\n    const hasCrmAccess = hasAdminAccess || role === "viewer";\n    const hasCmsAccess = hasAdminAccess || role === "editor";\n    const hasSuperAccess = role === "super_admin";');
}

content = content.replace(/\{\/\* CRM Overview \(lg:col-span-4\) \*\/\}\s*<Link/, '{/* CRM Overview (lg:col-span-4) */}\n                    {hasCrmAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* Business Health Card \(lg:col-span-2\) \*\/\}/, '$1)}\n\n                    {/* Business Health Card (lg:col-span-2) */}');

content = content.replace(/\{\/\* Business Health Card \(lg:col-span-2\) \*\/\}\s*<Link/, '{/* Business Health Card (lg:col-span-2) */}\n                    {hasAdminAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* Discovery Engine \(lg:col-span-2\) \*\/\}/, '$1)}\n\n                    {/* Discovery Engine (lg:col-span-2) */}');

content = content.replace(/\{\/\* Discovery Engine \(lg:col-span-2\) \*\/\}\s*<Link/, '{/* Discovery Engine (lg:col-span-2) */}\n                    {hasAdminAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* Estimator Engine \(lg:col-span-2\) \*\/\}/, '$1)}\n\n                    {/* Estimator Engine (lg:col-span-2) */}');

content = content.replace(/\{\/\* Estimator Engine \(lg:col-span-2\) \*\/\}\s*<Link/, '{/* Estimator Engine (lg:col-span-2) */}\n                    {hasAdminAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* Content Management \(lg:col-span-2\) \*\/\}/, '$1)}\n\n                    {/* Content Management (lg:col-span-2) */}');

content = content.replace(/\{\/\* Content Management \(lg:col-span-2\) \*\/\}\s*<Link/, '{/* Content Management (lg:col-span-2) */}\n                    {hasCmsAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* Blog Analytics \(lg:col-span-2\) \*\/\}/, '$1)}\n\n                    {/* Blog Analytics (lg:col-span-2) */}');

content = content.replace(/\{\/\* Blog Analytics \(lg:col-span-2\) \*\/\}\s*<Link/, '{/* Blog Analytics (lg:col-span-2) */}\n                    {hasAdminAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* User Access \(lg:col-span-2\) \*\/\}/, '$1)}\n\n                    {/* User Access (lg:col-span-2) */}');

content = content.replace(/\{\/\* User Access \(lg:col-span-2\) \*\/\}\s*<Link/, '{/* User Access (lg:col-span-2) */}\n                    {hasAdminAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* System Settings \(lg:col-span-2\) \*\/\}/, '$1)}\n\n                    {/* System Settings (lg:col-span-2) */}');

content = content.replace(/\{\/\* System Settings \(lg:col-span-2\) \*\/\}\s*<Link/, '{/* System Settings (lg:col-span-2) */}\n                    {hasSuperAccess && (\n                    <Link');
content = content.replace(/(<\/SpotlightCard>\s*<\/Link>\s*)\{\/\* ── Smart AI Insights Panel \(lg:col-span-4\) ── \*\/\}/, '$1)}\n\n                    {/* ── Smart AI Insights Panel (lg:col-span-4) ── */}');

content = content.replace(/\{\/\* ── Smart AI Insights Panel \(lg:col-span-4\) ── \*\/\}\s*<div className="lg:col-span-4/, '{/* ── Smart AI Insights Panel (lg:col-span-4) ── */}\n                    {hasAdminAccess && (\n                    <div className="lg:col-span-4');
content = content.replace(/(<\/div>\s*)\{\/\* ── Live Activity Stream \(lg:col-span-2\) — moved from right sidebar ── \*\/\}/, '$1)}\n\n                    {/* ── Live Activity Stream (lg:col-span-2) — moved from right sidebar ── */}');

content = content.replace(/\{\/\* ── Live Activity Stream \(lg:col-span-2\) — moved from right sidebar ── \*\/\}\s*<div className="lg:col-span-2/, '{/* ── Live Activity Stream (lg:col-span-2) — moved from right sidebar ── */}\n                    {hasAdminAccess && (\n                    <div className="lg:col-span-2');

const closeLiveActivityStr = `                        </div>
                    </div>
                    )}

                </div>

            </div>

            {/* ── Floating Actions Dock ── */}`;

content = content.replace(/                        <\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* ── Floating Actions Dock ── \*\/\}/, closeLiveActivityStr);

content = content.replace(/\[\s*\{\s*label: "Add Lead"[\s\S]*?\}\]\.map\(\(action\) => \([\s\S]*?<\/button>\s*\)\)/, `[
                                { label: "Add Lead", route: "/admin/crm/leads?action=create", icon: Users, show: hasCrmAccess },
                                { label: "New Estimate", route: "/admin/estimator/estimate-leads", icon: Calculator, show: hasAdminAccess },
                                { label: "Upload Asset", route: "/admin/cms/media-library", icon: FileText, show: hasCmsAccess },
                                { label: "Access Security", route: "/admin/user-access/security", icon: Shield, show: hasAdminAccess },
                                { label: "System Config", route: "/admin/system/settings", icon: Settings, show: hasSuperAccess }
                            ].filter(a => a.show).map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => {
                                        setDockOpen(false);
                                        navigate(action.route);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-admin-surface hover:text-[hsl(var(--admin-primary))] text-xs font-medium transition-colors flex items-center gap-2"
                                >
                                    <action.icon className="w-3.5 h-3.5 text-[hsl(var(--admin-muted))]" />
                                    <span>{action.label}</span>
                                </button>
                            ))`);

fs.writeFileSync(file, content);
console.log('AdminHub.tsx patched cleanly with regex.');
