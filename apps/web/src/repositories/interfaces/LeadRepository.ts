export interface LeadPayload {
    name: string;
    email: string;
    phone?: string;
    message?: string;
    source?: string;
    category?: string;
    city?: string;
    budget?: string;
    notes?: string;
    lead_source?: string; // Legacy/Mapping support
    lead_type?: string;   // Legacy/Mapping support
}

export interface Lead extends LeadPayload {
    id: string;
    status: string;
    score?: number;
    created_at: string;
    updated_at?: string;
}

export interface LeadRepository {
    submitLead(payload: LeadPayload): Promise<void>;
    getLeads(): Promise<Lead[]>;
    updateLeadStatus(id: string, status: string): Promise<void>;
    deleteLead(id: string): Promise<void>;
}
