import { Outlet, Navigate, useLocation } from "react-router-dom";

export const DiscoveryModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/discovery" || location.pathname === "/admin/discovery/") {
        return <Navigate to="/admin/discovery/analytics" replace />;
    }

    return (
        <div className="flex-1 w-full h-full">
            <Outlet />
        </div>
    );
};
