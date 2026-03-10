import { z } from "zod";

// Base Schema for all generic sections
export const BaseSectionSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    body: z.string().optional(),
    cta_text: z.string().optional(),
    cta_url: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal("")),
});

// Specific Schemas with strict constraints
export const HeroSchema = BaseSectionSchema.extend({
    title: z.string().min(1, "Hero title is required"),
    subtitle: z.string().min(1, "Hero subtitle is required"),
    image_url: z.string().url("Hero image requires a valid URL").optional().or(z.literal("")),
});

export const CTASchema = BaseSectionSchema.extend({
    title: z.string().min(1, "CTA title is required"),
    cta_text: z.string().min(1, "CTA text is required"),
    cta_url: z.string().min(1, "CTA URL is required"),
});

// Registry Mapping for Validation
export const SectionSchemas = {
    hero: HeroSchema,
    cta: CTASchema,
    // Add other defined section types mapped to Base or specific schemas
    default: BaseSectionSchema,
} as const;

export type SectionType = keyof typeof SectionSchemas;

export const validateSectionContent = (type: string, content: unknown) => {
    const schema = SectionSchemas[type as SectionType] || SectionSchemas.default;
    return schema.safeParse(content);
};
