import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { ReactNode, useEffect } from 'react'

if (typeof window !== 'undefined') {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  if (apiKey) {
    posthog.init(apiKey, {
      api_host: "https://app.posthog.com",
      capture_pageview: false, // Handled manually or via router
      persistence: 'localStorage',
      autocapture: true,
    })
  }
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Optional: Track initial pageview or other global events
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>
}
