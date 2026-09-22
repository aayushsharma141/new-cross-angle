# Contact Page Design History

## Active Iteration: v2.6-height-standardization
**Git Tag:** `checkpoint/v2.6-contact-step3-equal-height`
**Commit:** `redesign(contact): strict height symmetry on step 3`

---

## v1 — Original (Pre-redesign)
**Checkpoint:** `checkpoint/v1-contact-original`

### Structure
- 5 separate stacked sections: `ContactHero` → `CTAContact` → `InteractiveMap` → `ContactFAQ` → `SocialBar`
- Each section had its own background + padding, creating visual disconnection

### Issues Identified
- ContactHero was redundant — cinematic hero with just two buttons before the actual form
- Map was 65vh full-bleed, feeling like a page-break
- SocialBar was 6 full SpotlightCards — heavy and cluttered at bottom
- 4 separate contact info boxes scattered in sidebar
- Cognitive overload: too many competing visual weight centers

---

## v2 — Full Redesign
**Commit:** `e7df0b2c`

### Key Changes
1. **ContactHero → stub** — merged its page title role into CTAContact's inline header block
2. **CTAContact** — premium centred header with outlined "Project" text and trust pills; contact info collapsed to single elegant list card with icon blocks
3. **InteractiveMap** — reduced from 65vh to `clamp(280px, 38vw, 440px)` compact rounded card with slim "Find Us" header
4. **ContactFAQ** — tightened to max-w-3xl, unified rounded card container with `divide-y`, softer opacities
5. **SocialBar** — from 6 large cards to a minimal pill-strip row at page bottom
6. **Form Card Bottom-Height Symmetry** — added `lg:h-full`, `lg:flex lg:flex-col`, and `lg:flex-1` classes so the left-column form matches the right-column stacked height perfectly on desktop, with footer buttons pinned dynamically using `lg:mt-auto` across all 3 steps.

---

## v2.6 — Strict Height Standardization (Active)
**Checkpoint:** `checkpoint/v2.6-contact-step3-equal-height`

### Key Changes
1. **Strict Height Limit:** Set a rigid height of `h-[630px]` on the form card globally.
2. **Step 3 Optimization:**
   - Reduced budget cards' min-height from `min-h-[80px]` to `min-h-[64px]` and padding to `px-3 py-2` to fit 2x2 grid nicely.
   - Reduced textarea rows to `3` and min-height from `min-h-[120px]` to `min-h-[88px]`.
   - Tightened element margins with `space-y-4` and `mb-4`.
3. **Alignment Benefit:** All 3 steps are now perfectly uniform and do not extend downwards, maintaining full bottom-height symmetry with the right-column list at exactly 630px.

### Visual Properties (Active)
- H1: serif, `clamp(2.8rem,6vw,5.5rem)`, "Project" in outlined stroke treatment
- Form card: `rounded-[28px]`, `bg-[#0A0A0A]/70`, `backdrop-blur-2xl`, rigid `h-[630px]`
- Bypass + info cards: `rounded-[24px]`, `bg-[#0A0A0A]/60`
- Map: `rounded-[24px]`, `clamp(280px, 38vw, 440px)` height
- FAQ: `max-w-3xl`, `rounded-[24px]`, unified divide-y container
- Social: flat pill strip, `rounded-full`, no card backgrounds
- Page sections: 4 total (Form → Map → FAQ → Socials)

