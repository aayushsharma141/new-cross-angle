// DEF-001 probe: is the redefined public.upsert_service live?
// Read-only for the database: anon must never be able to execute this RPC.
// Usage (repo root): node scripts/checks/probe-upsert-service.mjs
//
// PASS = new signature (no p_icon_url) resolves AND anon is refused at the grant (HTTP 401/403, code 42501).
// FAIL = old function still live: new signature -> 404 PGRST202, old signature -> 400 P0001 "Access denied. Must be CMS editor."
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/web/.env') });
dotenv.config({ path: path.resolve('apps/web/.env.local') });

const URL_ = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
if (!URL_ || !ANON) { console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY'); process.exit(2); }

const headers = { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' };
const base = { p_service_id: null, p_name: '[QA] anon-probe', p_slug: 'qa-anon-probe', p_description: {}, p_short_tag: null, p_display_order: 999, p_active: false, p_steps: [], p_faqs: [] };

const call = async (body) => {
  const r = await fetch(`${URL_}/rest/v1/rpc/upsert_service`, { method: 'POST', headers, body: JSON.stringify(body) });
  let json = {}; try { json = await r.json(); } catch { /* non-JSON */ }
  return { status: r.status, code: json.code, message: (json.message || '').slice(0, 80) };
};

const fresh = await call(base);                       // new signature: no p_icon_url
const legacy = await call({ ...base, p_icon_url: null }); // old signature

console.log('project      :', new URL(URL_).host);
console.log('new signature:', fresh);
console.log('old signature:', legacy);

const newResolves = fresh.code !== 'PGRST202';
const anonRefusedAtGrant = [fresh, legacy].every((r) => r.code === '42501' || r.status === 401 || r.status === 403);
const reachedGuard = [fresh, legacy].some((r) => r.code === 'P0001');

if (newResolves && anonRefusedAtGrant) { console.log('\nPASS — DEF-001 migration is live (new signature resolves, anon revoked).'); process.exit(0); }
if (!newResolves && reachedGuard) { console.log('\nFAIL — old upsert_service still live (icon_url writer). Migration 20260915000000 not applied.'); process.exit(1); }
console.log('\nINCONCLUSIVE — see raw responses above (possible PostgREST schema-cache lag: run NOTIFY pgrst, \'reload schema\'; and retry).');
process.exit(1);
