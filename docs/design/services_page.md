# Services Page Layout Design History

This file tracks the design changes, layouts, and checkpoints for **Services Page Components** (e.g., `ServicesPage.tsx`, `ServicesProcess.tsx`, `ServicesWhyUs.tsx`).

---

## 1. Visual History Log

| Component | Checkpoint Tag | Version / Commit | Description & Design Highlights |
| :--- | :--- | :--- | :--- |
| **Commercial Section Heading** | `checkpoint/v10-services-page-wrap` | `HEAD` | **Office & Commercial in One Row:** Placed "Office & Commercial" in a `whitespace-nowrap` span to force it onto a single line in white, with "Interiors" underneath in light italic crimson. |
| **Methodology / Turnkey Process** | `checkpoint/v11-services-process-align` | `HEAD` | **Aligned Turnkey Process Header:** Increased the Turnkey Process header container width to `max-w-[950px]` so "The Turnkey Process We" stays on a single line on desktop without wrapping. |
| **Why Us Section Heading** | `checkpoint/v12-why-us-align` | `HEAD` | **Quality & Durability Aligned:** Scaled the heading text to `text-[clamp(2.2rem,3.8vw,3.8rem)]` and wrapped the statements in `lg:whitespace-nowrap` to ensure they render on two clean lines on desktop without wrapping. |

---

## 2. Key Code Diffs and Code Snippets

### A. Office & Commercial Header

```tsx
<span className="whitespace-nowrap">Office &amp; Commercial</span><br />
<em className="italic font-light text-site-crimson underline underline-offset-[12px] decoration-white/10 decoration-[4px]">Interiors</em>
```

### B. Turnkey Process Header Container

```tsx
<div className="max-w-[950px] mb-8 md:mb-0">
  ...
  <motion.h2 ...>
    The Turnkey Process We <br/> <span className="italic font-medium text-site-crimson underline ...">Follow For Every Project</span>
  </motion.h2>
</div>
```

### C. Why Us Header Aligned

```tsx
<motion.h2
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  className="font-display font-normal text-[clamp(2.2rem,3.8vw,3.8rem)] leading-[1.1] tracking-tight text-white mb-10"
>
  <span className="block lg:inline-block lg:whitespace-nowrap"><em className="italic text-site-crimson font-medium">Quality</em> You Can See.</span><br className="hidden lg:block" />
  <span className="block lg:inline-block lg:whitespace-nowrap">Durability You Can Trust.</span>
</motion.h2>
```
