import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface AdminBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'default' | 'lg';
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'admin-badge admin-status-success',
  warning: 'admin-badge admin-status-warning',
  danger: 'admin-badge admin-status-danger',
  info: 'admin-badge admin-status-info',
  neutral: 'admin-badge admin-status-neutral',
  primary: 'admin-badge bg-[hsl(var(--admin-primary-muted))] text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))] / 20',
};

const sizeStyles = {
  sm: 'px-2 py-0 text-[10px]',
  default: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const AdminBadge = forwardRef<HTMLSpanElement, AdminBadgeProps>(
  ({ className, variant = 'neutral', size = 'default', dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
              variant === 'success' && 'bg-[hsl(var(--admin-success))]',
              variant === 'warning' && 'bg-[hsl(var(--admin-warning))]',
              variant === 'danger' && 'bg-[hsl(var(--admin-danger))]',
              variant === 'info' && 'bg-[hsl(var(--admin-info))]',
              variant === 'neutral' && 'bg-[hsl(var(--admin-text-muted))]',
              variant === 'primary' && 'bg-[hsl(var(--admin-primary))]'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);
AdminBadge.displayName = 'AdminBadge';

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const getVariant = (status: string): BadgeVariant => {
    const statusMap: Record<string, BadgeVariant> = {
      active: 'success',
      published: 'success',
      live: 'success',
      new: 'info',
      contacted: 'info',
      qualified: 'warning',
      proposal: 'warning',
      won: 'success',
      draft: 'neutral',
      pending: 'warning',
      archived: 'neutral',
      inactive: 'danger',
      lost: 'danger',
      rejected: 'danger',
    };
    return statusMap[status.toLowerCase()] || 'neutral';
  };

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <AdminBadge variant={getVariant(status)} dot className={className}>
      {formatStatus(status)}
    </AdminBadge>
  );
}
