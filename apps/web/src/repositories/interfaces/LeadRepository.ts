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
}

export interface Lead extends LeadPayload {
    id: string;
    status: string;
    score?: number;
    created_at: string;
    updated_at?: string;
    assigned_to?: string | null;
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
    deleteLead(id: string): Promise<void>;
}
