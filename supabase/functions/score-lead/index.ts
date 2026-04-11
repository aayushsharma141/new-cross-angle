// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handlePreflight, 
  checkRateLimit, 
  getClientId, 
  rateLimitResponse, 
  okResponse, 
  badRequestResponse, 
  serverErrorResponse, 
  structuredLog, 
  getRequestId 
} from "../_lib/security.ts";

const RATE_OPTS = { bucket: "score-lead", max: 10, windowMs: 60_000 };

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

function calculateEngagementScore(lead: Record<string, unknown>): number {
  let score = 0;
  
  if (lead.message && typeof lead.message === 'string' && lead.message.length > 50) {
    score += 30;
  }
  if (lead.message && typeof lead.message === 'string' && lead.message.length > 200) {
    score += 10;
  }
  if (lead.phone && typeof lead.phone === 'string' && lead.phone.trim().length > 0) {
    score += 20;
  }
  if (lead.service && typeof lead.service === 'string' && lead.service.trim().length > 0) {
    score += 15;
  }
  if (lead.city && typeof lead.city === 'string' && lead.city.trim().length > 0) {
    score += 15;
  }
  if (lead.budget && typeof lead.budget === 'string' && lead.budget.trim().length > 0) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function calculateBudgetScore(budget: string | null): number {
  if (!budget) return 0;
  
  const budgetMap: Record<string, number> = {
    'under_5l': 20,
    '5l_10l': 40,
    '10l_15l': 55,
    '15l_20l': 70,
    '20l_50l': 85,
    'above_50l': 100,
  };
  
  return budgetMap[budget.toLowerCase()] || 0;
}

function calculateTimelineScore(createdAt: string | null): number {
  if (!createdAt) return 50;
  
  try {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysSinceContact = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceContact <= 3) return 100;
    if (daysSinceContact <= 7) return 90;
    if (daysSinceContact <= 14) return 75;
    if (daysSinceContact <= 30) return 55;
    if (daysSinceContact <= 60) return 35;
    return Math.max(0, 25 - (daysSinceContact - 60));
  } catch {
    return 50;
  }
}

function calculateSourceScore(source: string | null): number {
  if (!source) return 20;
  
  const sourceMap: Record<string, number> = {
    'linkedin': 85,
    'referral': 75,
    'instagram': 55,
    'whatsapp': 60,
    'estimator': 70,
    'style_quiz': 65,
    'website_contact': 45,
    'search': 50,
    'direct': 40,
    'social': 35,
    'other': 25,
  };
  
  return sourceMap[source.toLowerCase()] || 25;
}

function calculateLeadScore(lead: Record<string, unknown>): LeadScoreResult {
  const engagementScore = calculateEngagementScore(lead);
  const budgetScore = calculateBudgetScore(lead.budget as string | null);
  const timelineScore = calculateTimelineScore(lead.created_at as string | null);
  const sourceScore = calculateSourceScore(lead.lead_source as string | null);
  
  const totalScore = Math.round(
    (engagementScore * 0.35) + 
    (budgetScore * 0.30) + 
    (timelineScore * 0.20) + 
    (sourceScore * 0.15)
  );
  
  const temperature: 'hot' | 'warm' | 'cold' = 
    totalScore >= 70 ? 'hot' : 
    totalScore >= 40 ? 'warm' : 'cold';
  
  return {
    id: lead.id as string,
    name: lead.name as string,
    email: lead.email as string,
    score: totalScore,
    temperature,
    breakdown: {
      engagementScore,
      budgetScore,
      timelineScore,
      sourceScore,
    },
  };
}

const FN = "score-lead";

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);
  const clientId = getClientId(req);
  const rl = await checkRateLimit(req, clientId, RATE_OPTS);
  if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return badRequestResponse(req, "Invalid JSON", {}, requestId);
    }

    const { leadId, recalculateAll } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (recalculateAll) {
      structuredLog("info", FN, "Recalculating all leads", {}, requestId);
      const { data: leads, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .in('status', ['new', 'contacted', 'qualified', 'proposal']);

      if (fetchError) throw fetchError;

      const results: LeadScoreResult[] = [];
      
      for (const lead of leads || []) {
        const scoreResult = calculateLeadScore(lead);
        results.push(scoreResult);

        await supabase
          .from('leads')
          .update({ 
            score: scoreResult.score,
            score_details: { ...scoreResult.breakdown, trace_id: requestId },
          })
          .eq('id', lead.id);
      }

      structuredLog("info", FN, "Bulk score complete", { count: results.length }, requestId);
      return okResponse(req, { 
        success: true, 
        count: results.length,
        results 
      }, {}, rl, RATE_OPTS.max, requestId);

    } else if (leadId) {
      structuredLog("info", FN, "Scoring single lead", { leadId }, requestId);
      const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return badRequestResponse(req, "Lead not found", {}, requestId);
        }
        throw fetchError;
      }

      const scoreResult = calculateLeadScore(lead);

      await supabase
        .from('leads')
        .update({ 
          score: scoreResult.score,
          score_details: { ...scoreResult.breakdown, trace_id: requestId },
        })
        .eq('id', leadId);

      structuredLog("info", FN, "Lead scored", { leadId, score: scoreResult.score }, requestId);
      return okResponse(req, { success: true, ...scoreResult }, {}, rl, RATE_OPTS.max, requestId);

    } else {
      return badRequestResponse(req, "Either leadId or recalculateAll must be provided", {}, requestId);
    }

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    structuredLog("error", FN, "Score failed", { error: msg }, requestId);
    return serverErrorResponse(req, msg, {}, FN, error, requestId);
  }
});
