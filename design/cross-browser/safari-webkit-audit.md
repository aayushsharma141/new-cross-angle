# WebKit & iOS Safari Compatibility Audit

| Audit Metadata | Detail |
|:---------------|:-------|
| **Standard**   | iOS WebKit safe area handling, backdrop-filter prefixes, subpixel font smoothing |
| **Status**     | **PASS (Certified)** |
| **Audit Date** | 2026-08-06 |
| **Scope**      | Safari 16+, iOS Safari 16+, iPadOS Safari |

---

## 1. Executive Summary

WebKit on iOS/macOS requires explicit handling for backdrop filters, tap highlights, dynamic toolbars (`100dvh`), and notch safe areas (`env(safe-area-inset-bottom)`). All critical iOS-specific pain points have been mitigated and certified.

---

## 2. WebKit Mitigations Implemented

### 2.1 WebKit Tap Highlight (`index.css`)
- Global `-webkit-tap-highlight-color: transparent;` applied to all interactive elements, eliminating unwanted grey flash overlays on touch taps in Mobile Safari.

### 2.2 Backdrop Filter Compatibility
- Tailwind glass utilities and custom overlay classes ensure `-webkit-backdrop-filter` is paired alongside standard `backdrop-filter` for translucent navigation bars and modal sheets.

### 2.3 Subpixel & Antialiasing
- `-webkit-font-smoothing: antialiased;` and `-moz-osx-font-smoothing: grayscale;` configured globally on `body` for crisp, non-blurry typographic rendering on Retina / OLED screens.

### 2.4 100dvh Dynamic Viewport Height
- Fullscreen hero containers leverage `h-[100dvh]` with `h-screen` fallbacks to prevent iOS Safari bottom toolbar resizing jumps during scrolling.

---

## 3. Verification Protocol

- **Mobile Safari Simulation:** Checked on iOS viewport configurations; zero address bar clipping or sticky header jumping.
