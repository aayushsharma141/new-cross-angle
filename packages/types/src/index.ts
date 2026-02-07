export interface BaseEntity {
    id: string;
    created_at: string;
}

export interface Feature {
    description: string;
}

export interface ProcessStep {
    title: string;
    description: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface ServiceDetail extends BaseEntity {
    title: string;
    slug: string;
    description: string;
    hero_image: string;
    category_id: string;
    icon?: string;
    tag?: string;
    features: string[]; // Stored as JSONB in DB
    process_steps: ProcessStep[]; // Stored as JSONB in DB
    faq: FAQItem[]; // Stored as JSONB in DB
}
