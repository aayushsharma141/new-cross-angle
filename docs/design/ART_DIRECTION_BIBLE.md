# Crossangle Art Direction Bible

**Status:** Frozen Spec  
**Governing Authority:** Platform Constitution & Evidence Ledger  
**Core Objective:** Guide every visual decision, layout, animation, and color state toward the restrained standard of an internationally recognized interior architecture studio.

---

## 1. Visual DNA

Crossangle does not build digital software dashboards or marketing landing pages; it presents a **physical, curated gallery walk** through designed spaces. The interface is completely silent—acting as a quiet, physical gallery wall with high mathematical proportions—allowing the craftsmanship, light, and geometry of the spaces to speak. Every digital element must feel inevitable, permanent, and physical rather than designed.

---

## 2. Brand Tension Scale

To maintain art direction consistency and avoid subjective shifts, all designs must be balanced strictly on the center column of this tension scale:

| Too Corporate (Software) | Crossangle (The Center) | Too Editorial (Art Mag) |
| :--- | :--- | :--- |
| Software / Utility | **Architectural Studio** | Art Magazine / Fashion Zine |
| Efficient / Rushed | **Deliberate** | Slow / Pretentious |
| Premium / Shiny | **Restrained** | Cold / Sterile |
| Luxury / Expensive | **Crafted** | Decorative / Trendy |
| Minimal / Sparse | **Human** | Empty / Void |

---

## 3. Lighting Environments

We do not use abstract theme variables. Our interfaces are governed by physical **Lighting States** that remap semantic tokens without changing component structures.

* **Global Lighting System: Gallery Light**
  After experimental evaluation, **Gallery Light** (limestone, paper, charcoal, restrained bronze) was selected as the frozen, global lighting aesthetic.
* **Semantic Environments as Material Emphasis**
  Environments are no longer used to create "dark vs light" themes. Instead, they represent **material emphasis** within the same visual language:
  * **Entrance:** Quieter chrome, maximum whitespace, and hero photography.
  * **Gallery:** Photography dominance.
  * **Workspace:** Paper, drafting precision, and denser information handling.
  * **Consultation:** Warmer surfaces and calmer reading rhythm.
* **The Archive:** The Gallery Dark prototype and its evaluation results have been preserved in `/prototypes/gallery-dark-evaluation.md` as a historical baseline.

---

## 4. Material Palette (Tactility)

All UI elements must represent real, structural materials. Digital-only effects are prohibited.

* The Canvas: Mimics solid base materials—warm linen/chalk plaster (Light) or textured stone/charcoal (Dark).
* The Cards/Surfaces: Flat, solid matte planes (plaster, stone, slate) that are only 2–3% lighter or darker than the background canvas. No transparent glassy overlays.
* The Seams (Dividers/Borders): Microscopic hairline boundaries (`1px`) representing material joins. Always low-contrast (10–12% opacity of the text color).
* Texturing: Overlaid with a subtle noise/grain filter (`opacity: 0.02 - 0.03`) to eliminate flat, synthetic digital pixels.

---

## 5. Photography Rules

Photography is the ultimate hero. The interface yields to the image.

* Light Quality: Soft, diffused natural overcast daylight, or low-angle morning sunlight. No high-contrast studio flash, artificial colors, or staged models.
* Color Grading: Uniform, desaturated, organic tones. Limestone grays, weathered oak brown, copper green.
* Aspect Ratios: Strict geometric layout bounds. Enforce a `3:4` vertical crop for architectural detail shots, and a `16:9` crop for wide, cinematic spatial views. Ratios must never be mixed arbitrarily in the same scroll track.

---

## 6. Typography Rules

Typography is structural. Like columns and beams, it creates the grid.

* The Display Font: *Cormorant Garamond* (Classical Display Serif). Used strictly for main headlines and narrative statements.
* The Body/Structural Font: A low-contrast, highly readable Grotesque (such as *Inter* or *Instrument Sans*). Used for all body paragraph copy, forms, and metadata.
* Letter Spacing (Tracking):
  * Display Titles: Tightly kerned (`-0.02em` to `-0.04em`) to feel custom-carved.
  * Body Paragraphs: Neutral (`0em`).
  * Uppercase Labels / Kickers: Extremely wide tracking (`0.15em` to `0.2em`) rendered in small caps (base `10px - 11px`) to mimic chiseled stone inscriptions.
* Paragraph Width: Max-width constrained to `60–70 characters` (approx. `max-w-xl` to `max-w-2xl` in layout blocks) to prevent horizontal tracking fatigue.

---

## 7. Composition Grammar & Negative Space

Proportion and asymmetry dictate our layouts.

* The Pauses (Design Silence): Negative space is load-bearing. Introduce vast empty spaces (`20vh` to `30vh` vertical margins) where nothing exists except the background canvas texture, framing photography like art in a museum.
* Editorial Asymmetry: Symmetrical grids are banned for storytelling. Cards must be staggered off-center, text blocks must overlap empty columns, and captions must sit offset from their corresponding images.
* The Rhythm Cadence: Alternating weights to guide the eye:
  $$\text{Silence} \longrightarrow \text{Small Detail Label} \longrightarrow \text{Full-Bleed Image} \longrightarrow \text{Obsidian Gap} \longrightarrow \text{Serif Statement}$$
* The 3/30 Rule: **Every section must be skimmable in 3 seconds and rewarding in 30 seconds.** This forces two layers of design:
  * *Immediate comprehension* (visual hierarchy and rhythm).
  * *Slow appreciation* (material craft, typography, and detail).

---

## 8. Interaction & Motion Philosophy

> **"Photography owns attention. Interface owns clarity."**

* Interactive Accent Discipline: We do not use accent colors to decorate. Accents are used purely to communicate active interactive states and focus clarity. Accent usage is limited to a single material color (e.g., raw copper or bronze) occupying less than 5% of the viewport.
* Kinetics (Motion): Animations must simulate physical mass, weight, and friction. Use custom decelerating ease curves (e.g., `cubic-bezier(0.22, 1, 0.36, 1)`). Bouncing, bouncing arrows, and fast sliding slide-ins are banned.
* The Pocket Door Slide: Navigation transitions must mimic the heavy, silent movement of wooden pocket doors sliding into plaster walls.

---

## 9. Signature Moments (Max Three)

We only animate three curated, high-end experiences:

1. The Reveal (The Entrance): A slow, curtain-like vertical wipe on initial page load, simulating natural light slowly filling a dark architectural room.
2. The Material Hover: Hovering over a portfolio item triggers a slow, imperceptible image scale-up (`scale: 1.02` over `1.5s`) inside a sharp crop mask, while the caption fades in silently.
3. The Workspace Transition: Cross-fading from the editorial pages to the Estimator drafting desk is executed as a gradual lighting cross-fade, dissolving shadows into a clean, flat, shadowless studio light.

---

## 10. The Anti-Patterns (Things We Never Do)

* **NO** multiple button shapes (mixing sharp rectangular buttons and rounded pills).
* **NO** glowing text gradients or heavy CSS drop shadows on headings.
* **NO** transparent glassmorphic content cards (reserve glass solely for navigation overlays).
* **NO** radial background glowing orbs or neon backdrop colors.
* **NO** blocky 2px Lucide icons inside buttons or labels (use text-only triggers).
* **NO** floating widgets (WhatsApp, floating side dots, progress tickers) overlapping content.
* **NO** abrupt light/dark theme shifts between route navigation.

---

## 11. Validation Metrics

Visual decisions must be measurable. Alongside DQI (Design Quality Index) and DCD (Design Consistency Debt), we evaluate compositions using the **Attention Purity Index (API)**.

* **Definition:** Percentage of participants whose first fixation lands on the intended focal point.
* **Target:**
  * **Hero:** >90% first fixation on photography/headline.
  * **Workspace:** >90% first fixation on the primary decision.
  * **Gallery:** >90% first fixation on the image.

The API measures whether our compositions are actively directing attention as intended, or whether decorative UI is competing with content.
