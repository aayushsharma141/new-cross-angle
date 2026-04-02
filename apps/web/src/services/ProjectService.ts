import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectPayload, ProjectUpdate, ProjectWithCategory } from '@/repositories/interfaces/ProjectRepository';
import type { FilterParams, PaginatedResponse, PaginationParams, SortParams } from './types';

export class ProjectService {
  async getProjectsPaginated(
    params: PaginationParams & FilterParams & SortParams = {}
  ): Promise<PaginatedResponse<ProjectWithCategory>> {
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
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasMore: to < (count || 0) - 1,
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

  async getCategories(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from('project_categories')
      .select('id, name')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createProject(payload: ProjectPayload): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async softDeleteProject(id: string): Promise<Project> {
    return this.updateProject(id, { 
      status: 'archived',
      deleted_at: new Date().toISOString()
    } as ProjectUpdate);
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

  async duplicateProject(id: string): Promise<Project> {
    const original = await this.getProjectById(id);
    if (!original) throw new Error('Project not found');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        description: original.description,
        category_id: original.category_id,
        gallery_urls: original.gallery_urls,
        cover_image_url: original.cover_image_url,
        short_description: original.short_description,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async getProjectStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    byCategory: Record<string, number>;
  }> {
    const { data, error } = await supabase.from('projects').select('*, project_categories(name)');
    if (error) throw error;

    const projects = data as ProjectWithCategory[];
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
