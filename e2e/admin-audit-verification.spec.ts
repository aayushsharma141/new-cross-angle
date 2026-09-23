/**
 * Admin panel audit — live verification pass.
 *
 * Companion to the static audit. Every check here corresponds to a finding I
 * could only reach statically. Nothing in this file needs credentials: it runs
 * on the storageState that `e2e/setup/admin-auth.ts` global setup produces.
 *
 * Run:
 *   PLAYWRIGHT_ADMIN_PASSWORD='…' npx playwright test e2e/admin-audit-verification.spec.ts --project=chromium
 *
 * Output:
 *   e2e/audit-evidence/audit-evidence.json   ← machine-readable results
 *   e2e/audit-evidence/shots/*.png           ← one screenshot per admin route
 *
 * This file is disposable — delete it once the findings are triaged.
 */

import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename_ = fileURLToPath(import.meta.url);
const __dirname_ = path.dirname(__filename_);
// NOT e2e/reports — the HTML reporter owns that folder and clears it on finish,
// which wiped the evidence file on the first run.
const OUT_DIR = path.resolve(__dirname_, 'audit-evidence');
const SHOT_DIR = path.join(OUT_DIR, 'shots');

type RouteResult = {
  route: string;
  finalUrl: string;
  consoleErrors: string[];
  failedRequests: { url: string; status: number; body?: string }[];
  errorBoundary: boolean;
  bodyChars: number;
};

const evidence: {
  routes: RouteResult[];
  findings: Record<string, unknown>;
} = { routes: [], findings: {} };

// Every routed admin path, from src/routes/adminRoutes.tsx.
const ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/cms/portfolio',
  '/admin/cms/services',
  '/admin/cms/testimonials',
  '/admin/cms/team-members',
  '/admin/cms/blog-posts',
  '/admin/cms/media-library',
  '/admin/cms/hero-carousel',
  '/admin/cms/gallery',
  '/admin/cms/before-and-after',
  '/admin/cms/milestones',
  '/admin/cms/process-steps',
  '/admin/cms/site-assets',
  '/admin/crm/leads',
  '/admin/crm/analytics',
  '/admin/crm/settings',
  '/admin/discovery/quiz-analytics',
  '/admin/discovery/quiz-configuration',
  '/admin/estimator/estimate-leads',
  '/admin/estimator/config',
  '/admin/blog/overview',
  '/admin/blog/article-performance',
  '/admin/blog/reader-engagement',
  '/admin/user-access/users',
  '/admin/user-access/roles',
  '/admin/user-access/security',
  '/admin/system/settings?tab=general',
  '/admin/system/email-templates',
  '/admin/system/audit-logs',
  '/admin/learning-health',
  '/admin/architecture',
];

/** Attach console + network recorders to a page. Returns the collected buckets. */
function recorders(page: Page) {
  const consoleErrors: string[] = [];
  const failedRequests: { url: string; status: number; body?: string }[] = [];

  page.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => consoleErrors.push('[pageerror] ' + e.message.slice(0, 300)));
  page.on('response', async (r) => {
    if (r.status() < 400) return;
    let body: string | undefined;
    try {
      body = (await r.text()).slice(0, 200);
    } catch {
      body = undefined;
    }
    failedRequests.push({ url: r.url().replace(/apikey=[^&]+/, 'apikey=…'), status: r.status(), body });
  });

  return { consoleErrors, failedRequests };
}

/** Guard: if the session file is empty the whole suite is meaningless. */
test.beforeAll(() => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const statePath = path.resolve(__dirname_, 'setup', '.auth', 'admin.json');
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const empty = (state.cookies?.length ?? 0) === 0 && (state.origins?.length ?? 0) === 0;
    if (empty) {
      throw new Error(
        'e2e/setup/.auth/admin.json is empty — global setup did not log in. ' +
          'Set PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD in the shell and re-run.',
      );
    }
  }
});

test.afterAll(() => {
  fs.writeFileSync(path.join(OUT_DIR, 'audit-evidence.json'), JSON.stringify(evidence, null, 2));
  const broken = evidence.routes.filter((r) => r.consoleErrors.length || r.failedRequests.length);
  process.stdout.write(
    `\n──── AUDIT EVIDENCE ────\n` +
      `routes visited: ${evidence.routes.length}\n` +
      `routes with console errors or failed requests: ${broken.length}\n` +
      `written: e2e/audit-evidence/audit-evidence.json\n`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Route sweep — the part that finds what I could not predict.
// ─────────────────────────────────────────────────────────────────────────────
test('sweep every admin route for console errors, failed requests and error boundaries', async ({ page }) => {
  test.setTimeout(6 * 60 * 1000);

  for (const route of ROUTES) {
    const { consoleErrors, failedRequests } = recorders(page);

    await page.goto(route, { waitUntil: 'networkidle' }).catch(() => undefined);
    // Let React Query settle so late 4xx responses are captured.
    await page.waitForTimeout(1200);

    const errorBoundary = await page
      .getByText(/something went wrong|unexpected error|rendered (more|fewer) hooks/i)
      .first()
      .isVisible()
      .catch(() => false);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const slug = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root';
    await page.screenshot({ path: path.join(SHOT_DIR, `${slug}.png`), fullPage: true }).catch(() => undefined);

    evidence.routes.push({
      route,
      finalUrl: new URL(page.url()).pathname + new URL(page.url()).search,
      consoleErrors: [...new Set(consoleErrors)],
      failedRequests: failedRequests.filter(
        (f, i, a) => a.findIndex((x) => x.url === f.url && x.status === f.status) === i,
      ),
      errorBoundary,
      bodyChars: bodyText.length,
    });

    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.removeAllListeners('response');
  }

  const redirected = evidence.routes.filter((r) => !r.finalUrl.startsWith(r.route.split('?')[0]));
  process.stdout.write(
    '\nroutes that redirected away (possible role bounce):\n' +
      (redirected.map((r) => `  ${r.route} → ${r.finalUrl}`).join('\n') || '  none') +
      '\n',
  );

  // Mirror every problem route to stdout — a file can be clobbered, the log cannot.
  process.stdout.write('\n═══ PER-ROUTE PROBLEMS ═══\n');
  for (const r of evidence.routes) {
    if (!r.consoleErrors.length && !r.failedRequests.length && !r.errorBoundary) continue;
    process.stdout.write(`\n> ${r.route}${r.errorBoundary ? '   [ERROR BOUNDARY RENDERED]' : ''}\n`);
    for (const f of r.failedRequests.slice(0, 6)) {
      const short = f.url.replace(/^https?:\/\/[^/]+/, '').slice(0, 110);
      process.stdout.write(`    HTTP ${f.status}  ${short}\n`);
      if (f.body) process.stdout.write(`             ${f.body.replace(/\s+/g, ' ').slice(0, 110)}\n`);
    }
    for (const c of r.consoleErrors.slice(0, 4)) {
      process.stdout.write(`    console: ${c.replace(/\s+/g, ' ').slice(0, 150)}\n`);
    }
  }
  process.stdout.write('\n═══ END PER-ROUTE ═══\n');

  expect(evidence.routes.length).toBe(ROUTES.length);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. P1·3 / P1·4 / P1·5 — the three tables that do not exist.
// ─────────────────────────────────────────────────────────────────────────────
test('P1.3-5 dead tables return 404 to the live UI', async ({ page }) => {
  const hits: Record<string, { status: number; code?: string }[]> = {};

  page.on('response', async (r) => {
    const m = r.url().match(/\/rest\/v1\/(estimate_rates|admin_users|article_analytics)\b/);
    if (!m) return;
    let code: string | undefined;
    try {
      code = JSON.parse(await r.text())?.code;
    } catch { /* not JSON */ }
    (hits[m[1]] ??= []).push({ status: r.status(), code });
  });

  for (const route of ['/admin/estimator/config', '/admin/user-access/roles', '/admin/blog/article-performance']) {
    await page.goto(route, { waitUntil: 'networkidle' }).catch(() => undefined);
    await page.waitForTimeout(1500);
  }

  // P1.4: the roles page renders a confident "0 users" per role card.
  await page.goto('/admin/user-access/roles', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const rolesText = await page.locator('body').innerText();
  const zeroUserCards = (rolesText.match(/0 users/g) ?? []).length;
  const showsEditorRole = /\beditor\b/i.test(rolesText);

  evidence.findings['P1.3-5_deadTables'] = hits;
  evidence.findings['P1.4_rolesPage'] = { zeroUserCards, showsEditorRole };
  process.stdout.write(
    `\nP1.3-5 dead-table responses: ${JSON.stringify(hits)}\n` +
      `P1.4 roles page: "0 users" cards = ${zeroUserCards}, mentions editor role = ${showsEditorRole}\n`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. P1·6 — Tailwind admin utility classes that generate no CSS.
// ─────────────────────────────────────────────────────────────────────────────
test('P1.6 admin shorthand colour classes are no-ops', async ({ page }) => {
  await page.goto('/admin', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const host = document.querySelector('.admin-theme') ?? document.body;
    const probe = (cls: string) => {
      const el = document.createElement('span');
      el.className = cls;
      el.textContent = 'x';
      host.appendChild(el);
      const cs = getComputedStyle(el);
      const out = { color: cs.color, background: cs.backgroundColor };
      el.remove();
      return out;
    };
    const bare = probe('');
    return {
      bare,
      shorthand: {
        'text-admin-text': probe('text-admin-text'),
        'text-admin-text-subtle': probe('text-admin-text-subtle'),
        'bg-admin-surface': probe('bg-admin-surface'),
        'bg-admin-bg': probe('bg-admin-bg'),
      },
      arbitrary: {
        'text-[hsl(var(--admin-text))]': probe('text-[hsl(var(--admin-text))]'),
        'bg-[hsl(var(--admin-surface))]': probe('bg-[hsl(var(--admin-surface))]'),
      },
      // Do the tokens themselves resolve on the admin subtree?
      tokens: Object.fromEntries(
        [
          '--admin-text',
          '--admin-text-subtle',
          '--admin-surface',
          '--admin-background',
          '--admin-primary',
          '--admin-border-subtle',
          '--admin-wine',
        ].map((t) => [t, getComputedStyle(host as Element).getPropertyValue(t).trim() || '(unset)']),
      ),
    };
  });

  evidence.findings['P1.6_deadClasses'] = result;
  const noop = Object.entries(result.shorthand).filter(
    ([, v]) => v.color === result.bare.color && v.background === result.bare.background,
  );
  process.stdout.write(
    `\nP1.6 shorthand classes with no effect: ${noop.map(([k]) => k).join(', ') || 'none'}\n` +
      `     arbitrary form: ${JSON.stringify(result.arbitrary)}\n` +
      `     token values:   ${JSON.stringify(result.tokens)}\n`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. P1·7 — 20 admin tokens exist only under .dark.
// ─────────────────────────────────────────────────────────────────────────────
test('P1.7 admin palette collapses when the shared theme key is light', async ({ page }) => {
  const read = async () =>
    page.evaluate(() => {
      const host = document.querySelector('.admin-theme') ?? document.body;
      const cs = getComputedStyle(host as Element);
      return {
        rootClass: document.documentElement.className,
        background: cs.backgroundColor,
        tokens: Object.fromEntries(
          ['--admin-background', '--admin-primary', '--admin-foreground', '--admin-text', '--admin-surface'].map(
            (t) => [t, cs.getPropertyValue(t).trim() || '(unset)'],
          ),
        ),
      };
    });

  await page.goto('/admin', { waitUntil: 'networkidle' });
  const dark = await read();
  await page.screenshot({ path: path.join(SHOT_DIR, 'theme_dark.png'), fullPage: false });

  await page.evaluate(() => localStorage.setItem('vite-ui-theme', 'light'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const light = await read();
  await page.screenshot({ path: path.join(SHOT_DIR, 'theme_light.png'), fullPage: false });

  // Restore so later runs are unaffected.
  await page.evaluate(() => localStorage.setItem('vite-ui-theme', 'dark'));

  const lost = Object.entries(light.tokens)
    .filter(([k, v]) => v === '(unset)' && dark.tokens[k] !== '(unset)')
    .map(([k]) => k);

  evidence.findings['P1.7_themeCollapse'] = { dark, light, lostUnderLight: lost };
  process.stdout.write(
    `\nP1.7 dark : ${JSON.stringify(dark)}\n` +
      `     light: ${JSON.stringify(light)}\n` +
      `     tokens lost under light: ${lost.join(', ') || 'none'}\n` +
      `     screenshots: theme_dark.png / theme_light.png\n`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. P1·8 — the fabricated activity feed on the hub.
// ─────────────────────────────────────────────────────────────────────────────
test('P1.8 hub renders hardcoded activity events', async ({ page }) => {
  await page.goto('/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const text = await page.locator('body').innerText();

  const planted = [
    'completed the style questionnaire',
    'Daily backup written to secure vault',
    'Invoice Dispatched',
    '18 admin tokens verified',
    'Luxury master suite quote auto-generated',
  ].filter((s) => text.includes(s));

  evidence.findings['P1.8_fakeFeed'] = { plantedStringsVisible: planted };
  process.stdout.write(`\nP1.8 hardcoded feed strings visible on /admin: ${planted.length}/5\n`);
  planted.forEach((p) => process.stdout.write(`     · "${p}"\n`));
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. P1·9 — Media Library KPI vs. workspace contents.
// ─────────────────────────────────────────────────────────────────────────────
test('P1.9 media library KPI disagrees with the workspace below it', async ({ page }) => {
  await page.goto('/admin/cms/media-library', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const text = await page.locator('body').innerText();
  const totalFiles = text.match(/Total Files\s*\n?\s*([\d,]+)/i)?.[1] ?? '(not found)';
  const storage = text.match(/Storage Used\s*\n?\s*([\d.]+\s*MB)/i)?.[1] ?? '(not found)';

  evidence.findings['P1.9_mediaSplit'] = { kpiTotalFiles: totalFiles, kpiStorage: storage };
  await page.screenshot({ path: path.join(SHOT_DIR, 'media_library.png'), fullPage: true });
  process.stdout.write(
    `\nP1.9 KPI "Total Files" = ${totalFiles} (media_files) · live assets table = 22\n` +
      `     screenshot: media_library.png\n`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. P2·11 — AssetInspector select → deselect. Does it survive, and does the
//    React Query subscription actually get torn down?
// ─────────────────────────────────────────────────────────────────────────────
test('P2.11 DAM inspector survives select and deselect', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 300)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 300));
  });

  await page.goto('/admin/cms/media-library', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Click the first selectable asset in the sidebar list.
  const firstAsset = page
    .locator('[data-testid="asset-row"], button, [role="button"]')
    .filter({ hasText: /\.(jpg|jpeg|png|webp|avif|mp4|svg)/i })
    .first();

  const clicked = await firstAsset.click({ timeout: 8000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(1500);
  const urlAfterSelect = page.url();
  const inspectorShown = await page
    .getByText(/usages|versions|metadata/i)
    .first()
    .isVisible()
    .catch(() => false);
  await page.screenshot({ path: path.join(SHOT_DIR, 'dam_selected.png'), fullPage: false });

  // Deselect: this is the 1 → 0 hook transition on a reused fiber.
  await page.goto(new URL(urlAfterSelect).pathname, { waitUntil: 'networkidle' }).catch(() => undefined);
  await page.waitForTimeout(1200);
  const crashedAfterDeselect = await page
    .getByText(/something went wrong|rendered (more|fewer) hooks/i)
    .first()
    .isVisible()
    .catch(() => false);
  await page.screenshot({ path: path.join(SHOT_DIR, 'dam_deselected.png'), fullPage: false });

  evidence.findings['P2.11_damInspector'] = {
    clickedAnAsset: clicked,
    urlAfterSelect: clicked ? new URL(urlAfterSelect).search : null,
    inspectorRendered: inspectorShown,
    crashedAfterDeselect,
    errors: [...new Set(errors)],
  };
  process.stdout.write(
    `\nP2.11 clicked asset = ${clicked}, inspector rendered = ${inspectorShown}, ` +
      `crash after deselect = ${crashedAfterDeselect}\n` +
      `      errors: ${[...new Set(errors)].join(' | ') || 'none'}\n`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. P2·12 / P2·16 — empty activity feed, and the tab that never highlights.
// ─────────────────────────────────────────────────────────────────────────────
test('P2.12 + P2.16 dashboard activity feed and estimator tab state', async ({ page }) => {
  await page.goto('/admin/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const dashText = await page.locator('body').innerText();

  // Estimator: the sidebar tab points at a path that redirects, so nothing
  // should carry aria-current after the redirect settles.
  await page.goto('/admin/estimator/pricing-configuration', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const settledUrl = new URL(page.url()).pathname;
  const activeTabs = await page.locator('aside a[aria-current="page"]').allInnerTexts().catch(() => []);

  evidence.findings['P2.16_estimatorTab'] = { requested: '/admin/estimator/pricing-configuration', settledUrl, activeTabs };
  evidence.findings['P2.12_activityFeed'] = {
    mentionsNoActivity: /no (recent )?activity|nothing (here|yet)/i.test(dashText),
  };
  process.stdout.write(
    `\nP2.16 /admin/estimator/pricing-configuration → ${settledUrl}; ` +
      `sidebar tabs marked active: ${JSON.stringify(activeTabs)}\n`,
  );
});
