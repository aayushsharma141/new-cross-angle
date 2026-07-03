import { useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';
import { can as canFn, canAll as canAllFn, canAny as canAnyFn, type Resource } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/rbac';

interface UsePermissionsReturn {
  /**
   * Check if the current user can perform an action on a resource.
   *
   * Accepts either:
   *   - resource × action:  can('leads', 'edit')
   *   - dot-notation string: can('leads.edit')
   *
   * @example
   * const { can } = usePermissions();
   * <Button disabled={!can('leads', 'edit')}>Edit</Button>
   * <Button disabled={!can('cms.publish')}>Publish</Button>
   */
  can: (resourceOrDot: Resource | string, action?: string) => boolean;

  /**
   * True if the current user has ALL of the given dot-notation permissions.
   * @example
   * canAll(['cms.create', 'cms.publish'])
   */
  canAll: (permissions: readonly string[]) => boolean;

  /**
   * True if the current user has ANY of the given dot-notation permissions.
   * @example
   * canAny(['leads.view', 'crm.view'])
   */
  canAny: (permissions: readonly string[]) => boolean;

  /**
   * True if the current user has any of the given roles.
   * @example
   * hasRole('super_admin')              // super_admin only
   * hasRole('super_admin', 'admin')     // either
   */
  hasRole: (...roles: AppRole[]) => boolean;

  /** The current user's resolved role, or null if not authenticated. */
  role: AppRole | null;
}

/**
 * Hook for declarative RBAC permission checks in admin components.
 *
 * Wraps `useAdminAuth` + the central `PERMISSIONS` matrix so components
 * never need to hard-code role comparisons.
 *
 * @example
 * const { can, canAny, hasRole } = usePermissions();
 *
 * // Gate a button (either form)
 * <Button disabled={!can('leads', 'delete')}>Delete</Button>
 * <Button disabled={!can('leads.delete')}>Delete</Button>
 *
 * // Gate a whole section
 * {hasRole('super_admin') && <SettingsPanel />}
 *
 * // Multiple permission check
 * {canAny(['cms.view', 'crm.view']) && <QuickNav />}
 */
export function usePermissions(): UsePermissionsReturn {
  const { role } = useAdminAuth();

  const can = useCallback(
    (resourceOrDot: Resource | string, action?: string): boolean =>
      canFn(role, resourceOrDot, action),
    [role],
  );

  const canAll = useCallback(
    (permissions: readonly string[]): boolean => canAllFn(role, permissions),
    [role],
  );

  const canAny = useCallback(
    (permissions: readonly string[]): boolean => canAnyFn(role, permissions),
    [role],
  );

  const hasRole = useCallback(
    (...roles: AppRole[]): boolean => {
      if (!role) return false;
      return roles.includes(role);
    },
    [role],
  );

  return { can, canAll, canAny, hasRole, role };
}
