# Welcome Screen Design & Layout History

This file tracks the design changes, layouts, and git checkpoints specifically
for the **Aesthetic Discovery welcome page**
(`apps/web/src/addons/discovery/components/WelcomeScreen.tsx`).

---

## 1. Visual History Log

| Iteration       | Checkpoint Tag               | Commit / Reference | Description & Key UI Elements                                                                                                                                                                                                                                                                                                                      | Screenshots / References                                                                                                                                                                           |
| :-------------- | :--------------------------- | :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#1**          | `checkpoint/v1-dark-meteors` | `f3d89712`         | **Initial Dark Theme:** Pitch dark canvas, animated floating neon gradient cards, `Meteors` stars falling, retro-grid lines, double columns vertical text stats boxes, and bouncing scroll wheel indicator.                                                                                                                                        | [View Screenshot](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/a6a439f8-f3f3-41f3-beb4-bb395aaefa4d/welcome_screen_initial_1779742843390.png)                                              |
| **#2**          | `checkpoint/v2-light-aurora` | `e71e3e91`         | **Light Aurora Theme:** Transitioned to warm light cream base (`#faf8f5`), plain borderless inline header logo, vertical stats cards, scrolling scroll-wheel indicator, and living `SoftAurora` active background canvas.                                                                                                                          | [View Screenshot](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/a6a439f8-f3f3-41f3-beb4-bb395aaefa4d/welcome_screen_init_1779893163805.png)                                                 |
| **#3**          | `checkpoint/v3-zen-wizard`   | `3738c52f`         | **Minimalist Zen Wizard:** Immersive 3-step wizard (Steps 0, 1, 2) that fits the entire screen area, high-contrast stats boxes adjusted into a clean single-row, no scroll-wheel indicator, scrollable landing sections removed.                                                                                                                   | [View Screenshot](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/a6a439f8-f3f3-41f3-beb4-bb395aaefa4d/welcome_screen_step_0_1779894073942.png)                                               |
| **#4**          | `checkpoint/v4-full-hybrid`  | `aaab1936`         | **Active Full Hybrid Layout:** Combines the immersive Zen Step 0 Hero & single-row high-contrast stats with the full-length scrollable landing page sections (Five-input `AnimatedBeam` nodes, Literary quote, Archetypes cards, and Bottom interior background CTA with backdrop-blurs). Steps 1 & 2 render as clean fullscreen focused overlays. | [View Screenshot](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/a6a439f8-f3f3-41f3-beb4-bb395aaefa4d/.tempmediaStorage/media_a6a439f8-f3f3-41f3-beb4-bb395aaefa4d_1779894073503.png) |
| **#5** (Active) | `checkpoint/v5-soft-aurora-bg` | `HEAD`             | **SoftAurora Living Background:** Replaced particle network background on the landing page with the living `SoftAurora` canvas background (gold `#c8a96e`, green `#5a705e`, cream `#faf8f5`) at 25% opacity with mouse interactions. | [View Active Screenshot](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/f9a685bb-5c33-44b9-8c01-dbc508bf65c1/discovery_engine_welcome_1781782506238.png) |

---

## 2. Key Code Diffs and Code Snippets

### A. The Five-Input `AnimatedBeam` Nodes (Active in v4)

```tsx
const inputNodes = [
  {
    ref: node1,
    icon: Sun,
    label: lang === "hi" ? "Daily Habits" : "Daily Habits",
  },
  {
    ref: node2,
    icon: Layers,
    label: lang === "hi" ? "Image Picks" : "Image Picks",
  },
  {
    ref: node3,
    icon: Leaf,
    label: lang === "hi" ? "Material Sense" : "Material Sense",
  },
  {
    ref: node4,
    icon: Lamp,
    label: lang === "hi" ? "Light Calibration" : "Light Calibration",
  },
  {
    ref: node5,
    icon: BookOpen,
    label: lang === "hi" ? "Word Mapping" : "Word Mapping",
  },
];
```

### B. Custom Archetypes Top Gradient Line Hover Cards (Active in v4)

```tsx
{
  archetypes.map((arch) => (
    <div
      key={arch.name}
      className="relative bg-white border border-[#e8e4dd] p-7 rounded-2xl flex flex-col justify-between min-h-[220px] transition-all duration-500 shadow-sm hover:shadow-lg hover:border-[#70593a]/30 group overflow-hidden"
    >
      {/* Sub-hover ambient pastel glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${arch.palette[0]}, ${
            arch.palette[1]
          })`,
        }}
      />
      ...
    </div>
  ));
}
```
