import { useLocation, Link } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export const AppBreadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    // Don't show breadcrumbs on home page
    if (pathnames.length === 0) {
        return null;
    }

    // Helper to format path segments (e.g., "about-us" -> "About Us")
    const formatSegment = (segment: string) => {
        return segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                                <Home className="w-4 h-4" />
                                <span className="sr-only">Home</span>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    {pathnames.map((value, index) => {
                        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;
                        const formattedName = formatSegment(value);

                        return (
                            <BreadcrumbItem key={to}>
                                <BreadcrumbSeparator />
                                {isLast ? (
                                    <BreadcrumbPage>{formattedName}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={to} className="hover:text-primary transition-colors">
                                            {formattedName}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};
