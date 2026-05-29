import { supabase } from '@/integrations/supabase/client';

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface GalleryItem {
  id: string;
  category_id: string | null;
  title: string;
  subtitle: string | null;
  image_url: string;
  location: string | null;
  year: number | null;
  description: string | null;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
  category?: GalleryCategory;
}

export class GalleryService {
  // Categories
  async getCategories(): Promise<GalleryCategory[]> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as GalleryCategory[];
  }

  async createCategory(payload: Partial<GalleryCategory>): Promise<GalleryCategory> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as GalleryCategory;
  }

  async updateCategory(id: string, payload: Partial<GalleryCategory>): Promise<GalleryCategory> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GalleryCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('gallery_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Gallery Items
  async getGalleryItems(categorySlug?: string): Promise<GalleryItem[]> {
    let query = supabase
      .from('gallery_items')
      .select('*, category:gallery_categories(*)')
      .order('display_order', { ascending: true });

    if (categorySlug) {
      // Resolve the category_id by first fetching the category with that slug.
      // PostgREST does not support .eq('joined_relation.field', value) for row filtering.
      const { data: catData } = await supabase
        .from('gallery_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (catData?.id) {
        query = query.eq('category_id', catData.id);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as GalleryItem[];
  }

  async getGalleryItemById(id: string): Promise<GalleryItem | null> {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*, category:gallery_categories(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as GalleryItem;
  }

  async createGalleryItem(payload: Partial<GalleryItem>): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from('gallery_items')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as GalleryItem;
  }

  async updateGalleryItem(id: string, payload: Partial<GalleryItem>): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from('gallery_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GalleryItem;
  }

  async deleteGalleryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reorderGalleryItems(items: { id: string; display_order: number }[]): Promise<void> {
    const updates = items.map(item =>
      supabase.from('gallery_items').update({ display_order: item.display_order }).eq('id', item.id)
    );
    
    await Promise.all(updates);
  }
}

export const galleryService = new GalleryService();
