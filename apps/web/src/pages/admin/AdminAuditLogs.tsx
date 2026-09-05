import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Badge } from "@/components/primitives/interactive";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/primitives/tabs';
import { Surface, Stack, Text } from "@/components/primitives/foundation";
import { AuditLogTable, AuditLogFilters } from '@/components/admin/logs/AuditLogTable';
import { AdminMetricsPanel } from '@/components/admin/shared/AdminMetricsPanel';
import type { AuditAction, AuditEntityType } from '@/types/audit';
import { ACTION_COLORS, ENTITY_LABELS } from '@/types/audit';
import { ModuleActions } from '@/components/admin/layout/ModuleLayout';
import { useAuditLogs } from './_hooks/useAuditLogs';

export default function AdminAuditLogs() {
  const {
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
  } = useAuditLogs();

  return (
    <div className="flex flex-col space-y-4">
      <style>{`
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
        .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
        .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
      `}</style>

      <div className="fade-up-1">
        <AdminMetricsPanel metrics={[
          { label: "Total Activities (7d)", value: statsData?.totalLogs || 0 },
          { label: "Top Action", value: getTopKey(statsData?.byAction) || 'N/A' },
          { label: "Most Active Entity", value: ENTITY_LABELS[getTopKey(statsData?.byEntity) as AuditEntityType] || 'N/A' },
          { label: "Unique Users", value: users.length }
        ]} />
      </div>

      <div className="fade-up-2">
        <ModuleActions>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </ModuleActions>
      </div>

      <div className="fade-up-3">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-lg">
            <TabsTrigger value="all" className="data-[state=active]:bg-[hsl(var(--admin-primary))] data-[state=active]:text-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))]">All Activity</TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-[hsl(var(--admin-primary))] data-[state=active]:text-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))]">By Action</TabsTrigger>
            <TabsTrigger value="entities" className="data-[state=active]:bg-[hsl(var(--admin-primary))] data-[state=active]:text-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))]">By Entity</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            <Surface variant="primary" radius="lg" border shadow="sm" className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm overflow-hidden">
              <Stack gap="sm" className="p-6 bg-[hsl(var(--admin-surface))] border-b border-[hsl(var(--admin-border-subtle))] py-3 px-5">
                <div className="flex items-center justify-between">
                  <Text as="h3" variant="h3" className="leading-none text-sm font-bold text-[hsl(var(--admin-text))]">Audit Log</Text>
                  <div className="flex gap-2">
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
                </div>
              </Stack>
              <div className="p-6 pt-0 p-0 sm:p-0">
                <div className="px-5 py-4 border-b border-[hsl(var(--admin-border-subtle))]">
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
                </div>
              </div>
            </Surface>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <Surface variant="primary" radius="lg" border shadow="sm" className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm overflow-hidden">
              <Stack gap="sm" className="p-6 bg-[hsl(var(--admin-surface))] border-b border-[hsl(var(--admin-border-subtle))] py-3 px-5">
                <Text as="h3" variant="h3" className="leading-none text-sm font-bold text-[hsl(var(--admin-text))]">Activity by Action Type</Text>
              </Stack>
              <div className="p-6 pt-0 p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(statsData?.byAction || {}).map(([action, count]) => {
                    const colors = ACTION_COLORS[action as AuditAction];
                    return (
                      <div
                        key={action}
                        role="button"
                        tabIndex={0}
                        className="rounded-xl border border-[hsl(var(--admin-border))] p-4 cursor-pointer hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-200"
                        onClick={() => updateParams({ action: selectedAction === action ? null : action, tab: 'all' })}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') updateParams({ action: selectedAction === action ? null : action, tab: 'all' }); }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant="outline"
                            className={cn('capitalize text-[10px]', colors?.bg, colors?.text, colors?.border)}
                          >
                            {action.replace(/_/g, ' ')}
                          </Badge>
                          {selectedAction === action && (
                            <Badge variant="default" className="text-[10px] bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-surface))]">Filtered</Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{count}</p>
                        <p className="text-xs text-[hsl(var(--admin-text-muted))]">occurrences</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Surface>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4 mt-4">
            <Surface variant="primary" radius="lg" border shadow="sm" className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm overflow-hidden">
              <Stack gap="sm" className="p-6 bg-[hsl(var(--admin-surface))] border-b border-[hsl(var(--admin-border-subtle))] py-3 px-5">
                <Text as="h3" variant="h3" className="leading-none text-sm font-bold text-[hsl(var(--admin-text))]">Activity by Entity Type</Text>
              </Stack>
              <div className="p-6 pt-0 p-5">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(statsData?.byEntity || {}).map(([entity, count]) => (
                    <div
                      key={entity}
                      role="button"
                      tabIndex={0}
                      className="rounded-xl border border-[hsl(var(--admin-border))] p-4 cursor-pointer hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-200"
                      onClick={() => updateParams({ entity: selectedEntity === entity ? null : entity, tab: 'all' })}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') updateParams({ entity: selectedEntity === entity ? null : entity, tab: 'all' }); }}
                    >
                      <p className="font-bold text-sm text-[hsl(var(--admin-text))] mb-1">{ENTITY_LABELS[entity as AuditEntityType] || entity}</p>
                      <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{count}</p>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))]">entries</p>
                      {selectedEntity === entity && (
                        <Badge variant="default" className="mt-2 text-[10px] bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-surface))]">Filtered</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Surface>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function getTopKey(obj: Record<string, number> | undefined): string | undefined {
  if (!obj) return undefined;
  const entries = Object.entries(obj);
  if (entries.length === 0) return undefined;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}
