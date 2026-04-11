import * as React from 'react';
import { cn } from '@/lib/utils';
import { AdminButton } from './AdminButton';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
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
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-[hsl(var(--admin-text-muted))]">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-1">/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-[hsl(var(--admin-text))] transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[hsl(var(--admin-text))]">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-title">{title}</h1>
          {description && <p className="admin-subtitle mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

interface AdminSectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
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
