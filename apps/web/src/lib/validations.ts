import { z } from "zod";

// ==========================================
// BLOG POST VALIDATION
// ==========================================
export const blogPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    cover_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    published: z.boolean().default(false),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

// ==========================================
// SERVICE VALIDATION
// ==========================================
export const serviceFeatureSchema = z.object({
    title: z.string().min(1, "Feature title is required"),
    description: z.string().optional(),
});

export const processStepSchema = z.object({
    title: z.string().min(1, "Step title is required"),
    description: z.string().optional(),
});

export const faqItemSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters"),
    answer: z.string().min(10, "Answer must be at least 10 characters"),
});

export const serviceSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    description: z.string().optional(),
    hero_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    category_id: z.string().min(1, "Category is required"),
    icon: z.string().optional(),
    tag: z.string().optional(),
    features: z.array(serviceFeatureSchema).default([]),
    process_steps: z.array(processStepSchema).default([]),
    faq: z.array(faqItemSchema).default([]),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

// ==========================================
// PORTFOLIO VALIDATION
// ==========================================
export const portfolioSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    category: z.string().min(1, "Category is required"),
    style: z.string().optional(),
    description: z.string().optional(),
    hero_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    location: z.string().optional(),
    completed_date: z.string().optional(),
    featured: z.boolean().default(false),
    gallery: z.array(z.string().url()).default([]),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;

// ==========================================
// LEAD VALIDATION
// ==========================================
export const leadStatusOptions = ["new", "contacted", "qualified", "closed", "lost"] as const;
export type LeadStatus = typeof leadStatusOptions[number];

export const leadSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    message: z.string().optional(),
    service: z.string().optional(),
    status: z.enum(leadStatusOptions).default("new"),
    source: z.string().default("contact_form"),
    notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// ==========================================
// SITE CONTENT VALIDATION
// ==========================================
export const siteContentSchema = z.object({
    section: z.string().min(1, "Section name is required"),
    content: z.record(z.any()).default({}),
});

export type SiteContentFormData = z.infer<typeof siteContentSchema>;

// ==========================================
// SETTINGS VALIDATION
// ==========================================
export const siteSettingsSchema = z.object({
    site_name: z.string().min(1, "Site name is required"),
    site_description: z.string().optional(),
    contact_email: z.string().email("Invalid email").optional(),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
    social_facebook: z.string().url().optional().or(z.literal("")),
    social_instagram: z.string().url().optional().or(z.literal("")),
    social_twitter: z.string().url().optional().or(z.literal("")),
    social_linkedin: z.string().url().optional().or(z.literal("")),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

// ==========================================
// HELPER FUNCTIONS
// ==========================================
export const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

export const validateSlugUniqueness = async (
    slug: string,
    tableName: string,
    excludeId?: string
): Promise<boolean> => {
    // This will be implemented with supabase query
    return true;
};
