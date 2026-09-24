/**
 * Type definitions for OmniRoute integration
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | {
            type: "image_url";
            image_url: { url: string };
          }
        | {
            type: "image";
            source: {
              type: "base64";
              media_type: string;
              data: string;
            };
          }
      >;
}

export interface OmniRouteRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?: { type: "json_object" | "text" };
  [key: string]: unknown;
}

export interface Choice {
  message: {
    content: string;
    role: "assistant";
  };
  finish_reason: "stop" | "length" | "content_filter";
  index: number;
}

export interface OmniRouteResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Choice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  [key: string]: unknown;
}

export interface OmniRouteConfig {
  apiUrl: string;
  apiKey?: string;
  useDirectProviders: boolean;
}

export interface OmniRouteError {
  error: string;
  details?: string;
  status?: number;
}
