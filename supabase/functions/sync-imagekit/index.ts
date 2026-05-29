/**
 * sync-imagekit Edge Function
 * 
 * Fetches all files from ImageKit via their REST API and upserts them into
 * the Supabase `media` table so the Admin Media panel can display them.
 * 
 * Required Supabase secrets (set via: supabase secrets set KEY=value):
 *   IMAGEKIT_PRIVATE_KEY   — ImageKit private API key (never expose client-side)
 *   IMAGEKIT_URL_ENDPOINT  — e.g. https://ik.imagekit.io/wdrs8y61o/cross-angle
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: only admins can trigger this ──────────────────────────────────
    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey      = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin using their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check role
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!roleRow || !["super_admin", "admin"].includes(roleRow.role)) {
      return new Response(JSON.stringify({ error: "Forbidden — admin role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ImageKit API ─────────────────────────────────────────────────────────
    const ikPrivateKey   = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
    const ikUrlEndpoint  = Deno.env.get("IMAGEKIT_URL_ENDPOINT") 
                           || "https://ik.imagekit.io/wdrs8y61o/cross-angle";

    if (!ikPrivateKey) {
      return new Response(
        JSON.stringify({ 
          error: "IMAGEKIT_PRIVATE_KEY secret not set. Run: supabase secrets set IMAGEKIT_PRIVATE_KEY=your_private_key" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ImageKit uses HTTP Basic Auth: privateKey as username, empty password
    const basicAuth = btoa(`${ikPrivateKey}:`);

    // Parse optional folder path from request body
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const folder = body.folder || ""; // e.g. "/cross-angle/gallery"
    const limit  = Math.min(body.limit || 500, 1000);

    // Fetch files from ImageKit API
    const ikApiUrl = new URL("https://api.imagekit.io/v1/files");
    ikApiUrl.searchParams.set("limit", String(limit));
    ikApiUrl.searchParams.set("skip", "0");
    ikApiUrl.searchParams.set("type", "file");
    if (folder) ikApiUrl.searchParams.set("path", folder);

    const ikRes = await fetch(ikApiUrl.toString(), {
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });

    if (!ikRes.ok) {
      const errText = await ikRes.text();
      return new Response(
        JSON.stringify({ error: `ImageKit API error ${ikRes.status}: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ikFiles: Array<{
      fileId: string;
      name: string;
      url: string;
      filePath: string;
      fileType: string;
      size: number;
      createdAt: string;
      updatedAt: string;
      width?: number;
      height?: number;
      tags?: string[];
      customMetadata?: Record<string, unknown>;
    }> = await ikRes.json();

    if (!Array.isArray(ikFiles)) {
      return new Response(
        JSON.stringify({ error: "Unexpected ImageKit response", raw: ikFiles }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Upsert into media table ──────────────────────────────────────────────
    let upserted = 0;
    let skipped  = 0;
    const errors: string[] = [];

    for (const f of ikFiles) {
      // file_name is our unique key — use ImageKit filePath (starts with /)
      const fileName = `imagekit:${f.filePath}`.slice(0, 500); // prefix to distinguish from Supabase storage

      const { error: dbErr } = await adminClient
        .from("media")
        .upsert(
          {
            file_name: fileName,
            url: f.url,
            file_type: f.fileType === "image" ? "image/jpeg" : f.fileType,
            size_bytes: f.size || 0,
            alt: f.name,
            title: f.name,
            uploaded_by: user.id,
          },
          { onConflict: "file_name" }
        );

      if (dbErr) {
        errors.push(`${f.name}: ${dbErr.message}`);
      } else {
        upserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: ikFiles.length,
        upserted,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        ikUrlEndpoint,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
