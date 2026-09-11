#!/usr/bin/env node
/**
 * scripts/checks/supabase-auth-invariant.js — CI gate for the cookie-based auth model
 *
 * The browser never holds the Supabase session. Instead:
 *   - the client is constructed against the `/api/supabase` proxy, not the
 *     Supabase URL directly;
 *   - `middleware.ts` (prod) / the Vite proxy (dev) inject the HTTP-only
 *     `access_token` cookie as the Authorization header;
 *   - supabase-js is told not to manage a session of its own.
 *
 * Reverting any of that to a normal client-side session silently breaks the
 * security model without breaking the build, so it is checked here.
 *
 * Server-side handlers under api/ construct their own clients on purpose and
 * are out of scope — this gate only covers the browser bundle in src/.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../../src');
const CLIENT = path.join(SRC, 'integrations', 'supabase', 'client.ts');

/** Options supabase-js must be given, so it never manages a session itself. */
const REQUIRED_OPTIONS = ['persistSession: false', 'autoRefreshToken: false', 'detectSessionInUrl: false'];

/** The proxy path every browser request must travel through. */
const PROXY_PATH = '/api/supabase';

const errors = [];

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.tsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

// ─── 1. The canonical client must exist and opt out of session management ────
if (!fs.existsSync(CLIENT)) {
  errors.push(`Expected the Supabase client at src/integrations/supabase/client.ts — it is missing.`);
} else {
  const source = stripComments(fs.readFileSync(CLIENT, 'utf-8'));

  for (const option of REQUIRED_OPTIONS) {
    if (!source.includes(option)) {
      errors.push(
        `src/integrations/supabase/client.ts must pass \`${option}\` — without it supabase-js stores the session in the browser.`,
      );
    }
  }

  if (!source.includes(PROXY_PATH)) {
    errors.push(
      `src/integrations/supabase/client.ts must route through \`${PROXY_PATH}\` so the HTTP-only cookie can be injected as Authorization.`,
    );
  }

  // The first argument to createClient must be the proxy URL, not the raw
  // Supabase URL — passing SUPABASE_URL directly bypasses the cookie injection.
  const call = source.match(/createClient\s*(?:<[^>]*>)?\s*\(\s*([A-Za-z_$][\w$]*)/);
  if (!call) {
    errors.push(`Could not find the createClient(...) call in src/integrations/supabase/client.ts.`);
  } else if (call[1] !== 'PROXY_URL') {
    errors.push(
      `createClient() is called with \`${call[1]}\` — it must be called with PROXY_URL so requests go through ${PROXY_PATH}.`,
    );
  }
}

// ─── 2. No other browser module may construct its own client ─────────────────
for (const file of walk(SRC)) {
  if (path.resolve(file) === CLIENT) continue;
  if (stripComments(fs.readFileSync(file, 'utf-8')).includes('createClient(')) {
    errors.push(
      `${path.relative(SRC, file)} calls createClient() — the browser must use the shared client from @/integrations/supabase/client.`,
    );
  }
}

// ─── 3. api/auth/* handlers must never expose tokens or session objects ───────
const API_AUTH = path.resolve(__dirname, '../../api/auth');
if (fs.existsSync(API_AUTH)) {
  const FORBIDDEN_KEYS = ['access_token', 'refresh_token', 'session'];
  for (const file of walk(API_AUTH)) {
    const source = stripComments(fs.readFileSync(file, 'utf-8'));
    const jsonMatches = source.match(/res(?:\.status\(\d+\))?\.json\s*\(\s*([\s\S]*?)\s*\);/g) || [];
    for (const jsonCall of jsonMatches) {
      for (const key of FORBIDDEN_KEYS) {
        const keyPattern = new RegExp(`(?:['"]?${key}['"]?\\s*:|\\b${key}\\b\\s*[,}])`);
        if (keyPattern.test(jsonCall)) {
          errors.push(
            `api/auth/${path.relative(API_AUTH, file)} exposes \`${key}\` in JSON response — auth tokens must be confined to HTTP-only cookies.`,
          );
        }
      }
    }
  }
}

if (errors.length) {
  console.error('\n❌ Supabase auth invariant violated:\n');
  for (const error of errors) console.error(`  • ${error}`);
  console.error('\nSee "Auth is cookie-based, not supabase-js session-based" in CLAUDE.md.\n');
  process.exit(1);
}

console.log('✅ Supabase auth invariant holds (proxy URL, no client-side session, no token leaks in api/auth/*)');
