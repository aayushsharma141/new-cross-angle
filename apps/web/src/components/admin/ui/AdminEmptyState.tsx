import * as React from 'react';
import { FileQuestion, Inbox, Search, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminButton } from './AdminButton';

type EmptyIconType = 'inbox' | 'search' | 'question';

interface AdminEmptyStateProps {
  icon?: EmptyIconType | LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap: Record<EmptyIconType, LucideIcon> = {
  inbox: Inbox,
  search: Search,
  question: FileQuestion,
};

export function AdminEmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  const Icon = typeof icon === 'string' ? iconMap[icon as EmptyIconType] : icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--admin-surface))]">
        <Icon className="h-8 w-8 text-[hsl(var(--admin-text-muted))]" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-[hsl(var(--admin-text))]">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-[hsl(var(--admin-text-muted))]">
          {description}
        </p>
      )}
      {action && (
        <AdminButton variant="primary" onClick={action.onClick}>
          {action.label}
        </AdminButton>
      )}
    </div>
  );
}

interface AdminTableEmptyProps {
  columns?: number;
  message?: string;
}

export function AdminTableEmpty({
  columns = 5,
  message = 'No data found',
}: AdminTableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="py-12 text-center text-[hsl(var(--admin-text-muted))]"
      >
        <div className="flex flex-col items-center justify-center">
          <Inbox className="mb-2 h-8 w-8 opacity-50" />
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}
