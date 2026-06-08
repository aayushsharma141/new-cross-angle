# Phase 1: Quick Wins & Semantic SEO Foundation

## Goal
Establish a strong baseline for Semantic SEO and immediate user experience improvements.

## Execution Steps

### 1. H1/H2 Semantic Audit and Fixes
- **Target Files**: `Index.tsx`, `AboutPage.tsx`, `ServicesPage.tsx`, `ServiceCategoryPage.tsx`, `ServiceDetailPage.tsx`, `ProjectHubPage.tsx`, `ProjectPage.tsx`, `GalleryPage.tsx`, `BlogPage.tsx`, `BlogDetailPage.tsx`, `ContactPage.tsx`, `PrivacyPage.tsx`, `TermsPage.tsx`.
- **Action**: Ensure every page has exactly one `<h1>` tag containing the primary keyword/title. Ensure all subsequent headings correctly nest as `<h2>`, `<h3>`, etc. without skipping levels for styling purposes. Convert `<div>` or `<p>` elements used as headings into semantic `<h>` tags with equivalent Tailwind styling.

### 2. Sticky High-Contrast CTAs
- **Target Files**: `ServiceDetailPage.tsx`, `ProjectPage.tsx`.
- **Action**: Add a sticky bottom-bar CTA (or a sticky floating button) on mobile, and a sticky sidebar or top-level CTA on desktop, saying "Consult with us" linking to the contact page. This ensures users always have a clear conversion path.

### 3. JSON-LD FAQ Schema
- **Target Files**: `ServiceDetailPage.tsx` (and potentially the component that renders the FAQ data).
- **Action**: Create a `<script type="application/ld+json">` block that automatically generates FAQ schema from the `faqs` data array passed to the page. This will allow Google to display "People Also Ask" rich snippets for the service pages.

## Verification
- Run a quick manual review of the DOM for each page type to verify `<h1>` presence.
- Ensure FAQ schema script is present in the document `<head>` or body.
- Verify the CTA is visible and functional.
