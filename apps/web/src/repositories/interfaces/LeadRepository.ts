export interface LeadPayload {
    name: string;
    email: string;
    phone?: string | null;
    message?: string | null;
    source?: string | null;
    category?: string | null;
    city?: string | null;
    budget?: string | null;
    notes?: string | null;
    lead_source?: string | null;
    lead_type?: string | null;
    budget_value_inr?: number | null;
    auto_reply_sent_at?: string | null;
    auto_reply_template?: string | null;
    internal_notified_at?: string | null;
    scope?: string | null;
    timeline?: string | null;
    loss_reason?: string | null;
    // CRM intelligence fields
    next_step?: string | null;
    forecast_category?: 'committed' | 'best_case' | 'pipeline' | 'omitted' | null;
    assigned_to?: string | null;
    stale_flagged_at?: string | null;
    last_activity_at?: string | null;
    closed_at?: string | null;
}

export interface Lead extends LeadPayload {
    id: string;
    status: string;
    score?: number;
    created_at: string;
    updated_at?: string;
    lead_source?: string | null;
    lead_type?: string | null;
    service?: string | null;
    source_url?: string | null;
    internal_notes?: unknown | null;
    score_details?: unknown | null;
}

export interface LeadRepository {
    submitLead(payload: LeadPayload): Promise<void>;
    getLeads(): Promise<Lead[]>;
    updateLeadStatus(id: string, status: string): Promise<void>;
    /** Persist any subset of Lead fields — the canonical save method */
    updateLead(id: string, patch: Partial<LeadPayload>): Promise<void>;
    deleteLead(id: string): Promise<void>;
}
