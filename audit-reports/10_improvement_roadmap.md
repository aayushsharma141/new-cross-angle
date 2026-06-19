# Improvement Roadmap

## Overview
A prioritized list of executable tasks to elevate the application to Elite/FAANG-level, sorted by impact-to-effort ratio.

---

## High Impact / Low Effort (Quick Wins)

* **`/align_metrics`**
  * **Scope:** Sync client-facing metrics between Homepage and About page.  
  * **Fix:** Consolidate statistical counters ("12+ vs 15+ years experience", "150+ vs 500+ projects") into a shared constant file (`src/config/brand-metrics.ts`) and import it in both components.

* **`/fix_services_hero`**
  * **Scope:** `/services` hero subtitle overlapping text layout bug.  
  * **Fix:** Change CSS spacing or stagger text animation delay properties so both animated words don't render concurrently at the same coordinates.

* **`/align_estimator_accents`**
  * **Scope:** `/estimate` wizard button highlights.  
  * **Fix:** Replace green gradient custom button styling with standard gold/crimson accent classes.

* **`/add_social_rails`**
  * **Scope:** `/services/:category` and `/services/:category/:service` layout inconsistency.  
  * **Fix:** Extract the side floating social media panel component and wrap the services pages in a layout container that embeds it.

* **`/add_gallery_toasts`**
  * **Scope:** `/gallery` inspiration board.  
  * **Fix:** Integrate a toast notification trigger inside the save/heart onClick handler so visitors receive tactile, visual feedback.

* **`/fix_contrast`**
  * **Scope:** Dark mode readability.  
  * **Fix:** Audit and update all `text-white/30` and `text-muted-foreground` classes to ensure they pass WCAG 2.1 AA contrast requirements.

* **`/unify_loaders`**
  * **Scope:** Service pages layout shifts.  
  * **Fix:** Replace the generic `Loader2` spinner in `ServiceCategoryPage.tsx` with the bespoke branded loading skeletons used in `BlogDetailPage.tsx`.

* **`/css_variables`**
  * **Scope:** Hardcoded inline styles.  
  * **Fix:** Move hardcoded colors (e.g., `#050505`, `#C41230`) in inline styles into `tailwind.config.ts` for strict design system adherence.

---

## High Impact / Medium Effort (Performance & Stability)

* **`/fix_auth_handshake`**
  * **Scope:** `/estimate` startup timeout.  
  * **Fix:** Adjust the `AuthProvider` init logic so it doesn't block the mounting of public wizard routes if Supabase is offline/taking time to check sessions. Reduce the timeout limit to 3-5 seconds.

* **`/align_portfolio_db`**
  * **Scope:** Project Hub Commercial category mismatch.  
  * **Fix:** Ensure commercial projects exist in local database migrations, or align category tags so the home page doesn't show a project that's filtered out of the portfolio hub.

* **`/optimize_animations`**
  * **Scope:** Animation performance.  
  * **Fix:** Profile the GSAP and Framer Motion components on mobile viewports. Implement `matchMedia` or `prefers-reduced-motion` fallbacks universally to disable heavy parallax/scroll jank on low-end devices.

* **`/implement_error_tracking`**
  * **Scope:** Frontend observability.  
  * **Fix:** Integrate a tool like Sentry or LogRocket for real-time frontend exception monitoring.

---

## Low Impact / High Effort (Enterprise Scaling)

* **`/redis_caching`**
  * **Scope:** Database scaling.  
  * **Fix:** Implement an edge caching layer (like Redis or Cloudflare Workers) for high-traffic database reads to reduce Supabase compute load.

* **`/distributed_tracing`**
  * **Scope:** Observability tracing.  
  * **Fix:** Implement OpenTelemetry for end-to-end trace tracking between frontend clicks and backend Supabase functions.
