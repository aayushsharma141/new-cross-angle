# Global Layout & Brand Design History

This file tracks the design changes, layouts, and checkpoints for **Global Layout Components** (e.g. `Navbar.tsx`, `Footer.tsx`, `FixedSocialBar.tsx`, logo dimensions, brand assets).

---

## 1. Visual History Log

| Component | Checkpoint Tag | Version / Commit | Description & Design Highlights | Visual Reference / Links |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Navbar** | `checkpoint/logo-nav-curated` | `HEAD` | **Plain Borderless inline Logo:** standard borderless inline brand wordmark (`CROSSANGLE INTERIOR`). Fully responsive navigation blocks. | [View Nav Screenshot](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/a6a439f8-f3f3-41f3-beb4-bb395aaefa4d/enlarged_logo_nav_1779822251010.png) |
| **Unified Brand Logo** | `checkpoint/v5-logo-unification` | `HEAD` | **Standard Unification:** Logo unified across Public Navbar, Admin Sign-in (`AdminAuth.tsx`), Discovery Welcome (`WelcomeScreen.tsx`), and Estimator (`PriceEstimator.tsx` / `CostEstimator.tsx`) with consistent flex structure, image sizing, transition, and spacing. | [View Layout Segment](file:///c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/components/WelcomeScreen.tsx#L207-L222) |
| **Footer** | `checkpoint/footer-quick-links` | `HEAD` | **Curated Quick Links Layout:** Added comprehensive layout splits for footer quick links, service pages, portfolio showcase, contact triggers, and copy/privacy blocks. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/layout/Footer.tsx) |
| **Language Toggle** | `checkpoint/lang-pill-accessible` | `HEAD` | **High-contrast EN / HINGLISH Switcher:** Rounded pill layout in nav. Swaps translation contexts globally instantly with clear aria-pressed accessible statuses. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/components/WelcomeScreen.tsx#L233-L250) |

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
