import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ─── Session ID ─── */
function getSessionId(): string {
    let sid = sessionStorage.getItem("ca_blog_sid");
    if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem("ca_blog_sid", sid);
    }
    return sid;
}

function getDevice(): string {
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
}

/* ─── Core tracker ─── */
async function trackEvent(
    eventType: string,
    articleId?: string,
    metadata: Record<string, unknown> = {}
) {
    try {
        await supabase.rpc("record_blog_event", {
            p_event_type: eventType,
            p_article_id: articleId ?? null,
            p_session_id: getSessionId(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            p_metadata: metadata as any,
            p_device: getDevice(),
            p_referrer: document.referrer || null,
        });
    } catch (err) {
        console.warn("[BlogTracking] event failed:", err);
    }
}

/* ─── Hook: Article View ─── */
export function useArticleViewTrack(articleId?: string) {
    const tracked = useRef(false);

    useEffect(() => {
        if (!articleId || tracked.current) return;
        tracked.current = true;
        trackEvent("article_view", articleId);
    }, [articleId]);
}

/* ─── Hook: Scroll Depth ─── */
export function useScrollDepthTrack(articleId?: string) {
    const milestones = useRef(new Set<number>());

    useEffect(() => {
        if (!articleId) return;

        const handler = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const pct = Math.round((scrollTop / docHeight) * 100);

            [25, 50, 75, 100].forEach((m) => {
                if (pct >= m && !milestones.current.has(m)) {
                    milestones.current.add(m);
                    trackEvent("scroll_depth", articleId, { depth: m });
                }
            });
        };

        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, [articleId]);
}

/* ─── Hook: Reading Time ─── */
export function useReadingTimeTrack(articleId?: string) {
    const startTime = useRef(Date.now());

    useEffect(() => {
        if (!articleId) return;
        startTime.current = Date.now();

        return () => {
            const seconds = Math.round((Date.now() - startTime.current) / 1000);
            if (seconds > 3) {
                // Fire-and-forget on unmount
                trackEvent("reading_time", articleId, { time_spent_seconds: seconds });
            }
        };
    }, [articleId]);
}

/* ─── Imperative trackers ─── */
export function trackCtaClick(articleId: string, button: string) {
    trackEvent("cta_click", articleId, { clicked_button: button });
}

export function trackTagClick(articleId: string, tagName: string) {
    trackEvent("tag_click", articleId, { tag_name: tagName });
}

export function trackNewsletterSignup(articleId?: string) {
    trackEvent("newsletter_signup", articleId);
}

export function trackShareClick(articleId: string, platform: string) {
    trackEvent("share_click", articleId, { platform });
}
