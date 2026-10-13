/**
 * Registry of every server-side secret the edge functions read, grouped by the
 * integration that needs it.
 *
 * This is the single list the admin Settings page and the `integration-status`
 * edge function work from. `integration-secrets.test.ts` fails if a function
 * starts reading a secret that is not listed here, so the list cannot silently
 * fall behind the code.
 *
 * Secrets are never read into the browser: the status function only reports
 * whether each one is set, not its value.
 */

export interface SecretSpec {
  /** Name of the Supabase secret (Deno.env). */
  name: string;
  /** What breaks when it is missing. Shown to the admin in plain language. */
  ifMissing: string;
  /** True when the feature cannot work at all without it. */
  required: boolean;
  /** Note when the code quietly falls back to a built-in value. */
  fallbackNote?: string;
}

export interface IntegrationSpec {
  id: string;
  name: string;
  purpose: string;
  secrets: readonly SecretSpec[];
}

export const INTEGRATION_REGISTRY: readonly IntegrationSpec[] = [
  {
    id: "resend",
    name: "Resend (Email)",
    purpose: "Customer auto-replies, new-lead alerts, stale-lead digests and the weekly report.",
    secrets: [
      { name: "RESEND_API_KEY", required: true, ifMissing: "No emails are sent: auto-replies, lead alerts and the weekly report all stop." },
      { name: "LEAD_ALERT_EMAIL", required: true, ifMissing: "New-lead alerts have nowhere to go.", fallbackNote: "New-lead alerts fall back to a built-in address in the code." },
      { name: "APP_BASE_URL", required: false, ifMissing: "Links in emails point at the default site address.", fallbackNote: "Falls back to SITE_URL, then https://crossangleinterior.com." },
      { name: "SITE_URL", required: false, ifMissing: "Only used when APP_BASE_URL is not set." },
      { name: "STALE_LEAD_DAILY_DIGEST", required: false, ifMissing: "The daily stale-lead digest stays on. Set to \"false\" to turn it off." },
    ],
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    purpose: "Instant lead notifications and PostHog alerts to a Telegram chat.",
    secrets: [
      { name: "TELEGRAM_BOT_TOKEN", required: true, ifMissing: "Telegram notifications are not sent." },
      { name: "TELEGRAM_CHAT_ID", required: true, ifMissing: "Notifications go to a built-in chat instead of yours.", fallbackNote: "Falls back to a hardcoded chat id in the code." },
      { name: "WEBHOOK_SECRET", required: false, ifMissing: "Incoming Telegram webhook calls are not signature-checked." },
    ],
  },
  {
    id: "posthog",
    name: "PostHog (Reporting API)",
    purpose: "Nightly analytics sync and the admin Traffic, Blog and Discovery reports.",
    secrets: [
      { name: "POSTHOG_PERSONAL_API_KEY", required: true, ifMissing: "Traffic and reporting pages show no data and the nightly sync cannot run." },
      { name: "POSTHOG_PROJECT_ID", required: true, ifMissing: "Traffic and reporting pages show no data and the nightly sync cannot run." },
    ],
  },
  {
    id: "imagekit",
    name: "ImageKit (Media)",
    purpose: "Uploading, syncing and migrating managed images and video.",
    secrets: [
      { name: "IMAGEKIT_PRIVATE_KEY", required: true, ifMissing: "Media uploads, sync and migration fail." },
      { name: "IMAGEKIT_PUBLIC_KEY", required: true, ifMissing: "Media uploads fail." },
      { name: "IMAGEKIT_URL_ENDPOINT", required: true, ifMissing: "Media sync cannot build image addresses." },
    ],
  },
  {
    id: "ai",
    name: "AI (OpenRouter / Anthropic)",
    purpose: "The style-quiz AI and automatic image captions.",
    secrets: [
      { name: "OPENROUTER_API_KEY", required: true, ifMissing: "Style-quiz AI and caption generation are unavailable." },
      { name: "ANTHROPIC_API_KEY", required: false, ifMissing: "Caption generation uses OpenRouter only." },
    ],
  },
  {
    id: "lead-webhooks",
    name: "Lead webhooks & Google Sheets",
    purpose: "Securing the new-lead webhook and copying leads into a Google Sheet.",
    secrets: [
      { name: "LEAD_WEBHOOK_SECRET", required: false, ifMissing: "The new-lead webhook accepts calls without a shared secret." },
      { name: "WEBHOOK_SIGNATURE_SECRET", required: false, ifMissing: "Signed webhooks cannot be verified." },
      { name: "GOOGLE_SHEETS_WEBHOOK_URL", required: false, ifMissing: "Leads are not copied to a Google Sheet." },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    purpose: "The click-to-chat number placed in customer messages.",
    secrets: [
      { name: "WHATSAPP_NUMBER", required: false, ifMissing: "Messages use a built-in number.", fallbackNote: "Falls back to a number written in the code." },
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring & access",
    purpose: "Server error reporting and browser origin rules for edge functions.",
    secrets: [
      { name: "SENTRY_DSN", required: false, ifMissing: "Server-side errors are not reported to Sentry." },
      { name: "ALLOWED_ORIGINS", required: false, ifMissing: "Only the built-in site origins are allowed to call edge functions." },
    ],
  },
] as const;

/**
 * Variables the edge functions read that are not integration credentials:
 * Supabase injects the first group itself, the rest are tuning knobs with
 * safe defaults. Listed so the drift test can tell "unlisted by mistake" from
 * "deliberately not an integration".
 */
export const NON_INTEGRATION_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "DENO_ENV",
  "RATE_LIMIT_MAX",
  "RATE_LIMIT_WINDOW_MS",
  "MAX_BODY_BYTES",
] as const;

export const ALL_SECRET_NAMES: readonly string[] = INTEGRATION_REGISTRY.flatMap((i) => i.secrets.map((s) => s.name));

export type SecretStatusMap = Record<string, boolean>;

export type IntegrationHealth = "ready" | "partial" | "missing";

/** ready = everything required is set; partial = some required set; missing = none of the required are set. */
export function integrationHealth(spec: IntegrationSpec, status: SecretStatusMap): IntegrationHealth {
  const required = spec.secrets.filter((s) => s.required);
  if (required.length === 0) return spec.secrets.some((s) => status[s.name]) ? "ready" : "missing";
  const set = required.filter((s) => status[s.name]).length;
  if (set === required.length) return "ready";
  return set === 0 ? "missing" : "partial";
}
