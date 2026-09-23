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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string | null
          user_agent: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
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
      analytics_reporting_daily: {
        Row: {
          created_at: string | null
          date: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          module_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          module_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          module_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      asset_collections: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["collection_type_enum"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["collection_type_enum"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["collection_type_enum"]
        }
        Relationships: []
      }
      asset_metadata: {
        Row: {
          asset_id: string
          camera_exif: Json | null
          copyright: string | null
          created_at: string
          dominant_colors: Json | null
          materials: Json | null
          photographer: string | null
          room_type: string | null
          updated_at: string
        }
        Insert: {
          asset_id: string
          camera_exif?: Json | null
          copyright?: string | null
          created_at?: string
          dominant_colors?: Json | null
          materials?: Json | null
          photographer?: string | null
          room_type?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string
          camera_exif?: Json | null
          copyright?: string | null
          created_at?: string
          dominant_colors?: Json | null
          materials?: Json | null
          photographer?: string | null
          room_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_metadata_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_tag_links: {
        Row: {
          asset_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_tag_links_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_tag_links_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "asset_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      asset_usages: {
        Row: {
          asset_id: string
          created_at: string
          display_order: number | null
          domain: string
          entity_id: string
          entity_type: string
          id: string
          is_primary: boolean | null
          role: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          display_order?: number | null
          domain: string
          entity_id: string
          entity_type: string
          id?: string
          is_primary?: boolean | null
          role: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          display_order?: number | null
          domain?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_primary?: boolean | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_usages_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_versions: {
        Row: {
          asset_id: string
          created_at: string
          file_id: string
          height: number | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_provider: string | null
          url: string | null
          version_number: number
          width: number | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          file_id: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_provider?: string | null
          url?: string | null
          version_number?: number
          width?: number | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          file_id?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_provider?: string | null
          url?: string | null
          version_number?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          collection_id: string | null
          created_at: string
          description: string | null
          id: string
          parent_asset_id: string | null
          source: Database["public"]["Enums"]["asset_source_enum"]
          status: Database["public"]["Enums"]["asset_status_enum"]
          title: string | null
          type: Database["public"]["Enums"]["asset_type_enum"]
          updated_at: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          parent_asset_id?: string | null
          source?: Database["public"]["Enums"]["asset_source_enum"]
          status?: Database["public"]["Enums"]["asset_status_enum"]
          title?: string | null
          type: Database["public"]["Enums"]["asset_type_enum"]
          updated_at?: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          parent_asset_id?: string | null
          source?: Database["public"]["Enums"]["asset_source_enum"]
          status?: Database["public"]["Enums"]["asset_status_enum"]
          title?: string | null
          type?: Database["public"]["Enums"]["asset_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "asset_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          created_by: string | null
          deprecated_cover_image_url: string | null
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
          view_count: number
        }
        Insert: {
          author_id?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          deprecated_cover_image_url?: string | null
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
          view_count?: number
        }
        Update: {
          author_id?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          deprecated_cover_image_url?: string | null
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
          view_count?: number
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
      blog_user_events: {
        Row: {
          article_id: string | null
          created_at: string
          device: string | null
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          device?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          device?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_user_events_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
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
      cms_sections: {
        Row: {
          content: Json
          id: string
          is_active: boolean | null
          page_name: string
          section_key: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          is_active?: boolean | null
          page_name: string
          section_key: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          is_active?: boolean | null
          page_name?: string
          section_key?: string
          updated_at?: string | null
          updated_by?: string | null
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
      crm_pipeline_history: {
        Row: {
          admin_id: string | null
          created_at: string | null
          from_status: string | null
          id: string
          lead_id: string | null
          to_status: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          lead_id?: string | null
          to_status: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          lead_id?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipeline_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      decision_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lead_id: string
          occurred_at: string
          payload: Json
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          occurred_at?: string
          payload?: Json
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          occurred_at?: string
          payload?: Json
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      design_process_steps: {
        Row: {
          budget_range: string | null
          client_does: Json | null
          created_at: string
          deliverables: Json | null
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
          timeline_estimate: string | null
          title: string
          updated_at: string
          we_do: Json | null
        }
        Insert: {
          budget_range?: string | null
          client_does?: Json | null
          created_at?: string
          deliverables?: Json | null
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
          timeline_estimate?: string | null
          title: string
          updated_at?: string
          we_do?: Json | null
        }
        Update: {
          budget_range?: string | null
          client_does?: Json | null
          created_at?: string
          deliverables?: Json | null
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
          timeline_estimate?: string | null
          title?: string
          updated_at?: string
          we_do?: Json | null
        }
        Relationships: []
      }
      estimator_flow_config: {
        Row: {
          data: Json
          id: string
          key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          label: string
          path: string
          section: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          label: string
          path: string
          section: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          label?: string
          path?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
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
      lead_objections: {
        Row: {
          category: string
          created_at: string | null
          detail: string | null
          id: string
          lead_id: string
          resolved: boolean | null
          resolved_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          detail?: string | null
          id?: string
          lead_id: string
          resolved?: boolean | null
          resolved_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          detail?: string | null
          id?: string
          lead_id?: string
          resolved?: boolean | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_objections_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string
          priority: string | null
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id: string
          priority?: string | null
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          alcs_confidence: number | null
          alcs_evidence: Json | null
          alcs_execution_path: string | null
          alcs_primary_drivers: Json | null
          alcs_reasoning: string | null
          archetype: string | null
          area: number | null
          assigned_to: string | null
          budget: string | null
          city: string | null
          city_tier: string | null
          closed_at: string | null
          consent: boolean | null
          created_at: string | null
          discovery_archetype: string | null
          discovery_confidence: number | null
          discovery_contradictions: Json | null
          discovery_emotional_goal: string | null
          discovery_lifestyle: Json | null
          discovery_priorities: Json | null
          discovery_sensory: Json | null
          email: string
          estimate_breakdown: Json | null
          estimated_max: number | null
          estimated_min: number | null
          forecast_category: string | null
          form_data: Json | null
          id: string
          internal_notes: Json | null
          investment_tier: string | null
          last_activity_at: string | null
          lead_score: number | null
          lead_source: Database["public"]["Enums"]["lead_source_enum"] | null
          lead_type: Database["public"]["Enums"]["lead_type_enum"] | null
          message: string | null
          name: string
          next_step: string | null
          phone: string | null
          project_type: string | null
          property_type: string | null
          score: number | null
          score_details: Json | null
          service: string | null
          source: string | null
          source_url: string | null
          stale_flagged_at: string | null
          start_timing: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status_enum"]
          sub_status: string | null
          updated_at: string | null
        }
        Insert: {
          alcs_confidence?: number | null
          alcs_evidence?: Json | null
          alcs_execution_path?: string | null
          alcs_primary_drivers?: Json | null
          alcs_reasoning?: string | null
          archetype?: string | null
          area?: number | null
          assigned_to?: string | null
          budget?: string | null
          city?: string | null
          city_tier?: string | null
          closed_at?: string | null
          consent?: boolean | null
          created_at?: string | null
          discovery_archetype?: string | null
          discovery_confidence?: number | null
          discovery_contradictions?: Json | null
          discovery_emotional_goal?: string | null
          discovery_lifestyle?: Json | null
          discovery_priorities?: Json | null
          discovery_sensory?: Json | null
          email: string
          estimate_breakdown?: Json | null
          estimated_max?: number | null
          estimated_min?: number | null
          forecast_category?: string | null
          form_data?: Json | null
          id?: string
          internal_notes?: Json | null
          investment_tier?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_source?: Database["public"]["Enums"]["lead_source_enum"] | null
          lead_type?: Database["public"]["Enums"]["lead_type_enum"] | null
          message?: string | null
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
          sub_status?: string | null
          updated_at?: string | null
        }
        Update: {
          alcs_confidence?: number | null
          alcs_evidence?: Json | null
          alcs_execution_path?: string | null
          alcs_primary_drivers?: Json | null
          alcs_reasoning?: string | null
          archetype?: string | null
          area?: number | null
          assigned_to?: string | null
          budget?: string | null
          city?: string | null
          city_tier?: string | null
          closed_at?: string | null
          consent?: boolean | null
          created_at?: string | null
          discovery_archetype?: string | null
          discovery_confidence?: number | null
          discovery_contradictions?: Json | null
          discovery_emotional_goal?: string | null
          discovery_lifestyle?: Json | null
          discovery_priorities?: Json | null
          discovery_sensory?: Json | null
          email?: string
          estimate_breakdown?: Json | null
          estimated_max?: number | null
          estimated_min?: number | null
          forecast_category?: string | null
          form_data?: Json | null
          id?: string
          internal_notes?: Json | null
          investment_tier?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_source?: Database["public"]["Enums"]["lead_source_enum"] | null
          lead_type?: Database["public"]["Enums"]["lead_type_enum"] | null
          message?: string | null
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
          sub_status?: string | null
          updated_at?: string | null
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
      media_files: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          display_name: string
          file_name: string
          folder_id: string | null
          height: number | null
          id: string
          mime_type: string
          size_bytes: number
          storage_path: string
          storage_provider: string | null
          updated_at: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_name: string
          file_name: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path: string
          storage_provider?: string | null
          updated_at?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_name?: string
          file_name?: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          storage_provider?: string | null
          updated_at?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          path: unknown
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          path: unknown
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          path?: unknown
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
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
      process_faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          question?: string
        }
        Relationships: []
      }
      process_metrics: {
        Row: {
          created_at: string
          display_order: number
          id: string
          label: string
          suffix: string | null
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          label: string
          suffix?: string | null
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          label?: string
          suffix?: string | null
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
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
          deprecated_image_url: string
          display_order: number | null
          id: string
          project_id: string | null
          room_name: string | null
        }
        Insert: {
          created_at?: string | null
          deprecated_image_url: string
          display_order?: number | null
          id?: string
          project_id?: string | null
          room_name?: string | null
        }
        Update: {
          created_at?: string | null
          deprecated_image_url?: string
          display_order?: number | null
          id?: string
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
          created_at: string | null
          created_by: string | null
          deprecated_cover_image_url: string | null
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
          created_at?: string | null
          created_by?: string | null
          deprecated_cover_image_url?: string | null
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
          created_at?: string | null
          created_by?: string | null
          deprecated_cover_image_url?: string | null
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
      quiz_results: {
        Row: {
          ai_result: Json | null
          archetype: string
          created_at: string | null
          id: string
          lead_id: string | null
          scores: Json
          signals: Json | null
          slug: string
        }
        Insert: {
          ai_result?: Json | null
          archetype: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          scores: Json
          signals?: Json | null
          slug: string
        }
        Update: {
          ai_result?: Json | null
          archetype?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          scores?: Json
          signals?: Json | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
          deprecated_icon_url: string | null
          description: Json | null
          display_order: number | null
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
          deprecated_icon_url?: string | null
          description?: Json | null
          display_order?: number | null
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
          deprecated_icon_url?: string | null
          description?: Json | null
          display_order?: number | null
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
      site_media_assets: {
        Row: {
          asset_key: string
          created_at: string | null
          description: string | null
          id: string
          media_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          asset_key: string
          created_at?: string | null
          description?: string | null
          id?: string
          media_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_key?: string
          created_at?: string | null
          description?: string | null
          id?: string
          media_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_media_assets_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          about_text: string | null
          about_video_url: string | null
          address: string | null
          admin_email: string | null
          business_hours: Json | null
          company_logo_url: string | null
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
          integrations: Json | null
          is_2fa_enforced: boolean | null
          logo_dark_url: string | null
          logo_light_url: string | null
          maintenance_mode_active: boolean | null
          map_embed_url: string | null
          nav_links: Json | null
          og_image_url: string | null
          phone: string | null
          posthog_api_key: string | null
          posthog_host: string | null
          rbac_permissions: Json | null
          report_recipients: Json | null
          security_config: Json | null
          seo_description: string | null
          seo_title_template: string | null
          session_timeout: number | null
          social_links: Json | null
          studio_name: string
          studio_stats: Json | null
          tagline: string | null
          telegram_chat_ids: string[]
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          about_video_url?: string | null
          address?: string | null
          admin_email?: string | null
          business_hours?: Json | null
          company_logo_url?: string | null
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
          integrations?: Json | null
          is_2fa_enforced?: boolean | null
          logo_dark_url?: string | null
          logo_light_url?: string | null
          maintenance_mode_active?: boolean | null
          map_embed_url?: string | null
          nav_links?: Json | null
          og_image_url?: string | null
          phone?: string | null
          posthog_api_key?: string | null
          posthog_host?: string | null
          rbac_permissions?: Json | null
          report_recipients?: Json | null
          security_config?: Json | null
          seo_description?: string | null
          seo_title_template?: string | null
          session_timeout?: number | null
          social_links?: Json | null
          studio_name?: string
          studio_stats?: Json | null
          tagline?: string | null
          telegram_chat_ids?: string[]
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          about_video_url?: string | null
          address?: string | null
          admin_email?: string | null
          business_hours?: Json | null
          company_logo_url?: string | null
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
          integrations?: Json | null
          is_2fa_enforced?: boolean | null
          logo_dark_url?: string | null
          logo_light_url?: string | null
          maintenance_mode_active?: boolean | null
          map_embed_url?: string | null
          nav_links?: Json | null
          og_image_url?: string | null
          phone?: string | null
          posthog_api_key?: string | null
          posthog_host?: string | null
          rbac_permissions?: Json | null
          report_recipients?: Json | null
          security_config?: Json | null
          seo_description?: string | null
          seo_title_template?: string | null
          session_timeout?: number | null
          social_links?: Json | null
          studio_name?: string
          studio_stats?: Json | null
          tagline?: string | null
          telegram_chat_ids?: string[]
          updated_at?: string | null
          whatsapp?: string | null
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
      system_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          device: string | null
          id: string
          ip_address: string | null
          module: string
          status: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          device?: string | null
          id?: string
          ip_address?: string | null
          module: string
          status?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          device?: string | null
          id?: string
          ip_address?: string | null
          module?: string
          status?: string | null
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
          created_at: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          project_id: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          author_name: string
          author_role?: string | null
          avatar_url?: string | null
          city?: string | null
          content: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          project_id?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          author_name?: string
          author_role?: string | null
          avatar_url?: string | null
          city?: string | null
          content?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          project_id?: string | null
          rating?: number | null
          updated_at?: string | null
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
      transformation_stories: {
        Row: {
          active: boolean
          after_media: string
          before_media: string
          challenge: string
          created_at: string
          design_moves: string[]
          display_order: number
          id: string
          location: string
          outcome_metric: string
          products_used: Json
          testimonial_client_name: string | null
          testimonial_quote: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          after_media?: string
          before_media?: string
          challenge?: string
          created_at?: string
          design_moves?: string[]
          display_order?: number
          id?: string
          location?: string
          outcome_metric?: string
          products_used?: Json
          testimonial_client_name?: string | null
          testimonial_quote?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          after_media?: string
          before_media?: string
          challenge?: string
          created_at?: string
          design_moves?: string[]
          display_order?: number
          id?: string
          location?: string
          outcome_metric?: string
          products_used?: Json
          testimonial_client_name?: string | null
          testimonial_quote?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      website_events: {
        Row: {
          browser: string | null
          city: string | null
          created_at: string | null
          device: string | null
          event_type: string
          id: string
          metadata: Json | null
          page: string | null
          session_id: string | null
          source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          created_at?: string | null
          device?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          created_at?: string | null
          device?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          source?: string | null
        }
        Relationships: []
      }
      workspace_commitment_revisions: {
        Row: {
          commitment_id: string
          created_at: string
          decision_genome: Json
          decision_schema_version: string
          design_system_version: string
          divergence_score: number | null
          genome_version: string
          id: string
          is_locked: boolean
          lead_id: string | null
          locked_at: string | null
          narrative_brief: string
          previous_revision_id: string | null
          project_snapshot: Json
          recommendation_engine_version: string
          recommendation_id: string | null
          session_id: string | null
          workspace_state: Json
        }
        Insert: {
          commitment_id?: string
          created_at?: string
          decision_genome: Json
          decision_schema_version?: string
          design_system_version?: string
          divergence_score?: number | null
          genome_version?: string
          id?: string
          is_locked?: boolean
          lead_id?: string | null
          locked_at?: string | null
          narrative_brief: string
          previous_revision_id?: string | null
          project_snapshot: Json
          recommendation_engine_version?: string
          recommendation_id?: string | null
          session_id?: string | null
          workspace_state: Json
        }
        Update: {
          commitment_id?: string
          created_at?: string
          decision_genome?: Json
          decision_schema_version?: string
          design_system_version?: string
          divergence_score?: number | null
          genome_version?: string
          id?: string
          is_locked?: boolean
          lead_id?: string | null
          locked_at?: string | null
          narrative_brief?: string
          previous_revision_id?: string | null
          project_snapshot?: Json
          recommendation_engine_version?: string
          recommendation_id?: string | null
          session_id?: string | null
          workspace_state?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workspace_commitment_revisions_previous_revision_id_fkey"
            columns: ["previous_revision_id"]
            isOneToOne: false
            referencedRelation: "workspace_commitment_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_project_commitments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      bytea_to_text: { Args: { data: string }; Returns: string }
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
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      increment_blog_view:
        | { Args: { p_article_id: string }; Returns: undefined }
        | { Args: { post_slug: string }; Returns: undefined }
      increment_project_view: {
        Args: { project_id: string }
        Returns: undefined
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      is_cms_editor: { Args: never; Returns: boolean }
      is_crm_viewer: { Args: never; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_platform_admin_by_id: { Args: { _user_id: string }; Returns: boolean }
      migrate_legacy_asset: {
        Args: {
          p_domain: string
          p_entity_id: string
          p_entity_type: string
          p_role: string
          p_title: string
          p_url: string
        }
        Returns: undefined
      }
      record_blog_event: {
        Args: {
          p_article_id?: string
          p_device?: string
          p_event_type: string
          p_metadata?: Json
          p_referrer?: string
          p_session_id?: string
        }
        Returns: undefined
      }
      rpc_create_uploading_asset: {
        Args: {
          p_source: Database["public"]["Enums"]["asset_source_enum"]
          p_title: string
          p_type: Database["public"]["Enums"]["asset_type_enum"]
        }
        Returns: string
      }
      rpc_finalize_dam_asset: {
        Args: {
          p_asset_id: string
          p_domain: string
          p_entity_id: string
          p_entity_type: string
          p_file_id: string
          p_height: number
          p_mime_type: string
          p_role: string
          p_size_bytes: number
          p_url: string
          p_width: number
        }
        Returns: undefined
      }
      rpc_register_dam_asset: {
        Args: {
          p_domain: string
          p_entity_id: string
          p_entity_type: string
          p_file_id: string
          p_height: number
          p_mime_type: string
          p_role: string
          p_size_bytes: number
          p_source: Database["public"]["Enums"]["asset_source_enum"]
          p_title: string
          p_type: Database["public"]["Enums"]["asset_type_enum"]
          p_url: string
          p_width: number
        }
        Returns: string
      }
      text_to_bytea: { Args: { data: string }; Returns: string }
      text2ltree: { Args: { "": string }; Returns: unknown }
      update_media_metadata: {
        Args: { file_path: string; new_metadata: Json }
        Returns: undefined
      }
      upsert_service: {
        Args: {
          p_active: boolean
          p_description: Json
          p_display_order: number
          p_faqs: Json
          p_icon_url: string
          p_name: string
          p_service_id: string
          p_short_tag: string
          p_slug: string
          p_steps: Json
        }
        Returns: string
      }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "viewer" | "editor"
      asset_source_enum:
        | "uploaded"
        | "imported"
        | "external"
        | "generated"
        | "system"
      asset_status_enum:
        | "uploading"
        | "processing"
        | "ready"
        | "failed"
        | "archived"
      asset_type_enum: "image" | "video" | "document"
      collection_type_enum:
        | "shoot"
        | "campaign"
        | "moodboard_set"
        | "project_delivery"
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
        | "aesthetic_discovery_engine"
        | "welcome_popup"
        | "workspace_studio"
      lead_status_enum:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "won"
        | "lost"
        | "in_conversation"
        | "meeting_planned"
        | "quote_sent"
        | "closing"
      lead_type_enum: "interior" | "renovation" | "consultation" | "commercial"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "viewer", "editor"],
      asset_source_enum: [
        "uploaded",
        "imported",
        "external",
        "generated",
        "system",
      ],
      asset_status_enum: [
        "uploading",
        "processing",
        "ready",
        "failed",
        "archived",
      ],
      asset_type_enum: ["image", "video", "document"],
      collection_type_enum: [
        "shoot",
        "campaign",
        "moodboard_set",
        "project_delivery",
      ],
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
        "aesthetic_discovery_engine",
        "welcome_popup",
        "workspace_studio",
      ],
      lead_status_enum: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "won",
        "lost",
        "in_conversation",
        "meeting_planned",
        "quote_sent",
        "closing",
      ],
      lead_type_enum: ["interior", "renovation", "consultation", "commercial"],
    },
  },
} as const
