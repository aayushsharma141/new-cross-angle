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
                Relationships: []
            }
            blogs: {
                Row: {
                    author: string | null
                    content: string | null
                    cover_image: string | null
                    created_at: string | null
                    excerpt: string | null
                    id: string
                    is_published: boolean | null
                    published_at: string | null
                    read_time_minutes: number | null
                    slug: string
                    title: string
                    updated_at: string | null
                    views_count: number | null
                }
                Insert: {
                    author?: string | null
                    content?: string | null
                    cover_image?: string | null
                    created_at?: string | null
                    excerpt?: string | null
                    id?: string
                    is_published?: boolean | null
                    published_at?: string | null
                    read_time_minutes?: number | null
                    slug: string
                    title: string
                    updated_at?: string | null
                    views_count?: number | null
                }
                Update: {
                    author?: string | null
                    content?: string | null
                    cover_image?: string | null
                    created_at?: string | null
                    excerpt?: string | null
                    id?: string
                    is_published?: boolean | null
                    published_at?: string | null
                    read_time_minutes?: number | null
                    slug?: string
                    title?: string
                    updated_at?: string | null
                    views_count?: number | null
                }
                Relationships: []
            }
            content_analytics: {
                Row: {
                    content_id: string
                    content_type: string
                    created_at: string
                    event_type: string
                    id: string
                    metadata: Json | null
                }
                Insert: {
                    content_id: string
                    content_type: string
                    created_at?: string
                    event_type: string
                    id?: string
                    metadata?: Json | null
                }
                Update: {
                    content_id?: string
                    content_type?: string
                    created_at?: string
                    event_type?: string
                    id?: string
                    metadata?: Json | null
                }
                Relationships: []
            }
            estimate_leads: {
                Row: {
                    admin_notes: string | null
                    area: number | null
                    budget: number | null
                    city: string | null
                    city_tier: string | null
                    created_at: string | null
                    design_package: string | null
                    email: string | null
                    estimate_breakdown: Json | null
                    estimate_total_max: number | null
                    estimate_total_min: number | null
                    id: string
                    lead_category:
                    | Database["public"]["Enums"]["estimate_lead_category"]
                    | null
                    lead_score: number | null
                    name: string
                    notes: string | null
                    phone: string | null
                    property_type: string | null
                    scopes: Json | null
                    site_visits: number | null
                    state: string | null
                    status: Database["public"]["Enums"]["estimate_lead_status"] | null
                    timeline: string | null
                    updated_at: string | null
                }
                Insert: {
                    admin_notes?: string | null
                    area?: number | null
                    budget?: number | null
                    city?: string | null
                    city_tier?: string | null
                    created_at?: string | null
                    design_package?: string | null
                    email?: string | null
                    estimate_breakdown?: Json | null
                    estimate_total_max?: number | null
                    estimate_total_min?: number | null
                    id?: string
                    lead_category?:
                    | Database["public"]["Enums"]["estimate_lead_category"]
                    | null
                    lead_score?: number | null
                    name: string
                    notes?: string | null
                    phone?: string | null
                    property_type?: string | null
                    scopes?: Json | null
                    site_visits?: number | null
                    state?: string | null
                    status?: Database["public"]["Enums"]["estimate_lead_status"] | null
                    timeline?: string | null
                    updated_at?: string | null
                }
                Update: {
                    admin_notes?: string | null
                    area?: number | null
                    budget?: number | null
                    city?: string | null
                    city_tier?: string | null
                    created_at?: string | null
                    design_package?: string | null
                    email?: string | null
                    estimate_breakdown?: Json | null
                    estimate_total_max?: number | null
                    estimate_total_min?: number | null
                    id?: string
                    lead_category?:
                    | Database["public"]["Enums"]["estimate_lead_category"]
                    | null
                    lead_score?: number | null
                    name?: string
                    notes?: string | null
                    phone?: string | null
                    property_type?: string | null
                    scopes?: Json | null
                    site_visits?: number | null
                    state?: string | null
                    status?: Database["public"]["Enums"]["estimate_lead_status"] | null
                    timeline?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            estimate_rates: {
                Row: {
                    config: Json
                    id: string
                    updated_at: string | null
                    updated_by: string | null
                }
                Insert: {
                    config?: Json
                    id?: string
                    updated_at?: string | null
                    updated_by?: string | null
                }
                Update: {
                    config?: Json
                    id?: string
                    updated_at?: string | null
                    updated_by?: string | null
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
                    {
                        foreignKeyName: "lead_activities_performed_by_fkey"
                        columns: ["performed_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            leads: {
                Row: {
                    created_at: string | null
                    downloaded_brochure: boolean | null
                    email: string | null
                    id: string
                    landing_page: string | null
                    last_contact_at: string | null
                    message: string | null
                    name: string
                    notes: string | null
                    phone: string | null
                    priority: string | null
                    project_views_count: number | null
                    score: number | null
                    service: string | null
                    source: string | null
                    status: Database["public"]["Enums"]["lead_status"] | null
                    updated_at: string | null
                    utm_campaign: string | null
                    utm_medium: string | null
                    utm_source: string | null
                    visit_count: number | null
                }
                Insert: {
                    created_at?: string | null
                    downloaded_brochure?: boolean | null
                    email?: string | null
                    id?: string
                    landing_page?: string | null
                    last_contact_at?: string | null
                    message?: string | null
                    name: string
                    notes?: string | null
                    phone?: string | null
                    priority?: string | null
                    project_views_count?: number | null
                    score?: number | null
                    service?: string | null
                    source?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    updated_at?: string | null
                    utm_campaign?: string | null
                    utm_medium?: string | null
                    utm_source?: string | null
                    visit_count?: number | null
                }
                Update: {
                    created_at?: string | null
                    downloaded_brochure?: boolean | null
                    email?: string | null
                    id?: string
                    landing_page?: string | null
                    last_contact_at?: string | null
                    message?: string | null
                    name?: string
                    notes?: string | null
                    phone?: string | null
                    priority?: string | null
                    project_views_count?: number | null
                    score?: number | null
                    service?: string | null
                    source?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    updated_at?: string | null
                    utm_campaign?: string | null
                    utm_medium?: string | null
                    utm_source?: string | null
                    visit_count?: number | null
                }
                Relationships: []
            }
            portfolio: {
                Row: {
                    category: string | null
                    completed_date: string | null
                    created_at: string | null
                    description: string | null
                    featured: boolean | null
                    gallery: Json | null
                    hero_image: string | null
                    id: string
                    location: string | null
                    slug: string
                    style: string | null
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    category?: string | null
                    completed_date?: string | null
                    created_at?: string | null
                    description?: string | null
                    featured?: boolean | null
                    gallery?: Json | null
                    hero_image?: string | null
                    id?: string
                    location?: string | null
                    slug: string
                    style?: string | null
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    category?: string | null
                    completed_date?: string | null
                    created_at?: string | null
                    description?: string | null
                    featured?: boolean | null
                    gallery?: Json | null
                    hero_image?: string | null
                    id?: string
                    location?: string | null
                    slug?: string
                    style?: string | null
                    title?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    full_name: string | null
                    id: string
                    updated_at: string | null
                    username: string | null
                    website: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    full_name?: string | null
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    website?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    full_name?: string | null
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    website?: string | null
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
            projects: {
                Row: {
                    approach: string | null
                    area: string | null
                    brief: string | null
                    budget: string | null
                    category: string | null
                    client: string | null
                    created_at: string | null
                    description: string | null
                    display_order: number | null
                    duration: string | null
                    hero_image: string | null
                    id: string
                    is_featured: boolean | null
                    location: string | null
                    slug: string
                    style: string | null
                    testimonial_author: string | null
                    testimonial_quote: string | null
                    testimonial_role: string | null
                    title: string
                    type: string | null
                    updated_at: string | null
                    video_url: string | null
                    year: number | null
                }
                Insert: {
                    approach?: string | null
                    area?: string | null
                    brief?: string | null
                    budget?: string | null
                    category?: string | null
                    client?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    duration?: string | null
                    hero_image?: string | null
                    id?: string
                    is_featured?: boolean | null
                    location?: string | null
                    slug: string
                    style?: string | null
                    testimonial_author?: string | null
                    testimonial_quote?: string | null
                    testimonial_role?: string | null
                    title: string
                    type?: string | null
                    updated_at?: string | null
                    video_url?: string | null
                    year?: number | null
                }
                Update: {
                    approach?: string | null
                    area?: string | null
                    brief?: string | null
                    budget?: string | null
                    category?: string | null
                    client?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    duration?: string | null
                    hero_image?: string | null
                    id?: string
                    is_featured?: boolean | null
                    location?: string | null
                    slug?: string
                    style?: string | null
                    testimonial_author?: string | null
                    testimonial_quote?: string | null
                    testimonial_role?: string | null
                    title?: string
                    type?: string | null
                    updated_at?: string | null
                    video_url?: string | null
                    year?: number | null
                }
                Relationships: []
            }
            roles: {
                Row: {
                    role: string
                    user_id: string
                }
                Insert: {
                    role: string
                    user_id: string
                }
                Update: {
                    role?: string
                    user_id?: string
                }
                Relationships: []
            }
            service_categories: {
                Row: {
                    description: string | null
                    hero_image: string | null
                    icon: string | null
                    id: string
                    slug: string
                    title: string
                }
                Insert: {
                    description?: string | null
                    hero_image?: string | null
                    icon?: string | null
                    id: string
                    slug: string
                    title: string
                }
                Update: {
                    description?: string | null
                    hero_image?: string | null
                    icon?: string | null
                    id?: string
                    slug?: string
                    title?: string
                }
                Relationships: []
            }
            services: {
                Row: {
                    category_id: string | null
                    created_at: string | null
                    description: string | null
                    display_order: number | null
                    faq: Json | null
                    features: Json | null
                    hero_image: string | null
                    icon: string | null
                    id: string
                    process_steps: Json | null
                    slug: string | null
                    tag: string | null
                    title: string
                }
                Insert: {
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    faq?: Json | null
                    features?: Json | null
                    hero_image?: string | null
                    icon?: string | null
                    id: string
                    process_steps?: Json | null
                    slug?: string | null
                    tag?: string | null
                    title: string
                }
                Update: {
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    faq?: Json | null
                    features?: Json | null
                    hero_image?: string | null
                    icon?: string | null
                    id?: string
                    process_steps?: Json | null
                    slug?: string | null
                    tag?: string | null
                    title?: string
                }
                Relationships: []
            }
            site_content: {
                Row: {
                    content: Json
                    id: string
                    section: string
                    updated_at: string | null
                }
                Insert: {
                    content?: Json
                    id?: string
                    section: string
                    updated_at?: string | null
                }
                Update: {
                    content?: Json
                    id?: string
                    section?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            user_roles: {
                Row: {
                    created_at: string | null
                    id: string
                    role: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    role?: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    role?: string
                    user_id?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_admin_users: {
                Args: Record<string, never>
                Returns: {
                    avatar_url: string
                    banned_until: string
                    created_at: string
                    email: string
                    full_name: string
                    id: string
                    last_sign_in_at: string
                    role: Database["public"]["Enums"]["app_role"]
                    status: string
                }[]
            }
            increment_lead_project_views: {
                Args: { lead_id_param: string }
                Returns: undefined
            }
            increment_lead_visits: {
                Args: { lead_id_param: string }
                Returns: undefined
            }
            is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
            is_staff: { Args: { _user_id: string }; Returns: boolean }
            track_blog_view: { Args: { blog_id: string }; Returns: undefined }
        }
        Enums: {
            app_role: "admin" | "editor" | "viewer"
            estimate_lead_category: "HOT" | "WARM" | "COLD"
            estimate_lead_status: "new" | "contacted" | "converted" | "archived"
            lead_status:
            | "new"
            | "contacted"
            | "qualified"
            | "proposal"
            | "negotiation"
            | "closed"
            | "lost"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
}
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            app_role: ["admin", "editor", "viewer"],
            estimate_lead_category: ["HOT", "WARM", "COLD"],
            estimate_lead_status: ["new", "contacted", "converted", "archived"],
            lead_status: [
                "new",
                "contacted",
                "qualified",
                "proposal",
                "negotiation",
                "closed",
                "lost",
            ],
        },
    },
} as const
