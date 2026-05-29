import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { breadcrumbsForPath, type BreadcrumbItem } from '@/lib/admin-routes';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /**
   * Breadcrumb trail. When omitted, derived automatically from the current URL
   * via `ADMIN_ROUTES`. Pass an empty array to hide breadcrumbs entirely.
   * The "Admin" root is prepended by `AdminBreadcrumb` — do not include it here.
   */
  breadcrumbs?: BreadcrumbItem[];
  /** Right-aligned action slot (buttons, dialog triggers, counters). */
  actions?: ReactNode;
  /** Content rendered below the title/actions row (filters, tabs, banners). */
  children?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
}: AdminPageHeaderProps) {
  const location = useLocation();
  const resolved = breadcrumbs ?? breadcrumbsForPath(location.pathname);

  return (
    <div className={cn('space-y-5', className)}>
      {resolved.length > 0 && <AdminBreadcrumb items={resolved} />}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-5 border-b border-[hsl(var(--admin-border))]/50">
        <div className="min-w-0">
          <h1 className="admin-title text-2xl">{title}</h1>
          {description && <p className="admin-subtitle mt-2 text-sm">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

interface AdminSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminSectionHeader({
  title,
  description,
  action,
  className,
}: AdminSectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--admin-text))]">{title}</h2>
        {description && (
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
