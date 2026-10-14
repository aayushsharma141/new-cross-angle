import type { FooterCta } from "./types";

export interface FooterCopy {
  headlineStart: string;
  headlineHighlight: string;
  sub: string;
}

/**
 * Picks the footer wording for a page: an exact path wins, then the longest
 * matching "/section/*" prefix, then the fallback.
 */
export function resolveFooterCopy(cta: FooterCta, pathname: string): FooterCopy {
  const exact = cta.items.find((i) => i.path === pathname);
  const prefix = cta.items
    .filter((i) => i.path.endsWith("*") && pathname.startsWith(i.path.slice(0, -1)))
    .sort((a, b) => b.path.length - a.path.length)[0];
  const hit = exact ?? prefix;
  return hit
    ? { headlineStart: hit.headlineStart, headlineHighlight: hit.headlineHighlight, sub: hit.sub }
    : { headlineStart: cta.fallbackStart, headlineHighlight: cta.fallbackHighlight, sub: cta.fallbackSub };
}
