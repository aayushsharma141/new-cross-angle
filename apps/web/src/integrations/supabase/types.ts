export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          event_type: string
          id: string
          occurred_at: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_default: {
        Row: {
          event_type: string
          id: string
          occurred_at: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      awards: {
        Row: {
          display_order: number | null
          id: string
          image_url: string | null
          issuer: string | null
          title: string
          url: string | null
          year: number | null
        }
        Insert: {
          display_order?: number | null
          id?: string
          image_url?: string | null
          issuer?: string | null
          title: string
          url?: string | null
          year?: number | null
        }
        Update: {
          display_order?: number | null
          id?: string
          image_url?: string | null
          issuer?: string | null
          title?: string
          url?: string | null
          year?: number | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: Json | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_id: string | null
          content: string | null
          content_json: Json | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          featured_media_id: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          content_json?: Json | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          content_json?: Json | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          path: unknown
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          path?: unknown
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          path?: unknown
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions: {
        Row: {
          content_json: Json
          created_at: string | null
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          content_json: Json
          created_at?: string | null
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          content_json?: Json
          created_at?: string | null
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      crm_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          id: string
          section: string
          label: string
          path: string
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section: string
          label: string
          path: string
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section?: string
          label?: string
          path?: string
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          location: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          location?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          location?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_media: {
        Row: {
          animation_effect: string | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          display_order: number | null
          duration_ms: number | null
          headline: string | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          animation_effect?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number | null
          duration_ms?: number | null
          headline?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          animation_effect?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number | null
          duration_ms?: number | null
          headline?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          archetype: string | null
          area: number | null
          assigned_to: string | null
          budget: string | null
          city: string | null
          city_tier: string | null
          closed_at: string | null
          consent: boolean | null
          created_at: string | null
          email: string
          estimate_breakdown: Json | null
          estimated_max: number | null
          estimated_min: number | null
          forecast_category: string | null
          id: string
          internal_notes: Json | null
          investment_tier: string | null
          last_activity_at: string | null
          lead_score: number | null
          lead_source: Database["public"]["Enums"]["lead_source_enum"] | null
          lead_type: Database["public"]["Enums"]["lead_type_enum"] | null
          message: string
          name: string
          next_step: string | null
          phone: string | null
          project_type: string | null
          property_type: string | null
          score?: number | null
          score_details?: Json | null
          service?: string | null
          source?: string | null
          source_url?: string | null
          stale_flagged_at?: string | null
          start_timing?: string | null
          state?: string | null
          status: Database["public"]["Enums"]["lead_status_enum"]
          updated_at?: string | null
          form_data?: Json | null
        }
        Insert: {
          archetype?: string | null
          area?: number | null
          assigned_to?: string | null
          budget?: string | null
          city?: string | null
          city_tier?: string | null
          closed_at?: string | null
          consent?: boolean | null
          created_at?: string | null
          email: string
          estimate_breakdown?: Json | null
          estimated_max?: number | null
          estimated_min?: number | null
          forecast_category?: string | null
          id?: string
          internal_notes?: Json | null
          investment_tier?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_source?: Database["public"]["Enums"]["lead_source_enum"] | null
          lead_type?: Database["public"]["Enums"]["lead_type_enum"] | null
          message: string
          name: string
          next_step?: string | null
          phone?: string | null
          project_type?: string | null
          property_type?: string | null
          score?: number | null
          score_details?: Json | null
          service?: string | null
          source?: string | null
          source_url?: string | null
          stale_flagged_at?: string | null
          start_timing?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status_enum"]
          updated_at?: string | null
          form_data?: Json | null
        }
        Update: {
          archetype?: string | null
          area?: number | null
          assigned_to?: string | null
          budget?: string | null
          city?: string | null
          city_tier?: string | null
          closed_at?: string | null
          consent?: boolean | null
          created_at?: string | null
          email?: string
          estimate_breakdown?: Json | null
          estimated_max?: number | null
          estimated_min?: number | null
          forecast_category?: string | null
          id?: string
          internal_notes?: Json | null
          investment_tier?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_source?: Database["public"]["Enums"]["lead_source_enum"] | null
          lead_type?: Database["public"]["Enums"]["lead_type_enum"] | null
          message?: string
          name?: string
          next_step?: string | null
          phone?: string | null
          project_type?: string | null
          property_type?: string | null
          score?: number | null
          score_details?: Json | null
          service?: string | null
          source?: string | null
          source_url?: string | null
          stale_flagged_at?: string | null
          start_timing?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status_enum"]
          updated_at?: string | null
          form_data?: Json | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string | null
          created_at: string | null
          file_name: string
          file_type: string | null
          id: string
          size_bytes: number | null
          title: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string | null
          file_name: string
          file_type?: string | null
          id?: string
          size_bytes?: number | null
          title?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string | null
          file_name?: string
          file_type?: string | null
          id?: string
          size_bytes?: number | null
          title?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string | null
          filename: string
          height: number | null
          id: string
          mime_type: string
          size_bytes: number
          thumb_url: string | null
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          filename: string
          height?: number | null
          id?: string
          mime_type: string
          size_bytes: number
          thumb_url?: string | null
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string
          size_bytes?: number
          thumb_url?: string | null
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          label: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          label: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          label?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          body: string | null
          content_json: Json | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          extra: Json | null
          id: string
          image_url: string | null
          order_index: number
          page: string
          section_key: string
          section_type: string | null
          status: string
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          content_json?: Json | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          extra?: Json | null
          id?: string
          image_url?: string | null
          order_index?: number
          page: string
          section_key: string
          section_type?: string | null
          status?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          content_json?: Json | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          extra?: Json | null
          id?: string
          image_url?: string | null
          order_index?: number
          page?: string
          section_key?: string
          section_type?: string | null
          status?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string | null
          id: string
          meta_desc: string | null
          meta_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta_desc?: string | null
          meta_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meta_desc?: string | null
          meta_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
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
          rank: string | null
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
          rank?: string | null
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
          rank?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          full_name: string | null
          id: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          display_order: number | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          display_order?: number | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      project_gallery: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          project_id: string | null
          room_name: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          project_id?: string | null
          room_name?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          project_id?: string | null
          room_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_gallery_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_materials: {
        Row: {
          created_at: string | null
          details: string | null
          display_order: number | null
          id: string
          name: string
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          display_order?: number | null
          id?: string
          name: string
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          display_order?: number | null
          id?: string
          name?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views_2026_02: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_03: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_04: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_05: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_06: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_07: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_08: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_09: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_10: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_11: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2026_12: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      project_views_2027_01: {
        Row: {
          id: string
          project_id: string
          session_hash: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_hash: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_hash?: string
          viewed_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category_id: string | null
          client_name: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: Json | null
          display_order: number | null
          featured: boolean | null
          gallery_urls: string[] | null
          id: string
          location: string | null
          published_at: string | null
          rank: string | null
          seo_description: string | null
          seo_title: string | null
          service_tag: string | null
          short_description: string | null
          slug: string | null
          status: string
          style_tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
          year_completed: number | null
        }
        Insert: {
          category_id?: string | null
          client_name?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: Json | null
          display_order?: number | null
          featured?: boolean | null
          gallery_urls?: string[] | null
          id?: string
          location?: string | null
          published_at?: string | null
          rank?: string | null
          seo_description?: string | null
          seo_title?: string | null
          service_tag?: string | null
          short_description?: string | null
          slug?: string | null
          status?: string
          style_tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
          year_completed?: number | null
        }
        Update: {
          category_id?: string | null
          client_name?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: Json | null
          display_order?: number | null
          featured?: boolean | null
          gallery_urls?: string[] | null
          id?: string
          location?: string | null
          published_at?: string | null
          rank?: string | null
          seo_description?: string | null
          seo_title?: string | null
          service_tag?: string | null
          short_description?: string | null
          slug?: string | null
          status?: string
          style_tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
          year_completed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_payload: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          payload: Json
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          payload: Json
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "raw_payload_new_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      service_faqs: {
        Row: {
          answer: string
          display_order: number | null
          id: string
          question: string
          rank: string | null
          service_id: string | null
        }
        Insert: {
          answer: string
          display_order?: number | null
          id?: string
          question: string
          rank?: string | null
          service_id?: string | null
        }
        Update: {
          answer?: string
          display_order?: number | null
          id?: string
          question?: string
          rank?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_steps: {
        Row: {
          description: string | null
          id: string
          rank: string | null
          service_id: string | null
          step_number: number
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          rank?: string | null
          service_id?: string | null
          step_number: number
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          rank?: string | null
          service_id?: string | null
          step_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_steps_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: Json | null
          display_order: number | null
          icon_url: string | null
          id: string
          name: string
          rank: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          short_tag: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: Json | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          name: string
          rank?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          short_tag?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: Json | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          name?: string
          rank?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          short_tag?: string | null
          slug?: string | null
          updated_at?: string | null
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
      design_process_steps: {
        Row: {
          created_at: string
          description: string
          detail: string
          display_order: number
          icon_name: string
          id: string
          image_alt: string | null
          image_url: string | null
          kicker: string | null
          step_number: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          detail: string
          display_order?: number
          icon_name: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          kicker?: string | null
          step_number: string
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          detail?: string
          display_order?: number
          icon_name?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          kicker?: string | null
          step_number?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      studio_milestones: {
        Row: {
          created_at: string
          display_order: number
          event: string
          id: string
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          event: string
          id?: string
          title: string
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          display_order?: number
          event?: string
          id?: string
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string | null
          about_video_url: string | null
          address: string | null
          admin_email: string | null
          business_hours: Json | null
          contact_intro: string | null
          email: string
          favicon_url: string | null
          fb_pixel_id: string | null
          footer_columns: Json | null
          footer_text: string | null
          ga_measurement_id: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          logo_dark_url: string | null
          logo_light_url: string | null
          map_embed_url: string | null
          nav_links: Json | null
          og_image_url: string | null
          phone: string | null
          seo_description: string | null
          seo_title_template: string | null
          social_links: Json | null
          posthog_api_key: string | null
          posthog_host: string | null
          studio_name: string
          studio_stats: Json | null
          tagline: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          about_video_url?: string | null
          address?: string | null
          admin_email?: string | null
          business_hours?: Json | null
          contact_intro?: string | null
          email?: string
          favicon_url?: string | null
          fb_pixel_id?: string | null
          footer_columns?: Json | null
          footer_text?: string | null
          ga_measurement_id?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_light_url?: string | null
          map_embed_url?: string | null
          nav_links?: Json | null
          og_image_url?: string | null
          phone?: string | null
          seo_description?: string | null
          seo_title_template?: string | null
          social_links?: Json | null
          posthog_api_key?: string | null
          posthog_host?: string | null
          studio_name?: string
          studio_stats?: Json | null
          tagline?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          about_video_url?: string | null
          address?: string | null
          admin_email?: string | null
          business_hours?: Json | null
          contact_intro?: string | null
          email?: string
          favicon_url?: string | null
          fb_pixel_id?: string | null
          footer_columns?: Json | null
          footer_text?: string | null
          ga_measurement_id?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_light_url?: string | null
          map_embed_url?: string | null
          nav_links?: Json | null
          og_image_url?: string | null
          phone?: string | null
          seo_description?: string | null
          seo_title_template?: string | null
          social_links?: Json | null
          posthog_api_key?: string | null
          posthog_host?: string | null
          studio_name?: string
          studio_stats?: Json | null
          tagline?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean | null
          bio: string | null
          created_at: string | null
          department: string | null
          display_order: number | null
          email: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          linkedin_url: string | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean | null
          author_name: string
          author_role: string | null
          avatar_url: string | null
          city: string | null
          content: string
          display_order: number | null
          id: string
          is_featured: boolean | null
          project_id: string | null
          rating: number | null
        }
        Insert: {
          active?: boolean | null
          author_name: string
          author_role?: string | null
          avatar_url?: string | null
          city?: string | null
          content: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          project_id?: string | null
          rating?: number | null
        }
        Update: {
          active?: boolean | null
          author_name?: string
          author_role?: string | null
          avatar_url?: string | null
          city?: string | null
          content?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          project_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_failures: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          next_retry_at: string | null
          payload: Json
          status: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          next_retry_at?: string | null
          payload: Json
          status?: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          next_retry_at?: string | null
          payload?: Json
          status?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_project_kpis: {
        Row: {
          project_id: string | null
          total_views: number | null
          unique_views: number | null
          view_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_admin_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          deleted_at: string
          email: string
          full_name: string
          id: string
          last_sign_in_at: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }[]
      }
      get_lead_stats: { Args: never; Returns: Json }
      get_total_media_bytes: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_project_view: {
        Args: { project_id: string }
        Returns: undefined
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      is_cms_editor: { Args: never; Returns: boolean }
      text2ltree: { Args: { "": string }; Returns: unknown }
      update_media_metadata: {
        Args: { file_path: string; new_metadata: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "viewer"
      lead_category: "residential" | "commercial" | "other"
      lead_source: "website" | "referral" | "social" | "other"
      lead_source_enum:
        | "website_contact"
        | "estimator"
        | "style_quiz"
        | "whatsapp"
        | "instagram"
        | "referral"
        | "other"
      lead_status_enum:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "won"
        | "lost"
      lead_type_enum: "interior" | "renovation" | "consultation" | "commercial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "viewer"],
      lead_category: ["residential", "commercial", "other"],
      lead_source: ["website", "referral", "social", "other"],
      lead_source_enum: [
        "website_contact",
        "estimator",
        "style_quiz",
        "whatsapp",
        "instagram",
        "referral",
        "other",
      ],
      lead_status_enum: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "won",
        "lost",
      ],
      lead_type_enum: ["interior", "renovation", "consultation", "commercial"],
    },
  },
} as const
