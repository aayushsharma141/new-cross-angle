import { Badge } from "@/components/ui/badge";

export interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    service?: string;
    status: string;
    notes?: string;
    created_at?: string;
    message?: string;
    budget?: string;
    score?: number;
    // New fields
    priority?: 'hot' | 'warm' | 'cold';
    project_views_count?: number;
    visit_count?: number;
    downloaded_brochure?: boolean;
    source?: string;
    // Add fields matches Database type
    city?: string | null;
    lead_source?: string | null;
    lead_type?: string | null;
}

export function calculateLeadScore(lead: Partial<Lead>): number {
    let score = 0;

    // 1. Budget Scoring (Max 30)
    // Try to detect budget from 'budget' field or 'message'
    const budgetText = (lead.budget || lead.message || "").toLowerCase();
    if (budgetText.includes("30l") || budgetText.includes("30 l")) score += 30;
    else if (budgetText.includes("20l") || budgetText.includes("20 l") || budgetText.includes("25l")) score += 25;
    else if (budgetText.includes("15l") || budgetText.includes("15 l")) score += 20;
    else if (budgetText.includes("10l") || budgetText.includes("10 l")) score += 15;
    else if (budgetText.includes("5l") || budgetText.includes("5 l")) score += 10;
    else if (budgetText.includes("budget")) score += 5; // Mentioned budget but unclear

    // 2. Project Type (Max 20)
    const service = (lead.service || "").toLowerCase();
    if (service.includes("full home") || service.includes("villa") || service.includes("bungalow")) score += 20;
    else if (service.includes("multiple") || service.includes("bhk")) score += 15;
    else if (service.includes("room") || service.includes("kitchen") || service.includes("living")) score += 10;

    // 3. Timeline (Max 20)
    const message = (lead.message || "").toLowerCase();
    if (message.includes("urgent") || message.includes("immediately") || message.includes("asap")) score += 20; // Immediate
    else if (message.includes("month") || message.includes("soon")) score += 15; // Soon
    else if (message.includes("planning") || message.includes("exploring")) score += 5; // Later

    // 4. Engagement (Max 15)
    if ((lead.project_views_count || 0) >= 5) score += 5;
    if (lead.downloaded_brochure) score += 5;
    if ((lead.visit_count || 0) >= 3) score += 5;
    // Fallback for engagement if existing fields track it differently
    if (lead.email && lead.phone) score += 5; // Basic contact info bonus

    // 5. Source (Max 15)
    const source = (lead.source || "").toLowerCase();
    if (source.includes("referral")) score += 15;
    else if (source.includes("organic") || source.includes("google")) score += 12;
    else if (source.includes("social") || source.includes("instagram") || source.includes("facebook")) score += 8;
    else if (source.includes("paid") || source.includes("ad")) score += 6;
    else score += 5; // Direct or unknown

    return Math.min(score, 100);
}

export function getLeadTemperature(score: number): { label: string; color: string; priority: 'hot' | 'warm' | 'cold' } {
    if (score >= 70) return {
        label: "Hot",
        color: "bg-red-100 text-red-700 border-red-200",
        priority: 'hot'
    };
    if (score >= 40) return {
        label: "Warm",
        color: "bg-amber-100 text-amber-700 border-amber-200",
        priority: 'warm'
    };
    return {
        label: "Cold",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        priority: 'cold'
    };
}
