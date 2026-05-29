# Cross Angle Interior — Feature Documentation

Welcome to the feature documentation for the Cross Angle Interior platform. This guide is written for **non-technical readers** — business owners, designers, and team members who want to understand what the platform does and how each part works.

---

## Platform Overview

Cross Angle Interior's digital platform is a complete business system that handles everything from attracting new clients to managing projects. It consists of these major features:

| # | Feature | What It Does | Link |
|---|---------|--------------|------|
| 1 | [Main Website](./main-website/) | The public-facing website visitors see | [Read →](./main-website/README.md) |
| 2 | [Admin Control Panel](./admin-control-panel/) | Backend dashboard for managing everything | [Read →](./admin-control-panel/README.md) |
| 3 | [Interior Discovery Engine](./interior-discovery-engine/) | Style quiz that helps visitors find their aesthetic | [Read →](./interior-discovery-engine/README.md) |
| 4 | [Interior Cost Estimator](./interior-cost-estimator/) | Budget calculator for interior projects | [Read →](./interior-cost-estimator/README.md) |
| 5 | [Portfolio Showcase](./portfolio-showcase/) | Project gallery with before/after views | [Read →](./portfolio-showcase/README.md) |
| 6 | [Lead Generation System](./lead-generation-system/) | CRM and lead capture across all touchpoints | [Read →](./lead-generation-system/README.md) |
| 7 | [CMS-Driven Content](./cms-driven-content/) | Blog, services, and content management | [Read →](./cms-driven-content/README.md) |

---

## How It All Connects

```
Visitor arrives at Website
        │
        ├── Takes the Style Quiz ──→ Lead captured in CRM
        ├── Uses Cost Estimator ──→ Lead captured in CRM
        ├── Views Portfolio ────────→ Builds trust
        ├── Reads Blog/Services ───→ SEO brings more visitors
        └── Fills Contact Form ────→ Lead captured in CRM
                                          │
                                    Admin Panel
                                    (manages everything)
```

## Who Should Read What

| If you are... | Start here |
|---------------|------------|
| A business owner wanting an overview | This page + [Main Website](./main-website/README.md) |
| Managing leads and clients | [Lead Generation System](./lead-generation-system/README.md) |
| Updating website content | [CMS-Driven Content](./cms-driven-content/README.md) |
| Understanding the admin dashboard | [Admin Control Panel](./admin-control-panel/README.md) |
| Curious about the style quiz | [Interior Discovery Engine](./interior-discovery-engine/README.md) |

---

## Technical References

For developers and technical team members, detailed architecture docs are available in:
- `docs/architecture/` — System design and database schema
- `docs/guides/` — Step-by-step technical guides
- `docs/reports/` — Audit reports and analysis
