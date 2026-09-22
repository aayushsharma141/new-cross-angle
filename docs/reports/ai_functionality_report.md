# Comprehensive AI Functionality Report

**Project:** Cross Angle Interior (new-cross-angle)
**Date:** June 19, 2026

## 1. Executive Summary
A thorough scan of the Cross Angle Interior codebase reveals a highly modular, event-driven AI architecture. AI is strategically utilized in two main areas:
1. **User Experience (Frontend):** Providing a deeply personalized, immersive "Discovery Engine" that matches users with customized interior design aesthetics based on behavioral signals.
2. **Administrative Efficiency (Backend/CMS):** Automating the generation of SEO-friendly image captions (alt text) for media uploaded to the portfolio, saving time for administrators.

These functionalities are implemented using modern Serverless Edge Functions (Deno Deploy) via Supabase, ensuring high performance, global distribution, and secure handling of API keys.

---

## 2. Detailed Breakdown of AI Functionalities

### A. The Aesthetic Discovery Engine (`aesthetic-ai`)

**Intended Purpose:** 
To act as a "discerning interior design intelligence." It synthesizes a user's behavioral signals (gathered via an interactive frontend quiz) into a deeply personal and poetic aesthetic identity, returning a structured JSON response that includes a tagline, narrative, material bias, and sensory maps.

**Implementation Locations:**
*   **Backend Edge Function:** `supabase/functions/aesthetic-ai/index.ts` (Lines 1-306)
*   **Frontend Invocation:** `apps/web/src/addons/discovery/components/AnalysisPhase.tsx` (Line 59)

**How it Works:**
1.  **Data Collection:** The frontend `AnalysisPhase` component collects user signals, including lighting preferences, material choices, emotional priorities (sliders), and free-text reflections.
2.  **Edge Invocation:** The frontend sends a secure `POST` request to the `aesthetic-ai` Supabase Edge Function.
3.  **Prompt Engineering:** The Edge Function compiles these signals into a highly specific editorial prompt using the `buildPrompt` function (Line 189).
4.  **AI Processing:** The function securely calls the OpenRouter API to process the prompt using the `google/gemini-2.5-flash` model. It mandates a strictly formatted JSON response.
5.  **Validation & Fallback:** The backend parses the JSON. If the response is incomplete or fails, it falls back to predefined default responses to ensure the user experience is not broken.

**Dependencies & Libraries:**
*   **Runtime:** Deno Edge Runtime (`@supabase/functions-js`)
*   **AI Model:** Google Gemini 2.5 Flash (`google/gemini-2.5-flash`)
*   **API Gateway:** OpenRouter API

---

### B. Automated Media Captioning (`generate-caption`)

**Intended Purpose:** 
To automatically generate concise, SEO-friendly alt text for interior design images uploaded to the administrative media library. This ensures web accessibility compliance and improves search engine optimization without manual data entry.

**Implementation Locations:**
*   **Backend Edge Function:** `supabase/functions/generate-caption/index.ts` (Lines 1-199)
*   **Frontend Invocation:** `apps/web/src/components/admin/media/MediaDetailsSheet.tsx` (Line 97)

**How it Works:**
1.  **Admin Trigger:** When an admin views an image in the media library (`MediaDetailsSheet`), they can trigger the AI caption generation.
2.  **Secure Invocation:** The request is sent to the `generate-caption` Edge Function, which first validates the user's administrative authentication token.
3.  **Image Processing:** The Edge Function fetches the image URL and converts the image into a base64 string buffer.
4.  **Multi-Model Routing:** 
    *   It attempts to use the **OpenRouter API** (`google/gemini-2.5-flash`) as the primary generator.
    *   If OpenRouter is unavailable but Anthropic is configured, it falls back to the **Anthropic API** (`claude-3-5-sonnet-20241022`).
5.  **Response:** The AI analyzes the visual features of the room and returns a specialized, professional interior design description, which is then saved as the image's alt text.

**Dependencies & Libraries:**
*   **Runtime:** Deno Edge Runtime
*   **Authentication:** `@supabase/supabase-js` (for session validation)
*   **AI Models:** Google Gemini 2.5 Flash OR Anthropic Claude 3.5 Sonnet
*   **API Gateways:** OpenRouter API, Anthropic REST API

---

## 3. Architecture & Security Notes

*   **Security:** Both AI implementations are safely abstracted behind Supabase Edge Functions. This ensures that sensitive API keys (e.g., `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`) are never exposed to the frontend client. 
*   **Rate Limiting:** The `generate-caption` function utilizes an internal rate limiter (`checkRateLimit`) to prevent abuse and API exhaustion.
*   **Cross-Origin Resource Sharing (CORS):** The Edge functions are configured to handle preflight `OPTIONS` requests securely, allowing cross-origin calls from the main web application.
