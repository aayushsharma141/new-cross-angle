import { supabase } from '@/integrations/supabase/client';
import type {
    ProjectRepository,
    ProjectWithCategory,
    ProjectPayload,
    ProjectUpdate,
} from './interfaces/ProjectRepository';
import type { Database } from '@/integrations/supabase/types';
import type { PaginationParams, FilterParams, SortParams } from '@/services/types';

type Category = Database['public']['Tables']['project_categories']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

export class SupabaseProjectRepo implements ProjectRepository {
    async getProjects(): Promise<ProjectWithCategory[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*, project_categories(name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data ?? []) as unknown as ProjectWithCategory[];
    }

    async getProjectsPaginated(
        params: PaginationParams & FilterParams & SortParams = {}
    ): Promise<{ data: ProjectWithCategory[]; total: number }> {
        const {
            page = 1,
            pageSize = 25,
            search,
            status,
            category,
            dateFrom,
            dateTo,
            column = 'created_at',
            direction = 'desc'
        } = params;

        let query = supabase
            .from('projects')
            .select('*, project_categories(name)', { count: 'exact' });

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (category) {
            query = query.eq('category_id', category);
        }
        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query
            .order(column, { ascending: direction === 'asc' })
            .range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: (data || []) as ProjectWithCategory[],
            total: count || 0,
        };
    }

    async getProjectById(id: string): Promise<ProjectWithCategory | null> {
        const { data, error } = await supabase
            .from('projects')
            .select('*, project_categories(name)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as ProjectWithCategory;
    }

    async getProjectBySlug(slug: string): Promise<ProjectWithCategory | null> {
        const { data, error } = await supabase
            .from('projects')
            .select('*, project_categories(name)')
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as ProjectWithCategory;
    }

    async getCategories(): Promise<Pick<Category, 'id' | 'name'>[]> {
        const { data, error } = await supabase
            .from('project_categories')
            .select('id, name')
            .order('name');
        if (error) throw error;
        return data ?? [];
    }

    async createProject(payload: ProjectPayload): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
    }

    async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
        const { error, count } = await supabase
            .from('projects')
            .update({ status })
            .in('id', ids);
        if (error) throw error;
        return count || ids.length;
    }

    async bulkDelete(ids: string[]): Promise<number> {
        const { error, count } = await supabase
            .from('projects')
            .delete()
            .in('id', ids);
        if (error) throw error;
        return count || ids.length;
    }
}

export const projectRepo = new SupabaseProjectRepo();
