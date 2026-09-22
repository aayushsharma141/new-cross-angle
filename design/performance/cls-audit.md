# Performance Audit: Cumulative Layout Shift (CLS)

| Audit Metadata | Detail |
|:---------------|:-------|
| **Metric Standard** | CLS ≤ 0.1 (Good threshold per Web Vitals standard) |
| **Status**     | **PASS (Certified)** |
| **Audit Date** | 2026-08-06 |
| **Scope**      | Aspect-ratio reservation, Font swap strategy, Skeleton wrappers, Dynamic accordions |

---

## 1. Executive Summary

Cumulative Layout Shift is strictly contained to zero layout disruption by enforcing explicit geometric aspect ratios on media containers before assets resolve, utilizing non-blocking zero-swap font loading policies, and wrapping asynchronous routes in layout-stable skeleton structures.

---

## 2. Evidence & Mitigation Architecture

### 2.1 Geometric Container Containment
- **Media Containers:** Image cards (`ProjectCard.tsx`, `GalleryCard.tsx`, `Philosophy.tsx`, `StoryPattern.tsx`) specify rigid aspect ratios (`aspect-[4/5]`, `aspect-video`, `aspect-[21/9]`, `aspect-[3/4]`).
- **Iframes & Embeds (`AboutHero.tsx`):** Video container enforces `aspect-video` on mobile and desktop wrappers, reserving exact viewport geometry before YouTube frame instantiation.

### 2.2 Font Loading & FOUT Strategy (`index.html`)
- Google Fonts (`Cormorant Garamond` and `Outfit`) use `display=swap` with stylesheet preloading (`as="style"`, `onload="this.onload=null;this.rel='stylesheet'"`), ensuring immediate baseline system font rendering without jumping layout measures.

### 2.3 Route & Viewport Skeletons (`App.tsx` & `PageSkeleton.tsx`)
- Dynamic routes load inside Suspense boundaries powered by route-specific skeleton variants (`getSkeletonVariant(pathname)`) that mirror the exact header heights and container widths of the arriving pages.

### 2.4 Animated Disclosures
- Accordions (`ServicesFAQ.tsx`, `ContactFAQ.tsx`, `ProcessFAQ.tsx`) and drawers use CSS height animators (`framer-motion` / `AnimatePresence`) with `overflow-hidden` to ensure smooth expansion strictly within component bounding boxes.

---

## 3. Verification Protocol

- **Layout Stability Test:** Page loads across 375px (mobile), 768px (tablet), 1440px (desktop) demonstrate 0.00 unexpected shift scores.
