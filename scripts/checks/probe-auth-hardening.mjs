// F-07/F-08 probe: are auth rate limiting and the same-origin CSRF check live?
// Usage (repo root): node scripts/checks/probe-auth-hardening.mjs
// Target: PLAYWRIGHT_BASE_URL env var, else http://localhost:8080 — the dev server or a deployment.
//
// F-07 PASS  = repeated bad logins with one fixed (fake) email return 401 a few times, then 429.
// F-08 PASS  = a POST with a forged cross-origin Origin header is rejected (403), not processed (204/401).
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/web/.env') });
dotenv.config({ path: path.resolve('apps/web/.env.local') });

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';
const EMAIL = `qa-ratelimit-probe-${Date.now()}@example.invalid`;

console.log('target:', BASE);

// --- F-07 ---
console.log('\n=== F-07: rate limiting on /api/auth/login ===');
const codes = [];
for (let i = 0; i < 8; i++) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email: EMAIL, password: 'not-a-real-password' }),
  });
  codes.push(r.status);
}
console.log('8 rapid bad logins, same email:', codes.join(','));
const saw429 = codes.includes(429);
console.log(saw429 ? 'PASS — rate limit engaged (429 observed)' : 'FAIL — never rate limited (no 429 in 8 attempts)');

// --- F-08 ---
console.log('\n=== F-08: same-origin check on /api/auth/logout ===');
const forged = await fetch(`${BASE}/api/auth/logout`, {
  method: 'POST',
  headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
});
console.log('cross-origin POST /api/auth/logout ->', forged.status);
const f08Pass = forged.status === 403;
console.log(f08Pass ? 'PASS — cross-origin request rejected (403)' : `FAIL — cross-origin request was processed (${forged.status}, expected 403)`);

console.log('\n---');
console.log('F-07:', saw429 ? 'PASS' : 'FAIL');
console.log('F-08:', f08Pass ? 'PASS' : 'FAIL');
process.exit(saw429 && f08Pass ? 0 : 1);
