import type { Database } from '@/integrations/supabase/types';
import type { PaginationParams, FilterParams, SortParams } from '@/services/types';

export type Project = Database['public']['Tables']['projects']['Row'];
export type Category = Database['public']['Tables']['project_categories']['Row'];

export interface ProjectWithCategory extends Project {
    project_categories: { name: string } | null;
}

export type ProjectPayload = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectRepository {
    getProjects(): Promise<ProjectWithCategory[]>;
    getProjectsPaginated(
        params?: PaginationParams & FilterParams & SortParams
    ): Promise<{ data: ProjectWithCategory[]; total: number }>;
    getProjectById(id: string): Promise<ProjectWithCategory | null>;
    getProjectBySlug(slug: string): Promise<ProjectWithCategory | null>;
    getCategories(): Promise<Pick<Category, 'id' | 'name'>[]>;
    createProject(payload: ProjectPayload): Promise<Project>;
    updateProject(id: string, updates: ProjectUpdate): Promise<Project>;
    deleteProject(id: string): Promise<void>;
    bulkUpdateStatus(ids: string[], status: string): Promise<number>;
    bulkDelete(ids: string[]): Promise<number>;
}
