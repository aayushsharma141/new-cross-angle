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
import { scoreLead, scoreDetails, temperatureFor, type Lead, type ScoreBreakdown } from "../_lib/leadScoring.ts";

const RATE_OPTS = { bucket: "score-lead", max: 10, windowMs: 60_000 };

interface LeadScoreResult {
  id: string;
  name: string;
  email: string;
  score: number;
  temperature: "hot" | "warm" | "cold";
  breakdown: ScoreBreakdown;
}

/** The formula lives in _lib/leadScoring.ts, shared with auto-score-lead. */
function calculateLeadScore(lead: Record<string, unknown>): LeadScoreResult {
  const { score, breakdown } = scoreLead(lead as unknown as Lead);
  return {
    id: lead.id as string,
    name: lead.name as string,
    email: lead.email as string,
    score,
    temperature: temperatureFor(score),
    breakdown,
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
        .in('status', ['new', 'in_conversation', 'meeting_planned', 'quote_sent', 'closing']);

      if (fetchError) throw fetchError;

      const results: LeadScoreResult[] = [];
      
      for (const lead of leads || []) {
        const scoreResult = calculateLeadScore(lead);
        results.push(scoreResult);

        await supabase
          .from('leads')
          .update({ 
            score: scoreResult.score,
            score_details: { ...scoreDetails(scoreResult), trace_id: requestId },
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
          score_details: { ...scoreDetails(scoreResult), trace_id: requestId },
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
