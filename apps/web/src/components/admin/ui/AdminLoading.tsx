import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLoadingProps {
  size?: 'sm' | 'default' | 'lg';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  default: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function AdminLoading({
  size = 'default',
  fullScreen = false,
  text,
  className,
}: AdminLoadingProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2
        className={cn('animate-spin text-[hsl(var(--admin-primary))]', sizeStyles[size])}
      />
      {text && (
        <p className="text-sm text-[hsl(var(--admin-text-muted))]">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

interface AdminTableLoadingProps {
  rows?: number;
  columns?: number;
}

export function AdminTableLoading({
  rows = 5,
  columns = 5,
}: AdminTableLoadingProps) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[hsl(var(--admin-border-subtle))]">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <div className="h-4 w-full animate-pulse rounded bg-[hsl(var(--admin-surface))]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

interface AdminCardLoadingProps {
  count?: number;
}

export function AdminCardLoading({ count = 4 }: AdminCardLoadingProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="admin-card p-6 space-y-3"
        >
          <div className="h-4 w-20 animate-pulse rounded bg-[hsl(var(--admin-surface))]" />
          <div className="h-8 w-16 animate-pulse rounded bg-[hsl(var(--admin-surface))]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[hsl(var(--admin-surface))]" />
        </div>
      ))}
    </div>
  );
}
