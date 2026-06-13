# Global Layout & Brand Design History

This file tracks the design changes, layouts, and checkpoints for **Global Layout Components** (e.g. `Navbar.tsx`, `Footer.tsx`, `FixedSocialBar.tsx`, logo dimensions, brand assets).

---

## 1. Visual History Log

| Component | Checkpoint Tag | Version / Commit | Description & Design Highlights | Visual Reference / Links |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Navbar** | `checkpoint/logo-nav-curated` | `HEAD` | **Plain Borderless inline Logo:** standard borderless inline brand wordmark (`CROSSANGLE INTERIOR`). Fully responsive navigation blocks. | [View Nav Screenshot](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/a6a439f8-f3f3-41f3-beb4-bb395aaefa4d/enlarged_logo_nav_1779822251010.png) |
| **Unified Brand Logo** | `checkpoint/v5-logo-unification` | `HEAD` | **Standard Unification:** Logo unified across Public Navbar, Admin Sign-in (`AdminAuth.tsx`), Discovery Welcome (`WelcomeScreen.tsx`), and Estimator (`PriceEstimator.tsx` / `CostEstimator.tsx`) with consistent flex structure, image sizing, transition, and spacing. | [View Layout Segment](file:///c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/components/WelcomeScreen.tsx#L207-L222) |
| **Footer CTA & Watermark** | `checkpoint/v6-pointed-arrow-footer-cta` | `HEAD` | **Pointed Arrow & Max Watermark:** Removed subtitle/secondary button. Placed single red `Get Estimate →` pointed-arrow CTA pill next to the main header (`md:justify-between`). Maximized the giant `CROSSANGLE` watermark background at the bottom. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/layout/Footer.tsx) |
| **Footer Grid Lines** | `checkpoint/v7-borderless-footer-grid` | `HEAD` | **Borderless Columns & Rows:** Removed the geometric vertical column separators (`md:border-r`) and horizontal mobile borders (`border-b`) from `FooterSection` columns and rows to create a cleaner, more continuous luxury visual flow. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/layout/Footer.tsx) |
| **Footer Alignment & Separators** | `checkpoint/v8-footer-alignment-refinement` | `HEAD` | **Alignment Refinement & Separator Removal:** Changed the footer container padding from `px-[6vw]` to the global `container-wide mx-auto px-4 sm:px-6 lg:px-10` configuration to match the Navbar. Applied `md:pl-0` to the first column (STUDIO) and `md:pr-0` to the last column (SOCIALS) to align links with page margins. Removed vertical pipe separators (`\|`) in the copyright bar. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/layout/Footer.tsx) |
| **Language Toggle** | `checkpoint/lang-pill-accessible` | `HEAD` | **High-contrast EN / HINGLISH Switcher:** Rounded pill layout in nav. Swaps translation contexts globally instantly with clear aria-pressed accessible statuses. | [View Component](file:///c:/Users/aayus/Desktop/main/addons/discovery/components/WelcomeScreen.tsx#L233-L250) |
| **CRM Leads Panel** | `checkpoint/crm-layout-cleanup` | `HEAD` | **Premium Visual Refinement:** Cleaned up duplicate headers, portaled actions to top-right using `ModuleActions`, and eliminated nested vertical scrollbars via custom `contentClassName` on `AdminTabSlider`. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/pages/admin/AdminLeads.tsx) |
| **FixedSocialBar** | `checkpoint/socialbar-stacking-fix` | `HEAD` | **Layout Stacking & Z-Index Hoisting:** Hoisted the `<FixedSocialBar />` out of `<main>` and other local stacking context wrappers to the page root level across all pages, and boosted its z-index to `z-[99]`. This prevents clipping/overlapping by the relative-positioned footer (`z-20`). | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/layout/FixedSocialBar.tsx) |
| **Unified Brand Logo Colors** | `checkpoint/v9-logo-color-swap` | `HEAD` | **Base Red & Sliding Gold Gradient:** Swapped the base and sliding highlight colors of the unified metallic logo gradient. Main logo base color is now red (`#C41230`) and the sliding highlight is golden (`#D1AF6E`). Also updated custom overrides in `BlueprintPage.tsx` and `AdminAuth.tsx` to align with the new base brand color. | [View CSS Gradient](file:///c:/Users/aayus/Desktop/main/apps/web/src/index.css#L747-L757) |
| **Footer CTA Restructure** | `checkpoint/v13-footer-cta-center` | `HEAD` | **Centered Footer CTA:** Replaced the split two-column footer layout with a centered single-column layout. Centered the heading, removed the subtext description, and moved both CTA buttons directly below it. | [View Footer](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/layout/Footer.tsx) |
| **Footer CTA Aesthetics** | `checkpoint/v14-footer-cta-aesthetic` | `HEAD` | **Fit Text in Single Line & Enhanced Aesthetics:** Wrapped footer headline in `md:whitespace-nowrap` and scaled font clamp to `text-[clamp(2.2rem,4.2vw,4.5rem)]` to fit on a single line. Added a pulse badge ("The Next Step"), a soft ambient red radial glow, and premium drop shadows on hover. | [View Footer](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/layout/Footer.tsx) |
| **Private Invite Popup** | `checkpoint/v15-welcome-prompt-pre-minimize` | `HEAD` | **Minimalist Welcome Prompt:** Scaled logo icon to `h-16`, passed custom `text-[11px] tracking-[0.25em]` to logo wordmark, minimized copy texts, hid input label visually via `sr-only`, simplified DPDPA compliant footer. | [View Modal](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/shared/WelcomePrompt.tsx) |

---

## 2. Key Code Diffs and Code Snippets

### A. Curated Brand Logo Nav Markup

```tsx
<a
  href="/"
  className="flex items-center gap-2.5 text-[#1a1a1a] hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[#80643e] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
  aria-label="Return to CrossAngle Home"
>
  <img src={logoIcon} alt="CrossAngle Logo" className="h-7 w-auto shrink-0" />
  <AnimatedLogo isScrolled={true} className="text-[#1a1a1a] [&_span]:text-[#1a1a1a] font-serif font-semibold tracking-wide text-lg" />
</a>
```
