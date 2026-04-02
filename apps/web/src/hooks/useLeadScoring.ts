import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeadScoreResult {
  id: string;
  name: string;
  email: string;
  score: number;
  temperature: 'hot' | 'warm' | 'cold';
  breakdown: {
    engagementScore: number;
    budgetScore: number;
    timelineScore: number;
    sourceScore: number;
  };
}

interface ScoreLeadResponse {
  success: boolean;
  count?: number;
  results?: LeadScoreResult[];
  id?: string;
  name?: string;
  email?: string;
  score?: number;
  temperature?: 'hot' | 'warm' | 'cold';
  breakdown?: {
    engagementScore: number;
    budgetScore: number;
    timelineScore: number;
    sourceScore: number;
  };
}

export function useLeadScoring() {
  const scoreLead = useMutation({
    mutationFn: async (leadId: string): Promise<LeadScoreResult> => {
      const { data, error } = await supabase.functions.invoke('score-lead', {
        body: { leadId },
      });

      if (error) throw error;
      const response = data as ScoreLeadResponse;
      if (!response?.success) throw new Error('Failed to score lead');

      return {
        id: response.id!,
        name: response.name!,
        email: response.email!,
        score: response.score!,
        temperature: response.temperature!,
        breakdown: response.breakdown!,
      };
    },
  });

  const recalculateAllScores = useMutation({
    mutationFn: async (): Promise<{ count: number; results: LeadScoreResult[] }> => {
      const { data, error } = await supabase.functions.invoke('score-lead', {
        body: { recalculateAll: true },
      });

      if (error) throw error;
      const response = data as ScoreLeadResponse;
      if (!response?.success) throw new Error('Failed to recalculate scores');

      return {
        count: response.count!,
        results: response.results || [],
      };
    },
  });

  const getScoreBreakdown = useCallback((score: number) => {
    if (score >= 70) {
      return {
        temperature: 'hot' as const,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        label: 'High Priority',
        description: 'This lead has high engagement and budget potential.',
      };
    }
    if (score >= 40) {
      return {
        temperature: 'warm' as const,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        label: 'Medium Priority',
        description: 'This lead shows moderate interest and potential.',
      };
    }
    return {
      temperature: 'cold' as const,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Low Priority',
      description: 'This lead may need nurturing or follow-up.',
    };
  }, []);

  const getScoreAdvice = useCallback((score: number) => {
    if (score >= 70) {
      return [
        'Contact within 24 hours',
        'Prepare personalized proposal',
        'Consider video call consultation',
        'Offer exclusive site visit',
      ];
    }
    if (score >= 50) {
      return [
        'Contact within 48 hours',
        'Send relevant portfolio samples',
        'Share customer testimonials',
        'Schedule follow-up call',
      ];
    }
    if (score >= 30) {
      return [
        'Add to nurture sequence',
        'Share educational content',
        'Invite to design workshop',
        'Review in weekly pipeline',
      ];
    }
    return [
      'Include in monthly newsletter',
      'Monitor for engagement changes',
      'Review quarterly',
      'Consider for future projects',
    ];
  }, []);

  return {
    scoreLead,
    recalculateAllScores,
    getScoreBreakdown,
    getScoreAdvice,
  };
}
