// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed

interface SimpleKv {
    get<T>(key: unknown[]): Promise<{ value: T | null }>;
    set(key: unknown[], value: unknown, options?: { expireIn?: number }): Promise<{ ok: boolean }>;
    delete(key: unknown[]): Promise<{ ok: boolean }>;
}

class MemoryKv implements SimpleKv {
    private store = new Map<string, { value: unknown; expireAt: number }>();

    get<T>(key: unknown[]): Promise<{ value: T | null }> {
        const keyStr = JSON.stringify(key);
        const item = this.store.get(keyStr);
        if (!item) return Promise.resolve({ value: null });
        if (Date.now() >= item.expireAt) {
            this.store.delete(keyStr);
            return Promise.resolve({ value: null });
        }
        return Promise.resolve({ value: item.value as T });
    }

    set(key: unknown[], value: unknown, options?: { expireIn?: number }): Promise<{ ok: boolean }> {
        const keyStr = JSON.stringify(key);
        const expireIn = options?.expireIn ?? 3600000;
        this.store.set(keyStr, { value, expireAt: Date.now() + expireIn });
        return Promise.resolve({ ok: true });
    }

    delete(key: unknown[]): Promise<{ ok: boolean }> {
        const keyStr = JSON.stringify(key);
        this.store.delete(keyStr);
        return Promise.resolve({ ok: true });
    }
}

let kv: SimpleKv | null = null;

async function initKv(): Promise<void> {
    if (!kv) {
        const openKvFn = (Deno as unknown as { openKv?: unknown }).openKv;
        if (typeof openKvFn === "function") {
            try {
                kv = await (openKvFn as () => Promise<SimpleKv>)();
            } catch (e) {
                console.warn("Failed to open Deno.Kv, falling back to MemoryKv:", e);
                kv = new MemoryKv();
            }
        } else {
            console.warn("Deno.openKv is not available, falling back to MemoryKv");
            kv = new MemoryKv();
        }
    }
}

// Configuration
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_IP = 30;

/**
 * Checks if the given IP has exceeded the rate limit.
 * Uses Deno KV to store hit counts rolling over WINDOW_MS.
 */
async function isRateLimited(ip: string): Promise<boolean> {
    await initKv();
    const activeKv = kv;
    if (!activeKv) {
        throw new Error("KV failed to initialize");
    }
    const now = Date.now();
    const key = ["rl", ip];
    const entry = (await activeKv.get(key)) as { value: [number, number] | null }; // [lastTs, count]

    if (!entry || !entry.value) {
        // First request from this IP
        await activeKv.set(key, [now, 1], { expireIn: WINDOW_MS });
        return false;
    }

    const [lastTs, count] = entry.value;

    if (now - lastTs > WINDOW_MS) {
        // Window expired, reset counter
        await activeKv.set(key, [now, 1], { expireIn: WINDOW_MS });
        return false;
    }

    if (count >= MAX_REQUESTS_PER_IP) {
        // Rate limit exceeded
        return true;
    }

    // Increment counter
    await activeKv.set(key, [lastTs, count + 1], { expireIn: WINDOW_MS });
    return false;
}

Deno.serve(async (req: Request) => {
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
