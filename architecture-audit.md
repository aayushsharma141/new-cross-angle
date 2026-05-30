# Architecture & Codebase Audit Report

## 1. Folder Structure & Organization
- **Current State**: The project correctly leverages a monorepo setup (via Vite) separated into `apps/web` and `packages/*`. Admin pages reside in `apps/web/src/pages/admin`.
- **Issues**: There is a mix of Layout concepts. We have `AdminLayout.tsx` vs `ModuleLayout.tsx`. 
- **Recommendation**: Solidify `ModuleLayout.tsx` as the single layout mechanism for all inner-admin tools. Remove legacy `AdminPageHeader` instances where `ModuleLayout` is superior (due to its portal-based `ModuleActions`).

## 2. Reusability & Component Coupling
- **Current State**: Radix UI primitives and shadcn components are well encapsulated in `src/components/ui/primitives`. 
- **Issues**: Data tables and list views across `AdminUsers.tsx`, `AdminLeads.tsx`, and `AdminAnalytics.tsx` implement their own `.map()` table rendering logic.
- **Recommendation**: Create a unified `DataTable` component utilizing `@tanstack/react-table` for sorting, pagination, and standardized styles. This will eliminate ~500 lines of redundant table markup.

## 3. State Management & Data Fetching
- **Current State**: `react-query` is heavily used alongside Supabase, which is the correct architecture for real-time dashboards.
- **Issues**: Some components (like `ServicesEditor.tsx`) manually sync external data into local `useState` (e.g. `const [services, setServices] = useState`), which can lead to complex dirty-state tracking.
- **Recommendation**: Use `react-hook-form` in combination with `zod` and `react-query` mutations to handle deeply nested form state rather than syncing remote data to local `useState` variables.

## 4. Performance Bottlenecks
- **Bundle Size Analysis**: Imports from heavy libraries (`lucide-react`, `date-fns`, `recharts`) are currently acceptable but `AdminDashboard.tsx` correctly lazy-loads heavy chart tabs via `React.lazy`.
- **Recommendations**: Continue utilizing `Suspense` boundaries around widget loads. Implement Virtualization (`@tanstack/react-virtual`) if list sizes in `AdminAuditLogs` or `AdminLeads` exceed 500+ DOM nodes.

## 5. Security & Technical Debt
- **Type Safety**: All strictly `any` types have been removed. `tsc --noEmit` and `eslint` now pass with zero errors. Technical debt on typing is low.
- **Row-Level Security (RLS)**: Must ensure that Supabase RLS policies are strictly enforced for all queries made from the frontend, especially for the admin panel. 
