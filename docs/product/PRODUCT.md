# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **UHNW Luxury Clients & Homeowners:** Seeking high-end, custom interior design services, exploring portfolio showcases, calculating project estimates, and initiating consultation requests.
2. **Studio Administrators & Designers:** Managing leads, publishing blog updates, managing project media assets, and overseeing client inquiry workflows.

## Product Purpose

Cross Angle Interior serves as the digital flagship and administrative operational dashboard for a UHNW luxury interior design studio. It makes high-ticket design decisions observable, transparent, and manageable while providing a conversion-optimized, premium portfolio experience.

## Positioning

Ultra-luxury interior design studio platform combining high-fidelity aesthetic presentation with observable, replayable decision-making and automated cost estimation for UHNW residential projects.

## Operating Context

- **Public Surface:** High-performance web application (Vite + React + Tailwind CSS) showcasing interior design portfolios, spatial project categories, and interactive estimation calculators.
- **Admin Surface:** Secure authenticated dashboard (`/admin`) for studio staff to track client leads, manage media libraries, edit articles, and review analytics.

## Capabilities and Constraints

- **Capabilities:**
  - Dynamic interior project showcase and portfolio viewer.
  - Interactive luxury cost & scope estimator.
  - Role-based admin portal with Supabase Authentication (`admin` / `viewer`).
  - Edge function integrations for automated lead management and invitations.
  - Real-time client lead management and status tracking.
- **Constraints:**
  - Monorepo structure (`apps/web` for frontend, `supabase` for database and edge functions).
  - Must uphold UHNW luxury design aesthetics, fluid motion, and zero-slop responsiveness.

## Brand Commitments

- **Brand Name:** Cross Angle Interior
- **Aesthetic Direction:** Elevated luxury, subtle dark modes, glassmorphism, refined typography, and uncompromised visual precision (per `ART_DIRECTION_BIBLE.md` and `DESIGN_GENOME.md`).

## Evidence on Hand

- Immutable Reference: [CROSSANGLE.md](file:///E:/main/CROSSANGLE.md)
- Art Direction Bible: [ART_DIRECTION_BIBLE.md](file:///E:/main/ART_DIRECTION_BIBLE.md)
- Public Pages Architecture: [PUBLIC_PAGES_ARCHITECTURE.md](file:///E:/main/PUBLIC_PAGES_ARCHITECTURE.md)
- Design Genome System: [DESIGN_GENOME.md](file:///E:/main/DESIGN_GENOME.md)

## Product Principles

1. **Uncompromised Luxury:** Every surface must feel bespoke, polished, and tailored to ultra-high-net-worth expectations.
2. **Observable Decision-Making:** Architectural choices and cost calculations are transparent, deterministic, and clear.
3. **Dual-Surface Excellence:** Public engagement and administrative operations receive equal rigor in performance and UX quality.

## Accessibility & Inclusion

- WCAG 2.1 AA compliance across core public flows and administrative forms.
- High contrast accessibility modes and keyboard navigation support across interactive portfolio components.
