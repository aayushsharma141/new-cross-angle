# Motion Tokens

| Token Name | Value | Purpose |
|:-----------|:------|:--------|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, reveals, page loading |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | On-screen spatial layout shifts |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets, slide-over navigation |
| `--ease-gallery` | `cubic-bezier(0.22, 1, 0.36, 1)` | Pocket door transitions (heavy, silent) |
| `--duration-press` | `140ms` | Physical `:active` feedback |
| `--duration-tooltip` | `160ms` | Hover explanations |
| `--duration-dropdown`| `200ms` | Context menus and selects |
| `--duration-modal` | `320ms` | Centered dialogs |
| `--duration-reveal` | `600ms` | Curtain wipe & scroll reveals |
| `--hover-scale` | `1.02` | Material hover on portfolio frames |
| `--hover-duration` | `400ms` | Portfolio frame hover transition |
| `--active-scale` | `0.97` | Tactile physical click compression |
| `--sweep-duration` | `750ms` | Hairline shine sweep on interactive triggers |

---

## Promoted Token Contracts

### `button-sweep-active`
- **Specification:**
  ```css
  .home-button-sweep {
    position: relative;
    overflow: hidden;
    transition: transform var(--duration-press, 150ms) var(--ease-gallery);
  }
  .home-button-sweep:active {
    transform: scale(var(--active-scale, 0.97));
  }
  .home-button-sweep::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left var(--sweep-duration, 750ms) var(--ease-gallery);
    pointer-events: none;
  }
  .home-button-sweep:hover::before {
    left: 100%;
  }
  ```
- **Promotion Certification:** Validated across 3 consecutive surfaces:
  1. `Homepage` (`apps/web/src/pages/Index.tsx`)
  2. `Portfolio` (`apps/web/src/components/portfolio/*`)
  3. `Services` (`apps/web/src/components/services/*`)

