/**
 * config/services/types.ts — Domain types for service data.
 * Shared across all domain service modules.
 */

import { LucideIcon } from "lucide-react";

export type ServiceCategory = {
    id: string;
    title: string;
    description: string;
    heroImage: string;
    slug: string;
    icon: LucideIcon;
};

export type ServiceDetail = {
    id: string;
    categoryId: string;
    category_id?: string;
    title: string;
    slug: string;
    description: string;
    longDescription?: string;
    heroImage: string;
    hero_image?: string;
    galleryImages?: string[];
    features: string[];
    processSteps: { title: string; description: string }[];
    process_steps?: { title: string; description: string }[];
    faq: { question: string; answer: string }[];
    relatedServices?: string[];
};
