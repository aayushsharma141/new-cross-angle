import {
  handlePreflight,
  verifyAdmin,
  okResponse,
  unauthorizedResponse,
  getRequestId,
} from "../_lib/security.ts";

/**
 * Reports which integration secrets are set. Returns true/false per name and
 * never the value. Admin only.
 *
 * The list below must match apps/web/src/lib/admin/integrations.ts;
 * integration-secrets.test.ts fails when they differ.
 */
const SECRET_NAMES = [
  "RESEND_API_KEY",
  "LEAD_ALERT_EMAIL",
  "APP_BASE_URL",
  "SITE_URL",
  "STALE_LEAD_DAILY_DIGEST",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "WEBHOOK_SECRET",
  "POSTHOG_PERSONAL_API_KEY",
  "POSTHOG_PROJECT_ID",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_URL_ENDPOINT",
  "OPENROUTER_API_KEY",
  "ANTHROPIC_API_KEY",
  "LEAD_WEBHOOK_SECRET",
  "WEBHOOK_SIGNATURE_SECRET",
  "GOOGLE_SHEETS_WEBHOOK_URL",
  "WHATSAPP_NUMBER",
  "SENTRY_DSN",
  "ALLOWED_ORIGINS",
] as const;

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);
  const auth = await verifyAdmin(req);
  if (!auth.user) {
    return unauthorizedResponse(req, auth.error ?? "Unauthorized");
  }

  const configured: Record<string, boolean> = {};
  for (const name of SECRET_NAMES) {
    configured[name] = (Deno.env.get(name) ?? "").trim().length > 0;
  }

  return okResponse(req, { configured, checkedAt: new Date().toISOString() }, {}, undefined, undefined, requestId);
});
