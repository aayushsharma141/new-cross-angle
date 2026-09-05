# Platform Certification Gate
## Phase 6.5 — Content Architecture

Production migration is **blocked** until all items below are marked ✅.

---

| # | Certification Item | Status | Notes |
|:--|:---|:---:|:---|
| 1 | **Token Architecture** — Three-layer system (Foundation → Semantic → Environments) is defined and frozen | ✅ | `tokens/foundation.css` |
| 2 | **Component Library** — All interactive, overlay, navigation, and primitive components exist | ✅ | `components/ui/` |
| 3 | **Pattern Library** — All 9 patterns exist with typed `Content` prop interfaces | ✅ | `components/patterns/` |
| 4 | **Template Library** — `LandingTemplate`, `PortfolioTemplate`, `CaseStudyTemplate` exist | ✅ | `components/templates/` |
| 5 | **Data Contracts (Pattern Level)** — `types/content/patterns.ts` fully defines all 8 pattern payloads | ✅ | `HeroContent`, `StoryContent`, etc. |
| 6 | **Data Contracts (Model Level)** — `types/content/models.ts` defines all 6 page models | ✅ | `HomepageModel`, `ServicesModel`, `AboutModel`, `ContactModel`, etc. |
| 7 | **Content Seeds** — All 5 pages have fully typed seed files | ✅ | `content/seeds/*.ts` |
| 8 | **Composition Recipes** — Recipe registry declares required/optional slots per page | ✅ | `content/recipes/index.ts` |
| 9 | **Visual Regression** — Design history checkpoint created before first migration | ⏳ | Run `git tag checkpoint/pre-migration` |

---

## Certification Status: 8/9 ✅

> [!IMPORTANT]
> **One item remaining before migration can begin:**
> Create a git checkpoint tag before touching any production page.
> Run: `git tag checkpoint/pre-production-migration`

---

## Migration Order (Post-Certification)

| Sprint | Page | Template | Seed | Priority Rationale |
|:--|:---|:---|:---|:---|
| 1 | `Index.tsx` | `LandingTemplate` | `homepageSeed` | Highest traffic. Validates full stack. |
| 2 | `PortfolioPage.tsx` | `PortfolioTemplate` | `portfolioSeed` | Core brand differentiator. |
| 3 | `ProjectPage.tsx` | `CaseStudyTemplate` | _(dynamic from API)_ | Highest conversion quality. |
| 4 | `ServicesPage.tsx` | `ServicesTemplate` | `servicesSeed` | — |
| 5 | `AboutPage.tsx` | `AboutTemplate` | `aboutSeed` | — |
| 6 | `ContactPage.tsx` | `ContactTemplate` | `contactSeed` | — |
| 7 | Estimator | _(bespoke)_ | _(bespoke)_ | After design proven on 6 pages. |

---

## What "Production Migration" Means

A page is **migrated** when:
- It renders exclusively through a `Template` component
- All content is provided via a typed `seed` or CMS adapter (no inline JSX strings)
- No UI primitives (spacing, colour values) appear in the page file itself
- `tsc --noEmit` passes with zero errors on the page file
