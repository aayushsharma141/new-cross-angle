import {
  handlePreflight,
  okResponse,
  serverErrorResponse,
  structuredLog,
  getRequestId,
} from "../_lib/security.ts";

const FN = "posthog-to-telegram";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);
  
  // Reusing the exact same secrets you already use for notify-telegram
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  
  // Extract chat_id from the URL query parameter if present, otherwise fallback to environment variable
  // @ts-ignore -- URL is a Deno global, not in TS lib without dom
  const urlParams = new URL(req.url).searchParams;
  const chatId = urlParams.get("chat_id") || Deno.env.get("TELEGRAM_CHAT_ID") || "1228126069";

  try {
    const rawPayload = await req.json();

    if (!botToken) {
      structuredLog("error", FN, "TELEGRAM_BOT_TOKEN is missing", {}, requestId);
      return serverErrorResponse(req, "Bot configuration missing", {}, FN, undefined, requestId);
    }

    // PostHog sends different shapes depending on if it's an action, alert, or plugin
    // We try to pull 'text', otherwise we cleanly format the raw JSON
    let bodyText = "";
    if (rawPayload.text) {
      bodyText = rawPayload.text;
    } else if (rawPayload.message) {
      bodyText = rawPayload.message;
    } else if (rawPayload.event) {
      // It's a raw event payload
      bodyText = `<b>Event:</b> ${rawPayload.event}`;
      if (rawPayload.properties?.['$exception_message']) {
        bodyText += `\n<b>Error:</b> ${rawPayload.properties['$exception_message']}`;
      }
    } else {
      // Just stringify whatever PostHog sent so you don't lose data
      bodyText = `<code>${JSON.stringify(rawPayload, null, 2)}</code>`;
    }

    const messageText = `💥 <b>PostHog Alert</b>\n━━━━━━━━━━━━━━━━━━\n${bodyText}`;

    // @ts-expect-error -- fetch is a Deno global
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      structuredLog("error", FN, "Telegram API error", { error: errorData }, requestId);
      return serverErrorResponse(req, "Failed to send Telegram message", {}, FN, undefined, requestId);
    }

    structuredLog("info", FN, "PostHog to Telegram notification sent", { payload: rawPayload }, requestId);
    return okResponse(req, { success: true }, {}, undefined, undefined, requestId);

  } catch (error) {
    structuredLog("error", FN, "Unexpected error in posthog-to-telegram", { error: String(error) }, requestId);
    return serverErrorResponse(req, "Internal Server Error", {}, FN, error, requestId);
  }
});
