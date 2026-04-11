# Cross Angle Interior — Web Application

> A premium interior design marketing and lead-generation platform for **Cross Angle Interior** — a professional design studio based in Jamshedpur & Kolkata, India.

---

## Overview

This is the public-facing web application for Cross Angle Interior. It is built as a single-page React/Vite application that combines cinematic brand storytelling, service discovery, an interactive cost estimator, a style discovery quiz, a project gallery, a blog, and a multi-channel lead capture system.

The app is bundled as part of a monorepo at `c:\Users\aayus\Desktop\main` and lives in `apps/web`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (Vite + SWC) |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 + `tailwind-merge` + `class-variance-authority` |
| Animations | Framer Motion, GSAP, Lenis (smooth scroll) |
| UI Components | Radix UI primitives + shadcn/ui patterns |
| Data & Backend | Supabase (Postgres + Edge Functions + Auth) |
| State / Data Fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Rich Text | Tiptap v3 (blog editor) |
| Charts | Recharts |
| Maps | Mapbox GL |
| 3D | Three.js |
| Error Monitoring | Sentry |
| SEO | React Helmet Async |

---

## Project Structure

```
apps/web/
├── public/                      # Static assets
├── src/
│   ├── App.tsx                  # Root router — all public and admin routes defined here
│   ├── pages/                   # Top-level page components
│   │   ├── Index.tsx            # Homepage (/)
│   │   ├── AboutPage.tsx        # About Us (/about-us)
│   │   ├── ServicesPage.tsx     # Services overview (/services)
│   │   ├── ServiceCategoryPage.tsx  # /services/:category
│   │   ├── ServiceDetailPage.tsx    # /services/:category/:service
│   │   ├── GalleryPage.tsx      # Project gallery (/gallery)
│   │   ├── PortfolioDetailPage.tsx  # /portfolio/:slug
│   │   ├── BlogPage.tsx         # Blog index (/blog)
│   │   ├── BlogPostPage.tsx     # /blog/:slug
│   │   ├── ContactPage.tsx      # Contact Us (/contact-us)
│   │   ├── EstimatePage.tsx     # Cost Estimator (/estimate)
│   │   ├── StyleQuizPage.tsx    # Style Discovery Quiz (/style-quiz)
│   │   ├── BlueprintPage.tsx    # Blueprint/proposal output (/blueprint)
│   │   └── admin/               # Admin console (lazy-loaded, auth-gated)
│   ├── components/              # Shared and page-level components
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Process.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Testimonials.tsx
│   │   ├── TrustSection.tsx
│   │   ├── BeforeAfterShowcase.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── FixedSocialBar.tsx
│   │   ├── WhatsAppButton.tsx
│   │   ├── ScrollProgress.tsx
│   │   ├── SectionNavDots.tsx
│   │   ├── WelcomePrompt.tsx
│   │   ├── about/               # About page sub-components
│   │   ├── services/            # Services page sub-components
│   │   ├── gallery/             # Gallery page sub-components
│   │   └── admin/               # Admin UI sub-components
│   ├── config/
│   │   ├── navigation.ts        # Main nav link definitions
│   │   └── site-content.ts     # Static service definitions, categories, FAQs
│   ├── data/                    # Static fallback data (projects, testimonials, etc.)
│   ├── lib/
│   │   └── api.ts               # Supabase query helpers and data fetching
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand / local state stores (estimator, quiz)
│   └── types/                   # TypeScript types
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Public Information Architecture

```
/ (Home)
├── /about-us
├── /services
│   ├── /services/:category          (e.g. residential, commercial, specialized)
│   └── /services/:category/:service (e.g. residential/living-room-design)
├── /gallery
│   └── /portfolio/:slug
├── /blog
│   └── /blog/:slug
├── /contact-us
├── /estimate               (Cost Estimator tool)
├── /style-quiz             (Style Discovery Engine)
├── /blueprint              (Visual proposal output)
├── /about → redirects to /about-us
├── /contact → redirects to /contact-us
└── * → 404 page
```

Admin routes are under `/admin/*` and are auth-gated (`/admin/auth`).

---

## Lead Capture Touchpoints

| Source Label | Visitor Entry Point | Data Destination |
|---|---|---|
| `website_contact` | `/contact-us` form | Supabase `leads` table via `process-lead` edge function |
| `welcome_popup` | Homepage popup (5s delay) | Supabase `leads` table |
| `estimator` | `/estimate` multi-step calculator | Supabase `leads` + estimator-specific tables |
| `discovery_engine` | `/style-quiz` multi-stage quiz | Supabase `leads` + discovery analytics |

---

## Supabase Backend

The app is backed by Supabase: Postgres database, Auth, Storage, and Edge Functions.

### Key Database Tables

| Table | Purpose |
|---|---|
| `leads` | All leads from contact form, popup, estimator, and quiz |
| `projects` | Portfolio projects shown in the gallery |
| `services` | Service entries powering `/services` category grids |
| `blogs` | Blog articles |
| `testimonials` | Client reviews shown on the homepage |
| `team_members` | Team profiles shown on About page |
| `hero_media` | Homepage hero slides and video |

### Edge Functions (`supabase/functions/`)

| Function | Purpose |
|---|---|
| `process-lead` | Handles contact form submissions: validates, rate-limits, notifies via WhatsApp (Twilio), syncs to Google Sheets, and stores the lead in Supabase |

> **Note:** The `process-lead` function includes a clearly marked hook for adding an optional AI acknowledgment message (e.g. via Google Gemini or OpenAI). This is not active by default — no external AI service is required.

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase CLI (for edge functions)

### 1. Install dependencies

```bash
cd apps/web
npm install
```

### 2. Configure environment variables

Create a `.env` file in `apps/web/` (or at the monorepo root) with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For Sentry release tracking (optional):
```
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

### 3. Start the dev server

```bash
npm run dev
```

The app starts on `http://localhost:8080` by default.

### 4. Build for production

```bash
npm run build
```

---

## Admin Console

The admin console is bundled inside the same app and is accessible at `/admin/auth`.

### Admin Modules

| Module | Route | Purpose |
|---|---|---|
| Intelligence Hub | `/admin/dashboard` | KPI overview and lead monitoring |
| CMS | `/admin/cms/*` | Portfolio, blog, services, testimonials, team, media management |
| CRM | `/admin/crm/leads` | Lead pipeline, filtering, status tracking |
| CRM Users | `/admin/crm/users` | User and permissions management |
| Discovery Engine | `/admin/discovery/analytics` | Style quiz performance and generated leads |
| Estimator Engine | `/admin/estimator/leads` | Estimator leads and pricing rate management |
| Blog Analytics | `/admin/blog/overview` | Blog article performance and engagement |
| System Config | `/admin/system/settings` | Global site settings |

---

## Design System

- **Typography:** Inter (UI), Playfair Display (editorial headings)
- **Color theme:** Dark premium with gold/amber accents
- **UI style:** Glassmorphism cards, subtle hover states, cinematic scroll animations
- **Brand statement:** *"We don't design interiors. We design how they feel."*
- **Studio presence:** Jamshedpur & Kolkata, India
- **Contact:** `hello@crossangle.com` | `+91 7909041132`

---

## Social Channels

- Instagram
- YouTube
- WhatsApp
- Facebook
- Pinterest
- LinkedIn

---

## Brand Partners Displayed

Asian Paints · Hafele · Godrej · Philips · Hettich · Jaquar

---

## Scripts Reference

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Starts Vite on port 8080 |
| Build | `npm run build` | Production bundle |
| Post-build | auto | Runs `scripts/copy-indexes.js` for SPA routing |
| Preview | `npm run preview` | Serves the production build locally |
| Lint | `npm run lint` | ESLint check |

---

## Notes

- The app uses static fallback data for projects, testimonials, and services if Supabase tables are empty. This ensures the public site always renders correctly during development or if content has not been seeded.
- The section navigation dots on the homepage include a "Contact" dot but the homepage `Index.tsx` does not contain an inline contact section — the dot navigates to the `/contact-us` page.
- Admin routes are lazy-loaded to keep the initial public bundle small.
