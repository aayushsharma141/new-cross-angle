import { supabase } from '@/integrations/supabase/client';
import type { BlogRepository, BlogPost, BlogPayload, BlogUpdate } from './interfaces/BlogRepository';

export class SupabaseBlogRepo implements BlogRepository {
    async getPosts(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data ?? [];
    }

    async getPublishedPosts(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });
        if (error) throw error;
        return data ?? [];
    }

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    async createPost(payload: BlogPayload): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updatePost(id: string, updates: BlogUpdate): Promise<void> {
        const { error } = await supabase.from('blog_posts').update(updates).eq('id', id);
        if (error) throw error;
    }

    async deletePost(id: string): Promise<void> {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) throw error;
    }
}

export const blogRepo = new SupabaseBlogRepo();
