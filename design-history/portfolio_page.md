# ✦ Portfolio Hub Page Layout History ✦

This log tracks layout changes, visual directions, and checkpoints for the Portfolio Hub page (`/portfolio`).

---

## Checkpoints

### 1. `checkpoint/v1-portfolio-pre-overhaul`
* **Layout Design:** V1 multi-section grid page.
* **Sections Included:** `HubHero` (slider with left text column, stats strip, red crimson theme markers), `HowWeWork` (Process blocks), `ProjectGrid` (classic filter controls with category buttons), `TrustSection` (stat-cards layout), `HubLightExperience` (Time of day blend overlay), and `PortfolioFinalCTA` (Formless estimate button).
* **Vibe:** Direct marketing / SaaS-focused template.

---

### 2. `checkpoint/v2-luxury-editorial-portfolio` (Active HEAD)
* **Visual Concept:** Luxury Design Publication / Architectural Digest.
* **Primary Color Palette:** `#0B0B0B` pure dark luxury background, `#FAFAFA` primary text, muted gold accents.
* **Scroll Engine:** Weighty, cinematic smooth scroll via Lenis.
* **Layout Structure:**
  1. **Hero:** Centered minimal headline with staggered word-by-word reveal. Subtle scaling background parallax. Magnetic projects trigger with 8px attraction limit.
  2. **Philosophy:** Text-focused entry with dynamic background crossfade transitions (Hero fade-out, Project 1 fade-in).
  3. **Featured Stories:** Alternating grids (Image Left / Text Right; Text Left / Image Right; Full-Width Overlay). Glassmorphic narrative panels with rotating conic border gradients and direction-aware hover overlays ("View Story →").
  4. **Trust Layer:** Seamless infinite editorial marquee strip with 35s speed loop, pausing on cursor hover.
  5. **Bento Project Archive:** Hierarchical Bento Grid (Large, Medium, Small blocks) with animated filter tabs (LayoutGroup transition with zero page reload).
  6. **Design Perspective:** Sticky horizontal-scroll scroll container showcasing the 4 pillars (Light, Materiality, Spatial Clarity, Execution Detail).
  7. **Client Perspective:** Elegant Playfair Serif quote with slow word-by-word reveal transitions.
  8. **Footer:** Holds all conversion lead capture fields. No additional CTAs on page.
* **Global Overlays:** Animated repeating noise grain overlay (3% opacity) and smooth desktop cursor light glow.
