import { Navigate, useLocation } from "react-router-dom";

/**
 * CONSOLIDATION NOTE: Discovery module has been merged into CRM.
 *
 * - Quiz Analytics (results) → CRM Leads filtered by source "aesthetic_discovery_engine"
 * - Quiz Configuration → System Settings (quiz management)
 *
 * This reduces module fragmentation and makes it clear that quiz leads
 * are just CRM leads with a specific source tag.
 */
export const DiscoveryModule = () => {
    const location = useLocation();

    // Redirect all discovery routes to CRM with quiz source filter
    if (location.pathname === "/admin/discovery" || location.pathname === "/admin/discovery/") {
        return <Navigate to="/admin/crm/leads?source=aesthetic_discovery_engine" replace />;
    }

    // Quiz analytics → CRM leads filtered by source
    if (location.pathname === "/admin/discovery/quiz-analytics") {
        return <Navigate to="/admin/crm/leads?source=aesthetic_discovery_engine" replace />;
    }

    // Quiz configuration → System settings (would be implemented in System module)
    if (location.pathname === "/admin/discovery/quiz-configuration") {
        return <Navigate to="/admin/system/settings?tab=discovery" replace />;
    }

    // Fallback
    return <Navigate to="/admin/crm/leads?source=aesthetic_discovery_engine" replace />;
};

export default DiscoveryModule;
