import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface WorkspaceCommitmentRevision {
  id: string;
  commitment_id: string;
  previous_revision_id: string | null;
  is_locked: boolean;
  locked_at: string | null;
  recommendation_id: string | null;
  divergence_score: number | null;
  
  decision_genome: any;
  project_snapshot: any;
  narrative_brief: string;
  workspace_state: any;
  
  decision_schema_version: string;
  genome_version: string;
  recommendation_engine_version: string;
  design_system_version: string;
  
  session_id: string;
  lead_id: string;
  created_at: string;
}

export interface CreateCommitmentRevisionParams {
  lead_id: string;
  session_id?: string;
  commitment_id?: string; // If null, starts a new thread
  previous_revision_id?: string; // For updates
  decision_genome: any;
  project_snapshot: any;
  narrative_brief: string;
  workspace_state: any;
  is_locked?: boolean;
  recommendation_id?: string;
  divergence_score?: number;
}

export function useCreateCommitmentRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateCommitmentRevisionParams) => {
      const { data, error } = await (supabase as any)
        .from('workspace_commitment_revisions')
        .insert({
          lead_id: params.lead_id,
          session_id: params.session_id,
          commitment_id: params.commitment_id || undefined, // undefined lets Postgres gen_random_uuid() take over if it's new
          previous_revision_id: params.previous_revision_id,
          decision_genome: params.decision_genome,
          project_snapshot: params.project_snapshot,
          narrative_brief: params.narrative_brief,
          workspace_state: params.workspace_state,
          is_locked: params.is_locked || false,
          locked_at: params.is_locked ? new Date().toISOString() : null,
          recommendation_id: params.recommendation_id,
          divergence_score: params.divergence_score,
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as WorkspaceCommitmentRevision;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-commitments', variables.lead_id] });
    }
  });
}

export function useWorkspaceCommitments(leadId: string) {
  return useQuery({
    queryKey: ['workspace-commitments', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data, error } = await (supabase as any)
        .from('workspace_commitment_revisions')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data as WorkspaceCommitmentRevision[];
    },
    enabled: !!leadId
  });
}
