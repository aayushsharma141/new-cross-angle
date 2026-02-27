export interface LeadPayload {
    name: string;
    email: string;
    phone?: string;
    message?: string;
    lead_source?: string;
    city?: string;
    budget_range?: string;
}
export interface Lead extends LeadPayload {
    id: string;
    status: string;
    created_at: string;
}
export interface LeadRepository {
    submitLead(payload: LeadPayload): Promise<void>;
    getLeads(): Promise<Lead[]>;
    updateLeadStatus(id: string, status: string): Promise<void>;
}
