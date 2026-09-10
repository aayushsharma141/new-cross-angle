# Performance Audit: Largest Contentful Paint (LCP)

| Audit Metadata | Detail |
|:---------------|:-------|
| **Metric Standard** | LCP ≤ 2.5s (Good threshold per Web Vitals standard) |
| **Status**     | **PASS (Certified)** |
| **Audit Date** | 2026-08-06 |
| **Scope**      | Hero sections, Primary imagery, Video posters, CDN pre-resolutions |

---

## 1. Executive Summary

Largest Contentful Paint across all five certified production routes (`/`, `/portfolio`, `/services`, `/about-us`, `/estimate`) is driven primarily by above-the-fold hero imagery and editorial typography. All primary display media prioritize rapid discovery, sync decoding, and CDN resolution.

---

## 2. Evidence & Optimization Architecture

### 2.1 Hero Image Preload & Priority Attributes
- **Home Hero (`Hero.tsx`):** Guaranteed fallback image uses `loading="eager"`, `fetchpriority="high"`, and `decoding="sync"`. Video slides supply an instant static poster image (`/hero_reality_render_1775299733746.png`) preventing layout/render stall during media download.
- **Portfolio Hero (`HubHero.tsx`):** Background parallax image uses `loading="eager"`, `fetchpriority="high"`, and `decoding="sync"`.
- **Hero Patterns (`HeroPattern.tsx`):** High-resolution architectural renders explicitly set `fetchpriority="high"` and `decoding="sync"`.

### 2.2 DNS & Preconnect Warmup (`index.html`)
- `<link rel="preconnect" href="https://fonts.googleapis.com" />`
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
- `<link rel="dns-prefetch" href="https://ik.imagekit.io" />`
- `<link rel="preconnect" href="https://iuuivmwqodefdrrrewol.supabase.co" />`

### 2.3 Responsive Image Pipeline (`OptimizedImage.tsx`)
- ImageKit integration (`getOptimizedUrl`) injects explicit `width`, `height`, and `quality=80` parameters dynamically to ensure client viewports never download oversized raw desktop assets on mobile devices.

---

## 3. Verification Protocol

- **Resource Timing:** LCP candidates begin transfer immediately following initial HTML parse without parser-blocking script interruption.
