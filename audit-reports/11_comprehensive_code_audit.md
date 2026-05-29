# Comprehensive Code & Security Audit

**Role:** Principal Software Architect, Senior Application Security Auditor, Lead QA Automation Expert  
**Target:** CrossAngle Interior Platform (React, Vite, Supabase, TypeScript)

## 1. Security & Vulnerability Analysis

### Critical Severity
*   **Missing API Route Authentication Enforcement:** Edge functions (e.g., `weekly-report-email`) must strictly validate Supabase JWTs. Currently, if not properly gated using `Authorization` headers, these endpoints could be triggered indiscriminately.
*   **Supabase RLS Bypass Risks:** By default, if Row Level Security (RLS) is not rigorously defined on tables like `leads`, `blog_posts`, and `profiles`, an attacker with a valid anon key can manipulate data.
*   **XSS in Rich Text Editor:** The `AdminBlogs.tsx` utilizes `RichTextEditor`. While `dompurify` is in `package.json`, any failure to aggressively sanitize HTML content before rendering user-submitted blog content could lead to Stored Cross-Site Scripting (XSS).

### High Severity
*   **Missing Env Validation on Startup:** The `supabase` client (`src/integrations/supabase/client.ts`) directly reads `import.meta.env.VITE_SUPABASE_URL`. Missing variables cause fatal runtime crashes instead of graceful degradation or clear startup errors.
*   **No Rate Limiting on Lead Generation:** Unauthenticated endpoints (e.g., website contact forms, estimator submissions) do not have aggressive rate limiting, making the database vulnerable to spam or DDoS-style data ingestion.

## 2. Runtime Errors & Code Quality

### High Severity
*   **God Components (Monolithic UI):** 
    *   **Faulty Function/Area:** `AdminBlogs.tsx` (800+ lines), `AdminLeads.tsx` (600+ lines), `AdminTestimonials.tsx` (800+ lines). 
    *   **Why it fails:** Large components have tightly coupled state (filtering, mutations, view modes, and drag-and-drop). This leads to excessive re-renders. A single state change in the search filter can cause the entire DOM tree, including the complex drag-and-drop board, to re-render, creating severe UI lag.
*   **Lack of Route-Level Error Boundaries:** 
    *   **Faulty Function/Area:** General Application Routing.
    *   **Why it fails:** If a nested component throws an unhandled exception (e.g., a null pointer when reading `lead.source.toLowerCase()`), the entire React tree unmounts. The application needs granular `<ErrorBoundary>` components around each major route.

### Medium Severity
*   **Unpinned Dependencies:** `package.json` uses `^` for critical dependencies (e.g., `@tanstack/react-query`). This leads to non-deterministic builds where CI/CD might pull a minor version update that breaks the app.
*   **Local Storage Misuse:** `AdminBlogs.tsx` uses local storage for auto-saving drafts. If storage quota is exceeded or multiple tabs are open, race conditions can corrupt the draft state. 

## 3. Prioritized Action Plan

### Immediate Action (Next 24 Hours)
1.  **Refactor God Components:** Decompose `AdminLeads.tsx`, `AdminBlogs.tsx`, and `AdminTestimonials.tsx` into smaller sub-components (e.g., `LeadPipelineBoard`, `LeadFilterBar`, `LeadTable`). 
2.  **Implement Env Validation:** Add a boot validation step to verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3.  **Sanitize Inputs:** Ensure `dompurify` is actively wrapping all Rich Text inputs and outputs.

### Short-term (Next 7 Days)
1.  **Standardize UI layout:** Implement the `useEmblaCarousel` vertical slide pattern across all Admin modules to remove cognitive overload and native scrolling, matching the `AdminHub` standard.
2.  **Security Review of RLS:** Audit all Supabase Row Level Security policies to ensure `anon` roles cannot insert without strict constraints and `authenticated` roles are properly scoped to their tenant/permissions.
3.  **Pin Dependencies:** Run `npm pkg fix` or manually update `package.json` to use exact dependency versions.

### Long-term
1.  **E2E Testing:** Implement Playwright tests covering the core critical paths: Login, Lead Submission, and CMS Publishing.
2.  **Rate Limiting:** Introduce Cloudflare or Edge-level rate limiting for public-facing forms.
