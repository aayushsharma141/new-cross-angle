import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Initialize Deno KV store for rate limiting
const kv = await Deno.openKv();

// Configuration
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_IP = 30;

/**
 * Checks if the given IP has exceeded the rate limit.
 * Uses Deno KV to store hit counts rolling over WINDOW_MS.
 */
async function isRateLimited(ip: string): Promise<boolean> {
    const now = Date.now();
    const key = ["rl", ip];
    const entry = await kv.get<[number, number]>(key); // [lastTs, count]

    if (!entry.value) {
        // First request from this IP
        await kv.set(key, [now, 1], { expireIn: WINDOW_MS });
        return false;
    }

    const [lastTs, count] = entry.value;

    if (now - lastTs > WINDOW_MS) {
        // Window expired, reset counter
        await kv.set(key, [now, 1], { expireIn: WINDOW_MS });
        return false;
    }

    if (count >= MAX_REQUESTS_PER_IP) {
        // Rate limit exceeded
        return true;
    }

    // Increment counter
    await kv.set(key, [lastTs, count + 1], { expireIn: WINDOW_MS });
    return false;
}

serve(async (req: Request) => {
    // Extract client IP from headers (Supabase proxies set x-forwarded-for)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (await isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: "Too Many Requests" }), {
            status: 429,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Example proxy to actual Edge Function logic or next middleware
    // In a real scenario, this wrapper would call your handler logic here.
    return new Response(JSON.stringify({ message: "Request accepted", ip }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});
