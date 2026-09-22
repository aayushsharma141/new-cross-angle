import { useLocation, useNavigate } from "react-router-dom";
import { SearchX, LayoutGrid } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/shared";

/**
 * Catch-all for unmatched `/admin/*` paths (QA-07).
 *
 * Renders inside AdminLayout so the shell (top bar, sidebar) stays in place and the
 * administrator can recover, instead of the blank screen an unmatched route produced.
 * Also covers legacy URLs from before the module consolidation (e.g. /admin/cms/blogs).
 */
export default function AdminNotFound() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="p-6 md:p-8" role="alert" aria-live="polite">
            <AdminEmptyState
                icon={SearchX}
                title="Page not found"
                description={`There is no admin page at "${location.pathname}". It may have moved during a module reorganisation, or the link is out of date.`}
                action={{
                    label: "Back to Hub",
                    icon: LayoutGrid,
                    onClick: () => navigate("/admin", { replace: true })
                }}
            />
        </div>
    );
}
