import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { FilterParams, PaginatedResponse, PaginationParams, SortParams } from './types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole extends Omit<Profile, 'role'> {
  role?: AppRole;
}

export class UserService {
  async getUsersPaginated(
    params: PaginationParams & FilterParams & SortParams = {}
  ): Promise<PaginatedResponse<UserWithRole>> {
    const {
      page = 1,
      pageSize = 25,
      search,
      status,
      column = 'created_at',
      direction = 'desc'
    } = params;

    let query = supabase
      .from('profiles')
      .select('*, user_roles(role)', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status === 'active') {
      query = query.is('deleted_at', null).eq('status', 'active');
    } else if (status === 'inactive') {
      query = query.or(`status.eq.inactive,deleted_at.isnot.null`);
    }
    
    query = query.is('deleted_at', null);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order(column, { ascending: direction === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const usersWithRoles = (data || []).map((user: Profile & { user_roles?: { role: AppRole } | null }) => ({
      ...user,
      role: user.user_roles?.role
    })) as UserWithRole[];

    return {
      data: usersWithRoles,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasMore: to < (count || 0) - 1,
    };
  }

  async getUserById(id: string): Promise<UserWithRole | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      role: (data as unknown as { user_roles: { role: AppRole } | null })?.user_roles?.role
    } as UserWithRole;
  }

  async getAllAdmins(): Promise<UserWithRole[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .is('deleted_at', null)
      .or('role.eq.super_admin,role.eq.admin');

    if (error) throw error;

    return (data || []).map((user: Profile & { user_roles?: { role: AppRole } | null }) => ({
      ...user,
      role: user.user_roles?.role
    })) as UserWithRole[];
  }

  async updateUserRole(userId: string, role: AppRole, updatedBy: string): Promise<void> {
    const { error: updateError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    await this.logAction('UPDATE_ROLE', userId, { role }, updatedBy);
  }

  async deactivateUser(userId: string, deactivatedBy: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    await this.logAction('DEACTIVATE', userId, {}, deactivatedBy);
  }

  async reactivateUser(userId: string, reactivatedBy: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    await this.logAction('REACTIVATE', userId, {}, reactivatedBy);
  }

  async softDeleteUser(userId: string, deletedBy: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
        status: 'deleted'
      })
      .eq('id', userId);

    if (error) throw error;
    await this.logAction('DELETE', userId, {}, deletedBy);
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
    return this.updateProfile(userId, { avatar_url: avatarUrl });
  }

  async getAuditLogs(userId?: string, limit: number = 50): Promise<unknown[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  private async logAction(
    action: string, 
    targetUserId: string, 
    details: Record<string, unknown>, 
    performedBy: string
  ): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action,
        entity_type: 'user',
        entity_id: targetUserId,
        user_id: performedBy,
        details,
        ip_address: 'client',
      });

    if (error) {
      console.error('[UserService] Failed to log action:', error.message);
    }
  }

  async canManageRole(actorRole: AppRole, targetRole: AppRole): Promise<boolean> {
    const roleHierarchy: Record<AppRole, number> = {
      'super_admin': 3,
      'admin': 2,
      'viewer': 1,
    };

    if (actorRole === 'super_admin') return true;
    if (actorRole === 'admin' && targetRole === 'viewer') return true;
    return false;
  }

  async isLastSuperAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')
      .neq('user_id', userId);

    if (error) throw error;
    return (data?.length || 0) === 0;
  }
}

export const userService = new UserService();
