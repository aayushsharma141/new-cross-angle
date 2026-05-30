import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/primitives/tabs';
import { Badge } from '@/components/ui/primitives/badge';
import { KPIGrid, MetricCard } from '@/components/admin/dashboard/KPICard';
import { AuditLogTable, AuditLogFilters } from '@/components/admin/logs/AuditLogTable';
import { auditService } from '@/services/AuditService';
import type { AuditAction, AuditEntityType, AuditLogStats } from '@/types/audit';
import { ACTION_COLORS, ENTITY_LABELS } from '@/types/audit';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { ModuleActions } from '@/components/admin/layout/ModuleLayout';

export default function AdminAuditLogs() {
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
    } catch (error) {
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

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
      <ModuleActions>
        <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </ModuleActions>

      <KPIGrid columns={4}>
        <MetricCard
          title="Total Activities (7d)"
          value={statsData?.totalLogs || 0}
          icon={<Activity className="h-4 w-4" />}
          color="primary"
        />
        <MetricCard
          title="Top Action"
          value={getTopKey(statsData?.byAction) || 'N/A'}
          subtitle={`${(statsData?.byAction && getTopKey(statsData.byAction) ? statsData.byAction[getTopKey(statsData.byAction) as AuditAction] : 0)} occurrences`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="success"
        />
        <MetricCard
          title="Most Active Entity"
          value={ENTITY_LABELS[getTopKey(statsData?.byEntity) as AuditEntityType] || 'N/A'}
          subtitle={`${(statsData?.byEntity && getTopKey(statsData.byEntity) ? statsData.byEntity[getTopKey(statsData.byEntity) as AuditEntityType] : 0)} entries`}
          icon={<BarChart3 className="h-4 w-4" />}
          color="warning"
        />
        <MetricCard
          title="Unique Users"
          value={users.length}
          icon={<Activity className="h-4 w-4" />}
          color="primary"
        />
      </KPIGrid>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="actions">By Action</TabsTrigger>
          <TabsTrigger value="entities">By Entity</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Audit Log</CardTitle>
                <AuditLogFilters
                  users={users}
                  selectedAction={selectedAction}
                  selectedEntity={selectedEntity}
                  selectedUser={selectedUser}
                  onActionChange={(action) => updateParams({ action })}
                  onEntityChange={(entity) => updateParams({ entity })}
                  onUserChange={(user) => updateParams({ user })}
                />
              </div>
            </CardHeader>
            <CardContent>
              <AuditLogTable
                logs={logsData?.data || []}
                search={search}
                pagination={
                  logsData
                    ? {
                        page,
                        pageSize,
                        total: logsData.total,
                        totalPages: logsData.totalPages,
                      }
                    : undefined
                }
                loading={isLoading}
                users={users}
                onPaginationChange={handlePaginationChange}
                onSearchChange={(q) => updateParams({ q })}
                onActionFilterChange={(action) => updateParams({ action })}
                onEntityFilterChange={(entity) => updateParams({ entity })}
                onUserFilterChange={(user) => updateParams({ user })}
                onRefresh={() => refetch()}
                selectedAction={selectedAction}
                selectedEntity={selectedEntity}
                selectedUser={selectedUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity by Action Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statsData?.byAction || {}).map(([action, count]) => {
                  const colors = ACTION_COLORS[action as AuditAction];
                  return (
                    <div
                      key={action}
                      className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => updateParams({ action: selectedAction === action ? null : action, tab: 'all' })}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="outline"
                          className={cn('capitalize', colors?.bg, colors?.text, colors?.border)}
                        >
                          {action.replace(/_/g, ' ')}
                        </Badge>
                        {selectedAction === action && (
                          <Badge variant="default">Filtered</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">occurrences</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity by Entity Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(statsData?.byEntity || {}).map(([entity, count]) => (
                  <div
                    key={entity}
                    className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => updateParams({ entity: selectedEntity === entity ? null : entity, tab: 'all' })}
                  >
                    <p className="font-medium mb-1">{ENTITY_LABELS[entity as AuditEntityType] || entity}</p>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">entries</p>
                    {selectedEntity === entity && (
                      <Badge variant="default" className="mt-2">Filtered</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTopKey(obj: Record<string, number> | undefined): string | undefined {
  if (!obj) return undefined;
  const entries = Object.entries(obj);
  if (entries.length === 0) return undefined;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
