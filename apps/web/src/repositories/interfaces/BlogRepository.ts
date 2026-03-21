import type { Database } from '@/integrations/supabase/types';

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type BlogPayload = Database['public']['Tables']['blog_posts']['Insert'];
export type BlogUpdate = Database['public']['Tables']['blog_posts']['Update'];

export interface BlogRepository {
    getPosts(): Promise<BlogPost[]>;
    getPublishedPosts(): Promise<BlogPost[]>;
    getPostBySlug(slug: string): Promise<BlogPost | null>;
    createPost(payload: BlogPayload): Promise<BlogPost>;
    updatePost(id: string, updates: BlogUpdate): Promise<void>;
    deletePost(id: string): Promise<void>;
}
