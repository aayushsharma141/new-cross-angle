import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fetchUserRole, clearRoleCache } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

describe('F-01: Real Role Resolution & Fail-Closed Semantics', () => {
  const userId = 'test-user-uuid-123';

  beforeEach(() => {
    clearRoleCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearRoleCache();
    vi.restoreAllMocks();
  });

  it('resolves valid super_admin role correctly from user_roles', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: [{ role: 'super_admin' }], error: null }),
        }),
      }),
    } as any);

    const role = await fetchUserRole(userId);
    expect(role).toBe('super_admin');
  });

  it('resolves valid admin role correctly from user_roles', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: [{ role: 'admin' }], error: null }),
        }),
      }),
    } as any);

    const role = await fetchUserRole(userId);
    expect(role).toBe('admin');
  });

  it('resolves valid editor role correctly from user_roles', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: [{ role: 'editor' }], error: null }),
        }),
      }),
    } as any);

    const role = await fetchUserRole(userId);
    expect(role).toBe('editor');
  });

  it('resolves valid viewer role correctly from user_roles', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: [{ role: 'viewer' }], error: null }),
        }),
      }),
    } as any);

    const role = await fetchUserRole(userId);
    expect(role).toBe('viewer');
  });

  it('fails closed (returns null) when no user_roles row exists and sync-user-role returns null', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as any);

    vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
      data: { role: null },
      error: null,
    } as any);

    const role = await fetchUserRole(userId);
    expect(role).toBeNull();
  });

  it('fails closed (returns null) when role query errors out and retries are exhausted', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: null, error: new Error('Network failure') }),
        }),
      }),
    } as any);

    vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
      data: null,
      error: new Error('Edge function failure'),
    } as any);

    const role = await fetchUserRole(userId);
    expect(role).toBeNull();
  }, 15000);

  it('enforces architectural invariant: no literal "as AppRole" assignment under components/auth', () => {
    const authDir = path.resolve(__dirname, '../../components/auth');
    
    function getFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getFiles(full));
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          files.push(full);
        }
      }
      return files;
    }

    const authFiles = getFiles(authDir);
    const violations: string[] = [];

    // Match any code like `"super_admin" as AppRole` or `'admin' as AppRole`
    const literalRoleCastRegex = /["'][a-z_]+["']\s+as\s+AppRole/i;

    for (const file of authFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Strip comments
      const stripped = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');

      if (literalRoleCastRegex.test(stripped)) {
        violations.push(path.relative(authDir, file));
      }
    }

    expect(
      violations,
      `Found hardcoded literal role cast (as AppRole) in: ${violations.join(', ')}`
    ).toEqual([]);
  });
});
