# Prototype Archive: Gallery Dark

## Experiment Context

This prototype was evaluated against "Gallery Light" to determine the global lighting state of CrossAngle Interior.

## Evaluation Results

| Metric | Dark | Light | Winner |
| - | - | - | - |
| Photography dominance | 9 | 7 | Dark |
| Emotional trust | 8 | 9 | Light |
| Reading comfort | 6 | 9 | Light |
| Premium perception | 9 | 8 | Dark |
| Brand fit | 7 | 9 | Light |
| Workspace continuity | 6 | 9 | Light |
| TFMA | 8 | 9 | Light |
| HAD | 9 | 8 | Dark |

### Verdict

While Gallery Dark produced exceptional photography dominance and a highly cinematic premium feel, Gallery Light swept the functional and brand alignment metrics. An interior design firm built around predictability and "engineering" aligns more closely with physical architectural materials (limestone, paper, charcoal ink) rather than moody dark mode. The reading comfort in the Discovery Workspace was significantly higher in Light mode.

## CSS Values (Frozen as of July 2026)

```css
/* PROTOTYPE A: GALLERY DARK */
[data-environment="gallery-dark-prototype"] {
  --m-wall:      hsl(0 0% 4%);       /* obsidian black/charcoal */
  --m-floor:     hsl(0 0% 4%);
  --m-plaster:   hsl(0 0% 6%);
  --m-surface:   hsl(0 0% 10%);      /* slate surface */
  --m-slab:      hsl(0 0% 10%);
  --m-panel:     hsl(0 0% 12%);
  --m-paper:     hsl(0 0% 8%);
  --m-glass:     color-mix(in srgb, hsl(0 0% 8%) 65%, transparent);
  --m-metal:     hsl(43 30% 65%);    /* bronze interaction cue */
  --m-fabric:    hsl(0 0% 10%);
  --m-wood:      hsl(0 0% 4%);
  --m-shadow:    var(--f-shadow-500);
  --m-highlight: hsl(40 10% 97%);
  --m-line:      color-mix(in srgb, hsl(40 10% 97%) 6%, transparent);
  --m-detail:    hsl(40 10% 95%);    /* warm off-white text */
  --m-subtext:   hsl(0 0% 70%);
  --m-caption:   hsl(0 0% 48%);
}
```
