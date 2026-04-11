import * as React from 'react';
import { cn } from '@/lib/utils';

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  default: 'p-6',
  lg: 'p-8',
};

export const AdminCard = React.forwardRef<HTMLDivElement, AdminCardProps>(
  ({ className, variant = 'default', padding = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'admin-card',
      hover: 'admin-card-hover cursor-pointer',
      glass: 'admin-glass',
      bordered: 'rounded-xl border border-[hsl(var(--admin-border))] bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AdminCard.displayName = 'AdminCard';

interface AdminCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminCardHeader({
  className,
  title,
  description,
  action,
  children,
  ...props
}: AdminCardHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children || (
        <>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-[hsl(var(--admin-text))]">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                {description}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </>
      )}
    </div>
  );
}

export function AdminCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold text-[hsl(var(--admin-text))]', className)}
      {...props}
    />
  );
}

export function AdminCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-[hsl(var(--admin-text-muted))]', className)}
      {...props}
    />
  );
}

export function AdminCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function AdminCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-[hsl(var(--admin-border))] mt-4', className)}
      {...props}
    />
  );
}
