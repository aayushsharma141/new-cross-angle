# CrossAngle UX Architecture

**Status:** Implementation Blueprint  
**Scope:** Core Pages & Routing  

> **This document defines the behavioral and structural purpose of every page. It is the bridge between the Business Strategy and the UI Specification.**

---

## 1. Homepage (`/`)

- **Goal:** Establish undeniable luxury authority and filter leads via empathy and process transparency.
- **Target User:** Homeowner Planner (Primary), HNI Executive (Secondary).
- **Entry Points:** Direct, Google Organic, Instagram Bio.
- **Exit Points:** `/portfolio` (Primary), `/estimate` (Secondary), `/about` (Tertiary).
- **Success Metric:** Scroll depth > 70%, 35% CTR to Portfolio.
- **Wireframe / Section Order:**
  1. Hero (Cinematic Entrance)
  2. Trust Strip (Google Rating, Stats)
  3. Client Problems (Empathy Matrix)
  4. Services Overview (Accordion)
  5. Before/After Showcase (Interactive slider)
  6. Featured Portfolio (Masonry grid)
  7. Project Failure Prevention (Process Differentiation)
  8. Our Process (Timeline)
  9. Testimonials (Client Voices)
  10. Founder's Note (Personal Accountability)
  11. Estimator Promo (Teaser)
  12. FAQ (Collapsible)
  13. Footer + CTA
- **CTA:** Primary: `Get Estimate →`, Secondary: `Explore Projects →`
- **Interactions:** "The Reveal" vertical wipe on load; pinned service accordion on scroll; slider interactions.
- **Failure Cases:** Slow LCP due to video (Fallback: fast-loading optimized poster image).

---

## 2. Portfolio (`/portfolio`)

- **Goal:** Serve as a highly curated visual gallery to prove execution quality.
- **Target User:** HNI Executive, Commercial Developer.
- **Entry Points:** Homepage, Instagram deep-links, Header navigation.
- **Exit Points:** `/project/[slug]`, `/estimate`.
- **Success Metric:** Minimum 2 project deep-dives per session.
- **Wireframe / Section Order:**
  1. Minimal Header (Title: "Curated Spaces")
  2. Category Filters (Residential, Commercial, Hospitality)
  3. Asymmetric Masonry Grid (Mixed 3:4 and 16:9 aspect ratios)
  4. Footer CTA ("Start a similar project →")
- **CTA:** Secondary: `View Project` (on hover).
- **Interactions:** "Material Hover" (1.02 scale inside crop mask, caption fade-in). Smooth layout transitions on filter change.
- **Failure Cases:** Empty category (Fallback: "More projects in this category are being archived. View all.").

---

## 3. Project Detail (`/project/[slug]`)

- **Goal:** Immersive storytelling of a single spatial transformation.
- **Target User:** High-intent prospects evaluating specific aesthetic capabilities.
- **Entry Points:** Portfolio Grid, SEO long-tail keywords.
- **Exit Points:** `/estimate`, `/portfolio` (Back).
- **Success Metric:** > 2:00 minute dwell time, scroll to bottom CTA.
- **Wireframe / Section Order:**
  1. Full-bleed Hero Image with Location/Title overlay
  2. Project Metadata (Duration, Scale, Scope)
  3. The Brief (Narrative paragraph)
  4. High-Res Gallery Walk (Staggered image blocks)
  5. Material Palette highlights
  6. Client Quote (Specific to the project)
  7. Bottom CTA Block ("Start a similar project")
- **CTA:** Primary: `Start a similar project →` (leads to estimator/contact with project context).
- **Interactions:** Image lightbox expansion on tap/click.
- **Failure Cases:** Missing metadata (Fallback: hide empty fields gracefully without breaking grid).

---

## 4. About (`/about`)

- **Goal:** Build human trust and articulate the design philosophy.
- **Target User:** Quality-Driven Executive evaluating vendor professionalism.
- **Entry Points:** Homepage "Founder Note", Header navigation.
- **Exit Points:** `/services`, `/contact`.
- **Success Metric:** High transition rate to Contact or Services.
- **Wireframe / Section Order:**
  1. Editorial Title ("The Studio")
  2. The Philosophy (Manifesto)
  3. Meet the Founder (High-contrast portrait + letter)
  4. The Team (Restrained grid of key architects/designers)
  5. Studio Location/Office shots
  6. CTA ("Work with us")
- **CTA:** Primary: `Connect With Us →`
- **Interactions:** Parallax scroll on studio imagery.
- **Failure Cases:** Missing team member photos (Fallback: Use brand monogram placeholder).

---

## 5. Services (`/services`)

- **Goal:** Define exact scope of capabilities to manage client expectations.
- **Target User:** Homeowner Planner, Commercial Developer.
- **Entry Points:** Header navigation, Homepage Services teaser.
- **Exit Points:** `/portfolio` (to see examples), `/estimate`.
- **Success Metric:** 30%+ transition to Estimator.
- **Wireframe / Section Order:**
  1. Header ("What We Build")
  2. Sticky Service Accordion (Residential, Commercial, Turnkey)
  3. Process Deep Dive (What is included vs excluded)
  4. Pricing Philosophy (Why we use the Estimator)
  5. Estimator CTA
- **CTA:** Primary: `Calculate Your Project Cost →`
- **Interactions:** Sticky panel locking during scroll to swap contextual images alongside service descriptions.
- **Failure Cases:** Scroll-lock breaks on very short viewports (Fallback: degrade to stacked standard layout on mobile).

---

## 6. Estimator (`/estimate`)

- **Goal:** Lead qualification and price expectation alignment.
- **Target User:** Homeowner Planner.
- **Entry Points:** Global Header CTA, Homepage Promo, Project Detail footer.
- **Exit Points:** Submission Success Screen -> `/`.
- **Success Metric:** Form completion rate > 15%.
- **Wireframe / Section Order:**
  1. Minimal "Workspace" Header (Zero distraction)
  2. Step 1: Property Type & Size
  3. Step 2: Quality Tier (Premium vs Luxury)
  4. Step 3: Timeline requirements
  5. Step 4: Real-time price range calculation reveal
  6. Step 5: Lead Capture (Name, Phone, WhatsApp) to view detailed breakdown
- **CTA:** `See Detailed Estimate` (Submit).
- **Interactions:** "The Workspace Transition" (lighting shifts from Gallery to Workspace). Form steps use smooth slide/fade progression.
- **Failure Cases:** Network timeout on submission (Fallback: Save local state, show "Offline" error, allow retry).

---

## 7. Contact (`/contact`)

- **Goal:** Direct inquiry capture for bespoke requests bypassing the estimator.
- **Target User:** HNI Executive, Commercial Developer.
- **Entry Points:** Footer, About page.
- **Exit Points:** Success Screen.
- **Success Metric:** Low bounce rate, high form submission.
- **Wireframe / Section Order:**
  1. Split Screen Layout
  2. Left: Contact Form (Zod validated)
  3. Right: Studio Contact Details (Address, WhatsApp link, Email, Hours)
- **CTA:** `Send Inquiry`
- **Interactions:** Instant inline validation feedback on blur.
- **Failure Cases:** API failure (Fallback: Mailto link fallback displayed dynamically).

---

## 8. Blog / Journal (`/journal`)

- **Goal:** SEO capture and thought leadership.
- **Target User:** Organic Search traffic.
- **Entry Points:** Google Search.
- **Exit Points:** `/portfolio`, `/services`.
- **Success Metric:** Organic traffic growth, time-on-page > 3 mins.
- **Wireframe / Section Order:**
  1. Featured Article
  2. Article Grid (Masonry)
  3. Article Detail (Standard markdown-rendered longform)
- **CTA:** Inline contextual links to relevant Portfolio projects.
- **Interactions:** Reading progress bar on article pages.
- **Failure Cases:** No articles in category (Fallback: "Coming soon" state).

---

## 9. 404 Error (`/404`)

- **Goal:** Recover lost users gracefully.
- **Target User:** Anyone hitting a broken link.
- **Entry Points:** Invalid URL.
- **Exit Points:** Homepage, Portfolio.
- **Wireframe / Section Order:**
  1. Centered minimalist message ("This space is currently empty.")
  2. Two distinct paths back (Home | Portfolio)
- **CTA:** `Return to Gallery`
- **Failure Cases:** N/A

---

## 10. Legal (`/privacy`, `/terms`)

- **Goal:** Compliance and trust.
- **Wireframe:** Single column, strict typographical hierarchy, no images.
- **Interactions:** Native browser scroll.
