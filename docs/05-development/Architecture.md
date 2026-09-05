# CrossAngle Development Architecture & Engineering Standards

**Status:** Implementation Blueprint  
**Scope:** Frontend Codebase (React/Vite) & Backend (Supabase)

> **This document enforces structural consistency. Developers should never have to guess where a file belongs or how state is managed.**

---

## 1. Technical Stack

- **Framework:** React 18 + Vite (SPA with Prerendering for SEO)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS v3 + CSS Variables (Design Tokens)
- **Motion:** Framer Motion (Component animation) + GSAP (Scroll scrubbing)
- **State Management:** TanStack React Query (Server state), React Context (Auth/Theme)
- **Forms:** React Hook Form + Zod validation
- **Backend/Database:** Supabase (Postgres, Auth, Edge Functions, Storage)

---

## 2. Folder Structure & Architecture

The `apps/web/src` directory is strictly organized by responsibility:

```text
src/
├── addons/            # Isolated feature engines (e.g., /calculators for Estimator)
├── components/
│   ├── home/          # Page-specific sections (e.g., Hero.tsx, ClientProblems.tsx)
│   ├── layout/        # Global wrappers (Navbar.tsx, Footer.tsx, PageTransition.tsx)
│   ├── shared/        # Cross-page composites (TestimonialSlider.tsx)
│   └── ui/            # Pure, stateless design system primitives (Button, Input)
├── data/              # Static constants and marketing copy (JSON/TS)
├── hooks/             # Custom React hooks (useAdminAuth, useScrollLock)
├── integrations/      # Third-party setups (supabase/client.ts)
├── pages/             # Route entry points (Index.tsx, PortfolioPage.tsx)
├── tokens/            # Design system CSS (semantic.css)
└── utils/             # Pure helper functions (formatCurrency.ts)
```

---

## 3. Component Ownership & Rules

1. **`components/ui/` (Primitives):**
   - Must be 100% stateless (no API calls).
   - Must accept `className` and merge it using `tailwind-merge` (`cn` utility).
   - Must forward refs using `forwardRef`.

2. **`components/home/` (Page Sections):**
   - Owns its specific layout grid.
   - May fetch data (via React Query) if it's a dynamic section (e.g., Featured Portfolio).

3. **`pages/` (Routes):**
   - Acts as the orchestrator.
   - Wraps content in `<PageTransition>` or Layout providers.
   - Should contain minimal DOM markup, primarily returning a vertical stack of Section components.

---

## 4. State Management Strategy

- **Server State (Database Data):** Use `@tanstack/react-query`. Do not use `useEffect` to fetch data.
  - Queries are cached.
  - Mutations must call `queryClient.invalidateQueries` on success.
- **Form State:** Use `react-hook-form`. Never use controlled `useState` inputs for large forms (like the Estimator) to prevent excessive re-renders.
- **Global UI State:** Use standard React Context (e.g., `AuthContext`, `NavigationContext`). Keep contexts small and isolated.
- **Local UI State:** Use `useState` (e.g., accordion open/closed, modal visibility).

---

## 5. Animation Ownership

- **Framer Motion (`framer-motion`):** Used for component-level mount/unmount animations, hover states (layout transitions), and page route transitions.
- **GSAP (`gsap/ScrollTrigger`):** Used EXCLUSIVELY for complex scroll-scrubbing interactions (e.g., pinning the Service Accordion while scrolling changes images).
  - *Rule:* Always use `gsap.context()` in a `useEffect` and return `ctx.revert()` in the cleanup function to prevent memory leaks in React.

---

## 6. Performance Budget

- **Bundle Size:** Core app chunk must remain under 350kb (gzipped).
- **Code Splitting:** All route components in `App.tsx` must be imported via `React.lazy()`.
- **Image Loading:**
  - Above the fold (Hero): `fetchpriority="high"`, `loading="eager"`.
  - Below the fold: `loading="lazy"`.
- **DOM Size:** Avoid deeply nested `div` structures. Use React Fragments `<>` where wrapping elements aren't stylistically required.

---

## 7. Coding Standards

- **TypeScript:** No `any` types. Define strict interfaces for all Supabase database returns.
- **Tailwind Formatting:** Use `prettier-plugin-tailwindcss` to auto-sort classes in a standardized order (Layout -> Spacing -> Typography -> Visuals).
- **Naming Conventions:**
  - Components: PascalCase (`ProjectCard.tsx`)
  - Hooks: camelCase (`useWindowSize.ts`)
  - Utilities: camelCase (`formatDate.ts`)
  - Types/Interfaces: PascalCase (`ProjectDatabaseRow`)

---

## 8. Deployment & CI/CD

- **Environment Variables:** Must be validated at boot. Local dev requires `.env.local`.
- **Preview Deployments:** Vercel automatically generates preview URLs for every PR.
- **Production Gate:** Commits to `main` auto-deploy to production ONLY IF:
  1. TypeScript compilation passes (`tsc --noEmit`).
  2. ESLint returns zero errors.
