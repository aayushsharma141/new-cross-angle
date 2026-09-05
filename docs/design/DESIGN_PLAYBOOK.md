# CrossAngle Design Playbook

| Specification Metadata | Detail |
|:-----------------------|:-------|
| **Version**            | **3.1 (Design v1.0 Frozen)** |
| **Status**             | **Frozen — Production Hardening Active** |
| **Last Reviewed**      | 2026-08-05 |
| **Owner**              | CrossAngle Design & Architecture Group |
| **Review Cadence**     | Quarterly / Post-Hardening (Next: 2026-11-05) |

> **Purpose:** The four-layer design authority and governance system for the CrossAngle platform.
> It separates immutable brand identity, engineering platform rules, context-dependent UX heuristics, 
> and surface-level review checklists into explicit tiers of stability.
>
> **Authority Hierarchy:**
> `ART_DIRECTION_BIBLE.md` (Identity Root) → `DESIGN_PLAYBOOK.md` (Design Authority) → `AI_REVIEW_WORKFLOW.md` (Tooling & Review Ops) → `Design Lab` → `Production Pages`
>
> **Core Principle:** Do not copy layouts or animations from external references. Extract timeless principles only.

---

## Design System Freeze Scope

### ❄️ Frozen (Changes require formal ADR)
- **Art Direction Bible & DNA** (Layer 1)
- **Design Tokens & Values** (Colors, spacing scales, radius, hair lines)
- **Motion Philosophy & Timing** (Easing curves, duration ceilings, physics)
- **Typography Matrix** (Display Cormorant serif vs Body sans ratios)
- **Layer 2 Platform Contracts** (A11y baseline, touch targets, CLS stability)
- **Surface Certification Criteria** (Audit rubric & approval thresholds)

### 🟢 Unfrozen (Continuous Evolution & Hardening)
- **Content & Narrative Copy**
- **High-Resolution Photography & Media Assets**
- **Core Web Vitals & Image Optimization**
- **SEO Architecture & Structured Schema Markup**
- **Accessibility & Screen Reader Refinements**
- **Browser Matrix & Mobile QA Hardening**
- **Analytics, Telemetry & Real User Monitoring**

---

## Platform Strategic Roadmap

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Design System & Surface Certification                         │
│ └── Status: ✅ COMPLETED & FROZEN (Homepage, Portfolio, Services,      │
│            About, Estimator all Certified)                             │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Production Hardening (ACTIVE)                                 │
│ ├── 2.1 Accessibility & Mobile QA (Semantic DOM, 48px Touch Targets,   │
│ │       WCAG AA Contrast, Keyboard Focus Traps, Reduced Motion)        │
│ ├── 2.2 Performance & Core Web Vitals (LCP ≤ 1.2s, CLS = 0, INP,       │
│ │       WebP/AVIF Image Pipeline, Bundle Analyzer)                     │
│ ├── 2.3 SEO & Structured Data (Single H1 Hierarchy, JSON-LD Schema,    │
│ │       Canonical & Meta Tags, Robots/Sitemap)                         │
│ ├── 2.4 Cross-Browser & Viewport Matrix QA (Chrome, Safari, Firefox,   │
│ │       Edge, iOS Safari, Android Chrome, 375px–1440px Breakpoints)    │
│ └── 2.5 Release Candidate & Deployment Gate (Full RELEASE_CHECKLIST)   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Business & Content Evolution                                  │
│ └── Focus: Portfolio Case Studies, High-Res Editorial Photography,     │
│            Architectural Journal/Blog, Testimonials, Content Marketing │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Growth & Conversion Intelligence                              │
│ └── Focus: A/B Testing, Funnel CRO, Session Heatmaps, Google Search    │
│            Console Analytics, Client Genome Machine Learning Models    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Core Design Principles

1. **Good design removes.**
2. **Photography leads.**
3. **Movement explains.**
4. **Typography structures.**
5. **Whitespace frames.**
6. **Performance is luxury.**
7. **Consistency beats novelty.**

---

## Governance & Document Hierarchy

To prevent duplicate standards and circular rules, CrossAngle operates on a strict single-source-of-truth hierarchy:

```text
ART_DIRECTION_BIBLE.md         (Immutable Brand Identity & DNA Baseline)
        │
        ▼
DESIGN_PLAYBOOK.md             (Platform Authority & Decision Architecture)
        │
        ▼
tokens/                        (CSS Variables & Engineering Contracts)
        │
        ▼
design/DEFINITION_OF_DONE.md   (Per-Surface Quality & Feature Exit Gate)
        │
        ▼
design/reviews/                (100-Point Rubric Evidence & Certifications)
        │
        ▼
RELEASE_CHECKLIST.md           (Pre-Deployment Ship & Production Gate)
```

---

## Objective Surface Audit Rubric (100 Points)

Rather than arbitrary decimal estimations, all surfaces are evaluated against a standardized 100-point objective rubric:

| Dimension | Weight | Target Criteria |
|:----------|:------:|:----------------|
| **1. Accessibility & Semantics** | **20 pts** | Semantic HTML5 (`h1`–`h6`, `<main>`, `<nav>`), 48×48px mobile touch targets, WCAG AA contrast (≥4.5:1), complete ARIA labeling, full keyboard navigability. |
| **2. Performance & Web Vitals** | **20 pts** | LCP ≤ 1.2s, CLS = 0, INP ≤ 50ms, priority preloading on hero visual assets, no synchronous layout thrashing, zero unnecessary re-renders. |
| **3. Typography & Hierarchy** | **15 pts** | Cormorant Garamond display paired with neutral grotesque sans, strict measure (60–70ch), rhythmic spacing, no orphaned headlines. |
| **4. Motion & Tactility** | **15 pts** | `--ease-gallery` and `--ease-out` curves, <300ms micro-durations, tactile `:active` compression (0.97), strict `prefers-reduced-motion` compliance. |
| **5. Photography & Visual Dominance** | **15 pts** | >90% Attention Purity Index (API), museum-grade natural lighting, consistent aspect ratio discipline (3:4 or 16:9), zero AI visual artifacts. |
| **6. Ergonomics & Interaction** | **15 pts** | Fluid responsive adaptation, zero overflow jitter, intuitive viewport boundaries, load-bearing whitespace framing interactive controls. |

### Surface Certification Tiers
- **`✓ Certified` (90–100 pts):** Reference-grade studio benchmark. Zero critical, security, or accessibility violations.
- **`✓ Premium` (80–89 pts):** High-craft execution. Ready for customer exposure with minor non-blocking polish backlog.
- **`✓ Production Ready` (70–79 pts):** Structurally sound and functionally complete. Basic standards satisfied.
- **`⚠ Needs Review` (< 70 pts):** Blocked from production release until remediation passes audit.

---

## Operational Design & Engineering Lifecycle

Every UI modification, new feature, or visual refactoring must execute this sequential 7-stage lifecycle:

```text
1. RESEARCH           Explore spatial requirements and reference R&D discoveries in /design/r-and-d/.
       │
2. DESIGN DECISION    Frame composition using Layer 3 Decision Tree; log any approved exceptions via /design/adr/.
       │
3. BUILD              Implement component against Design Tokens in /design/tokens/ and Layer 2 contracts.
       │
4. REVIEW             Execute Layer 4 Surface Checklists and run automated tooling via AI_REVIEW_WORKFLOW.md.
       │
5. EVIDENCE           Verify Accessibility (2.7), Performance (2.8), and record audit in /design/reviews/.
       │
6. CERTIFICATION      Score on 100-pt rubric; assign tier (Certified/Premium/Ready); verify cross-device min-h-[100dvh].
       │
7. TOKEN PROMOTION    Extract recurring (3x+) patterns into centralized tokens in /design/tokens/.
```

---

## Layer 1 — Immutable Brand

> These rules define CrossAngle's architectural studio identity. They change only during a formal studio rebrand. All lower layers yield to Layer 1.

### 1.1 Visual DNA

CrossAngle is not digital software; it is a **physical, curated gallery walk through designed spaces**.
The interface is a silent gallery wall with strict mathematical proportions.
**If a UI element consistently draws more attention than the photography, reconsider its prominence.**

### 1.2 Brand Tension Scale

All design choices must sit firmly in the center column of this tension scale:

| Too Corporate (Software) | CrossAngle (The Center) | Too Editorial (Art Mag) |
|:-------------------------|:------------------------|:------------------------|
| Software / Utility | **Architectural Studio** | Art Magazine / Fashion Zine |
| Efficient / Rushed | **Deliberate** | Slow / Pretentious |
| Premium / Shiny | **Restrained** | Cold / Sterile |
| Luxury / Expensive | **Crafted** | Decorative / Trendy |
| Minimal / Sparse | **Human** | Empty / Void |

### 1.3 Color Palette — Gallery Light (Frozen)

Base material tones: **Limestone, Paper, Charcoal, Restrained Bronze**.
- Accent colors represent interactive state and focus clarity only—never visual decoration.
- Total accent surface area must occupy **< 5% of the viewport**.
- **Forbidden:** AI-purple/neon gradients, warm beige + brass + espresso presets, glowing text shadows, or neon radial orbs.

### 1.4 Typography — Structural Grid

- **Display:** *Cormorant Garamond* (Classical Display Serif). Tightly kerned (–0.02em to –0.04em). Reserved strictly for headlines and narrative statements.
- **Body / Structural:** *Instrument Sans* or *Inter* (Neutral Grotesque). Neutral tracking (0em). Governs all body copy, forms, tables, and metadata.
- **Kickers / Labels:** Uppercase, 10–11px, wide tracking (0.15em to 0.2em). Mimics chiseled stone inscriptions.
- **Measure:** Paragraph measure constrained to 60–70 characters (`max-w-[65ch]`) to prevent reading fatigue.

### 1.5 Photography Dominance

Photography is the primary focal point; the interface recedes to hold it.
- **Light Quality:** Soft, diffused natural overcast daylight or low-angle morning sunlight. Studio flashes and synthetic lighting are prohibited.
- **Color Grading:** Desaturated, organic architectural tones (limestone gray, weathered oak, oxidized bronze).
- **Aspect Ratios:** Strict 3:4 vertical crops for structural details; 16:9 crops for cinematic spatial vistas. Never mix ratios haphazardly in a single scroll track.
- **Attention Purity Index (API):** Target > 90% first fixation on photography or headline.

### 1.6 Visitor Mode: Experience

CrossAngle public surfaces operate in **Experience Mode**:
1. The architectural artifact leads from the very first frame.
2. Interface chrome recedes until almost invisible.
3. Typography, layout cadence, and transitions are tuned for contemplation rather than urgent software utility.

---

## Layer 2 — Platform Rules (Engineering Contracts)

> Stable engineering standards and contracts. Changing these requires a documented technical architecture reason.

### 2.1 Design Tokens

Components consume semantic tokens only. Raw hardcoded values inside component styling are prohibited.

```css
/* Easing Contracts */
--ease-out:      cubic-bezier(0.23, 1, 0.32, 1);     /* Entrances & Reveals */
--ease-in-out:   cubic-bezier(0.77, 0, 0.175, 1);    /* On-screen Movement */
--ease-drawer:   cubic-bezier(0.32, 0.72, 0, 1);     /* Drawers & Sheets */
--ease-gallery:  cubic-bezier(0.22, 1, 0.36, 1);     /* Pocket Door Slide */

/* Interaction Durations */
--duration-press:    140ms;
--duration-tooltip:  160ms;
--duration-dropdown: 200ms;
--duration-modal:    320ms;
--duration-reveal:   600ms;

/* Material & Tactility */
--grain-opacity:     0.02;
--border-hairline:   1px solid rgba(0, 0, 0, 0.10);
--radius-surface:    0px;                            /* Structural surfaces remain sharp */
--radius-interactive: 2px;                          /* Micro-softened for tactile buttons */

/* Hover & Interaction Transformations */
--hover-scale:       1.02;
--hover-duration:    400ms;
--active-scale:      0.97;                           /* Tactile click compression */
--sweep-duration:    750ms;                          /* Hairline shine sweep */
```

*(See [design/tokens/motion.md](file:///E:/main/design/tokens/motion.md) for full promoted token contracts)*

### 2.2 Motion Principles & Kinetic Physics

Animations must simulate physical mass, structural inertia, and quiet friction.
- **Entrances:** Always use `--ease-out`. Never use `ease-in` (which delays visual confirmation on the first frame).
- **No Scale-from-Zero:** Elements must never enter from `scale(0)`. Start at `scale(0.95)` with `opacity: 0`.
- **Button Feedback & Sweep:** All interactive triggers must consume the promoted `button-sweep-active` contract (`transform: scale(var(--active-scale))` on `:active` with subtle hairline sweep on hover).
- **Portfolio Hover:** Card hover should feel like material movement rather than interface movement (`var(--hover-scale)` over `var(--hover-duration)`).
- **Origin Anchoring:** Drawers scale from edge origins; popovers scale from their trigger coordinates; modals remain centered.
- **Signature Moments (Max 3):**
  1. *The Reveal:* Quiet curtain wipe of natural lighting on initial entrance.
  2. *The Material Hover:* Subtle 1.02 scale inside a sharp crop mask with silent caption fade.
  3. *The Workspace Transition:* Cross-fade of ambient light into a shadowless drafting desk.

### 2.3 Spacing & Negative Space

Negative space is load-bearing structural design.
- Vertical pauses (20vh–30vh empty canvas) are required between primary narrative blocks to isolate visual noise.
- **Museum Cadence:** `Silence → Detail Kicker → Full-Bleed Image → Obsidian Gap → Serif Statement`.
- **The 3/30 Rule:** Every section must be immediately legible in 3 seconds and rewarding to inspect for 30 seconds.

### 2.4 Materiality & Surfaces

- **Planes:** Matte plaster, paper, and limestone planes differing by only 2–3% lightness from canvas.
- **Seams:** 1px hairline dividers at 10–12% contrast representing structural joints.
- **Glassmorphism:** Strictly reserved for floating navigation overlays. Never used on content cards.
- **Grain Overlay:** 0.02–0.03 opacity noise filter applied to remove synthetic digital flat pixels.

### 2.5 Layout & Viewport Stability

- **Viewport Standard:** Always use `min-h-[100dvh]` for hero and full-bleed modules. Never use raw `h-screen` (which breaks on mobile browser address bar expansions).
- **Navigation:** Single-line desktop height constrained to 64–72px (maximum 80px). Two-line desktop navigation is considered broken.
- **Editorial Asymmetry:** Symmetrical repeating card rows are banned for storytelling. Stagger cards off-center; allow captions to offset from image bounds.
- **Row Alternations:** Alternating image-and-text rows are capped at 2 consecutive instances.

### 2.6 Platform Anti-Patterns

- **NO** `transition: all` — every transition must explicitly declare target properties (`transform`, `opacity`, `color`).
- **NO** mixed corner radii (e.g. pill buttons on sharp architectural cards).
- **NO** generic 2px blocky icon fills inside button labels.
- **NO** floating intrusive chat widgets or overlapping side progress bars.
- **NO** abrupt un-eased theme switches between page route transitions.

### 2.7 Accessibility Contract (A11y)

Accessibility is a non-negotiable platform requirement:
- **Keyboard-First Navigation:** All interactive elements must be fully operable via Tab, Enter, Space, and Escape.
- **Visible Focus States:** High-contrast, non-intrusive focus rings (e.g. 2px offset bronze/charcoal outline) visible on keyboard navigation (`:focus-visible`).
- **Reduced Motion:** Every animation and transition must respect `@media (prefers-reduced-motion: reduce)` by instantly rendering the final resting state.
- **WCAG AA Contrast:** Minimum 4.5:1 text contrast on all structural copy; minimum 3:1 for large display titles and essential controls.
- **Touch Target Floor:** Minimum touch target size of 44×44px on all mobile interactive surfaces.
- **Semantic Structure:** Strict hierarchical landmark elements (`<header>`, `<main>`, `<nav>`, `<footer>`, `<h1>`–`<h6>`) with unambiguous ARIA labels on icon-only triggers.

### 2.8 Performance Budget & Engineering

Visual luxury must never compromise performance:
- **Motion Never Delays Content:** Content text and critical photography must be readable immediately; entrance animations must not delay critical information.
- **LCP Dominance:** Largest Contentful Paint (LCP) element (hero image) must be preloaded, modern format (WebP/AVIF), and unblocked by client-side animation chains.
- **GPU-Accelerated Only:** Transitions and keyframe animations must strictly animate `transform` and `opacity`. Never animate `width`, `height`, `margin`, `top`, or `padding`.
- **Zero Layout Thrashing:** Read-write DOM cycles must be batched; geometry-measuring hooks must be throttled or observer-driven.
- **Asset Weight Caps:** Hero photography < 200KB; ambient grain texture < 15KB SVG/PNG.

---

## Layer 3 — UX Heuristics (Decision Frameworks)

> Context-dependent principles that guide design judgment rather than enforcing arbitrary quotas.

### 3.1 Interaction Philosophy

1. **Cursor never outruns content:** Motion must feel physically tethered to the user's gesture or intent.
2. **Motion always explains state change:** If no state or spatial relationship changed, nothing moves.
3. **Hover should reveal, never surprise:** Revealed information or elevation must feel inevitable.
4. **Spatial continuity is sacred:** Elements transition with awareness of their origin and destination.
5. **Animation reduces cognitive load:** If motion forces the user to wait or reorient, eliminate it.
6. **Museum pacing:** Encourage slow, deliberate engagement without introducing artificial friction.
7. **Intentional imperfection:** Strict mathematical alignment gives way to editorial asymmetry when framing art.

### 3.2 Component Emphasis Decision Tree

When a surface or feature requires visual emphasis, follow this hierarchy before introducing new UI elements:

```text
Need Visual Emphasis?
        │
        ▼
1. Photography           Can higher-impact framing or contrast accomplish the goal?
        │ (No)
        ▼
2. Typography            Can scale, weight contrast, or tracking establish hierarchy?
        │ (No)
        ▼
3. Negative Space        Can generous padding or vertical isolation highlight the element?
        │ (No)
        ▼
4. Material Hairline     Can a subtle 1px seam or tone shift partition the content?
        │ (No)
        ▼
5. Add UI Element        Only now introduce badges, icons, or elevated containers.
```

### 3.3 Frequency-Based Animation Matrix

Evaluate every animation against encounter frequency:

| Frequency | Strategy | Action |
|:----------|:---------|:-------|
| **100+ times/day** (Keyboard shortcuts, form inputs, tooltips) | Instantaneous | **Zero animation.** Immediate response. |
| **Tens of times/day** (Navigation links, regular card hover) | Ultra-light | 120–160ms micro-transitions. |
| **Occasional** (Modals, filters, drawer reveals) | Considered | 200–320ms custom eased transitions. |
| **Rare / First-time** (Hero page reveal, inquiry confirmation) | Atmospheric | 600–1000ms choreographed spatial reveal. |

### 3.4 Hero & First Viewport Heuristic

- The hero composition must fit comfortably within the initial desktop viewport without forcing immediate scrolling.
- **Display Headings:** Target 18–24ch width. Exceptions are permitted for deliberate editorial asymmetry.
- **Subtext:** Restrain narrative intro to under 20 words for immediate scanning.
- **Hero Text Stack:** Maximum 4 text tiers (Kicker, Headline, Subtext, Action Group). Avoid stacking trust badges, testimonials, and bullet lists inside the hero container.

### 3.5 CTA Intent & Hierarchy

- **Single Primary Intent:** Maintain one primary CTA per viewport region. Secondary contextual actions (e.g. "View Floorplan", "Read Spec") are permitted if their visual weight does not compete with the primary trigger.
- **Deduplicated Copy:** Standardize action labels across equivalent funnels (e.g. choose between "Inquire" vs "Request Consultation" and use it consistently).

### 3.6 Eyebrow Restraint

- Eyebrows (uppercase kickers) communicate structural section categorization—not decorative styling.
- If a section's headline or visual context already makes its role obvious, omit the eyebrow.

### 3.7 Structural Grouping vs. Elevated Cards

- Reserve elevated cards for elements requiring explicit tactile interaction or drag state.
- Prefer organizing flat editorial content with `border-t`, subtle dividers, or generous negative space.

### 3.8 Bento Grid Content Balance

- Bento layouts must feature exactly as many cells as there is meaningful content. Never leave filler cells or empty decorative tiles.

### 3.9 Responsive Viewport Degradation

- Every multi-column composition must specify its mobile degradation strategy explicitly within the component. Avoid unverified default wrapping.

---

## Layer 4 — Surface Review Checklists

> Applied during Step 3 of the Operational Review Workflow prior to shipping.

### 4.1 Hero Surface Review

- [ ] Hero composition resolves completely within `100dvh` without forced scroll.
- [ ] Photography fixation index verified (>90% first visual fix on image/headline).
- [ ] Display headline fits within 18–24ch guideline (or documented editorial exception).
- [ ] Subtext constrained to concise reading length (≤ 20 words).
- [ ] Only one primary CTA visually prioritized in initial viewport.
- [ ] No simultaneous combination of kicker + trust strip + bullet lists.
- [ ] `min-h-[100dvh]` configured with zero layout shift on mobile address bars.
- [ ] Brand Tension Scale verified: sits firmly in the architectural center.

### 4.2 Portfolio & Gallery Surface Review

- [ ] Photography dominates; UI chrome and captions recede cleanly.
- [ ] Aspect ratios (3:4 or 16:9) remain uniform and harmonious within the active track.
- [ ] Hover states utilize `var(--hover-scale)` (1.02) and `var(--hover-duration)` without abrupt snap.
- [ ] Captions offset deliberately to support editorial rhythm rather than centered blocks.
- [ ] Grain overlay active across canvas and surface materials.
- [ ] Zero glassmorphic backgrounds on content cards.
- [ ] Preloaded hero/first-card media for instantaneous LCP.

### 4.3 Services & Spatial Solutions Review

- [ ] Layout family does not repeat consecutively from preceding or succeeding sections.
- [ ] Alternating rows do not exceed 2 consecutive iterations.
- [ ] Eyebrow kicker is present only if it adds structural context to the headline.
- [ ] Body copy paragraphs strictly constrained to `max-w-[65ch]`.
- [ ] Full interactive state cycle implemented (Loading skeleton, Empty state, Error state, Active state).
- [ ] Mobile collapse layout explicitly verified at 375px, 768px, and 1024px.

### 4.4 About & Studio Narrative Review

- [ ] Editorial asymmetry applied: layout avoids predictable symmetrical card grids.
- [ ] 20vh–30vh vertical pauses integrated to establish museum pacing.
- [ ] Composition follows structural cadence (`Silence → Kicker → Image → Gap → Serif`).
- [ ] 3/30 Rule validated (legible in 3s, rewarding for 30s).
- [ ] Cormorant Garamond tracked tightly (–0.02em to –0.04em).
- [ ] Kicker inscriptions styled with wide letter spacing (0.15em–0.2em).

### 4.5 General Motion & Interaction Audit

| Check | Target Standard | Anti-Pattern to Reject |
|:------|:----------------|:-----------------------|
| **Property Specificity** | `transition: transform 200ms var(--ease-out)` | `transition: all 300ms` |
| **Entrance Scaling** | `transform: scale(0.95); opacity: 0` | `transform: scale(0)` |
| **Entrance Easing** | `--ease-out` (cubic-bezier(0.23, 1, 0.32, 1)) | `ease-in` or browser default `ease` |
| **Button Interaction** | `:active { transform: scale(0.97); }` | Flat static click with no tactile feedback |
| **Scroll Reveal** | `translateY(20px)` to `translateY(0)` over 600ms | `translateY(80px)` excessive jumps |
| **Keyboard Actions** | Instantaneous trigger without animation lag | Animated menu dropdowns on hotkey press |

---

## Architectural Decision Records (ADR) for Design

Whenever an intentional deviation or exception to a Layer 2 or Layer 3 rule is approved, it must be recorded in this section or in an archived review document.

### ADR Log Format

```markdown
### ADR-[ID]: [Brief Title]
- **Surface / Component:** `apps/web/...`
- **Rule Challenged:** (e.g. "Hero Display Heading target 18–24ch")
- **Approved Deviation:** (e.g. "Heading extended to 31ch")
- **Architectural Rationale:** (e.g. "Specific spatial quote required uninterrupted line rhythm across hero photography.")
- **Approved Date:** YYYY-MM-DD
- **Sign-off:** Lead Architect
```

### Active Design ADRs

*No active deviations currently logged. All production surfaces adhere to baseline contracts.*

---

## Separation of Concerns: Tokens vs. Taste

```text
TOKENS (The Engineering Contract)
├── Resides in: CSS Variables & Design System Config
├── Governs: Numbers, Easing Curves, Milliseconds, Color Codes, Breakpoints
└── Examples: --ease-gallery, --duration-reveal, --grain-opacity, --hover-scale

TASTE (The Architectural Intent)
├── Resides in: DESIGN_PLAYBOOK.md & ART_DIRECTION_BIBLE.md
├── Governs: Pacing, Restraint, Hierarchy, Material Tactility, Silence
└── Examples: "Museum pacing", "Interface recedes", "Load-bearing negative space"
```

**Rule:** Never encode taste as a fake token (`--premium-level: 5`). Never declare engineering tokens as ambiguous prose (`make it feel gentle`).

---

## Design System Token Promotion

When any styling pattern, layout rhythm, or timing duration is implemented **3+ times with identical intent**, it must be extracted and promoted into a centralized token.

Every token promotion is recorded in the platform changelog.

---

## Changelog

| Version | Date | Key Architectural Updates |
|:--------|:-----|:--------------------------|
| **v1.0** | 2026-08-04 | Initial extraction from Emil Kowalski, TasteSkill v2, and Impeccable principles. |
| **v2.0** | 2026-08-04 | Reorganized into 4 governance layers; softened hard quotas to UX heuristics; introduced Interaction Philosophy and Token vs. Taste separation. |
| **v3.0** | 2026-08-05 | Added Core Design Principles; frozen specification status metadata; integrated Architectural Decision Records (ADR); refined UI prominence guideline; added Accessibility and Performance engineering contracts. |
| **v3.1** | 2026-08-05 | **Design v1.0 Frozen**: Established freeze boundary vs continuous evolution streams; replaced decimal scoring with 100-Point Objective Rubric and Certification Tiers (`✓ Certified`); published multi-phase strategic roadmap (Phase 2: Production Hardening active). |
| **v3.2** | 2026-08-06 | Integrated `RELEASE_CHECKLIST.md` pre-deployment gate; codified 5-stage Phase 2 hardening pipeline; unified strict single-source-of-truth document hierarchy. |
