import { useState, useRef, useEffect } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/primitives/button';
import { Input } from '@/components/ui/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/primitives/select';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  enableSearch?: boolean;
  enablePagination?: boolean;
  enableColumnFilters?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  initialSearch?: string;
}

export function DataTable<TData>({
  columns,
  data,
  pagination,
  onPaginationChange,
  onSearchChange,
  onFiltersChange,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No data found',
  enableSearch = true,
  enablePagination = true,
  enableColumnFilters = true,
  pageSizeOptions = [10, 25, 50, 100],
  className,
  initialSearch = '',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setGlobalFilter(initialSearch);
  }, [initialSearch]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(pagination && {
        pagination: {
          pageIndex: pagination.page - 1,
          pageSize: pagination.pageSize,
        },
      }),
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: !!pagination,
    pageCount: pagination?.totalPages ?? -1,
  });

  const debouncedSearchRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = (value: string) => {
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    debouncedSearchRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, 300);
  };

  const selectedRowCount = Object.keys(rowSelection).length;
  const columnFilterCount = table.getState().columnFilters.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {enableSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(event) => {
                  setGlobalFilter(event.target.value);
                  handleSearchChange(event.target.value);
                }}
                className="pl-9"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 min-h-[44px] min-w-[44px]"
                  onClick={() => {
                    setGlobalFilter('');
                    onSearchChange?.('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {enableColumnFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-accent')}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {columnFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                  {columnFilterCount}
                </span>
              )}
            </Button>
          )}
        </div>
        {selectedRowCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {selectedRowCount} selected
          </div>
        )}
        {enablePagination && pagination && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {pagination.total} total
            </span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => {
                onPaginationChange?.(1, Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {showFilters && enableColumnFilters && columnFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-accent/50 rounded-md">
          {table.getState().columnFilters.map((columnFilter) => (
            <div
              key={columnFilter.id}
              className="flex items-center gap-1 text-sm bg-background border rounded px-2 py-1"
            >
              <span className="font-medium">{String(columnFilter.id)}:</span>
              <span>{String(columnFilter.value)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 min-h-[44px] min-w-[44px] p-0"
                onClick={() => table.getColumn(String(columnFilter.id))?.setFilterValue(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              onFiltersChange?.([]);
            }}
            className="text-xs h-7"
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      {...{
                        'aria-sort': header.column.getCanSort()
                          ? header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : header.column.getIsSorted() === 'desc'
                            ? 'descending'
                            : 'none'
                          : 'none'
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center">
                    <div className="flex items-center justify-center" role="status" aria-label="Loading">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      <span className="sr-only">Loading…</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      row.getIsSelected() && 'bg-muted'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    <div role="status" aria-live="polite">
                      {emptyMessage}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {enablePagination && pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {pagination.total === 0 ? (
              'No entries to show'
            ) : (
              <>
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => onPaginationChange?.(1, pagination.pageSize)}
              disabled={pagination.page <= 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => onPaginationChange?.(pagination.page - 1, pagination.pageSize)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm">Page</span>
              <span className="font-medium">{pagination.page}</span>
              <span className="text-sm">of {pagination.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => onPaginationChange?.(pagination.page + 1, pagination.pageSize)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => onPaginationChange?.(pagination.totalPages, pagination.pageSize)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
