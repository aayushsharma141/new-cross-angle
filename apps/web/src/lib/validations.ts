import { z } from "zod";

// ==========================================
// BLOG POST VALIDATION
// ==========================================
const blogStatusValues = ["draft", "published", "archived"] as const;

export const blogPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    excerpt: z.string().optional().default(""),
    content: z.string().optional().default(""),
    cover_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    is_published: z.boolean().default(false),
    status: z.enum(blogStatusValues).default("draft"),
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
    description: z.string().optional().default(""),
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
const portfolioStatusValues = ["draft", "live"] as const;

export const portfolioSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    short_description: z.string().optional().default(""),
    category_id: z.string().optional().default(""),
    client_name: z.string().optional().default(""),
    location: z.string().optional().default(""),
    area: z.string().optional().default(""),
    budget: z.string().optional().default(""),
    duration: z.string().optional().default(""),
    style: z.string().optional().default(""),
    year_completed: z.number().int().min(1900).max(2100).default(new Date().getFullYear()),
    cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    brief: z.string().optional().default(""),
    approach: z.string().optional().default(""),
    video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    is_featured: z.boolean().default(false),
    status: z.enum(portfolioStatusValues).default("draft"),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;

// ==========================================
// TESTIMONIAL VALIDATION
// ==========================================
export const testimonialSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.string().optional().default(""),
    content: z.string().min(10, "Review must be at least 10 characters"),
    rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5").default(5),
    avatar_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    city: z.string().optional().default(""),
    active: z.boolean().default(true),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

// ==========================================
// LEAD VALIDATION
// ==========================================
export const leadStatusOptions = [
    "new",
    "contacted",
    "qualified",
    "consultation_scheduled",
    "proposal_sent",
    "negotiation",
    "final_review",
    "won",
    "lost"
] as const;
export type LeadStatus = typeof leadStatusOptions[number];

export const forecastCategoryOptions = [
    "committed",
    "best_case",
    "pipeline",
    "omitted",
] as const;
export type ForecastCategory = typeof forecastCategoryOptions[number];

export const lossReasonOptions = [
    "no_budget",
    "out_of_area",
    "no_response",
    "not_ready",
    "lost_to_competitor",
    "scope_mismatch",
    "other"
] as const;
export type LossReason = typeof lossReasonOptions[number];

export const leadSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    message: z.string().optional(),
    service: z.string().optional(),
    status: z.enum(leadStatusOptions).default("new"),
    loss_reason: z.enum(lossReasonOptions).optional().nullable(),
    source: z.string().default("contact_form"),
    notes: z.string().optional(),
    // Qualification parameters
    city: z.string().optional().nullable(),
    budget: z.string().optional().nullable(),
    scope: z.string().optional().nullable(),
    timeline: z.string().optional().nullable(),
    // CRM intelligence fields
    next_step: z.string().optional().nullable(),
    forecast_category: z.enum(forecastCategoryOptions).optional().nullable(),
    assigned_to: z.string().optional().nullable(),
    budget_value_inr: z.number().optional().nullable(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// ==========================================
// CRM HYGIENE VALIDATION
// ==========================================

/** Fields required before allowing stage advancement */
const STAGE_ADVANCE_REQUIREMENTS: Partial<Record<LeadStatus, { fields: string[]; messages: string[] }>> = {
    qualified: {
        fields: ["phone", "city"],
        messages: ["Phone number required for qualified leads", "City required for qualified leads"],
    },
    proposal_sent: {
        fields: ["phone", "city", "budget"],
        messages: [
            "Phone number required before sending proposal",
            "City required before sending proposal",
            "Budget required before sending proposal",
        ],
    },
    won: {
        fields: ["notes"],
        messages: ["Add a closing note for Won deals (what worked?)"],
    },
    lost: {
        fields: ["loss_reason"],
        messages: ["Loss reason is required — helps improve future win rates"],
    },
};

/**
 * Validate a lead object before advancing it to a new stage.
 * Returns an array of error messages. Empty array = valid.
 */
export function validateStageAdvance(
    lead: Partial<Record<string, unknown>>,
    targetStatus: LeadStatus
): string[] {
    const req = STAGE_ADVANCE_REQUIREMENTS[targetStatus];
    if (!req) return [];
    const errors: string[] = [];
    req.fields.forEach((field, i) => {
        const val = lead[field];
        if (val == null || String(val).trim() === "") {
            errors.push(req.messages[i] ?? `${field} is required`);
        }
    });
    return errors;
}

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
    contact_whatsapp: z.string().optional(),
    about_video_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    address: z.string().optional(),
    social_facebook: z.string().url().optional().or(z.literal("")),
    social_instagram: z.string().url().optional().or(z.literal("")),
    social_twitter: z.string().url().optional().or(z.literal("")),
    social_linkedin: z.string().url().optional().or(z.literal("")),
    social_youtube: z.string().url().optional().or(z.literal("")),
    social_pinterest: z.string().url().optional().or(z.literal("")),
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

/**
 * Format Zod validation errors into a human-readable string for toast messages.
 */
export function formatZodErrors(errors: z.ZodError): string {
    return errors.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
}
