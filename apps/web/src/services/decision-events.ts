import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type EventType = 'Meeting' | 'Call' | 'Proposal' | 'Revision' | 'SiteVisit' | 'Approval' | 'Handover';

export interface DecisionEventPayload {
  recommendations?: Array<{
    id: string;
    decision: 'Accept' | 'Modify' | 'Reject';
    objection?: string;
    notes?: string;
  }>;
  clientDecision?: string;
  followUpActions?: string[];
  outcome?: string;
  [key: string]: any; // Allow arbitrary extra payload properties
}

export interface DecisionEvent {
  id: string;
  lead_id: string;
  session_id?: string;
  event_type: EventType;
  occurred_at: string;
  payload: DecisionEventPayload;
  created_at: string;
}

export interface CreateDecisionEventParams {
  lead_id: string;
  session_id?: string;
  event_type: EventType;
  occurred_at?: string;
  payload: DecisionEventPayload;
}

export function useCreateDecisionEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateDecisionEventParams) => {
      const { lead_id, session_id, event_type, occurred_at, payload } = params;
      
      const { data, error } = await (supabase as any)
        .from('decision_events')
        .insert({
          lead_id,
          session_id,
          event_type,
          occurred_at: occurred_at || new Date().toISOString(),
          payload
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as DecisionEvent;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['decision-events', variables.lead_id] });
    }
  });
}
