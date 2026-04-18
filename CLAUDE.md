# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Tasks
- **Start development server**: `npm run dev` or `npm run dev:web` (runs Vite dev server on apps/web)
- **Build for production**: `npm run build` (runs Vite build + sitemap generation + index copying)
- **Build for development**: `npm run build:dev`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint` (runs ESLint on the codebase)
- **Run tests**: `npx playwright test` (uses Playwright for end-to-end testing)
- **Run single test**: `npx playwright test tests/example.spec.ts`

### Workspace Structure
This is a monorepo managed by npm workspaces:
- `apps/web`: Main React/Vite application
- `supabase`: Supabase configuration, migrations, and edge functions

## Code Architecture & Structure

### Application Overview
Cross Angle Interior is a full-stack application featuring:
- **Public website**: Portfolio showcase, services, blog, contact forms, and price estimator
- **Admin dashboard**: Secure interface for managing leads, blogs, services, portfolio, testimonials, team, and system settings
- **Backend**: Supabase providing database, authentication, storage, and edge functions (including AI integrations)

### Key Architectural Patterns

#### Routing & Navigation
- Uses **React Router v6** with route separation between public and admin sections
- Admin routes protected by `AuthGuard` and role-based `RoleGuard` components
- Lazy loading with `React.lazy()` and `Suspense` for code splitting
- Page transitions handled by `PageTransition` component using Framer Motion
- Scroll-to-top behavior on route changes via `ScrollToTop` component

#### State Management & Data Fetching
- **React Query** (`@tanstack/react-query`) for server state management
- **React Hook Form** with Zod validation for form handling
- Supabase client (`@supabase/supabase-js`) for database operations
- Custom hooks in `apps/web/src/hooks/` for reusable logic

#### Component Architecture
- **UI Library**: Built with **shadcn/ui** components over Radix UI primitives
- **Styling**: Tailwind CSS with custom configurations in `tailwind.config.ts`
- **Layout**: Consistent layout structure with header/footer components
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Internationalization**: Using `next-themes` for light/dark mode support

#### Admin Dashboard Structure
- Modular organization with separate modules:
  - **CMS Module**: Content management (blogs, services, portfolio)
  - **CRM Module**: Lead management and customer relationships
  - **Discovery Module**: Style quiz and design discovery flow
  - **Estimator Module**: Price estimation and lead generation
  - **Blog Module**: Blog post management
  - **System Module**: Settings, users, team management, audit logs
- Role-based access control with Super Admin and Admin roles
- Consistent layout using `AdminLayout` with sidebar navigation

#### Supabase Integration
- Authentication handled via Supabase Auth
- Database schemas in `supabase/migrations/`
- Edge functions in `supabase/functions/` for AI integrations and webhooks
- Realtime subscriptions for live updates
- Storage buckets for media assets

#### Notable Features
- **Price Estimator**: Interactive calculator with step-by-step form flow
- **Style Quiz**: Discovery flow with archetype-based results
- **Media Library**: Drag-and-drop interface for asset management
- **Blog System**: Rich text editing with Tiptap and markdown support
- **Analytics**: Integrated with PostHog, Vercel Analytics, and Speed Insights
- **Error Boundaries**: Global error handling with fallback UI
- **Performance Optimizations**: Code splitting, lazy loading, and image optimization

### Directory Conventions
- `apps/web/src/components/` - Reusable UI components
- `apps/web/src/pages/` - Page-level components mapped to routes
- `apps/web/src/hooks/` - Custom React hooks
- `apps/web/src/lib/` - Utility functions and service integrations
- `apps/web/src/services/` - API service layers
- `apps/web/src/context/` - React context providers
- `apps/web/src/addons/` - Feature-specific modules (calculators, discovery)
- `supabase/` - Database migrations, edge functions, and configuration

### Development Practices
- TypeScript used throughout for type safety
- ESLint with React hooks and refresh plugins for code quality
- Prettier configuration via Tailwind setup
- Component composition patterns following shadcn/ui guidelines
- Accessibility considerations in UI components
- Responsive design with mobile-first approach