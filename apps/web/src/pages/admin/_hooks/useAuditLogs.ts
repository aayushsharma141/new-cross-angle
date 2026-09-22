import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/AuditService';
import type { AuditAction, AuditEntityType } from '@/types/audit';
import { useToast } from '@/hooks/useToast';

export function useAuditLogs() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived states
  const activeTab = searchParams.get('tab') === 'actions'
    ? 'actions'
    : searchParams.get('tab') === 'entities'
      ? 'entities'
      : 'all';

  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10) || 25;
  const search = searchParams.get('q') || '';
  const selectedAction = (searchParams.get('action') as AuditAction) || null;
  const selectedEntity = (searchParams.get('entity') as AuditEntityType) || null;
  const selectedUser = searchParams.get('user') || null;

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    let filterOrSearchChanged = false;
    for (const [key, value] of Object.entries(updates)) {
      if (['q', 'action', 'entity', 'user'].includes(key)) {
        const currentValue = searchParams.get(key);
        if ((currentValue || '') !== (value || '')) {
          filterOrSearchChanged = true;
        }
      }
      if (value === null || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }
    if (filterOrSearchChanged) {
      nextParams.delete('page');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleTabChange = (nextTab: string) => {
    updateParams({ tab: nextTab === 'all' ? null : nextTab });
  };

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['audit_logs', page, pageSize, search, selectedAction, selectedEntity, selectedUser],
    queryFn: () =>
      auditService.getLogsPaginated({
        page,
        pageSize,
        search: search || undefined,
        action: selectedAction || undefined,
        entityType: selectedEntity || undefined,
        userId: selectedUser || undefined,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['audit_stats'],
    queryFn: () => auditService.getStats(168),
    staleTime: 5 * 60 * 1000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['audit_users'],
    queryFn: () => auditService.getUniqueUsers(),
    staleTime: 10 * 60 * 1000,
  });

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const content = await auditService.exportLogs(
        {
          search: search || undefined,
          action: selectedAction || undefined,
          entityType: selectedEntity || undefined,
          userId: selectedUser || undefined,
        },
        format
      );

      const blob = new Blob([content], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format === 'csv' ? 'export' : 'export'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Downloaded ${logsData?.total || 0} log entries as ${format.toUpperCase()}`,
      });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Could not export logs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    if (newPageSize !== pageSize) {
      updateParams({
        pageSize: newPageSize.toString(),
        page: '1',
      });
    } else {
      updateParams({
        page: newPage.toString(),
      });
    }
  };

  return {
    activeTab,
    page,
    pageSize,
    search,
    selectedAction,
    selectedEntity,
    selectedUser,
    logsData,
    isLoading,
    statsData,
    users,
    handleTabChange,
    handleExport,
    handlePaginationChange,
    updateParams,
    refetch,
  };
}
