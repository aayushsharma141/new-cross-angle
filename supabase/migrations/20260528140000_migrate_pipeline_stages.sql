-- Migration to 5-stage pipeline (Week 3 of CRM redesign)
-- Old statuses: new, contacted, qualified, consultation_scheduled, proposal_sent, negotiation, final_review
-- New statuses: new, in_conversation, meeting_planned, quote_sent, closing

-- NOTE: We use simple text replacement. Make sure no custom statuses conflict.

BEGIN;

-- Map 'contacted' to 'in_conversation'
UPDATE leads SET status = 'in_conversation' WHERE status = 'contacted';

-- Map 'qualified' and 'consultation_scheduled' to 'meeting_planned'
UPDATE leads SET status = 'meeting_planned' WHERE status IN ('qualified', 'consultation_scheduled');

-- Map 'proposal_sent' to 'quote_sent'
UPDATE leads SET status = 'quote_sent' WHERE status = 'proposal_sent';

-- Map 'negotiation' and 'final_review' to 'closing'
UPDATE leads SET status = 'closing' WHERE status IN ('negotiation', 'final_review');

COMMIT;
