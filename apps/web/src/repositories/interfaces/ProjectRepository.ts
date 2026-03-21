import type { Database } from '@/integrations/supabase/types';

export type Project = Database['public']['Tables']['projects']['Row'];
export type Category = Database['public']['Tables']['project_categories']['Row'];

export interface ProjectWithCategory extends Project {
    project_categories: { name: string } | null;
}

export type ProjectPayload = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectRepository {
    getProjects(): Promise<ProjectWithCategory[]>;
    getCategories(): Promise<Pick<Category, 'id' | 'name'>[]>;
    createProject(payload: ProjectPayload): Promise<Project>;
    updateProject(id: string, updates: ProjectUpdate): Promise<void>;
    deleteProject(id: string): Promise<void>;
    bulkUpdateStatus(ids: string[], status: string): Promise<void>;
}
