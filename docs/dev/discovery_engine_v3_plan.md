# Discovery Engine V3 — Desktop First Experience Plan

## Core Principle
Transform the Discovery Engine from a long-form landing page into a premium, interactive assessment product. Desktop and mobile will have distinctly optimized experiences, prioritizing luxury and professional consulting aesthetics over typical startup SaaS designs.

## 1. Desktop Architecture (Fixed Viewport)
**Layout Rules:**
- `height: 100vh; overflow: hidden;`
- No traditional scrolling, no stacked sections.
- The entire experience is contained within a single viewport.

### Left Panel (Static) - 45% Width
This panel serves as the anchor for the user experience, providing constant context and access to the primary action.
- **Content:**
  - Brand / Crossangle Interior / Aesthetic Discovery Engine
  - **Headline:** "Most tools ask what you want. We decode how you want to live."
  - **Supporting Copy:** Concise, maximum 2 lines.
  - **CTA Group:** "Start Discovery", "Quick Quiz". **Must remain permanently visible.**
  - **Trust Indicator:** "1,420+ homeowners completed discovery".

### Right Panel (Interactive) - 55% Width
This panel drives the interactive narrative and methodology.
- **Navigation:** Segmented control (Editorial style, NOT corporate tabs) featuring: `Methodology`, `Archetypes`, `Deliverables`.
- **STATE 01 — Methodology (Default):**
  - Visual diagram showing the transformation: `5 Inputs (Daily Habits, Image Picks, Material Sense, Light Calibration, Word Mapping)` → `You` → `Style Profile`.
  - Refined, high-quality animation (opacity, blur, line drawing).
- **STATE 02 — Archetypes:**
  - Horizontal carousel displaying style outcomes (e.g., Quiet Curator, Warm Modernist, Social Minimalist, Expressive Collector).
  - Each card contains the Archetype Name and a 1-line personality summary.
- **STATE 03 — Deliverables (Conversion Focus):**
  - Presents "What You'll Receive" as a professional consulting output.
  - Cards include: Lifestyle Analysis, Spatial DNA, Material Affinity, Lighting Profile, Budget Strategy, Priority Roadmap.

### Animation & Motion Guidelines
- **Vibe:** Luxury, refined, subtle.
- **Allowed:** Opacity fades, blur transitions, scale adjustments, subtle line drawings.
- **Prohibited:** Huge parallax effects, excessive GSAP animations, floating particles.

---

## 2. Mobile Strategy (Vertical Flow)
Mobile will not force the desktop's fixed-viewport pattern. Instead, it will be a highly optimized vertical experience.

- **Hero Section (Max 70vh):** Headline, Supporting Copy, Primary CTA.
- **Methodology Section:** Single swipeable card showing the "5 Inputs → 1 Profile" concept.
- **Archetypes Section:** Horizontal carousel showing one card fully visible at a time.
- **Deliverables Section:** Grid layout for cards (Lifestyle Analysis, Spatial DNA, Budget Strategy, Roadmap).
- **Footer/Bottom:** Final image banner with a single CTA (remove duplicate buttons).

---

## 3. Visual Hierarchy & Decision Filters
To fix the current issue of elements fighting for attention, strict visual hierarchy will be enforced:
1. **Primary:** Hero 
2. **Secondary:** Methodology
3. **Tertiary:** Archetypes
4. **Conversion:** Deliverables
*Rule: Only one major story/state is visibly dominant at a time on desktop.*

### The 5-Second Success Metric
Every element must support answering these four questions within 5 seconds of a user landing:
1. **What is this?** → A discovery engine.
2. **How does it work?** → 5 inputs become a style profile.
3. **What do I get?** → A personalized blueprint.
4. **What should I do next?** → Start Discovery.
*(Any element failing this filter will be removed).*

## 4. Next Implementation Steps (When Ready to Edit)
1. Scaffold the basic `100vh` grid split (45/55) for desktop and the vertical flow for mobile.
2. Build the Static Left Panel with the fixed CTA.
3. Implement the Segmented Control navigation for the Right Panel.
4. Build State 01 (Methodology) with subtle transition animations.
5. Build State 02 (Archetypes) with the horizontal carousel.
6. Build State 03 (Deliverables) focusing on premium card design.
7. Implement mobile-specific layouts overriding the desktop fixed structure.
