import { supabase } from "@/integrations/supabase/client";
import { captureEvent } from "@/lib/posthog";

const SESSION_KEY = "ca_site_sid";

const getWebsiteSessionId = (): string => {
  let sessionId = window.sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const getDevice = (): string => {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua)) return "Safari";
  return "Other";
};

export const trackWebsitePageView = async (page: string): Promise<void> => {
  const sessionId = getWebsiteSessionId();
  const payload = {
    page,
    path: page,
    title: document.title,
    referrer: document.referrer || null,
    device: getDevice(),
    browser: getBrowser(),
    session_id: sessionId,
  };

  captureEvent("page_view", payload);

  try {
    await supabase.from("website_events").insert({
      event_type: "page_view",
      page,
      source: "web_app",
      device: payload.device,
      browser: payload.browser,
      session_id: sessionId,
      metadata: {
        title: payload.title,
        referrer: payload.referrer,
      },
    });
  } catch (error) {
    console.warn("[websiteTracking] page_view insert failed:", error);
  }
};
