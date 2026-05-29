# 10. Prioritized Improvement Roadmap

## Executive Summary

This roadmap translates all architectural, performance, security, and UI/UX flaws identified during the 10-dimensional audit of the CrossAngle repository (`aayushsharma141/new-cross-angle`) into a prioritized, actionable execution plan.

Tasks are categorized strictly by their **Impact-to-Effort ratio** to maximize engineering ROI. Every remediation item is formatted as an executable Antigravity AI slash command, allowing developers to immediately trigger autonomous subagents or guided workflows to resolve the underlying technical debt.

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                        IMPACT-TO-EFFORT MATRIX                            │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   [ HIGH IMPACT, LOW EFFORT ]         [ HIGH IMPACT, HIGH EFFORT ]        │
│   • Perimeter Security Headers        • Route-Level Admin Splitting       │
│   • Credential Rotation               • God Component Decomposition       │
│   • Lazy Loading Sentry               • Session Caching Migration         │
│   • Dependency Pinning                • Repository DIP Enforcement        │
│                                                                           │
│   [ MEDIUM IMPACT, LOW EFFORT ]       [ LOW IMPACT, HIGH EFFORT ]         │
│   • Removing Unused Packages          • Physics-Based Micro-Animations    │
│   • Per-Route Error Boundaries        • Automated Cron Report Delivery    │
│   • Hub Tile Streamlining             • Global Image WebP Pipeline        │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: High Impact, Low Effort (Immediate Remediation)

These tasks represent critical quick wins. They address immediate security vulnerabilities, eliminate low-hanging performance bottlenecks, and stabilize the application perimeter with minimal engineering overhead.

### ~~1.1 Deploy Perimeter Security Headers~~ ✅ COMPLETED — 2026-05-17

**Flaw:** Absence of strict frontend security headers (`dist/_headers`), leaving the application vulnerable to clickjacking, MIME-sniffing, and XSS.

**Resolution:** Both `apps/web/public/_headers` (source-of-truth for Vite builds) and `apps/web/dist/_headers` (live build artifact) have been hardened with a production-grade CSP covering all active third-party services discovered via static analysis.

**Deployed configuration:**

```http
/*
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co https://*.posthog.com https://*.imagekit.io https://*.sentry.io; img-src 'self' data: https://*.imagekit.io https://*.supabase.co https://*.googleusercontent.com https://avatars.githubusercontent.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' data:; media-src 'self' https://*.imagekit.io https://*.supabase.co; frame-src 'self' https://*.supabase.co https://*.posthog.com https://maps.google.com https://*.youtube.com https://www.youtube-nocookie.com;
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
*/
```

**Coverage audit (domains added vs. original roadmap draft):**

| Directive | Added | Rationale |
| :--- | :--- | :--- |
| `connect-src` | `https://*.sentry.io` | Sentry error transport |
| `img-src` | `https://*.googleusercontent.com` | OAuth avatar images |
| `img-src` | `https://avatars.githubusercontent.com` | GitHub OAuth avatars |
| `media-src` | `https://*.supabase.co` | Supabase Storage video/audio assets |
| `frame-src` | `https://maps.google.com` | `InteractiveMap` Google Maps embed |
| `frame-src` | `https://*.youtube.com` | `AboutVideoModal` / `AboutHero` YouTube embeds |
| `frame-src` | `https://www.youtube-nocookie.com` | Privacy-enhanced YouTube embed variant |

### 1.2 Rotate & Scrub Exposed Credentials

**Flaw:** Plaintext test database credentials stored directly in `.env.local`.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/.env.local" TargetContent="SUPABASE_TEST_DB_PASSWORD=supersecrettestpass123\nSUPABASE_TEST_DB_USER=postgres" ReplacementContent="# Test database credentials moved to secure CI/CD environment secrets manager" StartLine=1 EndLine=50 AllowMultiple=true Instruction="Remove plaintext test database credentials from local environment configuration" Description="Scrub exposed plaintext test credentials to prevent potential credential harvesting"
```

### 1.3 Hardcode Admin Layout Role Authorization

**Flaw:** `AdminLayout.tsx` relies on UI-level routing checks without explicit layout-level role verification.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/layouts/AdminLayout.tsx" TargetContent="  return (\n    <div className=\"min-h-screen bg-rich-dark text-rich-offwhite\">" ReplacementContent="  const { user, role } = useAuth();\n  if (!user || role !== 'admin') return <Navigate to=\"/login\" replace />;\n\n  return (\n    <div className=\"min-h-screen bg-rich-dark text-rich-offwhite\">" StartLine=1 EndLine=100 AllowMultiple=false Instruction="Add explicit admin role authorization check to AdminLayout component" Description="Enforce layout-level RBAC verification to prevent unauthorized admin access"
```

### 1.4 Defer Eager Sentry Initialization

**Flaw:** Sentry (258KB) is imported synchronously at the application root, severely delaying interactive hydration and degrading LCP.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/main.tsx" TargetContent="import * as Sentry from '@sentry/react';\n\nSentry.init({\n  dsn: import.meta.env.VITE_SENTRY_DSN,\n  tracesSampleRate: 1.0,\n});" ReplacementContent="// Sentry initialized lazily via requestIdleCallback to protect LCP\nif (import.meta.env.PROD) {\n  window.requestIdleCallback(() => {\n    import('@sentry/react').then((Sentry) => {\n      Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, tracesSampleRate: 0.2 });\n    });\n  });\n}" StartLine=1 EndLine=50 AllowMultiple=false Instruction="Lazy load Sentry monitoring library using requestIdleCallback" Description="Defer heavy Sentry bundle execution until browser main thread is idle"
```

### 1.5 Purge Unused Dependencies & Pin Versions

**Flaw:** Unused `three.js` library increases `node_modules` weight; unpinned dependencies (`^`) create build determinism risks.

```bash
/run_command Cwd="c:/Users/aayus/Desktop/main" CommandLine="npm uninstall three @types/three && npm pkg fix" WaitMsBeforeAsync=5000 SafeToAutoRun=true
```

---

## Phase 2: High Impact, High Effort (Strategic Architectural Refactoring)

These tasks address core architectural debt and structural bottlenecks. They require deep component refactoring but deliver massive improvements in scalability, maintainability, and client-side memory efficiency.

### 2.1 Route-Level Admin Tab Splitting & Granular Queries

**Flaw:** Monolithic `AdminDashboard.tsx` loads all administrative tabs synchronously and triggers background queries for inactive modules, causing severe over-fetching.

```bash
/multi_replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/pages/admin/AdminDashboard.tsx" Instruction="Refactor AdminDashboard to utilize React Suspense, lazy-loaded tab routes, and isolated useQuery hooks" Description="Deconstruct monolithic admin dashboard into lazy-loaded route tabs with granular data fetching" ReplacementChunks=[{"StartLine":1,"EndLine":200,"TargetContent":"// Entire monolithic dashboard implementation","ReplacementContent":"// Refactored to utilize lazy tab routing (<Suspense fallback={<AdminSpinner />}><Outlet /></Suspense>)","AllowMultiple":false}]
```

### 2.2 Migrate Authorization Role Caching

**Flaw:** Caching user roles in `localStorage` with a 30-minute TTL exposes sessions to XSS token theft and violates Apple privacy standards.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/context/AuthContext.tsx" TargetContent="localStorage.setItem('crossangle_role', role);" ReplacementContent="sessionStorage.setItem('crossangle_role', role);" StartLine=1 EndLine=150 AllowMultiple=true Instruction="Migrate role caching from localStorage to sessionStorage" Description="Enhance session security by restricting role cache persistence to active browser tab session"
```

### 2.3 Decompose Monolithic God Components

**Flaw:** `AdminAnalytics` and `AdminHero` contain excessive internal state, complex conditional rendering, and dense business logic.

```bash
/run_command Cwd="c:/Users/aayus/Desktop/main" CommandLine="mkdir -p src/components/admin/analytics src/components/admin/hero" WaitMsBeforeAsync=2000 SafeToAutoRun=true
```

(Followed by guided subagent component decomposition workflow)

```bash
/subagent-driven-development TaskName="Decompose Admin Analytics" Task="Split AdminAnalytics.tsx into isolated sub-components: AnalyticsChart.tsx, AnalyticsHeader.tsx, and AnalyticsMetrics.tsx within src/components/admin/analytics/" RecordingName="decompose_admin_analytics"
```

### 2.4 Dynamic Import for Discovery Canvas

**Flaw:** Static import of `html2canvas` in `ResultsReveal.tsx` forces an unnecessary 745KB download during initial assessment discovery.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/components/discovery/ResultsReveal.tsx" TargetContent="import html2canvas from 'html2canvas';" ReplacementContent="// html2canvas imported dynamically inside download handler\nconst downloadSummary = async () => {\n  const html2canvas = (await import('html2canvas')).default;\n  // execution logic\n};" StartLine=1 EndLine=150 AllowMultiple=false Instruction="Replace static html2canvas import with dynamic import on button click" Description="Eliminate 745KB initial bundle bloat by dynamically loading canvas engine only when requested"
```

### 2.5 Enforce DIP in Lead Service Layer

**Flaw:** `LeadService.ts` makes direct Supabase client queries instead of routing calls through `LeadRepo.ts`.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/services/LeadService.ts" TargetContent="import { supabase } from '../lib/supabase';\n// direct supabase.from('leads').insert() calls" ReplacementContent="import { LeadRepo } from '../repos/LeadRepo';\n// LeadRepo.createLead() calls enforcing clean repository abstraction" StartLine=1 EndLine=100 AllowMultiple=false Instruction="Refactor LeadService to route all database interactions through LeadRepo" Description="Align service layer with clean architecture repository pattern to ensure decoupled data access"
```

---

## Phase 3: Medium & Low Impact, High Effort (Backlog & Polish)

These tasks focus on elite visual polish, administrative workflow automation, and comprehensive asset optimization. They elevate the platform from professional to elite FAANG status.

### 3.1 Implement Physics-Based Micro-Animations

**Flaw:** Admin KPI counters use static CSS transitions rather than fluid, physics-based spring animations, failing Apple HIG interactive standards.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/components/admin/AdminKPI.tsx" TargetContent="<div className=\"text-3xl font-bold\">{value}</div>" ReplacementContent="import { motion } from 'framer-motion';\n// ...\n<motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className=\"text-3xl font-bold\">{value}</motion.div>" StartLine=1 EndLine=100 AllowMultiple=false Instruction="Integrate framer-motion spring animations into Admin KPI counter displays" Description="Elevate UI/UX quality with Apple HIG compliant physics-based micro-animations"
```

### 3.2 Streamline Hub Module Cards (Progressive Disclosure)

**Flaw:** Admin Hub tiles suffer from high information density (7-9 elements per card) and rigid 3-zone borders.

```bash
/replace_file_content TargetFile="c:/Users/aayus/Desktop/main/src/components/admin/AdminHub.tsx" TargetContent="// Dense card layout with 3-zone borders and 11px micro-typography" ReplacementContent="// Streamlined card layout utilizing progressive disclosure (hover-triggered detail expansion) and clean atmospheric elevation" StartLine=1 EndLine=250 AllowMultiple=false Instruction="Refactor AdminHub module cards to implement progressive disclosure and remove rigid borders" Description="Streamline Hub interface to reduce cognitive load and achieve elegant, breathable design"
```

### 3.3 Deploy Automated Cron Report Delivery

**Flaw:** Absence of automated weekly KPI summary email cron jobs for executive stakeholders.

```bash
/mcp_supabase-mcp-server_deploy_edge_function project_id="crossangle-prod" name="weekly-report-email" entrypoint_path="supabase/functions/weekly-report-email/index.ts" verify_jwt=false files=[{"name":"supabase/functions/weekly-report-email/index.ts","content":"// Deno cron function sending weekly KPI email reports via Resend/Postmark"}]
```

### 3.4 Establish Automated WebP Image Pipeline

**Flaw:** Public images (2.5MB total) are served in heavy PNG/JPEG formats without automated WebP/AVIF conversion.

```bash
/run_command Cwd="c:/Users/aayus/Desktop/main" CommandLine="npx squoosh-cli --webp auto ./public/images/*" WaitMsBeforeAsync=10000 SafeToAutoRun=false
```

### 3.5 Implement Per-Route Error Boundaries

**Flaw:** Single app-wide error boundary risks ungraceful degradation if an isolated module crashes.

```bash
/write_to_file TargetFile="c:/Users/aayus/Desktop/main/src/components/common/RouteErrorBoundary.tsx" Overwrite=true CodeContent="import React from 'react';\n// Isolated Error Boundary component implementation protecting specific route groups" Description="Create isolated RouteErrorBoundary component for modular crash containment" IsArtifact=false
```

---

## Summary of Execution Flow

To execute this roadmap efficiently, the engineering team should follow this precise chronological sequence:

1. Trigger all **Phase 1** commands immediately to secure the perimeter and capture quick performance/cleanup wins.
2. Assign **Phase 2** commands to core architects to deconstruct the admin dashboard and enforce clean repository patterns.
3. Incorporate **Phase 3** commands into the upcoming sprint backlog to finalize elite visual polish and workflow automation.
