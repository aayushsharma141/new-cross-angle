import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/primitives/breadcrumb";

export interface BreadcrumbLinkItem {
  label: string;
  href?: string;
}

interface SiteBreadcrumbProps {
  items: BreadcrumbLinkItem[];
  className?: string;
}

export function SiteBreadcrumb({ items, className = "" }: SiteBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="text-white/60 sm:gap-2">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Home className="w-3 h-3" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.length > 0 && <BreadcrumbSeparator><ChevronRight className="w-3.5 h-3.5 opacity-50" /></BreadcrumbSeparator>}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={item.label} className="flex items-center sm:gap-2">
              <BreadcrumbItem>
                {!isLast && item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="text-xs uppercase tracking-widest hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-xs uppercase tracking-widest text-white/90">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50 mx-2" />
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
