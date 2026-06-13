import {
  handlePreflight,
  okResponse,
  serverErrorResponse,
  badRequestResponse,
  verifyAdmin,
  structuredLog,
  getRequestId,
  readLimitedBody
} from "../_lib/security.ts";

const FN = "posthog-query";

interface QueryBody {
  action: "traffic-stats" | "traffic-timeline" | "top-pages" | "traffic-hourly" | "traffic-sources" | "funnel-discovery" | "funnel-estimator" | "retention-summary";
  from: string; // ISO date
  to: string;   // ISO date
  previousFrom?: string;
  previousTo?: string;
}

async function runHogQL(projectId: string, apiKey: string, query: string) {
  const res = await fetch(`https://app.posthog.com/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog API Error: ${res.status} - ${text}`);
  }

  const json = await res.json();
  return json.results || [];
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req, { credentialed: true });
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  // 1. Verify Admin
  const auth = await verifyAdmin(req);
  if (!auth.user) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Parse body
  const { body, error: bodyError } = await readLimitedBody<QueryBody>(req);
  if (bodyError || !body) return badRequestResponse(req, bodyError || "Missing body", { credentialed: true }, requestId);

  const { action, from, to, previousFrom, previousTo } = body;
  
  const apiKey = Deno.env.get("POSTHOG_PERSONAL_API_KEY");
  const projectId = Deno.env.get("POSTHOG_PROJECT_ID");

  if (!apiKey || !projectId) {
    return serverErrorResponse(req, "PostHog credentials not configured", { credentialed: true }, FN, undefined, requestId);
  }

  try {
    let result: unknown;

    if (action === "traffic-stats") {
      // Current views
      const viewsRes = await runHogQL(projectId, apiKey, `SELECT count() FROM events WHERE event = 'page_viewed' AND timestamp >= '${from}' AND timestamp <= '${to}'`);
      const views = viewsRes[0]?.[0] || 0;

      // Previous views
      let prevViews = 0;
      if (previousFrom && previousTo) {
        const pViewsRes = await runHogQL(projectId, apiKey, `SELECT count() FROM events WHERE event = 'page_viewed' AND timestamp >= '${previousFrom}' AND timestamp <= '${previousTo}'`);
        prevViews = pViewsRes[0]?.[0] || 0;
      }
      
      const viewsTrend = prevViews > 0 ? Math.round(((views - prevViews) / prevViews) * 100) : views > 0 ? 100 : 0;

      // Unique visitors (distinct_id)
      const uniqueRes = await runHogQL(projectId, apiKey, `SELECT count(DISTINCT distinct_id) FROM events WHERE event = 'page_viewed' AND timestamp >= '${from}' AND timestamp <= '${to}'`);
      const uniqueVisitors = uniqueRes[0]?.[0] || 0;

      // Engagement events (e.g. cta_clicked, etc) - let's count cta_clicked and blog views
      const engagementRes = await runHogQL(projectId, apiKey, `SELECT count() FROM events WHERE event IN ('cta_clicked', 'blog_viewed', 'contact_form_started') AND timestamp >= '${from}' AND timestamp <= '${to}'`);
      const engagementEvents = engagementRes[0]?.[0] || 0;

      result = {
        views,
        viewsTrend,
        uniqueVisitors,
        engagementEvents,
        avgPagesPerVisitor: uniqueVisitors > 0 ? (views / uniqueVisitors).toFixed(1) : "0",
      };
    } 
    else if (action === "traffic-timeline") {
      // Daily groupings
      const rows = await runHogQL(projectId, apiKey, `SELECT toDate(timestamp) as day, count() FROM events WHERE event = 'page_viewed' AND timestamp >= '${from}' AND timestamp <= '${to}' GROUP BY day ORDER BY day ASC`);
      result = rows.map((r: [string, number]) => ({ name: r[0], views: r[1] }));
    }
    else if (action === "top-pages") {
      // Group by path
      const rows = await runHogQL(projectId, apiKey, `SELECT properties.path, count() FROM events WHERE event = 'page_viewed' AND timestamp >= '${from}' AND timestamp <= '${to}' GROUP BY properties.path ORDER BY count() DESC LIMIT 8`);
      result = rows.map((r: [string, number]) => ({ path: r[0] || '/unknown', count: r[1] }));
    }
    else if (action === "traffic-hourly") {
      const rows = await runHogQL(projectId, apiKey, `SELECT toHour(timestamp) as hr, count() FROM events WHERE event = 'page_viewed' AND timestamp >= '${from}' AND timestamp <= '${to}' GROUP BY hr ORDER BY hr ASC`);
      
      // Initialize 24 hours
      const hours = Array.from({ length: 24 }, (_, i) => ({ name: `${i}:00`, views: 0 }));
      rows.forEach((r: [number, number]) => {
        const h = r[0];
        if (h >= 0 && h < 24) hours[h].views = r[1];
      });
      result = hours;
    }
    else if (action === "traffic-sources") {
      // Device grouping - properties.$device_type
      const rows = await runHogQL(projectId, apiKey, `SELECT properties.$device_type, count() FROM events WHERE event = 'page_viewed' AND timestamp >= '${from}' AND timestamp <= '${to}' GROUP BY properties.$device_type`);
      
      const devices: Record<string, number> = {};
      rows.forEach((r: [string, number]) => {
        const device = String(r[0] || 'unknown').toLowerCase();
        const label = device === "mobile" ? "Mobile" : device === "tablet" ? "Tablet" : "Desktop";
        devices[label] = (devices[label] || 0) + r[1];
      });

      const colors: Record<string, string> = { Desktop: "hsl(43, 74%, 49%)", Mobile: "hsl(200, 70%, 50%)", Tablet: "hsl(150, 60%, 45%)", unknown: "hsl(0, 0%, 50%)" };
      result = Object.entries(devices).map(([name, value]) => ({ name, value, color: colors[name] || "hsl(0, 0%, 50%)" }));
    }
    else if (action === "funnel-discovery") {
      const rows = await runHogQL(projectId, apiKey, `SELECT properties.stepName, count(DISTINCT properties.sessionId) FROM events WHERE event = 'quiz_step_viewed' AND timestamp >= '${from}' AND timestamp <= '${to}' GROUP BY properties.stepName ORDER BY count(DISTINCT properties.sessionId) DESC LIMIT 20`);
      result = rows.map((r: [string, number]) => ({ step: r[0] || 'unknown', count: r[1] }));
    }
    else if (action === "funnel-estimator") {
      const rows = await runHogQL(projectId, apiKey, `SELECT properties.pathId, count(DISTINCT distinct_id) FROM events WHERE event = 'estimate_path_selected' AND timestamp >= '${from}' AND timestamp <= '${to}' GROUP BY properties.pathId ORDER BY count(DISTINCT distinct_id) DESC LIMIT 20`);
      result = rows.map((r: [string, number]) => ({ step: r[0] || 'unknown', count: r[1] }));
    }
    else if (action === "retention-summary") {
      const rows = await runHogQL(projectId, apiKey, `SELECT is_new, count() FROM (SELECT distinct_id, min(timestamp) >= '${from}' as is_new FROM events WHERE event = 'page_viewed' GROUP BY distinct_id) GROUP BY is_new`);
      // rows returns [ [true, count], [false, count] ]
      let newVisitors = 0;
      let returningVisitors = 0;
      rows.forEach((r: [boolean | number, number]) => {
        if (r[0] === true || r[0] === 1) newVisitors = r[1];
        else returningVisitors = r[1];
      });
      result = { newVisitors, returningVisitors };
    }
    else {
      return badRequestResponse(req, "Invalid action", { credentialed: true }, requestId);
    }

    return okResponse(req, result, { credentialed: true }, undefined, undefined, requestId);

  } catch (error) {
    structuredLog("error", FN, "Failed to query PostHog", { error: String(error) }, requestId);
    return serverErrorResponse(req, "Failed to query PostHog", { credentialed: true }, FN, error, requestId);
  }
});
