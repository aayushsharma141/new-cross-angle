import { Outlet, Navigate, useLocation } from "react-router-dom";

export const SystemModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/system" || location.pathname === "/admin/system/") {
        return <Navigate to="/admin/system/settings" replace />;
    }

    return (
        <div className="flex-1 w-full h-full">
            <Outlet />
        </div>
    );
};
