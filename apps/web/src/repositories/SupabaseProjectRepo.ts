import { supabase } from '@/integrations/supabase/client';
import type {
    ProjectRepository,
    ProjectWithCategory,
    ProjectPayload,
    ProjectUpdate,
} from './interfaces/ProjectRepository';
import type { Database } from '@/integrations/supabase/types';

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

    async getCategories(): Promise<Pick<Category, 'id' | 'name'>[]> {
        const { data, error } = await supabase
            .from('project_categories')
            .select('id, name')
            .order('display_order');
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

    async updateProject(id: string, updates: ProjectUpdate): Promise<void> {
        const { error } = await supabase.from('projects').update(updates).eq('id', id);
        if (error) throw error;
    }

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
    }

    async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .update({ status })
            .in('id', ids);
        if (error) throw error;
    }
}

export const projectRepo = new SupabaseProjectRepo();
