import { supabase } from '@/integrations/supabase/client';
import { projectRepo } from '@/repositories/SupabaseProjectRepo';
import type { 
  ProjectRepository, 
  Project, 
  ProjectPayload, 
  ProjectUpdate, 
  ProjectWithCategory 
} from '@/repositories/interfaces/ProjectRepository';
import type { FilterParams, PaginatedResponse, PaginationParams, SortParams } from './types';

export class ProjectService {
  constructor(private repo: ProjectRepository = projectRepo) {}

  async getProjectsPaginated(
    params: PaginationParams & FilterParams & SortParams = {}
  ): Promise<PaginatedResponse<ProjectWithCategory>> {
    const { page = 1, pageSize = 25 } = params;
    const { data, total } = await this.repo.getProjectsPaginated(params);

    const from = (page - 1) * pageSize;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: from + data.length < total,
    };
  }

  async getProjectById(id: string): Promise<ProjectWithCategory | null> {
    return this.repo.getProjectById(id);
  }

  async getProjectBySlug(slug: string): Promise<ProjectWithCategory | null> {
    return this.repo.getProjectBySlug(slug);
  }

  async getCategories(): Promise<{ id: string; name: string }[]> {
    return this.repo.getCategories();
  }

  async createProject(payload: ProjectPayload): Promise<Project> {
    return this.repo.createProject(payload);
  }

  async updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
    return this.repo.updateProject(id, updates);
  }

  async deleteProject(id: string): Promise<void> {
    return this.repo.deleteProject(id);
  }

  async softDeleteProject(id: string): Promise<Project> {
    return this.updateProject(id, { 
      status: 'archived',
      deleted_at: new Date().toISOString()
    });
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
    return this.repo.bulkUpdateStatus(ids, status);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.repo.bulkDelete(ids);
  }

  async duplicateProject(id: string): Promise<Project> {
    const original = await this.getProjectById(id);
    if (!original) throw new Error('Project not found');

    return this.repo.createProject({
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      description: original.description,
      category_id: original.category_id,
      gallery_urls: original.gallery_urls,
      cover_image_url: original.cover_image_url,
      short_description: original.short_description,
      status: 'draft',
    });
  }

  async getProjectStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    byCategory: Record<string, number>;
  }> {
    const projects = await this.repo.getProjects();
    const stats = {
      total: projects.length,
      published: 0,
      draft: 0,
      archived: 0,
      byCategory: {} as Record<string, number>,
    };

    projects.forEach(project => {
      if (project.status === 'published') stats.published++;
      else if (project.status === 'draft') stats.draft++;
      else if (project.status === 'archived') stats.archived++;

      const categoryName = project.project_categories?.name || 'Uncategorized';
      stats.byCategory[categoryName] = (stats.byCategory[categoryName] || 0) + 1;
    });

    return stats;
  }

  async uploadProjectImage(projectId: string, file: File, bucket: string = 'projects'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }
}

export const projectService = new ProjectService();
