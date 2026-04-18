import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || import.meta.env.NEXT_PUBLIC_POSTHOG_KEY;
const IS_PROD = import.meta.env.PROD;

/**
 * In production/preview, we proxy PostHog requests through Vercel's Edge Network
 * via the /ingest rewrite in vercel.json. This bypasses many ad-blockers.
 */
const POSTHOG_HOST = IS_PROD 
  ? `${window.location.origin}/ingest` 
  : (import.meta.env.VITE_POSTHOG_HOST || import.meta.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com');

let _initialized = false;

/**
 * Initializes PostHog singleton. 
 * This should only be called once, after the user has accepted cookies.
 */
export const initPostHog = () => {
  if (typeof window === 'undefined' || _initialized) return;

  if (!POSTHOG_KEY) {
    console.warn('[posthog] VITE_POSTHOG_KEY is missing. Analytics disabled.');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only', // RECOMMENDED: skip anonymous profiles for GDPR/CCPA
    capture_pageview: false, // Pageviews are handled via router / manual capture
    persistence: 'localStorage',
    autocapture: true,
    // Add Vercel-specific attribution if needed
    property_blacklist: ['$ip'], // Optional: privacy-first tracking
  });

  _initialized = true;
  console.debug(`[posthog] Initialized. host=${POSTHOG_HOST}`);
};

/**
 * Capture a custom event. Guarded by initialization check.
 */
export const captureEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!_initialized) return;
  posthog.capture(eventName, properties);
};

export default posthog;
