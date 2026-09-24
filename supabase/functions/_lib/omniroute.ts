/**
 * OmniRoute integration utility
 * Provides a unified interface for routing AI requests through OmniRoute
 */

interface OmniRouteConfig {
  apiUrl: string;
  apiKey?: string;
  useDirectProviders: boolean;
}

interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
  [key: string]: unknown;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: { content: string };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export function getOmniRouteConfig(): OmniRouteConfig {
  const apiUrl = Deno.env.get("OMNIROUTE_API_URL") || "http://localhost:20128/v1";
  const apiKey = Deno.env.get("OMNIROUTE_API_KEY");
  const useDirectProviders = Deno.env.get("USE_DIRECT_PROVIDERS") === "true";

  return { apiUrl, apiKey, useDirectProviders };
}

export async function callOmniRoute(
  request: ChatCompletionRequest,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const config = getOmniRouteConfig();

  if (config.useDirectProviders) {
    // Fallback to direct provider calls
    return callDirectProvider(request, corsHeaders);
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OmniRoute error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: "AI service error",
          details: errorText,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: ChatCompletionResponse = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("OmniRoute request failed:", message);
    return new Response(
      JSON.stringify({
        error: "OmniRoute request failed",
        details: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function callDirectProvider(
  request: ChatCompletionRequest,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Route to OpenRouter by default
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "No API key configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": "https://crossangle.com",
    "X-Title": "Cross Angle Interior",
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Direct provider error:", response.status, errorText);
    return new Response(
      JSON.stringify({ error: "Direct provider error" }),
      {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function parseModelFromRequest(
  request: ChatCompletionRequest,
  envVarName: string
): string {
  // Allow per-function model override via environment variable
  const envModel = Deno.env.get(envVarName);
  if (envModel) return envModel;

  // Use model from request if provided
  if (request.model) return request.model;

  // Default to Gemini
  return "google/gemini-2.5-flash";
}
