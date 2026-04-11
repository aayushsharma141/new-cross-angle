import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_placeholder';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export const initPostHog = () => {
  if (typeof window !== 'undefined' && POSTHOG_KEY !== 'phc_placeholder') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only', // or 'always' if you want to track anonymous people as well
      capture_pageview: false, // We'll handle this manually or via the React SDK
      persistence: 'localStorage',
      autocapture: true,
    });
  }
};

export const captureEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
};

export default posthog;
