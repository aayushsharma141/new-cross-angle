# CrossAngle Design System Specification

**Status:** Implementation Blueprint  
**Scope:** UI Components, Tokens, & Figma Library  

> **This document is the literal translation of the Art Direction Bible into code and components.**

---

## 1. The 3-Layer Token Architecture

To ensure strict visual governance, we use a 3-layer architecture. **Components must NEVER consume Foundation tokens directly.**

### Layer 1: Foundation Tokens
Raw HSL values representing the physical material palette.
- `stone-50`: `#F5F3EF` (Warm chalk plaster)
- `stone-100`: `#EDEAE4` (Aged linen)
- `charcoal-900`: `#1A1A1A`
- `charcoal-500`: `#5A5A5A`
- `copper-600`: `#C41230` (Base Red)
- `gold-400`: `#D1AF6E` (Highlight Gold)

### Layer 2: Semantic Tokens
The functional roles of colors. Components consume these.
- `--canvas-primary`: Base background for all pages.
- `--canvas-secondary`: Alternate background for section distinction.
- `--surface-card`: Background for elevated panels.
- `--text-primary`: Primary reading text and headlines.
- `--text-secondary`: Metadata, captions.
- `--border-subtle`: Material join seams (`rgba(26,26,26,0.1)`).
- `--accent-copper`: Primary interactive color.

### Layer 3: Lighting Environments
CSS classes applied to a parent container that remap Semantic tokens without changing component code.
- `.gallery` (Default): `canvas-primary` maps to `stone-50`.
- `.workspace`: `canvas-primary` maps to `#FFFFFF` (Pure white for high-focus form entry).

---

## 2. Typography System

### A. Font Families
- **Display:** *Cormorant Garamond* (Self-hosted).
- **Body/UI:** *Inter* (Self-hosted).

### B. Typographic Scale & Tracking
| Role | Font | Size (clamp) | Tracking (Letter Spacing) | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Hero)** | Garamond | `3rem` to `5.5rem` | `-0.03em` | `1.1` |
| **H2 (Section)** | Garamond | `1.8rem` to `3.2rem` | `-0.02em` | `1.2` |
| **H3 (Component)**| Garamond | `1.4rem` to `2rem` | `-0.01em` | `1.2` |
| **Body (P)** | Inter | `1rem` (16px) | `0em` | `1.6` |
| **Label/Meta** | Inter (Medium)| `0.6875rem` (11px)| `0.2em` (Uppercase) | `1.4` |

---

## 3. Component Inventory & Specifications

### A. Buttons
- **Primary Button (`ButtonPrimary`):** 
  - Background: `--accent-copper` (Base red transitioning to sliding gold gradient on hover).
  - Text: White, Inter Medium, `14px`, tracking `0.05em`.
  - Shape: Sharp rectangle (no `rounded-full` pills allowed).
  - Hover: Inner gradient slide, NO scaling, NO drop shadow.
- **Ghost Button (`ButtonGhost`):**
  - Background: Transparent.
  - Border: `1px solid --text-primary`.
  - Text: `--text-primary`.
  - Hover: Background fills with `--text-primary`, Text becomes `--canvas-primary`.
- **Text Link (`TextLinkArrow`):**
  - Text: `--text-primary`, Inter Medium.
  - Suffix: Arrow icon (`->`).
  - Hover: Arrow translates X by `4px` with cubic-bezier ease.

### B. Inputs & Forms
- **Text Input (`Input`):**
  - Background: Transparent (relies on container surface).
  - Border: Bottom border only (`1px solid --border-subtle`), converting to `--text-primary` on focus.
  - Label: Floating label (Inter, 11px, uppercase).
  - Focus Ring: `outline-none`, relies on border-color transition.
  - Error State: Border becomes `--accent-copper`, error text appears below (11px).

### C. Cards
- **Project Card (`ProjectCard`):**
  - Container: Sharp corners (`rounded-none`).
  - Image: `aspect-[3/4]` or `aspect-[16/9]`. `overflow-hidden`.
  - Hover (The Material Hover): Image scales to `1.02` over `1.5s`. Caption fades in `opacity-100`.
- **Testimonial Card (`TestimonialCard`):**
  - Container: `--surface-card`. Padding `p-8`.
  - Quote: Cormorant Garamond, Italic, `1.25rem`.

---

## 4. Spacing & Grid System

- **Editorial Grid:** 12-column CSS grid (`grid-cols-12`).
- **Section Margins:** `py-16` (mobile) to `py-24` (desktop).
- **Design Silence:** Empty `div` spacers of `h-[20vh]` to frame major narrative transitions.
- **Container Widths:**
  - Reading Text: `max-w-[65ch]`
  - Standard Content: `max-w-7xl` (`1280px`)
  - Full-Bleed: `w-full px-0`

---

## 5. Motion & Transitions

- **Global Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for all UI transitions.
- **Micro-interactions (Hover, Focus):** `duration-300`.
- **Macro-interactions (Page load, Layout shift):** `duration-800` to `duration-1400`.
- **Performance Rule:** Only animate `transform` and `opacity`. Never animate `height`, `width`, or `margin` directly unless using Framer Motion's `layout` prop.

---

## 6. Accessibility Patterns (WCAG AA)

- **Focus States:** For elements without custom borders, use `focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none`.
- **Cursor:** Apply `cursor-pointer` to all interactive surfaces (entire project cards, not just the title).
- **Icons:** All SVGs (Lucide) must have `aria-hidden="true"` if accompanied by text, or an `aria-label` if used as standalone buttons (e.g., slider arrows).
