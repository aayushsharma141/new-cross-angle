export interface LeadData {
    budget_range?: string
    project_type?: string
    timeline?: string
    project_views_count?: number
    downloaded_brochure?: boolean
    visit_count?: number
    source?: string
}

export interface LeadScore {
    score: number
    priority: 'hot' | 'warm' | 'cold'
    breakdown: {
        budget: number
        project_type: number
        timeline: number
        engagement: number
        source: number
    }
}

export function calculateLeadScore(lead: LeadData): LeadScore {
    let score = 0
    const breakdown = {
        budget: 0,
        project_type: 0,
        timeline: 0,
        engagement: 0,
        source: 0
    }

    // Budget scoring (30 points max)
    const budgetScores: Record<string, number> = {
        '30L+': 30,
        '25-30L': 28,
        '20-25L': 25,
        '15-20L': 20,
        '10-15L': 15,
        '10L-15L': 15,
        '5-10L': 10,
        '5L-10L': 10,
        '<5L': 5,
        'Under 5L': 5
    }
    breakdown.budget = budgetScores[lead.budget_range || ''] || 0
    score += breakdown.budget

    // Project type (20 points max)
    const projectTypeScores: Record<string, number> = {
        'Full Home': 20,
        'full_home': 20,
        'Multiple Rooms': 15,
        'multiple_rooms': 15,
        'Single Room': 10,
        'single_room': 10,
        'Bedroom': 10,
        'Living Room': 10,
        'Kitchen': 10,
        'Bathroom': 10,
        'Consultation': 5
    }
    breakdown.project_type = projectTypeScores[lead.project_type || ''] || 0
    score += breakdown.project_type

    // Timeline urgency (20 points max)
    const timelineScores: Record<string, number> = {
        'Immediate (<1 month)': 20,
        'immediate': 20,
        'Soon (1-3 months)': 15,
        'soon': 15,
        'Later (3-6 months)': 10,
        'later': 10,
        'Exploring (6+ months)': 5,
        'exploring': 5
    }
    breakdown.timeline = timelineScores[lead.timeline || ''] || 0
    score += breakdown.timeline

    // Engagement (15 points max)
    if ((lead.project_views_count || 0) >= 5) breakdown.engagement += 5
    if (lead.downloaded_brochure) breakdown.engagement += 5
    if ((lead.visit_count || 0) >= 3) breakdown.engagement += 5
    score += breakdown.engagement

    // Source quality (15 points max)
    const sourceScores: Record<string, number> = {
        'Referral': 15,
        'referral': 15,
        'Organic Search': 12,
        'organic': 12,
        'google': 12,
        'Social Media': 8,
        'social': 8,
        'instagram': 8,
        'facebook': 8,
        'Paid Ads': 6,
        'paid': 6,
        'ads': 6,
        'Direct': 5,
        'direct': 5
    }
    breakdown.source = sourceScores[lead.source?.toLowerCase() || 'direct'] || 5
    score += breakdown.source

    // Cap at 100
    score = Math.min(score, 100)

    // Determine priority
    let priority: 'hot' | 'warm' | 'cold'
    if (score >= 70) priority = 'hot'
    else if (score >= 40) priority = 'warm'
    else priority = 'cold'

    return { score, priority, breakdown }
}

export function getScoreColor(score: number): string {
    if (score >= 70) return 'bg-red-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-gray-500'
}

export function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'hot': return 'bg-red-100 text-red-700 border-red-200'
        case 'warm': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        case 'cold': return 'bg-gray-100 text-gray-700 border-gray-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

export function getPriorityBadgeVariant(priority: string): 'destructive' | 'default' | 'secondary' {
    switch (priority) {
        case 'hot': return 'destructive'
        case 'warm': return 'default'
        case 'cold': return 'secondary'
        default: return 'secondary'
    }
}
