import React, { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  moduleName: string;
  tabName: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  moduleName,
  tabName,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-8", className)}>
      <nav aria-label="Breadcrumb" className="flex items-center text-[13px] font-medium text-[hsl(var(--admin-text-muted))]">
        <ol className="flex items-center gap-1.5">
          <li className="flex items-center">
            <span className="flex items-center gap-1.5 hover:text-[hsl(var(--admin-text))] transition-colors">
              <Home className="w-3.5 h-3.5" />
              Admin
            </span>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
            <span className="hover:text-[hsl(var(--admin-text))] transition-colors">{moduleName}</span>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
            <span className="text-[hsl(var(--admin-text))] font-semibold flex items-center gap-1">{tabName}</span>
          </li>
        </ol>
      </nav>

      {actions && (
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
