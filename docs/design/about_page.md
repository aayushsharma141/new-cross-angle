# About Page Design & Layout History

This file tracks the design variations, sections, and layout checkpoints for the **About Page** (`apps/web/src/pages/AboutPage.tsx` and sub-components in `apps/web/src/components/about/`).

---

## 1. Visual History Log

| Component | Checkpoint Tag | Version / Commit | Description & Design Highlights | Visual Reference / Links |
| :--- | :--- | :--- | :--- | :--- |
| **AboutHero** | `checkpoint/about-aesthetic-overhaul` | `HEAD` | **Luxury Glass Cursor Hero:** Integrated directional-aware linear-gradient ellipse ripples, radial gold/crimson speed-adaptive glow aura, and a glass-circle cursor. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/components/about/AboutHero.tsx) |
| **AboutPage Layout** | `checkpoint/about-aesthetic-overhaul` | `HEAD` | **Option 1 Aesthetics Overhaul:** Enhanced all section backdrops, introduced dynamic HSL borders, micro-animations, architectural outline grids, cascading delays, and soft glow auras. | [View Component](file:///c:/Users/aayus/Desktop/main/apps/web/src/pages/AboutPage.tsx) |

---

## 2. Key Code Diffs and Code Snippets

### A. Luxury Glass Cursor Details

```tsx
const ring = ctx.createLinearGradient(
  cur.x - 8, cur.y - 8,
  cur.x + 8, cur.y + 8
);
ring.addColorStop(0, `rgba(255,255,255,${op.toFixed(3)})`);
ring.addColorStop(1, `rgba(255,215,120,${op.toFixed(3)})`);
ctx.strokeStyle = ring;
ctx.lineWidth   = 1.2;
ctx.stroke();
```
