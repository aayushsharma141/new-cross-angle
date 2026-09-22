import { z } from "zod";

// ==========================================
// BLOG POST VALIDATION
// ==========================================
const blogStatusValues = ["draft", "published", "archived"] as const;

export const blogPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title is too long"),
    slug: z.string().min(3, "Slug must be at least 3 characters").max(150, "Slug is too long")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    excerpt: z.string().max(500, "Excerpt is too long").optional().default(""),
    content: z.string().max(50000, "Content is too long").optional().default(""),
    cover_image: z.string().url("Must be a valid URL").max(1000).optional().or(z.literal("")),
    is_published: z.boolean().default(false),
    status: z.enum(blogStatusValues).default("draft"),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

// ==========================================
// SERVICE VALIDATION
// ==========================================
export const serviceFeatureSchema = z.object({
    title: z.string().min(1, "Feature title is required").max(150),
    description: z.string().max(1000).optional(),
});

export const processStepSchema = z.object({
    title: z.string().min(1, "Step title is required").max(150),
    description: z.string().max(1000).optional(),
});

export const faqItemSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters").max(300),
    answer: z.string().min(10, "Answer must be at least 10 characters").max(2000),
});

export const serviceSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(150),
    slug: z.string().min(3, "Slug must be at least 3 characters").max(150)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    description: z.string().max(5000).optional().default(""),
    hero_image: z.string().url("Must be a valid URL").max(1000).optional().or(z.literal("")),
    category_id: z.string().min(1, "Category is required").max(100),
    icon: z.string().max(100).optional(),
    tag: z.string().max(100).optional(),
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
    title: z.string().min(3, "Title must be at least 3 characters").max(150),
    slug: z.string().min(3, "Slug must be at least 3 characters").max(150)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    short_description: z.string().max(500).optional().default(""),
    category_id: z.string().max(100).optional().default(""),
    client_name: z.string().max(150).optional().default(""),
    location: z.string().max(150).optional().default(""),
    area: z.string().max(100).optional().default(""),
    budget: z.string().max(100).optional().default(""),
    duration: z.string().max(100).optional().default(""),
    style: z.string().max(100).optional().default(""),
    year_completed: z.number().int().min(1900).max(2100).default(new Date().getFullYear()),
    cover_image_url: z.string().url("Must be a valid URL").max(1000).optional().or(z.literal("")),
    brief: z.string().max(2000).optional().default(""),
    approach: z.string().max(5000).optional().default(""),
    video_url: z.string().url("Must be a valid URL").max(1000).optional().or(z.literal("")),
    is_featured: z.boolean().default(false),
    status: z.enum(portfolioStatusValues).default("draft"),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;

// ==========================================
// TESTIMONIAL VALIDATION
// ==========================================
export const testimonialSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    role: z.string().max(100).optional().default(""),
    content: z.string().min(10, "Review must be at least 10 characters").max(2000),
    rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5").default(5),
    avatar_url: z.string().url("Must be a valid URL").max(1000).optional().or(z.literal("")),
    city: z.string().max(100).optional().default(""),
    active: z.boolean().default(true),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

// ==========================================
// LEAD VALIDATION
// ==========================================
// Lead statuses aligned with CRM_STAGES (single source of truth: lib/crm/stages.ts)
export const leadStatusOptions = [
    "new",
    "in_conversation",
    "meeting_planned",
    "quote_sent",
    "closing",
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
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    email: z.string().email("Invalid email address").max(100, "Email is too long"),
    phone: z.string().regex(/^\+?[0-9\s-]{7,20}$/, "Invalid phone format").optional().nullable(),
    message: z.string().max(2000, "Message is too long").optional().nullable(),
    service: z.string().max(100).optional().nullable(),
    status: z.enum(leadStatusOptions).default("new"),
    loss_reason: z.enum(lossReasonOptions).optional().nullable(),
    source: z.string().max(50).nullish().transform(v => v ?? "contact_form"),
    notes: z.string().max(5000).optional().nullable(),
    // Qualification parameters
    city: z.string().max(100).optional().nullable(),
    budget: z.string().max(50).optional().nullable(),
    scope: z.string().max(100).optional().nullable(),
    timeline: z.string().max(50).optional().nullable(),
    // CRM intelligence fields
    next_step: z.string().max(200).optional().nullable(),
    sub_status: z.string().max(50).optional().nullable(),
    forecast_category: z.enum(forecastCategoryOptions).optional().nullable(),
    assigned_to: z.string().max(50).optional().nullable(),
    budget_value_inr: z.number().max(9999999999).optional().nullable(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// ==========================================
// CRM HYGIENE VALIDATION
// ==========================================

/** Fields required before allowing stage advancement */
const STAGE_ADVANCE_REQUIREMENTS: Partial<Record<LeadStatus, { fields: string[]; messages: string[] }>> = {
    meeting_planned: {
        fields: ["phone", "city"],
        messages: ["Phone number required before scheduling meeting", "City required before scheduling meeting"],
    },
    quote_sent: {
        fields: ["phone", "city", "budget"],
        messages: [
            "Phone number required before sending quote",
            "City required before sending quote",
            "Budget required before sending quote",
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
    company_name: z.string().min(1, "Company name is required"),
    company_description: z.string().optional(),
    company_logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
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
    telegram_chat_ids: z.array(z.string().min(1, "Chat ID cannot be empty")).default([]),
    office_hours: z.array(z.object({
        id: z.string(),
        days: z.string().min(1, "Days are required"),
        hours: z.string().min(1, "Hours are required")
    })).default([]),
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

export const validateSlugUniqueness = async (): Promise<boolean> => {
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
