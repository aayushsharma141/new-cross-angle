import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, Download, Filter, TrendingUp } from 'lucide-react';
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

export default function AdminAuditLogs() {
  const { toast } = useToast();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [search, setSearch] = React.useState('');
  const [selectedAction, setSelectedAction] = React.useState<AuditAction | null>(null);
  const [selectedEntity, setSelectedEntity] = React.useState<AuditEntityType | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);

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
      setPageSize(newPageSize);
      setPage(1);
    } else {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs & Audit</h1>
          <p className="text-muted-foreground">
            Track all system activities, admin actions, and security events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

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
          subtitle={`${statsData?.byAction[getTopKey(statsData?.byAction) as AuditAction] || 0} occurrences`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="success"
        />
        <MetricCard
          title="Most Active Entity"
          value={ENTITY_LABELS[getTopKey(statsData?.byEntity) as AuditEntityType] || 'N/A'}
          subtitle={`${statsData?.byEntity[getTopKey(statsData?.byEntity)] || 0} entries`}
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

      <Tabs defaultValue="all" className="space-y-4">
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
                  onActionChange={setSelectedAction}
                  onEntityChange={setSelectedEntity}
                  onUserChange={setSelectedUser}
                />
              </div>
            </CardHeader>
            <CardContent>
              <AuditLogTable
                logs={logsData?.data || []}
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
                onSearchChange={setSearch}
                onActionFilterChange={setSelectedAction}
                onEntityFilterChange={setSelectedEntity}
                onUserFilterChange={setSelectedUser}
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
                      onClick={() => setSelectedAction(selectedAction === action ? null : (action as AuditAction))}
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
                    onClick={() => setSelectedEntity(selectedEntity === entity ? null : (entity as AuditEntityType))}
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
