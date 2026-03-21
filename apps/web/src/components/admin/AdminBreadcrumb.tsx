import { Link } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { icons } from "@/design-system/tokens/icons";

interface AdminBreadcrumbLink {
    label: string;
    href?: string;
}

interface AdminBreadcrumbProps {
    items?: AdminBreadcrumbLink[];
}

export const AdminBreadcrumb = ({ items = [] }: AdminBreadcrumbProps) => {
    return (
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/admin" className="flex items-center gap-1 hover:-admin-primary transition-colors">
                            <Home className={icons.sm} />
                            <span>Admin</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {items.length > 0 && <BreadcrumbSeparator />}

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <BreadcrumbItem key={item.label}>
                            {item.href && !isLast ? (
                                <>
                                    <BreadcrumbLink asChild>
                                        <Link to={item.href} className="hover:-admin-primary transition-colors">
                                            {item.label}
                                        </Link>
                                    </BreadcrumbLink>
                                    <BreadcrumbSeparator />
                                </>
                            ) : (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
