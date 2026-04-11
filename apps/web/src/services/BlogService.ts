import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { FilterParams, PaginatedResponse, PaginationParams, SortParams } from './types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

export class BlogService {
  async getPostsPaginated(
    params: PaginationParams & FilterParams & SortParams = {}
  ): Promise<PaginatedResponse<BlogPost>> {
    const {
      page = 1,
      pageSize = 25,
      search,
      status,
      dateFrom,
      dateTo,
      column = 'created_at',
      direction = 'desc'
    } = params;

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }
    if (status === 'published') {
      query = query.eq('status', 'published');
    } else if (status === 'draft') {
      query = query.eq('status', 'draft');
    } else if (status === 'review') {
      query = query.eq('status', 'review');
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
      data: (data || []) as BlogPost[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasMore: to < (count || 0) - 1,
    };
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as BlogPost;
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as BlogPost;
  }

  async createPost(payload: BlogPostInsert): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  }

  async updatePost(id: string, updates: BlogPostUpdate): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  }

  async publishPost(id: string): Promise<BlogPost> {
    return this.updatePost(id, {
      status: 'published',
      published_at: new Date().toISOString()
    });
  }

  async unpublishPost(id: string): Promise<BlogPost> {
    return this.updatePost(id, { status: 'draft' });
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async bulkPublish(ids: string[]): Promise<number> {
    const { error, count } = await supabase
      .from('blog_posts')
      .update({ 
        status: 'published', 
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', ids);

    if (error) throw error;
    return count || ids.length;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const { error, count } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return count || ids.length;
  }

  async getBlogStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    review: number;
    recentPosts: BlogPost[];
  }> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const posts = data as BlogPost[];
    return {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      draft: posts.filter(p => p.status === 'draft').length,
      review: posts.filter(p => p.status === 'review').length,
      recentPosts: posts.slice(0, 5),
    };
  }

  async incrementViewCount(slug: string): Promise<void> {
    const { error } = await supabase.rpc('increment_blog_view', { blog_slug: slug });
    if (error) {
      console.error('Failed to increment blog view:', error);
    }
  }
}

export const blogService = new BlogService();
