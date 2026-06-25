# Service Page Content Strategy & Restructure

## Purpose of This Document

This is not another audit. This is a **blueprint** for what the service pages *should be* — grounded in business goals, user psychology, and content hierarchy principles. It answers: what content goes where, why it matters, and what's missing.

---

## 1. The Core Problem

The current service pages have a **purpose vacuum**. Each page has content, but the content doesn't answer the questions a real prospect asks. Here's the gap:

| User Question | Where It's Answered Today |
| --- | --- |
| "What exactly do you do?" | Hero H1 + description (partial) |
| "How much does it cost?" | ❌ Nowhere on service pages |
| "Can I see examples?" | Static gallery (not linked to real projects) |
| "Is this for someone like me?" | ❌ No audience targeting |
| "How long does it take?" | Process timeline (generic) |
| "Do you serve my area?" | ❌ Not on service pages |
| "What's included?" | Features list (thin) |
| "Why should I trust you?" | ❌ No real testimonials, no case studies |
| "What if I want both X and Y?" | Related services (weak cross-sell) |

**The gap is not cosmetic. It's structural.** The pages look premium but don't close the sale.

---

## 2. What Service Pages Must Do (Business Requirements)

Every service page must drive one of three outcomes:

| Outcome | Target Page | Conversion Path |
| --- | --- | --- |
| **Book a consultation** | All pages | `CTA → /contact-us` |
| **Use the estimator** | Hub + Detail | `CTA → /estimate` |
| **View portfolio proof** | Category + Detail | `CTA → /portfolio` or inline gallery |

### Secondary Outcomes

- **SEO**: Rank for `<service> interior design <city>` (long-tail organic)
- **Cross-sell**: Show related services to increase project scope value
- **Trust**: Overcome "can I trust this studio with my ₹50L project?"

---

## 3. Content Hierarchy — The Right Structure

### 3-A. Service Hub (`/services`) — Navigation & Overview

**Purpose:** Give the user a map of everything you offer. Let them self-select their entry point.

**User expects:** "Here are your service categories. Which one matches my project?"

| Section | Content | Why It Exists |
| --- | --- | --- |
| **Hero (H1)** | "Interior Design Services in Jamshedpur & India" | SEO anchor + clear intent match |
| **Category Navigation** | 3 domain cards: Residential | Commercial | Specialized — each with icon, tagline, brief scope description | Helps users self-select instantly |
| **Category Sections** (Residential, Commercial, Specialized) | Section H2, short paragraph, 2–4 service cards showing: title, description, icon, hover-reveal features | Scannable overview per domain |
| **The Engines** (Discovery + Estimator) | CTA cards showing value prop + how they work | Conversion tools (keep but reduce visual weight) |
| **Differentiators** | 3 value pillars (Single Point, In-House Mfg, Transparent Pricing) | Trust signal for high-ticket decisions |
| **Stats Strip** | Projects delivered, years, on-time % | Social proof at a glance |
| **Final CTA** | "Get Started" with 2 paths: Consult / Estimate | Clear next action |

**What to remove:**

- `ServicesMarquee` (pure decoration, zero utility, adds noise)
- `Domain I/II/III` labels (jargon — users don't think in domains)
- Hero word-swap animation (hurts readability, no SEO value)

**H1 audit:** "One Team. One Contract. Complete Turnkey Interiors." → Change to "Interior Design Services in Jamshedpur | Residential & Commercial"

### 3-B. Service Category (`/services/:category`) — Domain Deep-Dive

**Purpose:** Qualify the user into a specific service domain and build category-level trust.

**User expects:** "Show me what you do for [residential/commercial] projects specifically. Why you? Show me examples."

| Section | Content | Why It Exists |
| --- | --- | --- |
| **Hero (H1)** | "Residential Interior Design Services" | Clear category intent |
| **Category Value Prop** | 2–3 sentence block: "We've delivered 200+ residential projects across Jamshedpur. Here's what sets us apart." | Category-level trust |
| **Services Grid** | Service cards with: title, description, features preview, CTA to detail | Entry points to individual services |
| **Category Portfolio** | 3–6 project thumbnails filtered to this category (linked to `/portfolio/:slug`) | **MISSING** — visual proof |
| **Category Testimonials** | 2–3 client quotes specific to this category | **MISSING** — social proof |
| **Category Process** | Timeline showing how the category's work flows | **MISSING** — "how does it work for my type" |
| **CTA** | Custom CTA referencing the category | Conversion |

**Theme fix:** Must use dark brand theme (`#000000`, gold, crimson) — current shadcn default is a trust-breaking visual shift.

### 3-C. Service Detail (`/services/:category/:service`) — The Conversion Page

**Purpose:** This is the **money page**. The user is asking: "Should I buy this service? What do I get? Why you? How much? Who else has done this?"

| Section | Content | Why It Exists |
| --- | --- | --- |
| **Hero (H1)** | "Living Room Design in Jamshedpur" | SEO + intent match |
| **Service Overview (H2)** | 3–4 sentence value proposition | Present at the top (currently has no H2 wrapper) |
| **What's Included (H2)** | Feature list with icons + CTA to estimator | **CORE** — answers "what do I get" |
| **Portfolio/Gallery (H2)** | Real project images + "View Full Project" links | Proof of capability |
| **Pricing / Packages (H2)** | Service tier dropdown: C1–C5 with rates + what's included | **MISSING** — biggest conversion blocker |
| **Process / Timeline (H2)** | Service-specific steps with duration estimates | Manages expectations |
| **Testimonials (H2)** | Real client quotes (filtered by service type) | Social proof |
| **Related Services (H2)** | Cross-sell to complementary services | Increase LTV |
| **FAQs (H2)** | Schema-marked Q&A | SEO + conversion objection handling |
| **Sticky CTA** | "Get a Free Quote" / "Use Our Estimator" | Always-on conversion |

**Critical gap:** No pricing signal anywhere. A user on a service detail page cannot answer "how much does this cost?" without clicking away to the estimator.

---

## 4. UI/UX Design Patterns for Service Pages

### 4-A. Content Rhythm

```
VIEW: Hero          → Full viewport, image right, text left
SCROLL: Overview    → 1/2 viewport, clean paragraph
SCROLL: What's In   → Features with icons, 1/2 viewport
SCROLL: Gallery     → 3-column grid, 1 viewport
SCROLL: Pricing     → Tier cards with CTA, 1 viewport
SCROLL: Process     → Timeline, 1/2 viewport
SCROLL: Testimonials→ 2-column quote cards, 1/2 viewport
SCROLL: Related     → 3-card grid, 1/2 viewport
SCROLL: FAQ         → Accordion, 1 viewport
STICKY: CTA         → Always at bottom
```

Each section is exactly the right size for its purpose — no more, no less.

### 4-B. The Pricing Section Pattern

```
┌──────────────────────────────────────────┐
│   Pricing & Packages                     │
│                                          │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│   │ Design   │  │ Full-Svc│  │ White   │ │
│   │ Direction│  │ Steward │  │ Glove   │ │
│   │ ₹250/sqft│  │ ₹350/sq │  │ Custom  │ │
│   │───────── │  │─────────│  │─────────│ │
│   │ ✓ moodbrd│  │ ✓ all   │  │ ✓ turn- │ │
│   │ ✓ strtgy │  │ ✓ site  │  │ key     │ │
│   │───────── │  │─────────│  │─────────│ │
│   │ [Select] │  │ [Select]│  │ [Select]│ │
│   └─────────┘  └─────────┘  └─────────┘ │
│                                          │
│   Not sure? [Use Our Estimator Tool]     │
└──────────────────────────────────────────┘
```

Three tiers per service. Fills automatically from the estimator's `pricing-config.ts` service definitions (C1–C5 for design services, or service-specific tiers). Links directly to the estimator with pre-filled service selection.

### 4-C. Navigation Pattern

```
Services ─┬─ Residential ─┬─ Living Room Design
           │               ├─ Bedroom Design
           │               └─ Kitchen & Dining
           │
           ├─ Commercial  ─┬─ Office Interiors
           │                ├─ Retail & Showroom
           │                └─ Restaurant & Cafe
           │
           └─ Specialized ─┬─ Modular Kitchen
                            ├─ False Ceilings
                            ├─ Lighting Design
                            └─ Custom Furniture
```

Currently `hasMegaMenu: false` in navigation config. Wire this up as a true dropdown with icons and short descriptions. Dropdown should show on hover (desktop) and as accordion sub-menu (mobile). This gives users direct access to any service from anywhere.

---

## 5. Data Model — What's Missing

To support the content strategy above, the `ServiceDetail` type needs additional fields:

### Fields to Add to DB + Admin

| Field | Type | Purpose | Priority |
| --- | --- | --- | --- |
| `audience` | TEXT | e.g., "Perfect for luxury apartment owners in Jamshedpur" | P1 |
| `service_tiers` | JSONB | Array of `{name, rate, description, includes[]}` for this service | **P0** — enables on-page pricing |
| `testimonial_ids` | UUID[] | FK to testimonials table linked to this service | P1 |
| `project_ids` | UUID[] | FK to projects table (portfolio linkage) | **P0** — enables real gallery |
| `estimated_timeline` | TEXT | e.g., "4–6 weeks" | P1 |
| `min_budget` | INTEGER | e.g., 150000 (starting price in INR) | P1 |
| `meta_title` | TEXT | SEO override (exists in DB but not in admin UI) | P2 |
| `meta_description` | TEXT | SEO override (exists in DB but not in admin UI) | P2 |

### Existing Fields That Are Wasted

| Field | Issue | Fix |
| --- | --- | --- |
| `seo_title` (DB) | Not exposed in admin form, not used in frontend | Add to admin form, use as `<title>` override |
| `seo_description` (DB) | Same | Same |
| `description` (JSONB) | Stores mixed content (`icon`, `category_id`, `content`, `features`) in one blob | Maintains backward compat but should be normalized over time |
| `galleryImages` (static only) | Not in DB, exists only in `site-content.ts` | Add to DB as `project_ids[]` or as a gallery table |

### Relationship Fixes

| Current State | Problem | Fix |
| --- | --- | --- |
| No FK between services and projects | Portfolio-to-service linking is string-matching | Add `projects.service_id` FK column |
| No FK between services and testimonials | Testimonials on detail page are hardcoded generic text | Add `testimonials.service_id` FK column |
| C1–C5 tiers separate from CMS services | User sees "Living Room Design" on service page but never sees the C1–C5 pricing tiers | Link each CMS service to one or more estimator tier(s) via `service_tiers` JSONB |

---

## 6. The Real Worth of Each Service Page

### Service Hub (`/services`)

**Worth:** Navigation layer. Gets users to the right destination. Does NOT convert directly — it's the airport terminal, not the gate.

**Success metric:** Click-through rate to category/detail pages. If users bounce from `/services`, the cards or descriptions aren't clear enough.

**Real KPI:** `CTR to category/detail > 40%`

### Service Category (`/services/residential`)

**Worth:** Qualification + portfolio trust. User decides "yes, I want residential design" and needs proof this firm can deliver for their project type.

**Success metric:**

- Scroll depth > 60% (are users seeing the portfolio and testimonials?)
- CTR to service detail pages

**Real KPI:** `Category → Detail CTR > 60%`

### Service Detail (`/services/residential/living-room`)

**Worth:** Conversion. This is where the user decides to contact you. Everything else is preamble.

**Success metric:**

- CTA click rate (Get Quote / Use Estimator)
- Time on page (should be 2–4 min for a real consideration)
- Scroll depth > 80%

**Real KPI:** `CTA click rate > 5%` (baseline), `> 12%` (target)

---

## 7. Implementation Roadmap

### Phase 1 — Quick Wins (Fix what exists)

| Task | Files | Effort |
| --- | --- | --- |
| Fix H1 on hub to mention "Interior Design Services" | `apps/web/src/components/services/ServicesHero.tsx` | S |
| Port dark theme to Category + Detail pages | `ServiceCategoryPage.tsx`, `ServiceDetailPage.tsx` | M |
| Add visible H2 above service list on Category page | `ServiceCategoryPage.tsx` | S |
| Wrap intro paragraph in H2 on Detail page | `ServiceDetailPage.tsx` | S |
| Wire mega menu dropdown in Navbar | `Navbar.tsx` + `navigation.ts` | M |
| Reduce Domain H2 scale from 5rem to 3rem | `ServicesPage.tsx` | S |

### Phase 2 — Portfolio & Testimonial Integration

| Task | Files | Effort |
| --- | --- | --- |
| Add `projects.service_id` FK column + migration | Supabase migration | M |
| Add `testimonials.service_id` FK column + migration | Supabase migration | M |
| Update admin portfolio form to include service selector | `PortfolioFormDialog.tsx` | M |
| Wire real portfolio projects into ServiceDetail gallery | `ServiceDetailPage.tsx` | M |
| Wire real testimonials into ServiceDetail | `ServiceDetailPage.tsx` | M |

### Phase 3 — On-Page Pricing

| Task | Files | Effort |
| --- | --- | --- |
| Add `service_tiers` JSONB to DB + admin | Migration + `ServiceFormFields.tsx` | L |
| Build tier card component | New component | M |
| Integrate tier cards into ServiceDetail page | `ServiceDetailPage.tsx` | M |
| Link tier selection → pre-fill estimator | `pricing-config.ts` handoff | L |

### Phase 4 — Polish

| Task | Files | Effort |
| --- | --- | --- |
| Add `seo_title` / `seo_description` to admin form | `AdminServices.tsx` | S |
| Wire SEO fields into Helmet on detail page | `ServiceDetailPage.tsx` | S |
| Remove ServicesMarquee (or reduce) | `ServicesPage.tsx` | S |
| Add `prefers-reduced-motion` guards | All motion components | M |

---

## 8. Page-by-Page Content Specification

### `/services` — Content Spec

```
H1:          "Interior Design Services in Jamshedpur | Cross Angle Interior"
Description: "Premium turnkey interior design services for residential, commercial, 
              and specialized spaces across Jamshedpur, India."

Sections:
  1. Hero — H1 + 2 CTAs (Consult / Estimate)
  2. Category Cards — 3 cards linking to /services/{category}
  3. Residential Section — H2 + service cards + link
  4. Commercial Section — H2 + service cards + link
  5. Specialized Section — H2 + service cards + link
  6. Estimator CTA — "Not sure what you need? Use our calculator"
  7. Why Us — 3 pillars
  8. Stats — 150+ Projects, 12+ Years, 98% On-Time
  9. Final CTA — "Start Your Project"
```

### `/services/residential` — Content Spec

```
H1:          "Residential Interior Design Services in Jamshedpur"
Description: "Custom residential interiors built for your lifestyle, comfort, and 
              lasting value. We've designed 200+ homes in Jamshedpur."

Sections:
  1. Hero — Category image + H1 + description
  2. Value Prop — "Why our residential design stands out" (2-3 sentences)
  3. Services — Grid of service cards (Living Room, Bedroom, Kitchen)
  4. Portfolio — 3-6 project thumbnails filtered to residential
  5. Testimonials — 2-3 client quotes from residential projects
  6. Process — How residential projects work (timeline steps)
  7. CTA — "Get a Free Quote for Your Home"
```

### `/services/residential/living-room` — Content Spec

```
H1:          "Living Room Design in Jamshedpur | Cross Angle Interior"
Description: "Complete living room design services — from layout and lighting to 
              custom furniture and premium finishes."

Sections:
  1. Hero — H1 + description + 2 CTAs + hero image
  2. Overview — 3-4 sentence value proposition (H2: "Living Room Design Services")
  3. What's Included — Features with icons (H2: "What's Included")
  4. Gallery — Real project images linked to portfolio (H2: "Our Work")
  5. Pricing — Tier cards (H2: "Pricing & Packages")
  6. Process — Steps with duration (H2: "How We Work")
  7. Testimonials — Real quotes (H2: "What Our Clients Say")
  8. Related — Complementary services (H2: "Complete Your Home")
  9. FAQ — Schema-marked (H2: "FAQs")
  10. Sticky CTA — Always visible at bottom
```

---

## 9. Key Design Principles

1. **No decoration without purpose.** Every element on the page serves one of: educate, persuade, convert, or navigate. `ServicesMarquee` fails this test.

2. **The bus stop cannot have more signage than the destination.** The hub (bus stop) currently has richer UI than the detail pages (destinations). Flip this — the detail pages should be the richest.

3. **Pricing on every detail page.** The single biggest conversion blocker is "I don't know what this costs." Even a starting price removes the friction. Cross Angle offers premium design — hiding prices signals opacity, not exclusivity.

4. **Real content, not placeholders.** Hardcoded generic testimonials weaken trust. A page with 2 real client quotes outranks a page with 8 fake ones. Same for portfolio images — link to real projects or don't show a gallery.

5. **The mega menu is a solved problem.** Users expect to navigate directly to "Living Room Design" from the dropdown. The data exists in `navigation.ts` — it just needs `hasMegaMenu: true` and proper UI in `Navbar.tsx`.

6. **Category pages are the weakest link.** They bridge the gap between "browse all" (hub) and "buy this" (detail). Currently they have the least content. They should have portfolio previews, category-specific testimonials, and a category-specific process.

---

## 10. Success Measurement

After implementation, each service page type should meet these criteria:

| Page Type | Load Time | `scrollDepth > 75%` | CTA Click Rate | Bounce Rate |
| --- | --- | --- | --- | --- |
| Hub | < 2s LCP | N/A (navigation page) | > 3% | < 50% |
| Category | < 2s LCP | > 50% | > 5% | < 40% |
| Detail | < 2.5s LCP | > 60% | > 10% | < 30% |

**Content completeness check (Detail page):**

- [ ] H1 contains service name + geo modifier
- [ ] H2 wraps the intro paragraph
- [ ] Features list is present (not empty)
- [ ] Real portfolio images are displayed (not static fallback)
- [ ] Pricing section is present (tiers or starting price)
- [ ] Process timeline is present
- [ ] Testimonials are present (from DB, not hardcoded)
- [ ] Related services are present (at least 2)
- [ ] FAQ section is present
- [ ] Sticky CTA is present
- [ ] JSON-LD schema is injected (Service + FAQPage)
- [ ] Dark brand theme is consistent

---

*This document serves as the strategic foundation. Implementation starts with Phase 1 (quick wins) to fix the most visible gaps, then builds toward the full content vision.*
