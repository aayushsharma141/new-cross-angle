export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            blogs: {
                Row: {
                    author_id: string | null
                    content: string | null
                    cover_image: string | null
                    created_at: string
                    excerpt: string | null
                    id: string
                    published: boolean | null
                    published_at: string | null
                    slug: string
                    title: string
                    updated_at: string
                }
                Insert: {
                    author_id?: string | null
                    content?: string | null
                    cover_image?: string | null
                    created_at?: string
                    excerpt?: string | null
                    id?: string
                    published?: boolean | null
                    published_at?: string | null
                    slug: string
                    title: string
                    updated_at?: string
                }
                Update: {
                    author_id?: string | null
                    content?: string | null
                    cover_image?: string | null
                    created_at?: string
                    excerpt?: string | null
                    id?: string
                    published?: boolean | null
                    published_at?: string | null
                    slug?: string
                    title?: string
                    updated_at?: string
                }
                Relationships: []
            }
            portfolio: {
                Row: {
                    category: string
                    created_at: string
                    created_by: string | null
                    description: string | null
                    display_order: number | null
                    id: string
                    image_url: string | null
                    is_featured: boolean | null
                    title: string
                    updated_at: string
                    video_url: string | null
                }
                Insert: {
                    category?: string
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    display_order?: number | null
                    id?: string
                    image_url?: string | null
                    is_featured?: boolean | null
                    title: string
                    updated_at?: string
                    video_url?: string | null
                }
                Update: {
                    category?: string
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    display_order?: number | null
                    id?: string
                    image_url?: string | null
                    is_featured?: boolean | null
                    title?: string
                    updated_at?: string
                    video_url?: string | null
                }
                Relationships: []
            }
            site_content: {
                Row: {
                    content: string | null
                    id: string
                    image_url: string | null
                    metadata: Json | null
                    section_key: string
                    subtitle: string | null
                    title: string | null
                    updated_at: string
                    updated_by: string | null
                }
                Insert: {
                    content?: string | null
                    id?: string
                    image_url?: string | null
                    metadata?: Json | null
                    section_key: string
                    subtitle?: string | null
                    title?: string | null
                    updated_at?: string
                    updated_by?: string | null
                }
                Update: {
                    content?: string | null
                    id?: string
                    image_url?: string | null
                    metadata?: Json | null
                    section_key?: string
                    subtitle?: string | null
                    title?: string | null
                    updated_at?: string
                    updated_by?: string | null
                }
                Relationships: []
            }
        }
    }
}
