# Admin Panel & Content Management System (CMS)

## Reverse Engineering & Requirements Document

**Project**: Crossangle Interior Admin Panel
**Purpose**: To provide a comprehensive technical and functional breakdown required for third-party developers to recreate or maintain the Admin Panel from scratch.

---

## 1. Frontend and Backend Technologies

### Frontend Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: `react-router-dom` (Client-side routing with protected `/admin/*` routes)
- **Styling**: Tailwind CSS (extensively utilizing nested arbitrary values and CSS custom properties for theming).
- **UI Component Library**: `shadcn/ui` (Radix UI primitives for accessible complex components like Dialogs, Tabs, Selects, and Dropdowns).
- **Data Fetching/State Management**: React Query (`@tanstack/react-query`) handles reliable API state, caching, background refetching, and optimistic updates.
- **Icons**: `lucide-react`
- **Forms**: React Hook Form coupled with Zod (`@hookform/resolvers/zod`) for form state and validation schemas.

### Backend Stack (Supabase)

- **Database**: PostgreSQL (managed via Supabase).
- **Authentication**: Supabase Auth configured for Email/Password access.
- **Storage**: Supabase Storage Buckets (e.g., the `media` bucket for storing images and documents).
- **API**: Intelligent, auto-generated REST APIs via Supabase PostgREST, accessed natively through the `@supabase/supabase-js` client.
- **Serverless Compute**: Supabase Edge Functions (Deno-based). Primarily used for secure, privileged operations like `manage-user` and `assign-first-admin` workflows that bypass standard RLS (Row Level Security) client caps.

---

## 2. Theme and Design Specifications

The platform is designed to convey a sophisticated, "Ultra-High-Net-Worth" (UHNW) luxury aesthetic, distinguishing it from standard, sterile SaaS admin panels.

### Visual Identity

- **Dark-Themed Layout**: The UI strongly prefers deep, dark backgrounds (`--admin-background`: extremely dark slate or pure black). Content sits inside elevated surface cards (`--admin-card`).
- **Typography & Foreground**:
  - Text relies on off-white/light-gray values for optimal contrast without jarring brightness.
  - Headings (`font-display`) utilize elegant serif or stylized sans-serif fonts to denote premium service.
  - Body text uses clean, highly readable geometric sans-serifs.
- **Accents (Gold Standard)**: Interactive elements, Call-to-Actions (CTAs), and vital statistics highlight in a distinctive luxurious gold tone.

### Key UI Features

- **Glassmorphism & Transparency**: Headers and dialog modals routinely feature translucent backgrounds with heavy backdrop blurs (e.g., `bg-background/80 backdrop-blur-md`), providing spatial depth.
- **Micro-interactions**: Hover effects, smooth transitions (`duration-500`), and CSS animations (`animate-in fade-in zoom-in`) are universally applied for entering pages, dialogs, and table rows to provide a fluid, premium feel.
- **Responsiveness**: Grid layouts collapse intelligently down to mobile viewpoints using standard Tailwind breakpoints.

---

## 3. Logical Workflows & Architecture

### 3.1 Authentication & Route Security

1. **Login State (`AdminAuth.tsx`)**: The login view requests credentials, dispatching them to `supabase.auth.signInWithPassword()`.
2. **Context Persistence (`AuthProvider.tsx`)**: Wraps the application. It establishes an active Supabase session utilizing `onAuthStateChange`. It handles loading states globally so the app never mounts unauthenticated views prematurely.
3. **Route Protection (`AdminLayout.tsx`)**: Acts as a gateway. It immediately enforces redirects to `/admin/login` if the context defines the user as unauthenticated. Fetch operations scoped to the layout (like polling for `newLeadsCount`) are strictly conditionally enabled (`isAuthenticated && !!supabase`).

### 3.2 Data Workflow Strategy

1. **Fetching**: Achieved via `useQuery`. It caches identical requests seamlessly based on unique string/array query keys (e.g., `["projects"]`, `["admin-stats", dateRange]`).
2. **Mutating**: Record modification uses `useMutation`. Upon HTTP `2xx` responses, the system calls `queryClient.invalidateQueries(...)`, forcing the relevant tables or metrics to re-fetch from the database automatically without manual page reloads.

---

## 4. Functionality Breakdown (Operations)

All admin pages reside behind the `/admin` route scope.

### 4.1 Intelligence Hub Workspace (`AdminDashboard.tsx`)

- **KPI Metrics**: Real-time numerical roll-ups of *Portfolio Projects*, *Total Leads*, *Estimate Enquiries*, and *Portfolio Views*.
- **Date Range Subsetting**: All widgets and database connections adapt fetch instructions bounded by a dynamic calendar date range picker (`from`/`to` ISO strings).
- **Data Exporting**: Features a CSV compiler that extracts leads and project arrays directly into a downloaded blob for offline reporting.

### 4.2 Portfolio & Content Management (`AdminPortfolio.tsx`, `AdminBlogs.tsx`, `AdminServices.tsx`)

- **Data Listings**: Switchable views (Grid/List) with multi-variable filters (Search Query, Category Matcher, Status Tabs).
- **Creation & Modification Forms**: Popover dialogues capturing text inputs, rich-text markdown layouts (for blogs), and media dropzones.
- **Nested Architectures**: Specifically in *Services*, users can configure primary service attributes and attach child arrays of "Process Steps" and "Service FAQs" (linked via internal database foreign keys).
- **Media Uploads**: Interacts exclusively with Supabase Storage pipelines, abstracting the upload and returning public delivery URLs to stringify into table columns.

### 4.3 Client Interactions (`AdminLeads.tsx`, `AdminEstimateLeads.tsx`)

- **Pipeline Viewing**: Interactive tables of incoming public form submissions.
- **Premium Cost Estimator Logs**: High-value client intents captured via the frontend cost estimator tool map inputs (e.g., *Property Size*, *UHNW Quality Tier*) to strict numeric output ranges (*Min/Max Estimate*).

### 4.4 Team Access (`AdminUsers.tsx`)

- **Role Control**: Manages who can enter the admin interface and what they can modify (e.g., `admin` vs `viewer`).
- **Operations**: Includes edge-function powered actions for Sending Invites, Copying UUIDs, Suspending (Ban), Unsuspending, and permanent Deletion.

---

## 5. Database Schema Structure

The PostgreSQL architecture relies heavily upon Row Level Security (RLS) policies defining public vs. admin mutation bounds, automatic `updated_at` triggers, and cascading primary/foreign key connections.

### 5.1 Project & Service Clusters

- **`projects`**: Core portfolio.
  - Fields: `id` (uuid), `title`, `slug` (unique), `description`, `category_id` (fk), `client_name`, `location`, `budget`, `status`, `views` (int), `image_url`, `created_at`.
- **`project_categories`**: Tagging system.
  - Fields: `id` (uuid), `name`, `display_order`.
- **`services`**: Tiers to offer to users.
  - Fields: `id` (uuid), `name`, `slug` (unique), `description`, `icon_name` (maps to frontend JSX element text mappings), `image_url`, `display_order`.
  - Linked tables: **`service_steps`** and **`service_faqs`** branch directly off `service_id`.

### 5.2 Interactions Cluster

- **`leads`**: General contact captures.
  - Fields: `id` (uuid), `name`, `email`, `phone`, `message`, `status` (text: 'new', 'contacted', 'won', 'lost'), `lead_source`, `city`.
- **`estimate_leads`**: High-priority inputs from the cost calculator.
  - Fields: `id` (uuid), `name`, `email`, `phone`, `project_type`, `property_size`, `quality_tier`, `timeline`, `estimate_total_min` (numeric), `estimate_total_max` (numeric), `status`.
- **`testimonials`**: Client reviews logic.
  - Fields: `id` (uuid), `name`, `role`, `content`, `rating` (numeric), `active` (boolean).

### 5.3 Blog & Users

- **`blogs`**: Simple Article Schema.
  - Fields: `id` (uuid), `title`, `slug`, `excerpt`, `content` (text/html), `image_url`, `read_time`, `status`, `created_at`/`published_at`.
- **`profiles`**: Linked precisely via PostgreSQL database trigger to Supabase's secure, hidden `auth.users` ledger.
  - Fields: `id` (uuid, references `auth.users`), `full_name`, `avatar_url`, `role` (text).
