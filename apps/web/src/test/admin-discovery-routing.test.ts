import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Regression guard: DiscoveryModule was rewritten to redirect every /admin/discovery/*
 * path to the CRM lead list, on the premise that quiz analytics were "just quiz leads".
 * AdminQuizAnalytics (funnel, style breakdown) and AdminDiscoveryConfig have no CRM
 * equivalent, so both pages became unreachable while their routes stayed registered.
 */

const SRC = path.resolve(__dirname, '../');
const read = (p: string) => fs.readFileSync(path.join(SRC, p), 'utf-8');

function registeredPages(adminRoutes: string, moduleSegment: string): string[] {
  const block = adminRoutes.match(
    new RegExp(`<Route\\s+path="${moduleSegment}"[\\s\\S]*?\\n(\\s*)</Route>`)
  );
  if (!block) return [];
  const pages: string[] = [];
  for (const chunk of block[0].split('<Route ').slice(1)) {
    const tag = chunk.slice(0, chunk.indexOf('/>') + 2);
    const pathMatch = tag.match(/^path="([^"]+)"/);
    if (!pathMatch || tag.includes('<Navigate')) continue;
    pages.push(`/admin/${moduleSegment}/${pathMatch[1]}`);
  }
  return pages;
}

describe('Admin Discovery (Style Quiz) routing', () => {
  const adminRoutes = read('routes/adminRoutes.tsx');
  const discoveryModule = read('pages/admin/modules/DiscoveryModule.tsx');
  const pages = registeredPages(adminRoutes, 'discovery');

  it('registers the quiz analytics and configuration pages', () => {
    expect(pages).toEqual(
      expect.arrayContaining(['/admin/discovery/quiz-analytics', '/admin/discovery/quiz-configuration'])
    );
  });

  it('DiscoveryModule renders its child pages instead of redirecting them away', () => {
    expect(discoveryModule, 'DiscoveryModule must render <Outlet /> or its pages never mount').toMatch(/<Outlet/);
    const targets = [...discoveryModule.matchAll(/<Navigate\s+to="([^"]+)"/g)].map((m) => m[1]);
    const external = targets.filter((t) => !t.startsWith('/admin/discovery/'));
    expect(external, `DiscoveryModule redirects out of the module to: ${external.join(', ')}`).toEqual([]);
  });

  it('every Style Quiz nav entry points at a registered page', () => {
    const moduleNav = read('lib/admin/moduleNav.ts');
    const tabPaths = [...moduleNav.matchAll(/path:\s*"(\/admin\/discovery\/[^"]+)"/g)].map((m) => m[1]);
    expect(tabPaths.length).toBeGreaterThan(0);
    expect(tabPaths.filter((p) => !pages.includes(p))).toEqual([]);
  });
});
