/**
 * sentry-init.ts — Standalone entry point for deferred Sentry bootstrap.
 *
 * This file is dynamically imported by main.tsx inside requestIdleCallback.
 * Separating init from the static utility exports (captureException etc.)
 * ensures that the two import patterns (dynamic vs static) never collide,
 * which Vite's rollup treats as a boundary-violation warning.
 *
 * ── Module split ──
 *   sentry-init.ts    → initSentry()   → dynamically imported by main.tsx
 *   sentry.ts         → captureException / captureMessage / setSentryUser
 *                                       → statically imported by admin files
 */
export { initSentry } from './sentry';
