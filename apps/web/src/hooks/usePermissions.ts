import { useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';
import { can as canFn, type Resource } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/rbac';

interface UsePermissionsReturn {
  /**
   * Check if the current user can perform an action on a resource.
   * @example
   * const { can } = usePermissions();
   * <Button disabled={!can('leads', 'edit')}>Edit</Button>
   */
  can: (resource: Resource, action: string) => boolean;

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
 * const { can, hasRole } = usePermissions();
 *
 * // Gate a button
 * <Button disabled={!can('leads', 'delete')} title={!can('leads', 'delete') ? 'Insufficient permissions' : undefined}>
 *   Delete
 * </Button>
 *
 * // Gate a whole section
 * {hasRole('super_admin') && <SettingsPanel />}
 */
export function usePermissions(): UsePermissionsReturn {
  const { role } = useAdminAuth();

  const can = useCallback(
    (resource: Resource, action: string): boolean => canFn(role, resource, action),
    [role],
  );

  const hasRole = useCallback(
    (...roles: AppRole[]): boolean => {
      if (!role) return false;
      return roles.includes(role);
    },
    [role],
  );

  return { can, hasRole, role };
}
