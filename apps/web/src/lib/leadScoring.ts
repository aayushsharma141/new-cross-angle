import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/repositories/interfaces/LeadRepository";

export type { Lead };

export function calculateLeadScore(lead: Partial<Lead>): number {
    let score = 0;

    // 1. Budget Scoring (Max 30)
    const budgetText = (lead.budget || lead.message || "").toLowerCase();
    if (budgetText.includes("30l") || budgetText.includes("30 l")) score += 30;
    else if (budgetText.includes("20l") || budgetText.includes("20 l") || budgetText.includes("25l")) score += 25;
    else if (budgetText.includes("15l") || budgetText.includes("15 l")) score += 20;
    else if (budgetText.includes("10l") || budgetText.includes("10 l")) score += 15;
    else if (budgetText.includes("5l") || budgetText.includes("5 l")) score += 10;
    else if (budgetText.includes("budget")) score += 5;

    // 2. Project Type / Category (Max 20)
    const category = (lead.category || lead.lead_type || "").toLowerCase();
    if (category.includes("interior") || category.includes("full home") || category.includes("villa")) score += 20;
    else if (category.includes("renovation") || category.includes("multiple")) score += 15;
    else if (category.includes("consultation") || category.includes("room")) score += 10;
    else if (category.includes("commercial")) score += 20;

    // 3. Timeline (Max 20) - Usually extracted from message
    const message = (lead.message || "").toLowerCase();
    if (message.includes("urgent") || message.includes("immediately") || message.includes("asap")) score += 20;
    else if (message.includes("month") || message.includes("soon")) score += 15;
    else if (message.includes("planning") || message.includes("exploring")) score += 5;

    // 4. Engagement (Fixed Bonus for now since we don't have view counts easily)
    if (lead.email && lead.phone) score += 10; // High intent if both provided

    // 5. Source (Max 15)
    const source = (lead.source || lead.lead_source || "").toLowerCase();
    if (source.includes("referral")) score += 15;
    else if (source.includes("organic") || source.includes("google") || source.includes("website")) score += 12;
    else if (source.includes("social") || source.includes("instagram") || source.includes("facebook")) score += 8;
    else if (source.includes("paid") || source.includes("ad")) score += 6;
    else score += 5;

    return Math.min(score, 100);
}

export function getLeadTemperature(score: number): { label: string; color: string; priority: 'hot' | 'warm' | 'cold' } {
    if (score >= 70) return {
        label: "Hot",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        priority: 'hot'
    };
    if (score >= 40) return {
        label: "Warm",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        priority: 'warm'
    };
    return {
        label: "Cold",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        priority: 'cold'
    };
}
