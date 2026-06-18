# Visitor Experience & Perception Report

This report evaluates the **Cross Angle Interior** website from the perspective of an ultra-high-net-worth (UHNW) luxury client and a standard user, detailing visual perception, micro-interactions, layout polish, and overall user flow.

---

## 1. Visual Hierarchy & Aesthetic Integrity

The visual design is structured around a pitch-dark obsidian and charcoal background canvas, creating an immediate sense of exclusivity and cinematic scale typical of premium European luxury houses.

* **Color Palette**: The primary charcoal tones (`#020202`, `#0D0D0D`) are contrasted with gold (`#C6A15B`) and deep crimson (`#C41230`) text highlights and button borders. The colors are harmonized and evoke a high-end editorial feel rather than a typical web application.
* **Typography**: The pairing of the elegant, high-contrast serif header typeface (**Cormorant Garamond**) with the clean, highly legible geometric sans-serif (**DM Sans**) for body copy creates a readable yet architectural pacing.
* **Hero Sections**: Section headers are large, bold, and spaced widely. The main visual anchors are high-resolution architectural renders and photography, drawing focus to completed spatial case studies.

---

## 2. Interaction Smoothness & Animation Flow

Micro-interactions across key landing pages provide rich tactile feedback, confirming user actions and adding a layer of polish:

* **Navigation Bar**: Transitions smoothly from transparent to a solid, blurred glassmorphic overlay (`backdrop-blur-xl bg-background/90`) upon scrolling down the page. Hovering over nav items triggers a subtle, elegant underline slide-in.
* **Hover Overlays**: Image grids in the Portfolio and Gallery sections utilize slow-ease scale animations (`duration-[900ms] group-hover:scale-[1.04]`) alongside a dark-to-light gradient fade that lifts the project titles and category badges into view.
* **Save/Heart Feedback**: Clicking the heart icon on gallery cards toggles a swift color transition to crimson with a satisfying toast overlay, indicating the item is added to their inspiration list.
* **Transitions**: Using Framer Motion for mounting page transitions ensures that navigation between tabs is fluid and free of hard page flashes.

---

## 3. Key Pages Verification

### A. Immersive Portfolio & Project Hub

The portfolio page features an interactive category sorting menu (All, Residential, Commercial). Filtering is responsive: clicking a category transitions the grid items using layout-aware masonry adjustments.
*Note: A blank/empty state is displayed under the "Commercial" filter as there are currently no commercial portfolio entries in the database.*

![Portfolio Grid - Residential Filter Applied](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/86a511c8-0ffa-4a3a-941e-2891008758ce/portfolio_filtered_residential_1780894360716.png)

---

### B. Curated Gallery & Moodboard

The gallery page functions as a central inspiration board. The "Saved" tab successfully aggregates user choices from localStorage and persists them across reload sessions. The new share board feature allows users to serialize their saved items into the URL, facilitating collaborative moodboard reviews.

![Saved Inspiration Board Items](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/86a511c8-0ffa-4a3a-941e-2891008758ce/moodboard_saved_items_1780894530064.png)

---

### C. Glassmorphic Cost Estimator

The new onboarding step uses elegant glassmorphic cards for project type selection. The cards respond dynamically to hover triggers and support keyboard focus. Selecting a path transitions to the step-by-step cost breakdown engine.

![Cost Estimator - Step 0 Path Selection](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/86a511c8-0ffa-4a3a-941e-2891008758ce/homepage_hero_1780893890924.png)

---

### D. Localized SEO Pages

The localized service landing pages (e.g., Jamshedpur) maintain the main dark-mode design. They present region-specific headlines alongside custom bullet layouts targeting high-end modular kitchens and turnkey villa projects in Jamshedpur.

---

### E. Services Hub (`/services`)

A dramatic brand showcase spanning ~9 distinct sections across a deep obsidian canvas. The page delivers a premium editorial feel — the GSAP drag-to-reveal before/after image in the hero creates a compelling "blueprint → reality" metaphor that emotionally frames the value proposition. Auto-rotating word pairs ("Intelligence" vs "Decoration", "Execution" vs "Incomplete") add a layer of interactive brand storytelling.

**Perception Notes:**
- The Residential domain heading is visually as large as the H1 (`5rem` clamp), creating a moment of hierarchy confusion — the visitor is unsure if they've entered a new page or continued scrolling.
- The `ServicesEngines` section with Discovery Engine and Cost Estimator is visually stunning but heavy — it demands deep engagement at a point where most visitors are still scanning for service categories. The parallax grid backgrounds and interactive modals are polished but may over-shadow the actual service cards above.
- A visual disconnect emerges if navigating from this obsidian-branded hub to `/services/residential` — the Category page uses standard shadcn light-theme tokens, breaking the immersive dark experience.

### F. Service Category & Detail Pages (`/services/:category`, `/services/:category/:service`)

**Category Page Observation:** The hero image overlay (`bg-black/50`) and white/light-mode card styling (`text-muted-foreground`, `bg-accent/10`) create an abrupt thematic break from the hub page. The alternating left-right service layout with feature checklists is functional but lacks the atmospheric depth of the hub. A user arriving from the immersive dark hub may perceive this as a different, less premium site.

**Detail Page Observation:** The page follows a clean content structure (breadcrumbs → H1 hero → features → process → FAQ → related services → sticky CTA) but lacks visual proof elements. No gallery, no testimonials, no before/after — at the point where a visitor is most interested in a specific service, there are no case studies or social proof to reinforce trust. The sticky CTA is well-positioned for mobile conversion.

**Verification Check:** The related services section and FAQ accordion render correctly. The sticky CTA shows on scroll. The Schema.org markup (Service + FAQPage) is present in the DOM head. However, the meta description is directly set from `service.description` without length optimization, and hero image `alt` attributes reuse `service.title` rather than descriptive text.

---

### G. Homepage (`/`)

The homepage employs a curtain-scroll effect: the full-screen hero with crossfading Ken Burns carousel sits fixed, and content slides over it via `relative z-10`. The hero carries the brand's core message — "Homes Designed For Living. Engineered For Predictability." — with a metallic gold gradient on the accent line. A stats strip (150+ Projects, 12+ Years, 98% On-Time) provides immediate trust signals.

**Perception Notes:**
- Lazy-loaded below-fold sections (Discovery, Portfolio, Before/After, Process, Testimonials, Estimator, Final CTA) appear smoothly via IntersectionObserver. Each section has a distinct background shade (neutral-950, black, `#060504`, `#080807`) — the visual transitions between sections feel deliberate and editorial rather than repetitive.
- The Process section's scroll-pinned sticky timeline is a standout interaction: the left-column table of contents stays fixed while the right-column details scroll, creating an active reading experience.
- **Notable gap**: No "About" or "Services" section between the Hero and the Style Discovery teaser. A user lands on the brand message, then immediately gets a style quiz pitch without context on what the company offers or believes. The narrative jumps from "who" to "discover your style" without establishing "what we do."

---

## 4. Navigation & Footer — Cross-Page Consistency

### Navbar
The fixed top navigation transitions from transparent (homepage) to a frosted-glass dark bar (`backdrop-blur-xl bg-background/95`) on scroll. Desktop uses a spotlight pill menu with 7 links. The "Get Free Estimate" CTA button with crimson gradient and pulsing glow is the dominant visual element. On mobile, a hamburger opens a full-screen accordion with staggered link animations and focus-trap accessibility.

**Perception of polish:** High — the spotlight highlight effect on active link and the smooth transparent-to-solid transition feel premium. The staggered mobile menu animation with shift from left adds tactile feedback.

**User friction:** The "Get Estimate" CTA is visually louder than the brand logo on desktop. Its pulsing glow and gradient background draw the eye before the logo or nav links — potentially distracting for a user trying to navigate.

### Footer
Full-featured footer with a contextual CTA hero (headline changes per page), 4-column grid (Studio, Locations, Navigate, Connect), and 100 animated bubble particles rising from the bottom. The live IST clock and 11 linked city routes demonstrate strong local SEO focus.

**Perception of polish:** The contextual CTA headlines (13 variations) feel thoughtfully tailored. The giant "CROSSANGLE" watermark and bubble particles add depth. The mobile accordion pattern is well-executed with proper ARIA attributes.

**User friction:** The bubble particles animate perpetually — even on detail pages where a user may be reading. The navigation links in the footer trigger individual `window.scrollTo` calls that can conflict with the Lenis smooth scroll engine.

---

## 5. Overarching Layout & Responsiveness

### Container Width Inconsistency
The site uses two container systems:
- **`container-wide`** (max-width: 1600px): Navbar, Footer, Hero
- **`container mx-auto` / `max-w-7xl`** (max-width: ~1280px): Mid-page sections (Services, BeforeAfter, EstimatorPromo, etc.)

At screen widths between 1280px and 1600px, content edges jump inward by ~160px per side when scrolling from Hero into the Style Discovery section. This creates a subtle "breathing" effect in the horizontal rhythm that a trained eye perceives as a layout inconsistency.

### Section Vertical Spacing (`py-section-y`)
A custom utility class `py-section-y` is used across 11 of 16 home section components but is **not defined** in any CSS file or Tailwind config. This means all sections using it effectively have zero vertical padding from this class. Spacing between sections relies entirely on child element padding (e.g., `p-8`, `py-24` within inner containers). The appearance of spacing varies by each section's internal structure — there is no unified vertical rhythm.

### Smooth Scrolling
Lenis smooth scroll wraps all public routes with `lerp: 0.08` (very responsive) and `duration: 1.2`. On mid-range devices, this interpolation rate can cause visible jank during rapid scroll. The `SmoothScroll` wrapper loads eagerly at the `App.tsx` level rather than being deferred.

---

## 6. Playback of Browser Audit Run

A video recording of the full browser traversal showing interactions, filter changes, and moodboard saving is available here:

![UI/UX Traversal WebP Recording](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/86a511c8-0ffa-4a3a-941e-2891008758ce/ui_ux_audit_flow_1780892833059.webp)

---

## 7. Performance Audit Findings

### 7.1 Web Vitals (Desktop — Chrome Headless)

| Page | FCP | LCP | CLS | Transfer Size | DOM |
|------|-----|-----|-----|---------------|-----|
| Homepage (`/`) | 1.5s | 2.3s | 0.020 | **17,867 KB** | 567 |
| Services Hub (`/services`) | 0.4s | 1.6s | 0.000 | 7,563 KB | 999 |
| Service Category (`/services/residential`) | 0.4s | 1.6s | 0.000 | 156 KB | 471 |
| Service Detail (`/services/residential/living-room`) | 0.4s | 1.9s | 0.000 | 1,025 KB | 538 |

**Verdict:** All Web Vitals pass "Good" thresholds. The 17.8 MB homepage transfer is a dev-mode Vite artifact (163 individual script modules) and is expected to normalize in production builds.

### 7.2 Browser Interaction Fidelity

- **Animation Smoothness**: Framer Motion and GSAP animations play at 60 fps during Lenis scroll. No dropped frames observed on scroll-triggered reveals.
- **Image Loading**: All content images respect `loading=lazy`. No CLS spikes from deferred image insertion.
- **Resource Contention**: 150+ script requests in dev mode compete for connection pool. In production (bundled chunks), this resolves.

### 7.3 Critical Performance Notes

1. **Homepage bloat (dev mode)**: 163 script requests totaling 17.8 MB. Production build should reduce to ~5–10 chunks.
2. **JS Heap memory**: 37–48 MB per page — Framer Motion + GSAP ScrollTrigger maintain persistent observer state even after sections leave viewport.
3. **DOM depth 18**: Services hub has deepest nested tree — likely from ServicesEngines card-grid structure.
4. **Homepage only 2 H2s**: 5 orphaned components (About, Services, TrustSection, ServiceLocations, HomeBlog) are imported but not rendered in Index.tsx — content gap.
