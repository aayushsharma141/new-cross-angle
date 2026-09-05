/**
 * config/services/categories.ts — Service category definitions.
 * Maps the three top-level domains: Residential, Commercial, Specialized.
 */

import { Home, Building2, Lamp } from "lucide-react";
import type { ServiceCategory } from "./types";

export const serviceCategories: ServiceCategory[] = [
    {
        id: "residential",
        title: "Residential Design",
        slug: "residential",
        description: "Creating custom homes that match your lifestyle.",
        heroImage: "/reality_render.jpg",
        icon: Home,
    },
    {
        id: "commercial",
        title: "Commercial Design",
        slug: "commercial",
        description: "Functional workspaces designed for productivity and brand impact.",
        heroImage: "/images/projects/discovery/visual-16.jpg",
        icon: Building2,
    },
    {
        id: "specialized",
        title: "Specialized Executions",
        slug: "specialized",
        description: "Special focus on custom lighting and modular setups.",
        heroImage: "/images/projects/discovery/visual-12.jpg",
        icon: Lamp,
    },
];
