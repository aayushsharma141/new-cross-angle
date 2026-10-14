import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Regression guard for a bug that made the media library unreachable.
 *
 * CmsModule used to redirect /admin/cms/media-library -> /admin/cms/visual-media,
 * guarded by `!location.search`. Nothing in the app ever links to that path with a
 * query string — not the "Images & Videos" tab in CmsModule's own tab list, not the
 * Visual Media Hub's card, not useHubStats, not DiscoveryMediaSlot, not the legacy
 * forwards in adminRoutes — so the guard never passed and AdminMedia never rendered.
 * The route existed, the nav linked to it, and clicking it bounced you straight back.
 *
 * The invariant: CmsModule must not redirect away from a path that adminRoutes
 * registers as a real, rendering CMS page.
 */

const SRC = path.resolve(__dirname, '../');
const read = (p: string) => fs.readFileSync(path.join(SRC, p), 'utf-8');

/** Child paths of the `cms` route that render a component (not themselves redirects). */
function registeredCmsPages(adminRoutes: string): string[] {
  const cmsBlock = adminRoutes.match(
    /<Route\s+path="cms"[\s\S]*?\n(\s*)<\/Route>/
  );
  if (!cmsBlock) return [];

  // Split on the route tags rather than regexing the whole element, whose
  // nested braces (`allowedRoles={CMS_ROLES}`) defeat a naive `{...}` match.
  const pages: string[] = [];
  for (const chunk of cmsBlock[0].split('<Route ').slice(1)) {
    const tag = chunk.slice(0, chunk.indexOf('/>') + 2);
    const pathMatch = tag.match(/^path="([^"]+)"/);
    if (!pathMatch) continue; // the `path="cms"` parent itself
    if (tag.includes('<Navigate')) continue; // an intentional redirect, not a page
    pages.push(`/admin/cms/${pathMatch[1]}`);
  }
  return pages;
}

/** Paths CmsModule short-circuits with a <Navigate>. */
function redirectedPaths(cmsModule: string): string[] {
  const out: string[] = [];
  const re = /location\.pathname\s*===\s*"([^"]+)"[\s\S]{0,200}?<Navigate/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cmsModule))) out.push(m[1]);
  return out;
}

describe('Admin CMS routing', () => {
  const adminRoutes = read('routes/adminRoutes.tsx');
  const cmsModule = read('pages/admin/modules/CmsModule.tsx');

  it('registers media-library as a real page', () => {
    expect(registeredCmsPages(adminRoutes)).toContain('/admin/cms/media-library');
  });

  it('CmsModule does not redirect away from any registered CMS page', () => {
    const pages = registeredCmsPages(adminRoutes);
    const hijacked = redirectedPaths(cmsModule).filter((p) => pages.includes(p));

    expect(
      hijacked,
      `CmsModule redirects away from ${hijacked.join(', ')}, which adminRoutes ` +
        `registers as a rendering page. Those pages become unreachable from the UI.`
    ).toEqual([]);
  });

  it('every CMS nav entry points at a path that actually renders', () => {
    const pages = registeredCmsPages(adminRoutes);
    const redirected = redirectedPaths(cmsModule);

    // Tab definitions live in the shared admin nav, not in CmsModule.
    const moduleNav = read('lib/admin/moduleNav.ts');
    const tabPaths = [...moduleNav.matchAll(/path:\s*"(\/admin\/cms\/[^"]+)"/g)].map(
      (m) => m[1]
    );
    expect(tabPaths.length).toBeGreaterThan(0);

    const dead = tabPaths.filter((p) => !pages.includes(p) || redirected.includes(p));
    expect(
      dead,
      `These CMS tabs lead nowhere: ${dead.join(', ')}`
    ).toEqual([]);
  });
});
