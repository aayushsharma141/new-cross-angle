import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
    badRequestResponse,
    serverErrorResponse,
    okResponse,
    checkIdempotency,
    structuredLog,
    getRequestId,
} from "../_lib/security.ts";

const FN = "submit-workspace-commitment";

const RATE_OPTS = { bucket: "workspace-commitment", max: 10, windowMs: 60_000 };

Deno.serve(async (req: Request) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);
    const clientId = getClientId(req);
    
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

    try {
        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return badRequestResponse(req, "Invalid JSON", {}, requestId);
        }

        const { name, email, phone, session_id, decision_genome, project_snapshot, narrative_brief, workspace_state, versioning } = body as {
            name: string; email: string; phone?: string; session_id?: string;
            decision_genome: any;
            project_snapshot: any;
            narrative_brief: string;
            workspace_state: any;
            versioning: any;
        };

        if (!email || !String(email).includes("@")) {
            return badRequestResponse(req, "Valid email is required", {}, requestId);
        }

        if (!name || String(name).trim().length === 0) {
            return badRequestResponse(req, "Name is required", {}, requestId);
        }

        if (!decision_genome || !project_snapshot || !narrative_brief || !workspace_state) {
            return badRequestResponse(req, "All four commitment artifacts are required", {}, requestId);
        }

        // Idempotency: prevent duplicate submissions
        const idemKey = `${String(email).trim().toLowerCase()}:${session_id ?? "no-session"}`;
        const idem = await checkIdempotency(idemKey, FN);
        if (idem.duplicate) {
            structuredLog("info", FN, "Duplicate workspace commitment blocked", { email }, requestId);
            return okResponse(req, { success: true, deduplicated: true }, {}, rl, RATE_OPTS.max, requestId);
        }

        // Initialize Supabase client with Service Role to bypass RLS
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // First, check if lead exists, otherwise create
        let leadId = null;
        const { data: existingLead } = await supabase
            .from("leads")
            .select("id")
            .eq("email", email.trim().toLowerCase())
            .limit(1)
            .single();

        if (existingLead) {
            leadId = existingLead.id;
        } else {
            const { data: leadData, error: leadError } = await supabase
                .from("leads")
                .insert({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone ? phone.trim() : null,
                    lead_source: "workspace_studio",
                    status: 'new'
                }).select("id").single();
            
            if (leadError) {
                throw new Error(`Failed to create CRM lead: ${leadError.message}`);
            }
            leadId = leadData.id;
        }

        // Insert workspace commitment
        const { error: commitError } = await supabase
            .from("workspace_commitment_revisions")
            .insert({
                lead_id: leadId,
                session_id: session_id || null,
                decision_genome,
                project_snapshot,
                narrative_brief,
                workspace_state,
                decision_schema_version: versioning?.decisionSchemaVersion || '1.0.0',
                genome_version: versioning?.genomeVersion || '1.0.0',
                recommendation_engine_version: versioning?.recommendationEngineVersion || '1.0.0',
                design_system_version: versioning?.designSystemVersion || '2.0.0'
            });

        if (commitError) {
            structuredLog("error", FN, "commitment insert failed", { code: commitError.code }, requestId);
            throw new Error(`Failed to save commitment: ${commitError.message}`);
        }

        await idem.markComplete();
        structuredLog("info", FN, "Workspace commitment processed", { email, leadId }, requestId);

        return okResponse(req, {
            success: true,
            id: leadId,
        }, {}, rl, RATE_OPTS.max, requestId);

    } catch (error: unknown) {
        structuredLog("error", FN, "Unhandled exception", { error: String(error) }, requestId);
        const message = error instanceof Error ? error.message : "Unknown error";
        return serverErrorResponse(req, message, {}, FN, error, requestId);
    }
});
