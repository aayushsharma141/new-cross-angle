/**
 * sentry.ts – Sentry observability bootstrap for Cross Angle Interior
 *
 * Initialise ONCE, before React mounts (called from main.tsx).
 *
 * Environment variables (set in Vercel / hosting dashboard):
 *   VITE_SENTRY_DSN        – Required. The project DSN from Sentry settings.
 *   VITE_SENTRY_ENV        – Optional. Defaults to the Vite mode ('production' | 'development').
 *   VITE_RELEASE           – Optional. Git SHA injected at build time (VITE_RELEASE=$(git rev-parse --short HEAD)).
 *
 * Build-time variables (set in CI for source-map uploads):
 *   SENTRY_AUTH_TOKEN      – Sentry internal integration auth token
 *   SENTRY_ORG             – Your Sentry org slug
 *   SENTRY_PROJECT         – Your Sentry project slug
 */

import * as Sentry from '@sentry/react';

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const ENV = (import.meta.env.VITE_SENTRY_ENV as string | undefined) ?? import.meta.env.MODE;
const RELEASE = import.meta.env.VITE_RELEASE as string | undefined;

/** True once init() has succeeded. Prevents double-init. */
let _initialized = false;

/**
 * Bootstraps Sentry. Safe to call multiple times — idempotent.
 *
 * Call this as early as possible, before createRoot().
 */
export function initSentry(): void {
  if (_initialized) return;

  // Skip in development UNLESS a DSN is explicitly provided.
  if (!DSN) {
    if (ENV === 'development') {
      console.debug('[sentry] No VITE_SENTRY_DSN — skipping init in development.');
    } else {
      console.warn('[sentry] VITE_SENTRY_DSN is not set. Error reporting is disabled.');
    }
    return;
  }

  Sentry.init({
    dsn: DSN,
    environment: ENV,
    release: RELEASE,

    // ─── Integrations ────────────────────────────────────────────────────────
    integrations: [
      // Browser Tracing — captures page-load & navigation performance.
      Sentry.browserTracingIntegration({
        // Do not automatically capture navigation timings for admin routes
        // (they are excluded from being indexed anyway, but also keep noise down).
        beforeStartSpan: (context) => {
          const url = context.attributes?.['url.full'] ?? context.name ?? '';
          if (typeof url === 'string' && url.includes('/admin')) {
            return { ...context, sampled: false };
          }
          return context;
        },
      }),

      // Session Replay — captures 1 % of sessions normally, 100 % on error.
      // Masks all text and blocks all media by default for privacy compliance.
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
        // Exclude admin panel replays entirely.
        beforeAddRecordingEvent: (event) => {
          if (window.location.pathname.startsWith('/admin')) return null;
          return event;
        },
      }),

      // Captures unhandled promise rejections.
      Sentry.extraErrorDataIntegration({ depth: 5 }),
    ],

    // ─── Sampling ────────────────────────────────────────────────────────────
    /**
     * Performance traces: 10 % in production is a solid starting point.
     * Increase to 1.0 (100 %) temporarily during load-testing or when
     * investigating a performance regression.
     */
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,

    /**
     * Session Replay: 1 % background + 100 % on errors.
     * This minimises quota usage while guaranteeing replay capture for bugs.
     */
    replaysSessionSampleRate: ENV === 'production' ? 0.01 : 0.0,
    replaysOnErrorSampleRate: 1.0,

    // ─── Privacy ─────────────────────────────────────────────────────────────
    /**
     * Never send PII to Sentry. Strip emails, phone numbers, and auth tokens
     * before any event is transmitted.
     */
    beforeSend(event) {
      // Strip sensitive query-string parameters from URLs
      const scrubUrl = (url: string | undefined) => {
        if (!url) return url;
        try {
          const u = new URL(url);
          for (const key of ['token', 'access_token', 'email', 'phone', 'apikey']) {
            if (u.searchParams.has(key)) u.searchParams.set(key, '[Filtered]');
          }
          return u.toString();
        } catch {
          return url;
        }
      };

      if (event.request?.url) event.request.url = scrubUrl(event.request.url);
      if (event.request?.headers?.['Authorization']) {
        event.request.headers['Authorization'] = '[Filtered]';
      }

      // Don't send events from admin routes to reduce noise — they are already
      // monitored via edge function Sentry reporting.
      if (event.request?.url?.includes('/admin')) return null;

      return event;
    },

    // ─── Breadcrumbs ─────────────────────────────────────────────────────────
    beforeBreadcrumb(breadcrumb) {
      // Drop XHR/fetch breadcrumbs to Sentry's own ingestion endpoint.
      if (
        breadcrumb.type === 'http' &&
        breadcrumb.data?.url?.includes('sentry.io')
      ) {
        return null;
      }
      return breadcrumb;
    },
  });

  _initialized = true;
  console.debug(`[sentry] Initialized. env=${ENV} release=${RELEASE ?? 'unknown'}`);
}

// ─── React Error Boundary re-export ──────────────────────────────────────────

/**
 * Use this as a drop-in replacement for a custom ErrorBoundary to get
 * automatic Sentry reporting + a user-facing fallback UI.
 *
 * Usage:
 *   <SentryErrorBoundary fallback={<ErrorFallback />}>
 *     <YourComponent />
 *   </SentryErrorBoundary>
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// ─── Manual capture helpers ───────────────────────────────────────────────────

/**
 * Captures a handled exception with optional context.
 * Use this in catch() blocks where you want to report but not crash.
 *
 * @example
 *   captureException(error, { tags: { area: 'lead-form' } });
 */
export function captureException(
  error: unknown,
  context?: Parameters<typeof Sentry.captureException>[1],
): void {
  if (!_initialized) return;
  Sentry.captureException(error, context);
}

/**
 * Captures a custom message event (non-error observability).
 *
 * @example
 *   captureMessage('Rate limit almost reached', 'warning', { extra: { count: 58 } });
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Parameters<typeof Sentry.captureMessage>[2],
): void {
  if (!_initialized) return;
  Sentry.captureMessage(message, level, context);
}

/**
 * Sets the currently authenticated user so errors are tied to an account.
 * Call this after a successful Supabase auth.signIn().
 *
 * @example
 *   setSentryUser({ id: user.id, email: user.email });
 */
export function setSentryUser(user: { id: string; email?: string } | null): void {
  if (!_initialized) return;
  if (user) {
    // Never send the raw email — hash or omit it.
    Sentry.setUser({ id: user.id });
  } else {
    Sentry.setUser(null);
  }
}
