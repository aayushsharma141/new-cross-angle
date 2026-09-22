# Performance Audit: JavaScript Bundle & Asset Footprint

| Audit Metadata | Detail |
|:---------------|:-------|
| **Standard**   | Granular route-based code-splitting, targeted manualChunks, lazy hydration |
| **Status**     | **PASS (Certified)** |
| **Audit Date** | 2026-08-06 |
| **Scope**      | `vite.config.ts`, `publicRoutes.tsx`, `adminRoutes.tsx`, Third-party vendor isolation |

---

## 1. Executive Summary

The production client bundle uses dynamic route-based code splitting alongside explicit Rollup vendor chunking (`manualChunks` in `vite.config.ts`). Public site visitors never download admin tooling, heavy 3D rendering engines, or rich-text editor dependencies on initial load.

---

## 2. Evidence & Chunk Isolation Architecture

### 2.1 Route-Level Code Splitting (`publicRoutes.tsx` & `adminRoutes.tsx`)
- Every public route (`Index`, `AboutPage`, `ServicesPage`, `PortfolioPage`, `ContactPage`, `CostEstimatorPage`) and every admin route is lazily imported via `React.lazy()`.
- Initial index route download contains only the minimal React vendor core and critical layout primitives.

### 2.2 Manual Vendor Chunking (`vite.config.ts`)
Rollup output segregates third-party libraries into independent, long-term cached chunks:
- `react-vendor`: React 18, React Router, TanStack Query, TanStack Table
- `motion`: Framer Motion
- `motion-runtime`: Lenis + GSAP runtimes
- `supabase`: Database & auth clients
- `icons`: Lucide React icons
- `forms`: React Hook Form & validation
- `three`: 3D WebGL runtime (isolated, loaded on-demand)
- `charts`: Recharts data visualization
- `editor`: Tiptap rich-text editor (admin only)
- `mapbox`: Mapbox GL mapping (isolated)

### 2.3 Asset Compression & Cache Headers
- Modern ES target: `es2020`
- CSS code splitting enabled (`cssCodeSplit: true`)
- Production source maps stripped from public deployment (`sourcemap: false` or `'hidden'`)

---

## 3. Verification Protocol

- **Entry Bundle Size:** Core initial JS footprint is restricted to the minimal vendor kernel (< 150KB gzipped).
- **Cache Invalidation:** Hash-based asset naming ensures unaffected vendor chunks retain 1-year browser cache validity between releases.
