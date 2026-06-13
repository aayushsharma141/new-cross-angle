/// <reference lib="deno.ns" />
// deno-lint-ignore-file
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROLE_PRIORITY = ["super_admin", "admin", "viewer"] as const;
type AppRole = typeof ROLE_PRIORITY[number];

function mapStoredRole(role: string | null | undefined): AppRole | null {
    if (!role) return null;
    if ((ROLE_PRIORITY as readonly string[]).includes(role)) return role as AppRole;
    if (role === "editor") return "admin";
    return null;
}

function mapProfileRole(role: string | null | undefined): AppRole | null {
    if (!role) return null;
    if (role === "user") return "viewer";
    return mapStoredRole(role);
}

function pickBestRole(rows: { role: string | null }[] | null | undefined): AppRole | null {
    const roles = new Set((rows ?? []).map((row) => mapStoredRole(row.role)).filter(Boolean));
    return ROLE_PRIORITY.find((candidate) => roles.has(candidate)) ?? null;
}

async function resolveVerifiedRole(
    adminClient: ReturnType<typeof createClient>,
    userId: string,
): Promise<AppRole | null> {
    const { data: roleRows, error: roleError } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .limit(10);

    if (roleError) throw roleError;

    const storedRole = pickBestRole(roleRows as { role: string | null }[] | null);
    if (storedRole) return storedRole;

    const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (profileError) throw profileError;

    const profileRole = mapProfileRole((profile as { role?: string | null } | null)?.role);
    if (!profileRole) return null;

    const { error: upsertError } = await adminClient
        .from("user_roles")
        .upsert({ user_id: userId, role: profileRole }, { onConflict: "user_id" });

    if (upsertError) {
        console.warn("admin-login: could not sync profile role to user_roles:", upsertError.message);
    }

    return profileRole;
}

interface SimpleKv {
    get<T>(key: unknown[]): Promise<{ value: T | null }>;
    set(key: unknown[], value: unknown, options?: { expireIn?: number }): Promise<{ ok: boolean }>;
    delete(key: unknown[]): Promise<{ ok: boolean }>;
}

// Fallback memory KV if Deno.openKv is not available
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
        // Default expire to 24 hours if not specified
        const expireIn = options?.expireIn ?? 86400000;
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

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS_HEADERS });
    }

    try {
        const { email, password } = await req.json();
        
        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Email and password are required" }), {
                status: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        await initKv();
        const activeKv = kv!;
        const key = ["login_failures", normalizedEmail];
        
        const entry = await activeKv.get<{ count: number; lockedUntil: number | null; permanentlyLocked: boolean }>(key);
        const failures = entry.value || { count: 0, lockedUntil: null, permanentlyLocked: false };

        const now = Date.now();

        // Check if permanently locked (>= 10 failures)
        if (failures.permanentlyLocked) {
            return new Response(JSON.stringify({ 
                error: "Account locked due to too many failed attempts. Please contact an administrator to reset your account." 
            }), {
                status: 403,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        // Check if temporarily locked (>= 5 failures)
        if (failures.lockedUntil && now < failures.lockedUntil) {
            const remainingMinutes = Math.ceil((failures.lockedUntil - now) / 60000);
            return new Response(JSON.stringify({ 
                error: `Too many failed attempts. Try again in ${remainingMinutes} minute(s).` 
            }), {
                status: 429,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        // Proceed to authenticate with Supabase
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
        
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data, error } = await authClient.auth.signInWithPassword({
            email: normalizedEmail,
            password
        });

        if (error || !data.session) {
            // Increment failure count
            failures.count += 1;
            
            if (failures.count >= 10) {
                failures.permanentlyLocked = true;
                
                // Ban the user via Service Role
                try {
                    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
                    const _adminClient = createClient(supabaseUrl, supabaseServiceKey);
                    
                    // Look up user by email to ban them
                    // Note: This API lists users, it requires super_admin or we can just iterate.
                    // Instead, we will just trust the KV lock for now since getting user ID by email via listUsers is tricky without pagination
                    // Deno KV will enforce the permanent lock
                } catch (e) {
                    console.error("Failed to ban user:", e);
                }
                
                await activeKv.set(key, failures); // No expiry
                return new Response(JSON.stringify({ 
                    error: "Account locked due to too many failed attempts. Please contact an administrator to reset your account." 
                }), {
                    status: 403,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                });
            } else if (failures.count >= 5) {
                // 15 minute cooldown
                failures.lockedUntil = now + (15 * 60 * 1000);
                await activeKv.set(key, failures, { expireIn: 15 * 60 * 1000 });
                return new Response(JSON.stringify({ 
                    error: "Too many failed attempts. Try again in 15 minutes." 
                }), {
                    status: 429,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                });
            } else {
                // Just record failure
                await activeKv.set(key, failures, { expireIn: 24 * 60 * 60 * 1000 }); // Expire after 24h
                return new Response(JSON.stringify({ 
                    error: "Invalid login credentials." 
                }), {
                    status: 401,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                });
            }
        }

        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        const verifiedRole = await resolveVerifiedRole(adminClient, data.session.user.id);

        if (!verifiedRole) {
            return new Response(JSON.stringify({
                error: "Your account is authenticated but no admin console role is assigned. Please contact an administrator."
            }), {
                status: 403,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        // Successful login
        // Reset failures
        if (failures.count > 0) {
            await activeKv.delete(key);
        }

        return new Response(JSON.stringify({
            session: data.session,
            user: {
                id: data.session.user.id,
                email: data.session.user.email,
            },
            role: verifiedRole,
        }), {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }
});
