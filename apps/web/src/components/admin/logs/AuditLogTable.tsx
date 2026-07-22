import { useState, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Filter,
  MapPin,
  RefreshCw,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/primitives/dropdown-menu';
import { Badge } from "@/components/primitives/interactive";
import { ScrollArea } from '@/components/ui/primitives/scroll-area';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/admin/DataTable';
import type { AuditLogEntry, AuditAction, AuditEntityType } from '@/types/audit';
import { ACTION_COLORS, ENTITY_LABELS } from '@/types/audit';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onActionFilterChange?: (action: AuditAction | null) => void;
  onEntityFilterChange?: (entity: AuditEntityType | null) => void;
  onUserFilterChange?: (userId: string | null) => void;
  onRefresh?: () => void;
  selectedAction?: AuditAction | null;
  selectedEntity?: AuditEntityType | null;
  selectedUser?: string | null;
  search?: string;
}

export function AuditLogTable({
  logs,
  pagination,
  loading,
  onPaginationChange,
  onSearchChange,
  onActionFilterChange,
  onEntityFilterChange,
  onUserFilterChange,
  onRefresh,
  selectedAction,
  selectedEntity,
  selectedUser,
  search = '',
}: AuditLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const columns: ColumnDef<AuditLogEntry>[] = useMemo(
    () => [
      {
        id: 'expand',
        header: () => null,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => toggleRow(row.original.id)}
          >
            {expandedRows.has(row.original.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs">
              {format(new Date(row.original.created_at), 'MMM d, yyyy')}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(row.original.created_at), 'HH:mm:ss')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'profiles',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {row.original.profiles?.full_name || 'System'}
              </span>
              {row.original.profiles?.email && (
                <span className="text-xs text-muted-foreground">
                  {row.original.profiles.email}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => {
          const action = row.original.action as AuditAction;
          const colors = ACTION_COLORS[action] || ACTION_COLORS.VIEW;
          return (
            <Badge
              variant="outline"
              className={cn('capitalize', colors.bg, colors.text, colors.border)}
            >
              {action.replace(/_/g, ' ')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'entity_type',
        header: 'Entity',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">
              {ENTITY_LABELS[row.original.entity_type as AuditEntityType] || row.original.entity_type}
            </span>
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
              {row.original.entity_id || '-'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'ip_address',
        header: 'IP Address',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {row.original.ip_address || 'N/A'}
          </div>
        ),
      },
    ],
    [expandedRows, toggleRow]
  );

  const activeFilters: { key: string; value: string }[] = [
    selectedAction ? { key: 'action', value: selectedAction } : null,
    selectedEntity ? { key: 'entity', value: selectedEntity } : null,
    selectedUser ? { key: 'user', value: selectedUser } : null,
  ].filter((f): f is { key: string; value: string } => f !== null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1">
              {filter.key}: {filter.value}
              <button
                onClick={() => {
                  if (filter.key === 'action') onActionFilterChange?.(null);
                  if (filter.key === 'entity') onEntityFilterChange?.(null);
                  if (filter.key === 'user') onUserFilterChange?.(null);
                }}
                className="ml-1 hover:text-destructive"
                aria-label={`Clear ${filter.key} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onActionFilterChange?.(null);
                onEntityFilterChange?.(null);
                onUserFilterChange?.(null);
              }}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        pagination={pagination}
        loading={loading}
        onPaginationChange={onPaginationChange}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search logs by action, entity, or IP�"
        emptyMessage="No audit logs found"
        pageSizeOptions={[10, 25, 50, 100]}
        initialSearch={search}
      />

      {expandedRows.size > 0 && (
        <div className="rounded-md border bg-muted/50 p-4">
          <h4 className="text-sm font-medium mb-2">Expanded Details</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {Array.from(expandedRows).map((id) => {
                const log = logs.find((l) => l.id === id);
                if (!log) return null;
                return (
                  <div key={id} className="rounded border bg-background p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'PPpp')}
                      </span>
                    </div>
                    <pre className="text-xs overflow-auto bg-muted p-2 rounded">
                      {JSON.stringify(
                        {
                          ...log,
                          details: log.details || {},
                          metadata: log.metadata || {},
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

interface AuditLogFiltersProps {
  users: { id: string; name: string; email: string }[];
  selectedAction?: AuditAction | null;
  selectedEntity?: AuditEntityType | null;
  selectedUser?: string | null;
  onActionChange?: (action: AuditAction | null) => void;
  onEntityChange?: (entity: AuditEntityType | null) => void;
  onUserChange?: (userId: string | null) => void;
  className?: string;
}

export function AuditLogFilters({
  users,
  selectedAction,
  selectedEntity,
  selectedUser,
  onActionChange,
  onEntityChange,
  onUserChange,
  className,
}: AuditLogFiltersProps) {
  const actions: AuditAction[] = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'VIEW',
    'LOGIN',
    'LOGOUT',
    'ROLE_CHANGE',
    'STATUS_CHANGE',
    'PUBLISH',
    'UNPUBLISH',
  ];

  const entities: AuditEntityType[] = [
    'user',
    'lead',
    'project',
    'blog',
    'service',
    'testimonial',
    'team_member',
    'media',
    'settings',
    'estimate',
  ];

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Action
            {selectedAction && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {selectedAction}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {actions.map((action) => (
            <DropdownMenuCheckboxItem
              key={action}
              checked={selectedAction === action}
              onCheckedChange={(checked) => {
                onActionChange?.(checked ? action : null);
              }}
            >
              {action.replace(/_/g, ' ')}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Entity
            {selectedEntity && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {ENTITY_LABELS[selectedEntity]}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {entities.map((entity) => (
            <DropdownMenuCheckboxItem
              key={entity}
              checked={selectedEntity === entity}
              onCheckedChange={(checked) => {
                onEntityChange?.(checked ? entity : null);
              }}
            >
              {ENTITY_LABELS[entity]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <User className="h-4 w-4" />
            User
            {selectedUser && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                1 selected
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 max-h-80">
          <ScrollArea className="h-full max-h-64">
            {users.map((user) => (
              <DropdownMenuCheckboxItem
                key={user.id}
                checked={selectedUser === user.id}
                onCheckedChange={(checked) => {
                  onUserChange?.(checked ? user.id : null);
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
