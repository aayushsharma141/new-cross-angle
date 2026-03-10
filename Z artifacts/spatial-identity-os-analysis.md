# Spatial Identity OS — Full Depth Analysis & Reimagination Report
## CrossAngle Interior | Discovery Engine Results Page
**Version:** Current State Analysis + Strategic Redesign Blueprint  
**Date:** March 2026  
**Scope:** Root cause diagnosis, flow audit, UI/UX critique, full reimagination spec

---

## Executive Summary

The page currently deployed at `/spatial-identity-os` is not a results page. It is a design specification document — a style guide that documents color palettes, font choices, animation plans, and component references. The agent that built this confused the *brief* (what to build) with the *output* (documentation about what to build), and deployed the documentation as the live page.

A user who completes all 10 phases of the Discovery Engine, submits their contact details at the Lead Gate, and arrives at `/spatial-identity-os` currently sees: **"Redesigned with Mocha in Mind"** followed by color swatches, typography specimens, and animation choreography notes.

This is not a UX failure. This is a fundamental product misfire. The user's data is collected. The AI has run. The scoring model has produced an archetype. And then the user is shown a developer's internal notes.

This report covers every layer: what went wrong, what should exist, and how to rebuild every section correctly.

---

## Section 1 — Root Cause: What the Agent Built vs. What Was Requested

### What the agent built
The agent appears to have received a design brief that included visual design notes — color palette rationale, typography decisions, and animation planning. It interpreted these notes as the content to render on the page, rather than as design instructions to guide the page's construction.

The page sections visible in the screenshot:
- **"Redesigned with Mocha in Mind"** — color palette documentation
- **"The Immersive Design Philosophy"** — design brief narrative
- **"Chosen Colorways & Rationale"** — color swatch grid with hex values
- **"Fontface Component References"** — typography specimens
- **"Reference System"** — component reference library
- **"Page by Page Animation Choreography"** — animation timing notes
- **"Ready to Build"** — CTA to start development

This is the agent's working document. It was never meant to be the product. It got deployed as the product.

### What was requested
The `/spatial-identity-os` route is the **personalized results destination** for a user after completing the Discovery Engine. It should receive the user's session data (archetype, 5-axis normalized scores, cognitive traits, AI-generated narrative) and render a deeply personalized psychological identity reveal.

The intended page has 9 sections built entirely around the specific user's data:

| Section | Purpose |
|---|---|
| S1 — Identity Reveal | Archetype name, rarity badge, AI narrative, score orb |
| S2 — Emotional Mirror | Curated moodboard with explanation of why each image resonates |
| S3 — Aesthetic DNA | Interactive radar chart showing 5 axes with hover insights |
| S4 — Cognitive Profile | 4 psychological traits: Openness, Detail, Emotion, Thinking |
| S5 — Transformation Readiness | Readiness score with vision/investment/momentum breakdown |
| S6 — Upgrade Path | Current identity vs. Evolved identity narrative |
| S7 — Design Blueprint | Lighting, Material, Layout, Narrative strategy pillars |
| S8 — Lead Capture Gate | Project type, budget, timeline, contact capture |
| S9 — Share Card | Downloadable identity card for organic sharing |

None of these 9 sections exist on the current page. Instead the page renders color documentation.

### The second misunderstanding: data pipeline is not connected

Even if the page sections were correctly built, there is a second structural problem: the page has no connection to the engine's session data. It renders statically. The archetype name, scores, AI narrative, moodboard selections, and cognitive profile do not flow from the Discovery Engine into the results page.

The intended architecture is:
```
Discovery Engine completes
      ↓
Session saved to database with sessionId
      ↓
User redirected to /spatial-identity-os/{sessionId}
      ↓
Page loads session data from database
      ↓
All 9 sections render with user-specific data
```

The current state:
```
Discovery Engine completes
      ↓
User arrives at /spatial-identity-os
      ↓
Page renders static design documentation
      ↓
No user data is shown
```

---

## Section 2 — Current UI/UX Assessment: Section by Section

### 2.1 What the User Currently Experiences

A user who has just completed 10+ minutes of behavioral discovery and submitted their personal details arrives at a page that:

1. Greets them with "Redesigned with Mocha in Mind" — a statement that is entirely meaningless to them
2. Shows them color swatches with hex codes — product design decisions that are invisible to users by design
3. Displays typography specimens labeled as "Fontface Component References" — developer terminology
4. Shows "Animation Choreography" — a technical animation timing document
5. Ends with "Ready to Build" — a CTA directed at a developer, not a client

The user has no idea what their archetype is. They have no moodboard. They have no radar chart. They have no design blueprint. They have received zero value from the experience they just completed.

**Drop impact:** Any user who reaches this page will either bounce immediately in confusion, or assume the product is broken. The lead that was captured at the gate arrives in the CRM with zero trust from the user.

### 2.2 UI Problems on the Current Page

**Color palette misuse.** The "Mocha in Mind" color section shows swatches that are design system documentation. It reads like an internal Figma file printed to a web page.

**Typography section.** Font specimens labeled "Fontface Component References" are shown at multiple weights and sizes. This is a developer reference sheet. Users do not need to know that the heading font is a specific weight — they need to feel the personality of their archetype expressed through typography.

**Animation choreography.** Section describing "Page by Page Animation Choreography" with timing breakdowns and transition notes is developer documentation. It tells the user what transitions the engineer planned. It has no user value whatsoever.

**Reference system.** The component reference grid shows UI components in various states (buttons, cards, inputs). This is a design system library. It belongs in Figma, not on a user-facing results page.

**Contrast and hierarchy.** The dark background is correct for the brand. However the content has no clear hierarchy. A user's eye has nowhere to go. There is no hero moment, no name reveal, no emotional peak. The page is flat documentation with no narrative arc.

**Mobile behavior.** None of the layout appears to be built with mobile-first principles. Documentation grids rarely adapt well to narrow viewports.

### 2.3 Flow Design Issues

The intended psychological flow for the results page is:
```
Emotional reward (identity reveal)
      ↓
Visual confirmation (moodboard)
      ↓
Intellectual proof (radar + cognitive)
      ↓
Aspiration activation (upgrade path)
      ↓
Strategic authority (design blueprint)
      ↓
Value exchange (lead enrichment gate)
      ↓
Viral loop (share card)
```

The current page has no flow. It is a flat document. There is no scroll narrative, no progressive reveal, no emotional arc, no conversion moment.

### 2.4 Input Handling Issues

The Discovery Engine collects the following signals:

- `archetype` — resolved from 5-axis scores
- `normalizedScores` — minimalism, warmth, social, structure, novelty (1–9 each)
- `AIAestheticResult` — narrative, traits, design guidance from aesthetic-ai edge function
- `selectedImageIds` — images the user chose in Visual Instinct
- `reflectionAnswers[]` — deep mode reflection responses
- `lifestyleChoices[]` — lifestyle signal selections
- `selectedAdjectives[]` — word choices
- `freeTextReflection` — open text the user typed about their space
- `materialChoice` — material preference
- `lightPreference` — lighting archetype

None of these inputs appear on the current results page. The page is completely disconnected from the engine's output. The user's data is being collected and then discarded from the user's perspective — it never surfaces as personalized content.

The `freeTextReflection` field is particularly wasted. This is text the user typed in their own words about their space. Showing it back on the results page ("You described your space as: '[their words]'") is one of the highest-impact personalization moments possible. It does not exist.

### 2.5 Output Presentation Issues

There is currently zero personalized output on the page. All content is static. This means:

- Every user who reaches `/spatial-identity-os` sees identical content
- The word "personalized" cannot be used to describe anything on this page
- The entire premise of the Discovery Engine — that it produces a unique spatial identity for each person — is contradicted by the results page
- The AI-generated narrative from `aesthetic-ai` is never surfaced to the user

The radar chart — one of the most visually compelling and emotionally resonant outputs of the engine — does not exist on this page.

The archetype name — the central identity moment the engine builds toward — does not appear anywhere.

---

## Section 3 — Intended Function vs. Actual Performance

### 3.1 The Engine's Intended Output Contract

When a user completes the Discovery Engine, the system makes an implicit promise:

> "You have told us who you are. We will tell you your spatial identity."

That promise requires the results page to deliver:

1. **Recognition** — "This is you." The archetype name and description must feel like self-discovery, not an assigned label.
2. **Proof** — The radar chart and cognitive profile show the data behind the identity, building trust in the system's intelligence.
3. **Aspiration** — The Upgrade Path shows not just who they are, but who they could become with the right design partner.
4. **Authority** — The Design Blueprint demonstrates that CrossAngle understands exactly what this specific user's space needs, positioning the firm as the natural next step.
5. **Conversion** — The Lead Gate, placed after all of the above, captures enriched lead data from a user who is already engaged, already grateful, and already trusting.

### 3.2 What the Page Currently Delivers

1. ~~Recognition~~ → User sees "Redesigned with Mocha in Mind"
2. ~~Proof~~ → User sees color swatches
3. ~~Aspiration~~ → User sees font specimens
4. ~~Authority~~ → User sees animation timing notes
5. ~~Conversion~~ → User sees "Ready to Build" button directed at a developer

**Net user value delivered: zero.**

### 3.3 The Critical Second Misunderstanding — Lead Gate Placement

Even in the intended architecture, the lead gate had been placed *before* results, which was identified as the highest drop-risk point in the funnel. The sprint plan addresses this by introducing a MiniResult stage before the gate.

But in the current live state, the gate fires before results AND the results page itself is empty. So the user:
1. Completes 10 phases (7–10 minutes of effort)
2. Hits the lead gate (form wall before seeing any result)
3. Submits their personal details
4. Arrives at a page showing color documentation

This is the worst possible sequence. The user paid the maximum psychological price (form submission) and received the minimum possible reward (nothing).

---

## Section 4 — Full Reimagination: Every Section, Every Detail

### 4.1 Data Architecture (Must Fix First)

Before any UI work, the data pipeline must be corrected.

**Session persistence.** When the engine completes, the full session object must be written to Supabase:
```
discovery_sessions table:
  id (uuid)
  created_at
  mode (quick/deep)
  archetype_id
  archetype_name
  minimalism_score
  warmth_score
  social_score
  structure_score
  novelty_score
  ai_narrative (text)
  ai_traits (jsonb)
  selected_image_ids (uuid[])
  free_text_reflection (text)
  material_choice
  light_preference
  lead_id (nullable, set on gate submit)
```

**Route structure.** The results page must load by sessionId:
```
/spatial-identity/{sessionId}
```

On load, the page fetches the session from Supabase and renders all sections with real data. If sessionId is invalid or expired, show a graceful error with a CTA to restart the engine.

**Fallback.** If no sessionId is present (direct URL access), show a teaser version of the page with one archetype as an example, with a prominent CTA to take the Discovery Engine.

---

### 4.2 S1 — Identity Reveal (The Hero Moment)

**Purpose:** Create maximum emotional payoff. The user's first sight of their result should feel like recognition — "Yes, that is me."

**Layout:** Full viewport height. Dark background. Single centered column. Cinematic entrance animation on scroll-in or page load.

**Elements and data sources:**

**Rarity badge** (top, small, subtle)
- Text: "One of 8 Spatial Archetypes" or "Held by ~12% of users" (calculated from archetype distribution in analytics once data exists)
- Style: small pill, gold border, muted text
- Data source: archetype static data

**Archetype name** (dominant visual element)
- Text: e.g., "The Warm Minimalist" or "The Expressive Collector"
- Typography: large serif, 80–96px on desktop, 48px on mobile
- Entrance: character-by-character reveal, 1.2s duration, staggered
- Data source: `session.archetype_name`

**Identity tagline** (single line beneath name)
- Text: e.g., "You design with restraint but live with warmth."
- Typography: 20px, light weight, muted gold
- Data source: AI-generated from `ai_traits`

**AI narrative paragraph** (3–4 sentences)
- Text: The full narrative from `aesthetic-ai` edge function
- Style: 16–18px, generous line height (1.8), max-width 640px centered
- This is the most personalized text on the page. It was generated from the user's specific signal profile. It must appear.
- Data source: `session.ai_narrative`

**Score orb / resonance indicator**
- A single circular visualization showing overall aesthetic resonance (derived from mean of normalized scores)
- Animated fill on page load
- Label: "Spatial Resonance · [score]/10"
- This is NOT the radar chart. It is a simplified single-number emotional indicator.
- Data source: calculated from 5 normalized scores

**Freetext reflection echo** (if present)
- If `session.free_text_reflection` is non-empty, show: *"You described your space: '[their words]'"*
- Style: italic, quotation-styled, smaller text, subtle indented position
- This is high-impact personalization that costs nothing to implement
- Data source: `session.free_text_reflection`

---

### 4.3 S2 — Emotional Mirror (Moodboard)

**Purpose:** Show users their own taste reflected back visually. Connects emotional feeling to the rational result.

**Layout:** Asymmetric grid of 4–6 images. Not a uniform grid. Varied sizes — one large hero image, 2–3 medium, 1–2 small. This creates visual energy.

**Data source:** The images the user selected in Visual Instinct (`session.selected_image_ids`). Load the actual image assets the user chose.

**Each image must show a caption explaining it:**
- Not just the image name. A sentence that connects the image to the archetype.
- Example: "You were drawn to warm timber surfaces — this reflects your warmth score of [X] and your preference for organic materiality."
- This caption is generated per archetype + image tag combination. It is a mapping, not AI-generated per request.

**Section heading:** "Your Visual Instinct" — not "Moodboard." The word "instinct" is more premium and more accurate to what the engine captured.

**If fewer than 4 images were selected** (possible in Quick mode): supplement with archetype-default images flagged as "matched to your archetype" with a different visual treatment (slightly muted, labeled "Archetype Match" in a small badge).

---

### 4.4 S3 — Aesthetic DNA (Radar Chart)

**Purpose:** Show the quantitative profile. Builds trust that the system actually measured something real.

**Layout:** Full-width section. Radar chart on left (or center on mobile), axis explanations on right.

**Radar chart specs:**
- 5 axes: Minimalism, Warmth, Social, Structure, Novelty
- Data: normalized scores 1–9 from session
- Filled polygon, gold fill at 30% opacity, gold stroke at full opacity
- Background grid: dark lines, low contrast
- Axis labels: positioned outside polygon, medium weight
- Hover interaction: hovering any axis point reveals a tooltip with score value and a one-sentence interpretation

**Axis interpretation tooltips** (examples):
- Minimalism 7.4: "You have a strong preference for edited, uncluttered environments."
- Warmth 8.1: "Warmth is your dominant axis. You gravitate strongly toward materials, textures, and light that feel human and inviting."
- Social 3.2: "You design primarily for private, intimate experience rather than social performance."

**Axis score display:** Show each axis name and score as a row beneath the chart on mobile, as a sidebar list on desktop. Each score has a small horizontal bar.

**Data source:** All from `session.*_score` fields.

---

### 4.5 S4 — Cognitive Profile

**Purpose:** Demonstrate that the engine measured personality, not just aesthetics. Increases perceived sophistication and emotional engagement.

**Four traits:**
- **Openness** — how experimental vs. classic the user's spatial preferences run
- **Detail** — how much the user attends to fine materiality vs. overall composition
- **Emotion** — how emotionally driven vs. functionally driven the design decisions are
- **Thinking** — how the user processes spatial choices (intuitive vs. deliberate)

**Layout:** 4 expandable cards in a 2×2 grid on desktop, vertical stack on mobile. Each card has:
- Trait name (large, bold)
- Score visualization (small horizontal bar, 1–9)
- One-sentence summary (always visible)
- Expanded explanation (revealed on click) — 3–4 sentences connecting the trait to the archetype and design implications

**Data source:** These 4 traits are derived from the 5 axis scores using a secondary mapping:
- Openness = f(novelty, minimalism inverse)
- Detail = f(structure, material_choice signal)
- Emotion = f(warmth, emotional_mapping sliders)
- Thinking = f(structure, lifestyle_choices patterns)

This mapping needs to be defined in `core/archetype.ts` as part of the scoring sprint.

---

### 4.6 S5 — Transformation Readiness

**Purpose:** The strongest lead qualification signal on the page. Shows the user a readiness score with sub-dimensions. Simultaneously qualifies them for the CRM and creates urgency.

**Overall score:** "82% Ready" — displayed as a large circular progress indicator with gold fill. The score is not static. It is calculated per user.

**Readiness calculation inputs:**
- Vision Clarity: derived from consistency of signals across phases (how coherent were the choices?)
- Investment Readiness: derived from `budget_range` if captured in lead gate, defaulting to archetype baseline if not yet captured
- Decision Momentum: derived from session completion time (users who completed quickly show higher momentum)
- Lifestyle Alignment: derived from lifestyle choices matching archetype profile

**Sub-dimension display:** 4 horizontal bars beneath the main score, each labeled and filled proportionally.

**Readiness narrative:** One sentence that interprets the score:
- 85–100%: "You have a clear vision and are ready to move. This is the optimal moment to begin."
- 65–84%: "Your vision is forming. A strategy consultation will crystallize the next steps."
- 45–64%: "You're in an exploratory phase. Your instincts are strong — they just need a design framework."
- Below 45%: "You're building clarity. Start with one room. Let the result inform the rest."

**This section is intentionally placed before the lead gate** because:
1. Users who see a high readiness score feel validated and are more likely to convert
2. Users who see a lower score still feel accurately seen (not judged) and trust the system more
3. The readiness language creates urgency without explicit sales pressure

---

### 4.7 S6 — Upgrade Path

**Purpose:** The most strategically intelligent section. Shows the user the gap between their current spatial identity and their evolved potential identity. Introduces CrossAngle's role as the bridge — without ever using the word "hire."

**Layout:** Two-column card comparison. Left card: Current Identity. Right card: Evolved Identity.

**Current Identity card:**
- Archetype name
- 2–3 limiting patterns the archetype tends to exhibit (framed constructively, never negatively)
- Example for "Expressive Collector": "Spaces that feel rich but sometimes lack visual rest. Layering that obscures the strongest pieces."

**Evolved Identity card:**
- Evolved archetype name (one step forward)
- Example: "The Expressive Collector" → "The Refined Curator"
- 2–3 evolved patterns:
- "Editing that makes each piece speak louder. Warmth achieved through restraint, not volume."

**Bridge statement** (between the two cards):
- "The distance between these two identities is not materials. It is strategy."
- This is the only sentence on the entire page that implies CrossAngle's value proposition. One sentence. No more.

**Data source:** Static archetype progression mapping. Each archetype has a defined evolved archetype and the limiting/evolved pattern copy. This lives in `core/archetype.ts`.

---

### 4.8 S7 — Design Blueprint

**Purpose:** Deliver actionable, specific design strategy that demonstrates CrossAngle's authority. The user should feel that CrossAngle already understands their space before a consultation has happened.

**4 strategy pillars — each rendered as an expandable card:**

**Lighting Logic**
- Based on: `session.light_preference` + warmth score
- Content example (for soft ambient preference + high warmth): "Prioritize layered ambient light over central fixtures. Warm CCT (2700–3000K) throughout. Consider indirect cove lighting to reinforce the sense of enveloped warmth your profile indicates."

**Material Strategy**
- Based on: `session.material_choice` + minimalism score
- Content example (timber + high minimalism): "Limit material palette to 2–3 primary surfaces. Let timber be the sensory anchor. Introduce contrast through matte stone rather than pattern."

**Layout Logic**
- Based on: social score + structure score
- Content example (low social, high structure): "Design for one strong focal axis. Avoid symmetrical arrangements that invite equal attention in multiple directions. Negative space is your most powerful tool."

**Narrative Layer**
- Based on: AI narrative + archetype
- Content example: "Your space should tell a story of quiet conviction. Objects chosen deliberately. Surfaces that reward close attention. Spaces that feel considered, not styled."

**Data source:** Each pillar uses a combination of session signal fields. The content is a mapping table in `core/archetype.ts` — not AI-generated per request. This reduces latency and cost while still feeling personalized because the inputs are genuinely user-specific.

---

### 4.9 S8 — Lead Capture Gate

**Critical positioning note:** This section appears AFTER S1 through S7. The user has already received full value before the form appears. This is the post-gratification gate architecture.

**Heading:** "Your Spatial Blueprint is ready. Where should we send it?"

Do not use: "Get in touch," "Contact us," "Book a consultation." These are transactional and break the identity narrative.

**Fields:**
1. Full Name (required)
2. Email (required)
3. Phone (optional — mark clearly as optional)
4. Project Type (dropdown: Full Home, Single Room, Commercial, Office, Hospitality)
5. Budget Range (dropdown: Under ₹15L, ₹15–30L, ₹30–60L, ₹60L–1Cr, Above ₹1Cr)
6. Project Timeline (dropdown: Ready now, 1–3 months, 3–6 months, Exploring)
7. City (text input)

**Form behavior:**
- If the lead gate was already submitted during the engine flow (the gate before this page), pre-fill name and email. Do not ask twice.
- On submit: update the lead record with project type, budget, timeline, city. Do not create a duplicate lead.
- On submit: show an inline confirmation ("Sent. A strategy conversation will follow within 24 hours.") — not a page redirect.
- The form should never be required to see the content above it. Scroll-based visibility enforcement is a dark pattern when the content above is already delivered.

**CTA button:** "Send My Blueprint"  
Not "Submit." Not "Book Now." Not "Get Quote."

---

### 4.10 S9 — Share Card

**Purpose:** Organic virality. Users who feel seen by their archetype will share it if sharing is made trivially easy and the share artifact looks genuinely premium.

**Download card design:**
- Dark background matching page brand
- Archetype name in large serif
- Single key trait (most dominant axis label + score)
- Small radar shape (simplified, decorative)
- CrossAngle wordmark (small, bottom right)
- Text: "My Spatial Identity · [archetypeName] · crossangle.in/discover"

**Technical implementation:** Canvas-based image generation on the client. The user clicks "Download My Identity Card" and receives a PNG.

**Share prompt copy:** "Your spatial identity is rare. [rarity percentage]% of people share this archetype."

**Share targets:** WhatsApp (most relevant for Indian audience), Instagram Stories aspect ratio option, LinkedIn.

---

## Section 5 — Strategic Redesign Recommendations

### 5.1 The Page Must Feel Like a Product, Not a Report

The greatest risk in rebuilding this page is rebuilding it as a "results dashboard" — grids, cards, statistics, panels. That is admin panel energy, not identity reveal energy.

The page should feel like:
- Spotify Wrapped — personal, visual, shareable, emotional
- 16Personalities — identity-affirming, explanatory, trusted
- Apple Fitness Rings — satisfying, progress-oriented, owned

The design language must be cinematic, not informational. Every section reveals rather than reports. Typography leads. Visuals follow. Data appears as proof, not as the primary experience.

### 5.2 Scroll Architecture

The page has one job: keep the user reading until they reach the lead gate. Every section is engineered for this.

**Scroll-triggered reveals.** Elements should appear as the user scrolls into each section, not all at once. This creates pacing and makes the experience feel like a journey.

**Section transitions.** Full-width dark dividers with the section number and a one-word label: "Identity," "Instinct," "Profile," "Readiness," "Evolution," "Blueprint," "Connect," "Share." These act as chapter markers.

**Time on page target.** A user who reads all 9 sections thoughtfully should spend 6–10 minutes on this page. Sections S4 (Cognitive Profile, expandable cards) and S7 (Design Blueprint, expandable pillars) are the primary time anchors.

### 5.3 Mobile Is the Primary Surface

The Discovery Engine is a mobile-first experience for a large percentage of users in India. The results page must be designed mobile-first.

Mobile-specific decisions:
- S1 (Identity Reveal): Archetype name at 48px, single column, full screen
- S3 (Radar Chart): Chart centered, axes listed below as horizontal bars
- S4 (Cognitive Profile): Vertical stack, all cards open by default on mobile (no expand interaction required)
- S6 (Upgrade Path): Vertical stack, Current below Evolved (reversed to show aspiration first)
- S8 (Lead Gate): All fields stacked, button full width

### 5.4 Performance Constraints

The current page has noted concerns about heavy animations (custom cursor system, multiple aura/orb effects). The following constraints apply:

**Remove entirely:** Custom cursor system. On mobile it is invisible. On desktop it is distracting and CPU-intensive. The brand's sophistication does not depend on cursor effects.

**Reduce:** Particle effects, ambient orbs, continuous loop animations. These add milliseconds to every frame and hurt perceived smoothness. Use entrance animations (one-time, on scroll-into-view) rather than continuous ambient effects.

**Limit animation to:** Archetype name character reveal (S1, one-time), radar chart fill animation (S3, one-time on section enter), readiness score count-up (S5, one-time on section enter), progress bar fills (S4, S5, one-time). Everything else should be static.

**Lazy load:** The moodboard images (S2) and the radar chart JavaScript (S3) should load progressively. They are not needed for the above-the-fold experience.

### 5.5 The Analytics Layer

The results page needs its own analytics tracking, separate from but complementary to the engine's event tracking:

- `results_page_loaded` — sessionId, archetype, mode
- `section_viewed` — sessionId, sectionId (s1–s9), timestamp (scroll depth map)
- `radar_hover` — sessionId, axisName (which traits users examine)
- `cognitive_expanded` — sessionId, traitName (which traits users find interesting)
- `upgrade_viewed` — sessionId (did they scroll to S6?)
- `blueprint_pillar_expanded` — sessionId, pillarName
- `share_card_downloaded` — sessionId, archetype
- `lead_gate_submitted` (on this page, for enrichment) — sessionId

These events, combined with the engine's events, produce a complete funnel view from entry to lead enrichment.

---

## Section 6 — Implementation Priority Order

This is ordered by user impact, not by technical complexity.

### Priority 1 (Blocker — Do Before Anything Else)
Replace the current static design-doc page with a working page that at minimum renders the archetype name and AI narrative from the session. Even if only S1 is built, the user receives acknowledgment that their data was processed. The current state delivers zero.

### Priority 2 (Core Identity Experience)
Build S1 (Identity Reveal), S3 (Radar), S8 (Lead Gate). These three sections constitute the minimum viable results page. A user who sees their archetype name, their radar shape, and a place to submit enrichment data has received genuine value and a conversion path.

### Priority 3 (Depth and Differentiation)
Build S2 (Moodboard), S4 (Cognitive Profile), S5 (Transformation Readiness), S7 (Design Blueprint). These sections differentiate the page from any other quiz results system and justify the "Spatial Identity OS" branding.

### Priority 4 (Conversion Amplifiers)
Build S6 (Upgrade Path) and S9 (Share Card). These are the highest-leverage conversion and virality mechanics, but they require the core experience to be solid first.

### Priority 5 (Optimization)
Add scroll analytics, refine mobile layout, optimize animation performance, implement share card canvas generation.

---

## Section 7 — Summary of All Issues Found

| # | Issue | Severity | Section Affected |
|---|---|---|---|
| 1 | Agent built design documentation instead of product page | Critical | Entire page |
| 2 | No user data rendered — page is static and identical for all users | Critical | All sections |
| 3 | Session data not passed from Discovery Engine to results page | Critical | Data pipeline |
| 4 | Archetype name never displayed to user | Critical | S1 |
| 5 | AI narrative from aesthetic-ai edge function never surfaced | Critical | S1 |
| 6 | Radar chart does not exist on results page | Critical | S3 |
| 7 | Lead gate placed before any results visible (engine flow) | Critical | S8 / Gate |
| 8 | freeTextReflection captured but never shown to user | High | S1 |
| 9 | Selected images in Visual Instinct never appear in moodboard | High | S2 |
| 10 | Cognitive profile traits not calculated or displayed | High | S4 |
| 11 | Transformation Readiness score not implemented | High | S5 |
| 12 | Upgrade Path (current vs evolved archetype) not implemented | High | S6 |
| 13 | Design Blueprint pillars not connected to user signal data | High | S7 |
| 14 | Share card functionality missing | Medium | S9 |
| 15 | Custom cursor system adding CPU overhead for no user value | Medium | Performance |
| 16 | Page not route-parameterized by sessionId | Medium | Data pipeline |
| 17 | No scroll analytics on results page | Medium | Analytics |
| 18 | Continuous ambient animations (orbs, auras) harming performance | Medium | Performance |
| 19 | Page not mobile-first designed | Medium | All sections |
| 20 | "Mocha in Mind" color doc content left in production route | Critical | Immediate fix |

---

## Closing Note

The Discovery Engine concept is genuinely strong. A behavioral spatial profiling system that produces a personalized identity reveal is rare in the Indian interior design market. The scoring model is thoughtful. The AI integration is well-structured. The archetype system has real differentiation potential.

But all of that strategic strength is currently invisible to users because the results page — the only moment where users receive value — is showing them a developer's color notes.

The rebuild is not optional. It is the product. Everything before `/spatial-identity-os` is the funnel. The results page is the thing itself.

Build S1 first. Show the user their name. That alone is more than they are getting today.

---

*This report covers all issues identified from: architecture audit (discovery-architecture.txt), live page screenshot (/spatial-identity-os), Spatial Identity OS brief, engine flow documentation, and CrossAngle project context across all sessions.*
