/**
 * copy-indexes.js — SPA static route emission.
 *
 * Copies dist/index.html into a subdirectory for every known route so that
 * hard-refreshes and direct-URL visits work on static hosts (Surge, Vercel
 * static, Netlify, etc.) that don't support fallback rewrites.
 *
 * Admin routes are imported from admin-route-paths.js (a plain-JS mirror of
 * src/lib/admin-routes.ts). If you add a route to admin-routes.ts, add it
 * to admin-route-paths.js as well — this script emits one folder per entry.
 *
 * Non-admin public routes are listed inline below (they change rarely and
 * don't have a TypeScript counterpart to keep in sync with).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ADMIN_STATIC_PATHS } from './admin-route-paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── FU-1: Sidecar drift check ───────────────────────────────────────────────

const tsSourcePath = path.resolve(__dirname, '..', 'src', 'lib', 'admin-routes.ts');
if (fs.existsSync(tsSourcePath)) {
  const tsSource = fs.readFileSync(tsSourcePath, 'utf8');
  const tsPaths = [...tsSource.matchAll(/path:\s*"(\/admin[^"]*)"/g)].map(m => m[1]);
  const missing = tsPaths.filter(p => !ADMIN_STATIC_PATHS.includes(p));
  if (missing.length > 0) {
    console.error('❌ Sidecar drift detected! The following paths are in admin-routes.ts but missing from admin-route-paths.js:', missing);
    process.exit(1);
  }
}

// ─── Resolve dist directory ──────────────────────────────────────────────────

const appDistDir = path.resolve(__dirname, '..', 'dist');
const rootDistDir = path.resolve(__dirname, '..', '..', '..', 'dist');
let distDir = appDistDir;

const appIndexPath = path.join(appDistDir, 'index.html');
const rootIndexPath = path.join(rootDistDir, 'index.html');

if (!fs.existsSync(appIndexPath) && fs.existsSync(rootIndexPath)) {
  distDir = rootDistDir;
  console.log('Using root dist directory:', distDir);
} else if (!fs.existsSync(appIndexPath) && !fs.existsSync(rootIndexPath)) {
  console.error('dist/index.html not found in', appDistDir, 'or', rootDistDir);
  process.exit(1);
}

const indexPathToUse = path.join(distDir, 'index.html');

// ─── Dynamic project slugs ───────────────────────────────────────────────────

const projectsFile = path.resolve(__dirname, '..', 'src', 'data', 'projects.ts');
let projectSlugs = [];
try {
  const txt = fs.readFileSync(projectsFile, 'utf8');
  const m = txt.matchAll(/slug:\s*"([^"]+)"/g);
  projectSlugs = Array.from(m, (r) => r[1]);
} catch {
  projectSlugs = [];
}

// ─── Route list ──────────────────────────────────────────────────────────────

/** Public (non-admin) routes. Update here when adding new public pages. */
const PUBLIC_ROUTES = [
  '/',
  '/about-us',
  '/services',
  '/gallery',
  '/blog',
  '/contact-us',
  '/quiz',
  '/discovery',
  '/estimate',
  '/style-quiz',
  '/aesthetic-discovery-engine',
  '/blueprint',
  '/privacy',
  ...projectSlugs.map((s) => `/portfolio/${s}`),
];

const routes = [...PUBLIC_ROUTES, ...ADMIN_STATIC_PATHS];

// ─── Emit ────────────────────────────────────────────────────────────────────

const indexHtml = fs.readFileSync(indexPathToUse, 'utf8');

// Write 200.html for Surge SPA support.
fs.writeFileSync(path.join(distDir, '200.html'), indexHtml, 'utf8');
console.log('Wrote 200.html for Surge SPA support');

let count = 0;
routes.forEach((r) => {
  const targetDir = path.join(distDir, r.replace(/^\//, ''));
  fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetPath, indexHtml, 'utf8');
  console.log('Wrote', targetPath);
  count++;
});

console.log(`\nCopied index.html to ${count} routes (${PUBLIC_ROUTES.length} public + ${ADMIN_STATIC_PATHS.length} admin).`);
