# 03 SEO Engineering Audit: CrossAngle Interior

**Auditor:** Antigravity Elite Protocol  
**Tier Assignment:** Professional Production-Level

---

## 1. Semantic HTML Structure

### 1.1 Heading Hierarchy (Homepage)

| Level | Content | Assessment |
| :--- | :--- | :--- |
| `h1` | "Design Your Dream Home." | ✅ Single H1, keyword-rich |
| `h2` | "Private Interiors, Crafted With Precision" | ✅ Topical |
| `h2` | "Design Is Emotional. Investment Is Strategic." | ✅ Services |
| `h2` | "Our Process" | ✅ How-we-work |
| `h2` | "Curated Excellence." | ✅ Portfolio |
| `h2` | "Before & After" | ✅ Social proof |
| `h2` | "What Our Clients Say" | ✅ Testimonials |
| `h2` | "Trust & Credibility" | ✅ Trust signals |
| `h3` | "Residential Design", "Commercial Design", etc. | ✅ Proper nesting |
| `h4` | "Priya Sharma", "Rajesh Kumar", etc. | ✅ Testimonial names |

**Verdict:** Heading hierarchy is exemplary. Single H1 per page with logical H2→H3→H4 cascading.

### 1.2 Semantic Elements

- ✅ `<header>` / `<banner>` landmark for navigation
- ✅ `<main>` landmark wrapping content
- ✅ `<nav>` with `aria-label="Main navigation"`
- ✅ `<footer>` / `<contentinfo>` landmark
- ✅ `<a href="#main-content">` skip-to-content link
- ⚠️ `<section>` usage is inconsistent — many sections use `<div>` instead

## 2. Meta Tags & Open Graph

### 2.1 Per-Page Helmet Coverage

| Page | `<title>` | `<meta description>` | `<link canonical>` | OG Tags |
| :--- | :--- | :--- | :--- | :--- |
| Index | ✅ | ✅ (keyword-rich, 160 chars) | ✅ | ✅ |
| About | ✅ | ✅ | ✅ | ✅ |
| Services | ✅ | ✅ | ✅ | ✅ |
| Gallery | ✅ | ✅ | ✅ | ✅ |
| Blog | ✅ | ✅ | ✅ | ✅ |
| Blog Detail | ✅ (dynamic) | ✅ (dynamic) | ✅ | ✅ |
| Contact | ✅ | ✅ | ✅ | ✅ |
| ServiceCategory | ✅ (dynamic) | ✅ (from `category.description`) | — | — |
| ServiceDetail | ✅ (dynamic) | ✅ (from `service.description`) | — | — |
| ProjectHub | ✅ | ✅ | — | — |

**Findings:**

- `ServiceCategoryPage` and `ServiceDetailPage` have title and description but are missing canonical URLs and OG tags — important for social sharing of deep-linked service pages.
- `og:image` uses a relative path `/og-image.png` — must be an absolute URL for Facebook/LinkedIn crawlers.

### 2.2 Duplicate Meta Risk

Both `index.html` and `Index.tsx` define `<title>` and `<meta description>`. React Helmet Async will override, but the base HTML fallback title is shorter and less optimized — acceptable for SSR fallback but could confuse crawlers on slow JS execution.

## 3. Schema.org Structured Data

- ✅ A reusable `<SchemaMarkup>` component exists, supporting `LocalBusiness`, `Service`, `BreadcrumbList`, and `Article` types.
- ⚠️ **Not verified on all pages.** The component is imported but I could not confirm it renders on the homepage from the DOM snapshot. Schema must be present on the crawled HTML.
- ❌ **No `FAQPage` schema** — the Process and Trust sections contain FAQ-like content that could qualify.
- ❌ **No `Review` / `AggregateRating` schema** on the testimonials section.

## 4. Sitemap & Crawlability

### 4.1 sitemap.xml (Static, 16 URLs)

- ✅ All major routes covered including sub-services (`/services/residential/living-room`, etc.).
- ❌ **Static file** — blog posts, individual project pages, and gallery items are NOT in the sitemap.
- ❌ `<lastmod>` is hardcoded to `2026-02-06` across all URLs — does not reflect actual content changes.
- ⚠️ No `<image:image>` extensions for portfolio/gallery pages.

### 4.2 robots.txt

- ✅ Minimal and correct (`Allow: /`, Sitemap reference).
- ⚠️ Missing `Disallow: /admin/` to prevent admin panel indexing.
- ⚠️ Missing `Disallow: /estimate` if the estimate tool should not be indexed.

## 5. Internal Linking & Crawl Depth

- ✅ Strong homepage → services → sub-services → contact funnel.
- ⚠️ Footer social links (`Twitter`, `LinkedIn`, `YouTube`, `Pinterest`) point to broken anchors (`href="#"`) — these are dead links that waste crawl budget and frustrate users.
- ⚠️ WhatsApp link uses `https://wa.me/1234567890` — placeholder number, not the actual business number.

## 6. SPA/SSR Rendering Concern

- ❌ **Critical: No SSR/SSG.** The app is a pure client-side SPA rendered via Vite. Google can index JS-rendered content, but:
  - Initial crawl budget is wasted on JavaScript execution.
  - Social media crawlers (Facebook, LinkedIn, Twitter) **cannot** execute JavaScript — OG tags in Helmet will not be seen.
  - `og:image` with a relative path will fail entirely on social shares.

## 7. Recommendations

1. **Implement dynamic sitemap generation** — either via a build step or Supabase Edge Function that queries blog/project tables.
2. **Add `Disallow: /admin/`** to `robots.txt`.
3. **Fix dead footer links** — replace `#` placeholders with actual social profile URLs or remove them.
4. **Add `FAQPage` and `AggregateRating` schema** to capitalize on rich snippet opportunities.
5. **Fix `og:image`** — use absolute URL (`https://crossangleinterior.com/og-image.png`).
6. **Consider pre-rendering** — use `vite-plugin-ssr` or migrate to Next.js for SSR/SSG to improve social sharing and initial crawlability.

---
*Finding 03: SEO Engineering Report Finalized.*
