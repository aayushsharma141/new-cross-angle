# Public Pages Architecture & Content Hierarchy Analysis

> **Generated:** July 27, 2026  
> **Total Pages Analyzed:** 20  
> **Framework:** React 18 + Vite + Tailwind CSS + Supabase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Shared Components Matrix](#shared-components-matrix)
3. [Page-by-Page Analysis](#page-by-page-analysis)
4. [Animation & Interaction Patterns](#animation--interaction-patterns)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Performance Optimizations](#performance-optimizations)
7. [SEO Implementation](#seo-implementation)

---

## Executive Summary

This document analyzes the frontend content hierarchy for all 20 public-facing pages in the Cross Angle Interior web application. Each page is documented with:

- File path and component name
- All imported components with their paths
- Content hierarchy (sections from top to bottom)
- Special features and animations
- Dependencies and integrations

### Page Categories

| Category | Pages | Description |
|----------|-------|-------------|
| **Marketing** | Home, About, Services, Portfolio, Contact | Brand-focused pages with rich animations |
| **Content** | Blog, Blog Detail, Gallery | Dynamic content from Supabase CMS |
| **Tools** | Price Estimator, Style Quiz, Blueprint | Interactive applications |
| **Legal** | Privacy, Terms | Compliance documentation |
| **Location** | Locations, Location Detail | Geo-targeted SEO pages |

---

## Shared Components Matrix

### Core Layout Components

| Component | Path | Used By (18+ pages) |
|-----------|------|---------------------|
| **Navbar** | `@/components/layout/Navbar` | All except NotFound, PriceEstimator |
| **Footer** | `@/components/layout/Footer` | All except NotFound, LegalPages, PriceEstimator |
| **LegalFooter** | `@/components/layout/LegalFooter` | PrivacyPage, TermsPage |
| **ScrollToTop** | `@/components/layout/ScrollToTop` | All except NotFound, DiscoveryPage, SharedResultPage, BlueprintPage |

### UI Primitives

| Component | Path | Used By |
|-----------|------|---------|
| **SchemaMarkup** | `@/components/shared/SchemaMarkup` | Index, AboutPage, ContactPage, ServiceDetailPage, LocationPage, LocationsPage, PriceEstimator |
| **Image** | `@/components/ui/enhanced/image` | ServiceCategoryPage, ServiceDetailPage, GalleryPage, BlogDetailPage, LocationPage |
| **Button** | `@/components/ui/primitives/button` | ServiceCategoryPage, ServiceDetailPage, BlogPage |
| **MediaSlot** | `@/components/ui/enhanced/MediaSlot` | NotFound, ContactPage, LocationPage |
| **Skeleton** | `@/components/ui/primitives/skeleton` | BlogPage, BlogDetailPage |
| **FixedSocialBar** | `@/components/layout/FixedSocialBar` | PortfolioPage |
| **ScrollProgress** | `@/components/layout/ScrollProgress` | PortfolioPage |

### Animation Libraries

| Library | Version | Usage |
|---------|---------|-------|
| **Framer Motion** | 12.36.0 | 15 pages - entrance, exit, whileInView, parallax |
| **GSAP** | 3.14.2 | 2 pages - BlogPage, BlogDetailPage (ScrollTrigger) |
| **React Bits** | Custom | PriceEstimator, BlueprintPage (FallingText, SplitText, Magnet) |

---

## Page-by-Page Analysis

### 1. Index.tsx (Home)

**File Path:** `apps/web/src/pages/Index.tsx`  
**Main Component:** `Index`

#### Imported Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Navbar` | `@/components/layout/Navbar` | Top navigation |
| `Footer` | `@/components/layout/Footer` | Bottom navigation |
| `Hero` | `@/components/home/Hero` | Full-screen hero slideshow |
| `SchemaMarkup` | `@/components/shared/SchemaMarkup` | SEO structured data |
| `ScrollToTop` | `@/components/layout/ScrollToTop` | Scroll behavior |

#### Content Hierarchy

```
1. Reveal Curtain Overlay (full-screen wipe animation, 1500ms)
2. Navbar
3. Main Content (home-shell class, noise texture overlay)
   ├── Hero Section (0-20% scroll)
   │   └── <Hero /> component (full-viewport photography)
   ├── Philosophy Headline (20-35% scroll)
   │   └── Right-aligned editorial block with kicker "The Philosophy"
   ├── CTA Panel (35-55% scroll)
   │   └── Left-aligned panel with body text + "Take Style Quiz" link
   ├── Featured Project (55-80% scroll)
   │   └── Split layout: text left / image right
   └── Gallery Transition (80-100% scroll)
       └── Centered kicker + "Explore the Gallery" headline
4. Footer
5. Schema Markup (LocalBusiness, Organization, WebSite, Service, FAQPage)
6. ScrollToTop
```

#### Special Features

- **Attention Telemetry:** `useAttentionTelemetry` hooks instrumenting focal points (hero-headline, primary-cta, featured-project)
- **Curtain Reveal:** Full-screen vertical wipe on initial page load
- **LCP Preload:** Hero image preloaded with high fetch priority
- **SEO:** sr-only H1, comprehensive Schema markup

---

### 2. AboutPage.tsx

**File Path:** `apps/web/src/pages/AboutPage.tsx`  
**Main Component:** `AboutPage`

#### Imported Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Navbar` | `@/components/layout/Navbar` | Top navigation |
| `Footer` | `@/components/layout/Footer` | Bottom navigation |
| `AboutHero` | `@/components/about/AboutHero` | Immersive hero with video |
| `AboutValues` | `@/components/about/AboutValues` | Core values with 3D cards |
| `AboutStats` | `@/components/about/AboutStats` | Stats with count-up animation |
| `AboutTimeline` | `@/components/about/AboutTimeline` | Scroll-animated timeline |
| `AboutCTA` | `@/components/about/AboutCTA` | Call-to-action |
| `AboutVideoModal` | `@/components/about/AboutVideoModal` | Video playback modal |
| `AboutTeam` | `@/components/about/AboutTeam` | Team section |
| `TactileMaterial` | `@/components/ui/enhanced/TactileMaterial` | Material textures |
| `SchemaMarkup` | `@/components/shared/SchemaMarkup` | SEO structured data |

#### Content Hierarchy

```
1. Navbar
2. AboutHero (immersive hero with video play button)
3. Studio Profile Section (grid layout: headline + cards)
4. AboutValues (core values with 3D cards)
5. AboutStats (count-up animation)
6. Design Signature Section (3 pillar cards with icons)
7. AboutTimeline (scroll-animated timeline)
8. How We Work Section (4 working standard items)
9. AboutTeam (The Visionaries section)
10. AboutCTA
11. Footer
12. ScrollToTop
13. AboutVideoModal (YouTube integration)
14. Schema Markup (BreadcrumbList, Organization, Person)
```

#### Special Features

- **Tactile Materials:** Inline wood and marble texture components
- **Video Modal:** YouTube integration with modal playback
- **Framer Motion:** `whileInView` animations throughout
- **Count-Up Numbers:** Animated statistics

---

### 3. OurProcessPage.tsx

**File Path:** `apps/web/src/pages/OurProcessPage.tsx`  
**Main Component:** `OurProcessPage`

#### Imported Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Navbar` | `@/components/layout/Navbar` | Top navigation |
| `Footer` | `@/components/layout/Footer` | Bottom navigation |
| `OurApproach` | `@/components/services/OurApproach` | Approach overview |
| `StageDetailPanel` | `@/components/process/StageDetailPanel` | 5 process stages |
| `TrustStrip` | `@/components/process/TrustStrip` | Trust indicators |
| `TimelineGantt` | `@/components/process/TimelineGantt` | Gantt timeline |
| `ProcessCaseStudy` | `@/components/process/ProcessCaseStudy` | Case study |
| `ProcessFAQ` | `@/components/process/ProcessFAQ` | FAQs |
| `ProcessCTA` | `@/components/process/ProcessCTA` | Call-to-action |

#### Content Hierarchy

```
1. Navbar
2. Hero Section (70-80vh, radial gradient background)
   ├── Kicker "How We Work"
   ├── Large headline
   ├── Description
   └── Two CTAs ("Book Free Consultation" + "Explore the 5 Stages")
3. TrustStrip (trust indicators)
4. OurApproach (approach overview)
5. StageDetailPanel (5 process stages, anchored by #process)
6. TimelineGantt (Gantt-style timeline visualization)
7. ProcessCaseStudy (case study example)
8. ProcessFAQ (frequently asked questions)
9. ProcessCTA (call-to-action)
10. Footer
11. ScrollToTop
```

#### Special Features

- **Dark Theme:** `bg-[#020202]` background
- **Radial Gradients:** Visual effects in hero
- **Framer Motion:** Animate entrance animations

---

### 4. ServicesPage.tsx

**File Path:** `apps/web/src/pages/ServicesPage.tsx`  
**Main Component:** `ServicesPage`

#### Imported Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Navbar` | `@/components/layout/Navbar` | Top navigation |
| `Footer` | `@/components/layout/Footer` | Bottom navigation |
| `ServicesHero` | `@/components/services/ServicesHero` | Hero banner |
| `ServicesMarquee` | `@/components/services/ServicesMarquee` | Scrolling marquee |
| `ServicesWhyUs` | `@/components/services/ServicesWhyUs` | Why choose us |
| `ServicesCTA` | `@/components/services/ServicesCTA` | Call-to-action |
| `ServicesEngines` | `@/components/services/ServicesEngines` | Engine details |
| `ProcessTeaser` | `@/components/services/ProcessTeaser` | Process teaser |
| `ServiceArchetypes` | `@/components/services/ServiceArchetypes` | Service archetypes |
| `ServicesDeliverables` | `@/components/services/ServicesDeliverables` | Deliverables |
| `ServicesInvestmentTiers` | `@/components/services/ServicesInvestmentTiers` | Pricing tiers |
| `ServicesTransformations` | `@/components/services/ServicesTransformations` | Transformations |
| `ServicesProcess` | `@/components/services/ServicesProcess` | Process overview |
| `ServicesFAQ` | `@/components/services/ServicesFAQ` | FAQs |

#### Content Hierarchy

```
1. Navbar
2. ServicesHero
3. ServicesMarquee (scrolling marquee strip)
4. ServiceArchetypes
5. Residential Domain (Domain I) - 3-column grid of service cards
6. Commercial Domain (Domain II) - icon+text service cards
7. Specialized Domain (Domain III) - 3-column grid
8. ServicesDeliverables
9. ServicesTransformations
10. ServicesInvestmentTiers
11. ServicesProcess
12. ServicesEngines
13. ServicesWhyUs
14. ProcessTeaser
15. ServicesFAQ
16. ServicesCTA
17. Footer
18. ScrollToTop
```

#### Special Features

- **Data-Driven:** Service listing from React Query (`api.getServices`)
- **URL Parameters:** Category parameter with smooth scroll (`?category=residential`)
- **Error Handling:** Error retry state with `EmptyCategoryState` fallback
- **Lazy Loading:** Image loading optimization

---

### 5. ServiceCategoryPage.tsx

**File Path:** `apps/web/src/pages/ServiceCategoryPage.tsx`  
**Main Component:** `ServiceCategoryPage`

#### Content Hierarchy

```
1. Navbar
2. Hero Section (full-bleed background, dark overlay)
3. Services List (alternating layout: image+text / text+image)
4. CTA Section ("Need Custom Solutions?")
5. Footer
6. ScrollToTop
```

#### Special Features

- **URL Params:** `useParams` for category
- **Fallback:** Shows `NotFound` if category not found
- **Alternating Layout:** Odd/even index pattern

---

### 6. ServiceDetailPage.tsx

**File Path:** `apps/web/src/pages/ServiceDetailPage.tsx`  
**Main Component:** `ServiceDetailPage`

#### Content Hierarchy

```
1. Navbar
2. Hero Section (two-column: text left, image right with glow blur)
3. Rich Content Section (ReactMarkdown rendering)
4. Features & Process (two-column: features + timeline)
5. Related Services ("Complementary Services" grid)
6. FAQ Section (Accordion-based)
7. Footer
8. ScrollToTop
9. Sticky CTA Bar (fixed bottom)
```

#### Special Features

- **Sticky CTA Bar:** Fixed bottom with "Consult with us"
- **ReactMarkdown:** Rich content rendering
- **Schema Markup:** FAQ and Service structured data

---

### 7. PortfolioPage.tsx

**File Path:** `apps/web/src/pages/PortfolioPage.tsx`  
**Main Component:** `PortfolioPage`

#### Content Hierarchy

```
1. ScrollProgress (top progress bar)
2. Navbar
3. FixedSocialBar (persistent social media bar)
4. HubHero (portfolio hub hero)
5. Philosophy (design philosophy section)
6. Featured Project Stories (up to 3 alternating stories)
7. TrustLayer (trust indicators marquee)
8. ProjectArchive (bento-style project grid)
9. DesignPerspective (horizontal scroll section)
10. DesignSignatures (4 editorial quote panels)
11. ClientPerspective (client testimonial)
12. PortfolioFinalCTA
13. Footer
14. ScrollToTop
```

#### Special Features

- **ScrollProgress:** Top scroll progress bar
- **FixedSocialBar:** Persistent social media bar
- **Data-Driven:** Featured projects from React Query

---

### 8. GalleryPage.tsx

**File Path:** `apps/web/src/pages/GalleryPage.tsx`  
**Main Component:** `GalleryPage`

#### Content Hierarchy

```
1. Navbar
2. Hero Section (full-viewport with parallax scaling)
3. Sticky Category Navigation (horizontal scrollable pills)
4. Asymmetric Gallery Grid (alternating left/right cards)
5. CTA Section ("Let's create your space.")
6. GalleryLightbox (full-screen modal)
7. Footer
8. ScrollToTop
```

#### Special Features

- **URL-Based:** Category and saved board (`?category=X&board=id1,id2`)
- **Inspiration Board:** `localStorage`-based saved items
- **Parallax Hero:** `useScroll`/`useTransform`
- **Lightbox:** Full-screen with prev/next navigation

---

### 9. BlogPage.tsx

**File Path:** `apps/web/src/pages/BlogPage.tsx`  
**Main Component:** `BlogPage`

#### Content Hierarchy

```
1. Navbar
2. Featured Article Hero (80vh background with gradient)
3. Sticky Filter Bar (category chips, search, sort)
4. Trending Articles Slider (horizontally draggable)
5. Main Content: Grid + Sidebar
   ├── Left: 2-column article grid with "Load More"
   └── Right: Categories, Tags, Most Read, CTA
6. Newsletter Section ("Design Decoded" signup + 3D journal)
7. Footer
8. ScrollToTop
```

#### Special Features

- **GSAP:** Entrance animations via `useGSAP`
- **Draggable Slider:** Trending posts with Framer Motion
- **Newsletter:** Honeypot spam protection + rate limiting
- **Skeleton Loading:** Loading states

---

### 10. BlogDetailPage.tsx

**File Path:** `apps/web/src/pages/BlogDetailPage.tsx`  
**Main Component:** `BlogDetailPage`

#### Content Hierarchy

```
1. ReadingProgressBar (fixed top with time-remaining pill)
2. StickyArticleBar (appears after 350px scroll)
3. Navbar
4. Article Header (category, title, author, meta)
5. Cover Image (parallax with gradient fade)
6. Content Area (3-column layout)
   ├── Left Sidebar: Table of Contents + Share buttons
   ├── Main Body: Sanitized HTML article + tags + author card
   └── Right Sidebar: In-article lead magnet CTA
7. Previous/Next Article Navigation
8. Related Articles (3-column grid)
9. Footer
```

#### Special Features

- **GSAP + ScrollTrigger:** Header entrance and cover parallax
- **IntersectionObserver:** Active ToC heading tracking
- **DOMPurify:** HTML sanitization
- **Portal-Rendered:** Fixed elements outside DOM tree

---

### 11. ContactPage.tsx

**File Path:** `apps/web/src/pages/ContactPage.tsx`  
**Main Component:** `ContactPage`

#### Content Hierarchy

```
1. Navbar
2. ShaderBackground (animated shader background)
3. CTAContact (primary contact section)
4. InteractiveMap (lazy-loaded with skeleton)
5. ContactFAQ
6. SocialBar (social media pill strip)
7. Footer
8. ScrollToTop
9. Schema Markup (BreadcrumbList, InteriorDesigner)
```

#### Special Features

- **ShaderBackground:** WebGL animated effect
- **Lazy Loading:** Map component with `React.lazy` + `Suspense`

---

### 12. PrivacyPage.tsx

**File Path:** `apps/web/src/pages/PrivacyPage.tsx`  
**Main Component:** `PrivacyPage`

#### Content Hierarchy

```
1. Navbar
2. Back to Home link
3. Hero (version badge, title, description)
4. Section 1: Statutory Overview (definitions grid)
5. Section 2: Nature of Data Collected
6. Section 3: Legal Grounds & Purposes (table)
7. Section 4: DPDPA Rights (5 right cards)
8. Section 5: Data Retention & Disposal
9. Section 6: Data Security & Third-Party Disclosure
10. Section 7: Grievance Redressal & DPO
11. Footer note
12. LegalFooter
13. ScrollToTop
```

#### Special Features

- **LegalFooter:** Simplified footer (not main Footer)
- **Framer Motion:** `whileInView` animations
- **Section Wrapper:** Custom component with icon and title

---

### 13. TermsPage.tsx

**File Path:** `apps/web/src/pages/TermsPage.tsx`  
**Main Component:** `TermsPage`

#### Content Hierarchy

```
1. Navbar
2. Back to Home link
3. Hero ("Legal Agreement" badge, title)
4. Section 1: The Agreement
5. Section 2: Scope of Services (5-item list)
6. Section 3: Quotations & Validity (3 provisions)
7. Section 4: 45-Day Delivery Guarantee (highlighted)
8. Section 5: Warranty & Post-Service
9. Section 6: Payment Schedule (4 milestone cards)
10. Section 7: Intellectual Property Rights
11. Section 8: Limitation of Liability
12. Section 9: Termination
13. Section 10: Dispute Resolution
14. Section 11: Contact
15. Footer note
16. LegalFooter
17. ScrollToTop
```

#### Special Features

- **Highlighted Section:** Section 4 with crimson tint
- **LegalFooter:** Simplified footer

---

### 14. NotFound.tsx

**File Path:** `apps/web/src/pages/NotFound.tsx`  
**Main Component:** `NotFoundGlass`

#### Content Hierarchy

```
1. Background Image (MediaSlot, opacity 40%)
2. Glass Card (centered frosted-glass)
   ├── Large "404" number
   ├── "Lost in Space?" title
   ├── Description with highlighted pathname
   └── "Return Home" button
```

#### Special Features

- **No Navbar/Footer:** Standalone page
- **Glassmorphism:** backdrop-blur UI
- **noindex:** Meta robots tag

---

### 15. LocationPage.tsx

**File Path:** `apps/web/src/pages/LocationPage.tsx`  
**Main Component:** `LocationPage`

#### Content Hierarchy

```
1. Navbar
2. Hero (local service area kicker, headline)
3. Localized SEO Content (two-column: text + image)
4. Demographic & Design Insights (4-column grid)
5. Footer
6. ScrollToTop
7. Schema Markup (LocalBusiness)
```

#### Special Features

- **Hardcoded Data:** 5 cities with unique demographics
- **Generic Fallback:** For unknown cities
- **noindex:** For unknown cities

---

### 16. LocationsPage.tsx

**File Path:** `apps/web/src/pages/LocationsPage.tsx`  
**Main Component:** `LocationsPage`

#### Content Hierarchy

```
1. Navbar
2. Hero (radial gradient background)
3. Stats Strip (4-column: Cities, States, Metros, Projects)
4. Location Grid by State (3-column grid)
5. Tier Legend (classification explanation)
6. CTA Section ("Don't See Your City?")
7. Footer
8. ScrollToTop
9. Schema Markup (BreadcrumbList, ItemList)
```

#### Special Features

- **Dynamic Data:** City list from `LOCATION_DATA` pricing config
- **Tier Coding:** Metro=red, Tier-1=amber, Tier-2=emerald

---

### 17. PriceEstimator.tsx (addons/calculators)

**File Path:** `apps/web/src/addons/calculators/pages/PriceEstimator.tsx`  
**Main Component:** `CostEstimatorPage`

#### Content Hierarchy

**Selection Screen (default):**
```
1. Standalone Nav Header (Logo + AnimatedLogo)
2. SoftAurora Ambient Background
3. MagicRings Background (gold/green ring animation)
4. Urgency Badge ("Free - Smart Calculation - 3 minutes")
5. Headline (FallingText animation)
6. Description paragraph
7. Connection Status (Blueprint linked status)
8. Path Selection Buttons
```

**Calculator Mode:**
```
1. Full-screen CostEstimator component
2. Back button
```

#### Special Features

- **Two-Mode Page:** Selection screen vs. calculator
- **Magnet:** Mouse-following button effect
- **FallingText:** Letter-by-letter animation
- **WebGL Backgrounds:** SoftAurora + MagicRings
- **Discovery Integration:** Blueprint linked via `loadDiscoveryResult()`

---

### 18. DiscoveryPage.tsx (addons/discovery)

**File Path:** `apps/web/src/addons/discovery/pages/DiscoveryPage.tsx`  
**Main Component:** `DiscoveryPage`

#### Content Hierarchy

```
1. Helmet (SEO meta tags)
2. DiscoveryAddon (entire discovery quiz flow)
```

#### Special Features

- **Minimal Wrapper:** All logic in `DiscoveryAddon` module
- **Style Quiz:** Aesthetic Discovery Engine

---

### 19. SharedResultPage.tsx (addons/discovery)

**File Path:** `apps/web/src/addons/discovery/pages/SharedResultPage.tsx`  
**Main Component:** `SharedResultPage`

#### Content Hierarchy

```
1. Loading State: Spinner ("Loading Aesthetic Blueprint...")
2. Error State: "Result not found"
3. Success State: ResultsReveal (lazy-loaded)
```

#### Special Features

- **Dynamic OG Images:** Per archetype (10 mapped archetypes)
- **Rich Metadata:** Open Graph + Twitter Card
- **JSON-LD:** Structured data

---

### 20. BlueprintPage.tsx (addons/discovery)

**File Path:** `apps/web/src/addons/discovery/pages/BlueprintPage.tsx`  
**Main Component:** `BlueprintPage`

#### Content Hierarchy

```
1. Scroll Progress Bar (fixed gradient)
2. Header ("CrossAngle Archival" branding + tabs)
3. Tab Content (3 modes):
   ├── Blueprint Tab:
   │   ├── Cover Section (grid background, stats)
   │   └── Architectural Timeline (5 phases with interactive simulations)
   ├── Documentation Workspace Tab:
   │   ├── Header with search (Cmd+K)
   │   ├── Explorer sidebar (folder tree)
   │   ├── Terminal-style document viewer
   │   └── Welcome dashboard
   └── Design Proposal Tab:
       ├── Concept section (5 pillars, colors, typography)
       ├── Tech Stack section (9 technology cards)
       ├── Animations Bento grid (10 demos)
       ├── Scroll Journey Map (6 zones)
       └── Responsive Design section
4. Footer ("CrossAngle Archival" branding)
```

#### Special Features

- **Interactive Simulations:** DB viewer, CRM pipeline, Lighthouse audit
- **Cmd+K Search:** Keyboard shortcut
- **Custom Markdown Parser:** `parseMarkdownToReact`
- **3 Tab Modes:** Blueprint, Documentation, Design Proposal

---

## Animation & Interaction Patterns

### Framer Motion (15 pages)

| Pattern | Pages |
|---------|-------|
| `whileInView` | AboutPage, ServicesPage, ServiceCategoryPage, ServiceDetailPage, LocationPage, PrivacyPage, TermsPage |
| `animate` (entrance) | OurProcessPage, ServiceCategoryPage, ServiceDetailPage, LocationsPage, GalleryPage |
| `AnimatePresence` | Index, GalleryPage, PriceEstimator |
| `useScroll`/`useTransform` | GalleryPage, PortfolioPage |

### GSAP (2 pages)

| Pattern | Pages |
|---------|-------|
| `useGSAP` | BlogPage |
| `ScrollTrigger` | BlogDetailPage |

### Custom Animations

| Pattern | Pages |
|---------|-------|
| Curtain Reveal | Index |
| Parallax Scrolling | GalleryPage, BlogDetailPage, PortfolioPage |
| Lightbox Modal | GalleryPage |
| Video Modal | AboutPage |
| Draggable Slider | BlogPage |
| Count-Up Numbers | AboutPage |
| Letter-by-Letter Text | PriceEstimator, BlueprintPage |
| Mouse-Following Buttons | PriceEstimator |
| Interactive Simulations | BlueprintPage |

---

## Data Flow Architecture

### Supabase Integration

```
Supabase Database
       ↓
React Query (caches data, staleTime: 5min)
       ↓
Components render with data
       ↓
Framer Motion animations
```

### Data Sources

| Source | Pages |
|--------|-------|
| `hero_media` table | Index (Hero) |
| `services` table | ServicesPage, ServiceCategoryPage, ServiceDetailPage |
| `blog_posts` table | BlogPage, BlogDetailPage |
| `portfolio_projects` table | PortfolioPage |
| `gallery_items` table | GalleryPage |
| `quiz_results` table | SharedResultPage |
| `site_settings` table | Navbar, Footer, all pages |
| `LOCATION_DATA` config | LocationsPage |

---

## Performance Optimizations

### Code Splitting

- **Lazy Loading:** All page components loaded on-demand
- **React.lazy:** Used for interactive map, scroll components
- **Suspense:** Fallback skeletons during load

### Image Optimization

- **LCP Preload:** Hero image preloaded with high priority
- **Lazy Loading:** Images below the fold
- **MediaSlot:** CMS-controllable image optimization

### Bundle Optimization

- **Tree Shaking:** Unused components excluded
- **Dynamic Imports:** Interactive features loaded only when needed
- **React Query Caching:** Reduces API calls

### Rendering Optimization

- **content-visibility: auto:** Off-screen sections
- **will-change:** Transform hints for animations
- **useCallback/useMemo:** Prevents unnecessary re-renders

---

## SEO Implementation

### Schema Markup (7 pages)

| Page | Schema Types |
|------|--------------|
| Index | LocalBusiness, Organization, WebSite, Service, FAQPage |
| AboutPage | BreadcrumbList, Organization, Person |
| ContactPage | BreadcrumbList, InteriorDesigner |
| ServiceDetailPage | FAQPage, Service |
| LocationPage | LocalBusiness |
| LocationsPage | BreadcrumbList, ItemList |
| PriceEstimator | (planned) |

### Meta Tags

- **Title:** Unique per page
- **Description:** Unique per page
- **Keywords:** Relevant per page
- **OG Tags:** Open Graph metadata
- **Twitter Cards:** Social sharing
- **Canonical URLs:** Duplicate prevention

### Accessibility

- **Skip Navigation:** `#main-content` link
- **ARIA Labels:** On interactive elements
- **Keyboard Navigation:** Focus management
- **Screen Reader:** sr-only text for visual elements
- **Reduced Motion:** `prefers-reduced-motion` support

---

## Summary

### Page Statistics

| Metric | Value |
|--------|-------|
| Total Public Pages | 20 |
| Pages with Navbar | 18 |
| Pages with Footer | 17 |
| Pages with Framer Motion | 15 |
| Pages with Schema Markup | 7 |
| Pages with GSAP | 2 |
| Pages with WebGL | 2 |
| Pages with Lightbox | 1 |
| Pages with Video Modal | 1 |

### Component Reuse Rate

- **Navbar:** 90% (18/20 pages)
- **Footer:** 85% (17/20 pages)
- **ScrollToTop:** 80% (16/20 pages)
- **SchemaMarkup:** 35% (7/20 pages)
- **Image:** 25% (5/20 pages)

### Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3.1 |
| Build Tool | Vite 5.4.19 |
| Styling | Tailwind CSS 3.4.17 |
| Routing | React Router DOM 6.30.1 |
| State | React Query 5.90.20 |
| Animations | Framer Motion 12.36.0 |
| Backend | Supabase 2.48.1 |
| Analytics | PostHog, Vercel Analytics |
| Monitoring | Sentry, Speed Insights |

---

## Architecture Review (Corrected)

> **Reviewer Note:** The initial assessment conflated architecture with code hygiene. This corrected review separates architectural design from implementation quality.

### Architecture Ratings

| Category | Score | Notes |
|----------|------:|-------|
| System Architecture | **9.3/10** | Excellent separation of concerns and feature boundaries |
| Information Architecture | **9.5/10** | Very clear page hierarchy and user journey |
| Scalability | **9.2/10** | Easily supports future features |
| Maintainability | **8.3/10** | Good, but depends on implementation consistency |
| Component Architecture | **8.2/10** | Strong foundation, needs standardization |
| Performance Architecture | **9.3/10** | Modern optimization strategy |
| SEO Architecture | **9.8/10** | Enterprise-grade |
| Animation Architecture | **9.6/10** | Exceptionally organized |
| Data Architecture | **9.0/10** | React Query + Supabase is a mature stack |
| **Overall Architecture** | **9.1/10** | |

### Architecture Strengths

#### 1. Excellent Feature Separation (9.5/10)

Instead of dumping everything into `/components`, the project separates by domain:

```
home/
about/
services/
process/
layout/
shared/
ui/
addons/
```

This is how large React applications evolve. Many agencies never reach this level.

#### 2. Addons are Completely Isolated (10/10)

```
Public Website
    ↓
Discovery Engine
    ↓
Blueprint
    ↓
Estimator
```

Each is almost an independent application. Extremely scalable — better than forcing everything under `pages/`.

#### 3. Shared Infrastructure is Excellent

Reusable across pages:
- Navbar
- Footer
- ScrollToTop
- SchemaMarkup
- Image / MediaSlot
- React Query

This is exactly what shared infrastructure should look like.

#### 4. SEO Architecture (9.8/10)

One of the strongest parts:
- Schema markup
- OpenGraph
- Canonical URLs
- Location pages
- Structured data
- Semantic HTML
- Local SEO
- Blog SEO
- Service SEO

Very few agency websites implement all of this.

#### 5. Animation Architecture (9.6/10)

Instead of random animations everywhere:
- **Framer Motion** — UI transitions and scroll animations
- **GSAP** — Complex scroll-triggered sequences
- **Custom WebGL** — Background effects (ShaderBackground, MagicRings)
- **React Bits** — Specialized text animations (FallingText, SplitText)

Each chosen for specific jobs. That's mature.

#### 6. Data Flow (9.0/10)

```
Supabase → React Query → UI → Animation
```

Simple. Predictable. Easy to debug. No unnecessary Redux.

#### 7. Layered Product Architecture

The website is not just a marketing site. It's evolving toward:

```
Marketing Website
    ↓
Discovery Engine
    ↓
Estimator
    ↓
Blueprint
    ↓
Documentation Workspace
```

This is a layered product architecture — evolving toward an ecosystem rather than a collection of pages. Much more scalable than most agency sites.

### Implementation Issues (Not Architecture)

These are code hygiene issues, not architectural problems:

#### 1. 18 Unused Home Components

**Impact:** Code bloat, cognitive load  
**Fix:** Delete them  
**Architecture Impact:** None — the architecture supports using them, they're just not used yet

#### 2. Footer God Component (495 lines)

**Impact:** Harder to maintain  
**Fix:** Extract Particles, Clock, Social, Links into sub-components  
**Architecture Impact:** None — the component exists and works

#### 3. Inline Sections in Index.tsx

**Impact:** Less modular home page  
**Fix:** Extract to `HomePhilosophy`, `HomeCTA`, `HomeFeatured`, `HomeGallery`  
**Architecture Impact:** Minor (-0.3) — the architecture supports this, just not implemented

#### 4. Mixed Page Patterns

Some pages use component-based, others inline.  
**Fix:** Standardize to component-based  
**Architecture Impact:** None — both patterns work

### Architectural Recommendations

#### What to Fix (Architecture)

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| Home page inline sections | -0.3 | Extract to components |
| Cross-cutting capabilities not modular | Future risk | Plan for `media/`, `animation/`, `cms/`, `seo/` modules |

#### What NOT to Over-Abstract

Avoid creating mega-components like:
- `<PageHero />` with 30 props
- `<PageCTA />` that tries to handle every variant

Instead, prefer semantic variants:
```
EditorialHero
ServiceHero
BlogHero
PortfolioHero
LocationHero
MinimalHero
```

These represent design systems rather than one Swiss Army Knife component.

### Biggest Architectural Risk

The architecture is **page-centric** rather than **capability-centric**.

Current:
```
Services/
About/
Blog/
Portfolio/
```

Future (as project grows):
```
Media/
Animation/
CMS/
Telemetry/
SEO/
Content Blocks/
Motion System/
Design Tokens/
Editorial Components/
```

These cross-cutting capabilities should become first-class modules rather than remaining distributed across page folders. That's the transition many mature codebases eventually make.

### Final Verdict

| Area | Rating |
|------|-------:|
| Architecture | **9.1/10** |
| Current Implementation | **8.5/10** |
| Enterprise Readiness | **9.1/10** |
| Scalability | **9.2/10** |
| Long-term Maintainability | **8.5/10** |

The underlying architecture — feature organization, data flow, routing, shared infrastructure, and extensibility — is strong. Unused components, oversized files, and inconsistent extraction are **maintainability issues** that can be fixed without changing the underlying design.

---

*This document provides a comprehensive overview of the public pages architecture for the Cross Angle Interior web application. For component-specific documentation, refer to the individual component files.*
