import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ExternalLink, MoreHorizontal, Mail, Phone, MapPin, Calendar, Tag, ArrowUpDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Checkbox } from "@/components/primitives/interactive";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/primitives/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/primitives/dialog';
import { Badge } from "@/components/primitives/interactive";
import { DataTable } from '@/components/admin/DataTable';
import type { Lead } from '@/repositories/interfaces/LeadRepository';
import { CRM_STAGE_BADGE_CLASSES, CRM_TEMPERATURES } from '@/lib/crm';
import { CRM_STAGES } from '@/lib/crm/stages';

const temperatureStyles: Record<string, string> = CRM_TEMPERATURES.reduce(
  (acc, t) => {
    acc[t.id] = t.badgeClass;
    return acc;
  },
  {} as Record<string, string>,
);

interface LeadTableProps {
  leads: Lead[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onViewLead?: (lead: Lead) => void;
}

export function LeadTable({
  leads,
  pagination,
  loading,
  onPaginationChange,
  onSearchChange,
  onStatusChange,
  onViewLead,
}: LeadTableProps) {
  const columns: ColumnDef<Lead>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant="outline"
              className={CRM_STAGE_BADGE_CLASSES[status as keyof typeof CRM_STAGE_BADGE_CLASSES] || 'bg-gray-500/10 text-gray-500'}
            >
              {status.replace('_', ' ')}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'score',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3"
          >
            Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const score = row.original.score || 0;
          const temp = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
          return (
            <Badge variant="outline" className={temperatureStyles[temp]}>
              {score}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            {row.original.phone && (
              <div className="flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3" />
                {row.original.phone}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'Location',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3" />
            {row.original.city || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'lead_source',
        header: 'Source',
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            <Tag className="h-3 w-3 mr-1" />
            {row.original.lead_source?.replace('_', ' ') || 'unknown'}
          </Badge>
        ),
      },
      {
        accessorKey: 'service',
        header: 'Service',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.service || 'N/A'}</span>
        ),
      },
      {
        id: 'form_data',
        header: 'Details',
        cell: ({ row }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fd = (row.original as any).form_data as Record<string, unknown> | null | undefined;
          if (!fd || typeof fd !== 'object' || Object.keys(fd).length === 0) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs px-2">
                  <FileText className="h-3 w-3" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-admin-card border-admin-border text-admin-text">
                <DialogHeader>
                  <DialogTitle>Form Submission Data</DialogTitle>
                </DialogHeader>
                <div className="mt-2 space-y-2 rounded-md bg-muted/50 p-3 text-xs font-mono overflow-auto max-h-80">
                  {Object.entries(fd).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="font-semibold text-muted-foreground truncate">{key}:</span>
                      <span className="break-all">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {format(new Date(row.original.created_at || ''), 'MMM d, yyyy')}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewLead?.(lead)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Change Status
                </DropdownMenuLabel>
                {CRM_STAGES.map((stage) => (
                  <DropdownMenuItem
                    key={stage.id}
                    onClick={() => onStatusChange?.(lead.id, stage.id)}
                    disabled={lead.status === stage.id}
                  >
                    {stage.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onViewLead, onStatusChange]
  );

  return (
    <DataTable
      columns={columns}
      data={leads}
      pagination={pagination}
      loading={loading}
      onPaginationChange={onPaginationChange}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search leads by name, email, or phone�"
      emptyMessage="No leads found"
      pageSizeOptions={[10, 25, 50]}
    />
  );
}
