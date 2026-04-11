import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
    id: string;
    author_name: string;
    author_role: string;
    avatar_url: string | null;
    content: string;
    rating: number;
    display_order: number;
    active: boolean;
    project_id?: string | null;
}

export interface TestimonialPayload {
    author_name: string;
    author_role?: string;
    avatar_url?: string | null;
    content: string;
    rating?: number;
    display_order?: number;
    active?: boolean;
    project_id?: string | null;
}

export type CreateTestimonialData = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTestimonialData = Partial<Omit<Testimonial, 'id' | 'created_at'>>;

export interface FilterParams {
    search?: string;
    active?: boolean;
}

export interface SortParams {
    column?: 'display_order' | 'created_at' | 'author_name' | 'rating';
    direction?: 'asc' | 'desc';
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}

export class TestimonialService {
    async getTestimonialsPaginated(
        params: PaginationParams & FilterParams & SortParams = {}
    ): Promise<PaginatedResponse<Testimonial>> {
        const {
            page = 1,
            pageSize = 25,
            search,
            active,
            column = 'display_order',
            direction = 'asc'
        } = params;

        let query = supabase
            .from('testimonials')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`author_name.ilike.%${search}%,content.ilike.%${search}%`);
        }
        if (active !== undefined) {
            query = query.eq('active', active);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query
            .order(column, { ascending: direction === 'asc' })
            .range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: (data || []) as Testimonial[],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
            hasMore: to < (count || 0) - 1,
        };
    }

    async getActiveTestimonials(): Promise<Testimonial[]> {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return (data || []) as Testimonial[];
    }

    async getAllTestimonials(): Promise<Testimonial[]> {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return (data || []) as Testimonial[];
    }

    async getTestimonialById(id: string): Promise<Testimonial | null> {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as Testimonial;
    }

    async createTestimonial(payload: TestimonialPayload): Promise<Testimonial> {
        const { data, error } = await supabase
            .from('testimonials')
            .insert({
                ...payload,
                display_order: payload.display_order ?? 0,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Testimonial;
    }

    async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
        const { data, error } = await supabase
            .from('testimonials')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Testimonial;
    }

    async toggleActive(id: string): Promise<Testimonial> {
        const testimonial = await this.getTestimonialById(id);
        if (!testimonial) throw new Error('Testimonial not found');
        
        return this.updateTestimonial(id, { active: !testimonial.active });
    }

    async deleteTestimonial(id: string): Promise<void> {
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async reorderTestimonials(orderedIds: string[]): Promise<void> {
        const updates = orderedIds.map((id, index) => ({
            id,
            display_order: index
        }));

        for (const update of updates) {
            const { error } = await supabase
                .from('testimonials')
                .update({ display_order: update.display_order })
                .eq('id', update.id);

            if (error) throw error;
        }
    }

    async getTestimonialStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        avgRating: number;
    }> {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*');

        if (error) throw error;

        const testimonials = data as Testimonial[];
        const ratings = testimonials.map(t => t.rating).filter(r => typeof r === 'number');

        return {
            total: testimonials.length,
            active: testimonials.filter(t => t.active).length,
            inactive: testimonials.filter(t => !t.active).length,
            avgRating: ratings.length > 0 
                ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
                : 0,
        };
    }
}

export const testimonialService = new TestimonialService();
