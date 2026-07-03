# Crossangle Design Language Specification (DLS)
**Prepared by: Lead Creative Director (Wix Studio / Framer / Pentagram Persona)**
**Objective:** Establish a singular, non-negotiable visual language to unify the Crossangle product ecosystem into a premium architectural studio.

---

## 1. Brand Personality

**Emotional Direction:**
Architectural, Editorial, Quiet Luxury, Tactile, Timeless, and Restrained.

**The One-Sentence Mandate:**
*"Crossangle feels like stepping into a perfectly curated, high-end architectural gallery—where the interface is completely silent, allowing the materials, light, and geometry of the work to speak."*

---

## 2. Visual Principles

These are the 10 non-negotiable principles that dictate every design decision moving forward:

1. **Photography Before Decoration:** The interface is a canvas; the imagery is the art. UI elements must never compete with interior photography.
2. **Whitespace is Architectural:** Negative space is not "empty space"—it is the structural framing that makes content feel expensive.
3. **One Focal Point Per Viewport:** A screen must guide the eye to a single primary action or image at a time.
4. **Contrast Through Weight, Not Color:** Hierarchy is established by font-weight and opacity, not by introducing new saturated colors.
5. **Surfaces Over Effects:** Rely on clean borders, subtle lighting, and solid fills. Glassmorphism, glows, and heavy shadows are strictly prohibited.
6. **Limit Choices (The Rule of Three):** Never use more than three font sizes, three spacing intervals, or three opacities within a single view.
7. **Motion is Physical, Not Digital:** Animations must feel grounded in real-world physics (gravity, friction). Nothing should blink, flash, or float aimlessly.
8. **Asymmetry is Editorial:** Avoid symmetrical 3-column grids when telling a story. Use overlapping, offset, and staggered rhythms to create an editorial magazine feel.
9. **Typography as Structure:** Text doesn't just convey information; it creates the grid. Alignment and tracking must be mathematically precise.
10. **Radical Consistency:** A button on the homepage must share the exact geometry, hover state, and padding as a button deep inside the cost estimator.

---

## 3. Color Architecture

Instead of listing literal hex codes, this is the structural system for color distribution. Whether we adopt the "Midnight Stone" (Dark) or "Gallery Alabaster" (Light) theme, the ratios remain identical.

**Usage Distribution:**
* **85% Neutrals (The Void):** Backgrounds, deep surface shadows, and primary typography.
* **10% Structural (The Scaffolding):** Surface fills, low-opacity borders, and secondary/tertiary typography.
* **5% Accent (The Highlight):** Interactive elements, active states, and deliberate brand highlights.

**Color Hierarchy Rules:**
* **Backgrounds:** Never use pure `#000000` or pure `#FFFFFF`. Use deep charcoal/warm off-black or tinted cream/linen to reduce eye strain and simulate physical materials.
* **Typography:** `100%` contrast for display titles, `70%` for readable body copy, `40%` for metadata/labels.
* **Accent Usage:** Only ONE accent color is allowed per screen (e.g., Muted Gold or Deep Crimson, never both simultaneously).
* **System Colors (Success/Error):** Must be desaturated. A success state is a muted sage/emerald, not a bright neon green.

---

## 4. Surface Language

What makes a surface feel expensive? **Restraint and precision.**

* **Cards & Containers:** Flat, solid colors that are only 2-3% lighter or darker than the background.
* **Borders:** Extremely delicate. Always `1px` width with `10%` to `15%` opacity of the contrasting text color.
* **Corner Radius (Geometry):** Strict adherence to a rigid scale. We will adopt an **Architectural Sharp** language:
  * `0px` (Sharp) for large containers, images, and major sections.
  * `2px` or `4px` for buttons, inputs, and small interactive cards (to provide subtle tactile comfort without feeling "bubbly").
  * **Strictly Prohibited:** `rounded-2xl`, `rounded-[3rem]`, and completely pill-shaped `rounded-full` buttons.
* **Elevation & Shadows:** No large floating drop shadows. Elevation is implied through border contrast and extremely tight, ambient occlusion shadows (e.g., `box-shadow: 0 1px 3px rgba(0,0,0, 0.1)`).
* **Glass Usage:** Permitted *only* on fixed global elements (like the top navigation bar) to maintain context over scrolling images. Never use glass for standard content cards.

---

## 5. Typography System

The typography must shift from "SaaS Template" to "High-End Editorial."

* **Display Font:** An elegant, high-contrast serif (e.g., *Cormorant Garamond*, *Ogg*, *Playfair Display*).
* **Body/Structural Font:** A highly legible, geometric or grotesque sans-serif (e.g., *Inter*, *Plus Jakarta Sans*, *Helvetica Now*).
* **Scale:** A strict modular scale (Base `16px`, Ratio `1.250`).
* **Letter Spacing (Tracking):**
  * **Display Titles:** Tightly kerned (`-0.02em` to `-0.04em`) to feel bespoke and unified.
  * **Body Copy:** Neutral (`0em`).
  * **Uppercase Labels/Kickers:** Widely tracked (`0.15em` to `0.2em`) and always rendered in a bold/medium Sans-Serif at a small size (e.g., `10px` or `11px`).
* **Paragraph Width:** Constrained to `60-70 characters` (approx. `max-w-xl` to `max-w-2xl`) for optimal reading rhythm.
* **Line Height (Leading):** `1.1` for massive display titles, `1.6` for readable body paragraphs.

---

## 6. Layout Language

* **Grid System:** Fluid 12-column grid.
* **Container Widths:** A single maximum width across the entire site (e.g., `max-w-[1440px]`) with generous fluid side padding (`px-6 md:px-12 xl:px-24`).
* **Section Spacing:** Expansive and consistent. Minimum `120px` to `160px` vertical padding (`py-24` or `py-32`) between distinct sections.
* **Editorial Asymmetry:** Stagger content. Instead of a text block perfectly centered over an image, push the text to column 2-5 and the image to column 7-12. Allow elements to overlap the grid slightly.
* **Visual Balance:** If a section contains heavy, dark imagery on the right, the typography on the left must have enough size and weight to anchor the composition.

---

## 7. Motion Language

* **Philosophy:** Motion must be physical, intentional, and smooth.
* **Duration:** Between `400ms` (for micro-interactions) and `800ms` (for large page transitions or reveals).
* **Easing:** Custom cubic-bezier (e.g., `cubic-bezier(0.22, 1, 0.36, 1)`) for a luxurious, decelerating slide.
* **Hover Behavior:** 
  * Buttons: Subtle scale-down (`scale: 0.98`) to mimic physical pressing, or a color fill transition.
  * Images: Slow, subtle scale-up (`scale: 1.03` over `1.5s`) inside a hidden-overflow container.
* **Prohibited Animations:** Bouncing, infinite pulsating glows, erratic flashing, or elements sliding in from massive distances (`y: 200`). Keep initial transform offsets small (e.g., `y: 20` or `y: 30`).

---

## 8. Component Language

All components must belong to the exact same family, regardless of whether they are on the marketing site or inside the estimator tool.

* **Buttons:**
  * **Primary:** Solid background, contrasting text, sharp or `4px` radius, uniform padding (e.g., `px-8 py-4`).
  * **Secondary:** Transparent background, `1px` border, uniform padding.
  * **Typography:** `11px` or `12px` Sans-Serif, Uppercase, `tracking-[0.15em]`, Medium/Bold.
* **Inputs & Forms:** Minimalist. A flat, low-opacity background fill (`bg-white/5` or `bg-black/5`) with a `1px` border that highlights on focus. No thick rings.
* **Cards:** Flat, 1px subtle border, uniform inner padding (`p-8` or `p-10`).
* **Badges/Tags:** Small, rectangular (`rounded-sm`), muted background fill, uppercase text.
* **Testimonials:** Clean, editorial pull-quotes. Remove oversized, low-opacity "Quote Icon" graphics floating in the background.

---

## 9. Photography Direction

* **Color Grading:** All photography (whether portfolio or stock) must be passed through a uniform color grade to match the chosen theme (e.g., lowering saturation by 10%, adding a slight warm cinematic tint).
* **Cropping & Ratios:** Enforce strict aspect ratios. E.g., `3:4` for vertical portraits/details, `16:9` for cinematic hero shots. Do not mix ratios arbitrarily in a grid unless it is a deliberate masonry layout.
* **Content:** Focus on light rays, material textures (wood grain, marble veining), and structural geometry.
* **Human Presence:** Abstracted. Show a blurred figure walking through a space rather than a posed stock model staring at the camera.

---

## 10. Anti-Patterns (NEVER DO THIS)

* **DO NOT** use multiple button shapes (mixing pills, rounded corners, and sharp edges).
* **DO NOT** apply heavy CSS text-shadows (`text-shadow: 0 10px 30px...`) to headings.
* **DO NOT** place radial gradient glowing orbs behind cards or text.
* **DO NOT** use saturated Crimson and saturated Gold in the exact same viewport.
* **DO NOT** use glassmorphism (`backdrop-blur`) on standard content cards; reserve it strictly for floating navigational elements.
* **DO NOT** change the background theme color (Dark to Light) abruptly when navigating between core features (e.g., Homepage to Estimator).
* **DO NOT** have multiple floating widgets overlapping in the corners (e.g., WhatsApp + Scroll Progress + Page Dots).

---

## 11. Design Tokens Blueprint (Rules Only)

**Colors (Semantic):**
* `bg.canvas` (The absolute background)
* `bg.surface` (Cards and panels, slightly offset from canvas)
* `border.subtle` (Hairline dividers, 10% opacity)
* `text.display` (High contrast, headings)
* `text.body` (Mid contrast, paragraphs)
* `text.muted` (Low contrast, labels/metadata)
* `brand.accent` (The single primary brand color)

**Spacing (Base 8):**
* `space.3xs` (4px), `space.2xs` (8px), `space.xs` (16px), `space.sm` (24px), `space.md` (32px), `space.lg` (48px), `space.xl` (64px), `space.2xl` (96px), `space.3xl` (144px).

**Radii (Architectural Scale):**
* `radius.none` (0px)
* `radius.sm` (2px)
* `radius.md` (4px)
* *No further radii permitted.*

---

## 12. Consistency Audit & Migration Strategy

### Audit Against the New DLS
* **Aligns:**
  * Component-based React architecture is well structured.
  * Motion libraries (Framer Motion) are installed and capable of the required physics.
  * The conceptual intent of the Discovery / Estimator tools is highly premium.
* **Violates:**
  * **Theme:** The dark homepage vs. light estimator violates the unified color architecture.
  * **Surfaces & Radii:** The usage of `rounded-2xl`, `rounded-[3rem]`, and glassmorphism directly violates the architectural surface and radius language.
  * **Typography:** Current font implementation and heavy shadows violate the editorial typography principles.
  * **Buttons:** Button geometry is fragmented across 4 different styles.

### Migration Strategy & Implementation Order
**Do not execute simultaneously. Follow this strict sequence:**

1. **Phase 1: Token Unification & Purge (High Impact)**
   * Remove all text-shadows, radial background glows, and glassmorphism from standard cards.
   * Strip arbitrary corner radii (`rounded-[...]`) and enforce `rounded-none` or `rounded-sm` globally.
   * Unify button classes into a single, reusable component format.
2. **Phase 2: Theme Alignment**
   * Select the unified theme (e.g., transition the Estimator/Discovery flows to match the Dark Architectural theme of the marketing site, OR vice versa).
   * Map all backgrounds, text colors, and borders to the new strict neutral-heavy palette.
3. **Phase 3: Typographic Overhaul**
   * Integrate the chosen Editorial Serif (for display) and Geometric Sans (for body/labels).
   * Audit all uppercase tracking and line heights.
4. **Phase 4: Spacing & Layout Stabilization**
   * Implement the unified container widths (`max-w-[1440px]`).
   * Standardize all vertical section padding to `py-24` or `py-32`.
5. **Phase 5: Refinement & Motion**
   * Update easing curves and hover states to match the physical motion philosophy.
   * Consolidate and minimize floating action widgets.
