# Homepage Design & Layout History

This file tracks the design variations, sections, and layout checkpoints for the **Main Website Homepage** (`apps/web/src/components/home/`).

---

## 1. Visual History Log

| Component | Checkpoint Tag | Version / Commit | Description & Design Highlights | Visual Reference / Links |
| :--- | :--- | :--- | :--- | :--- |
| **Hero** | `checkpoint/home-hero-curated` | `HEAD` | **Curated Minimal Hero:** Large typography, plain wordmark logo header integration, clean CTA triggers, and premium fading image background. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/home/Hero.tsx) |
| **Hero Trust Chips** | `checkpoint/v-pre-homepage-research-improvements` | `HEAD` | Added **Google Rating chip** (4.9★ · 200+ Google Reviews) to the hero trust strip using a gold Star icon, matching existing chip styling. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/home/Hero.tsx) |
| **Services** | `checkpoint/v-pre-homepage-research-improvements` | `HEAD` | Added **neighborhood callout line** ("Serving Jamshedpur · Kolkata · Mango · Bistupur · Sakchi · Adityapur") below the section heading for local trust signaling. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/home/Services.tsx) |
| **HomeBlog** | `checkpoint/v-pre-homepage-research-improvements` | `HEAD` | **New section:** Top 3 latest published blogs rendered in a premium editorial grid (1 featured + 2 side posts). "View All Articles" CTA links to /blog. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/home/HomeBlog.tsx) |
| **TactileJourney** | `checkpoint/tactile-carousel` | `HEAD` | **Interactive Tactile Carousel:** Showcase of fine textures, marble grains, oak panels, and luxury fabrics with responsive layout configurations. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/home/TactileJourney.tsx) |
| **BeforeAfterShowcase** | `checkpoint/slide-reveal` | `HEAD` | **Premium Slide Splitter:** Visual comparison of before/after interior transformations with custom dragging split handles. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/home/BeforeAfterShowcase.tsx) |
| **Testimonials** | `checkpoint/testimonial-slider` | `HEAD` | **Clean Slider:** Single-row high contrast client testimonials with location tag elements. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/home/Testimonials.tsx) |

---

## 2. Key Code Diffs and Code Snippets

### A. Before/After Split Handle Structure
```tsx
<div 
  className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-30 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
  style={{ left: `${sliderPosition}%` }}
>
  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-[#e8e4dd] flex items-center justify-center shadow-lg">
    <ArrowLeftRight size={14} className="text-[#70593a]" />
  </div>
</div>
```
