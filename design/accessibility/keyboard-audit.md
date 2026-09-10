# Accessibility Audit: Keyboard Navigation & Focus (WCAG 2.1.1, 2.1.2, 2.4.7)

| Audit Metadata | Detail |
|:---------------|:-------|
| **Requirement**| Full keyboard operability, visible focus indicators, no trap without escape, skip link |
| **Status**     | **PASS (Certified)** |
| **Audit Date** | 2026-08-06 |
| **Scope**      | Global root layout, navigation menus, modals, dialogs, form elements |

---

## 1. Executive Summary

All pages and interactive structures support 100% keyboard-only navigation. There are no keyboard traps. Tab order flows strictly in logical DOM reading order. Focus states are clearly demarcated using high-contrast outline rings (`2px solid hsl(var(--ring))` with `2px offset`).

---

## 2. Key Audited Systems

### 2.1 Skip Links (WCAG 2.4.1)
- **Implementation:** `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` present at root of `apps/web/src/App.tsx` and `Navbar.tsx`.
- **Target Target Verified:** Every primary page (`Index`, `Portfolio`, `Services`, `About`, `Estimator`, `Blog`, `Contact`, etc.) exposes `<main id="main-content">`.

### 2.2 Focus Indicators (WCAG 2.4.7)
- **Global Base Rule (`index.css`):**
  ```css
  :focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
    border-radius: 2px;
  }
  :focus:not(:focus-visible) {
    outline: none;
  }
  ```
- **Admin Specifics:** Enhanced champagne gold glow (`--admin-gold` with subtle box-shadow ring).
- **Prims & Components:** Buttons and interactive pills carry explicit `focus-visible:ring-2 focus-visible:ring-primary` tokens.

### 2.3 Modals & Drawer Overlays (WCAG 2.1.2)
- **`FocusTrap.tsx`:** Traps tab cycles within active modal boundaries, auto-focuses first interactive element, and cycles back from last to first.
- **`useEscapeKey.ts`:** Global listener captures `Escape` to close drawers, dialogs, and flyouts smoothly.
- **`Navbar.tsx` (Mobile Drawer):** Implements internal Tab/Shift+Tab cycle and instant escape handling.

---

## 3. Verification Protocol

- **Tab Traversal:** Top-to-bottom tab traversal through Header → Hero CTAs → Main Content Sections → Footer.
- **Escape Key Check:** Mobile drawer, dialogs, and filter overlays immediately yield control and restore scroll locks upon pressing `Escape`.
