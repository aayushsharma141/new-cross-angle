# SEO Audit: Schema.org Structured Data (JSON-LD)

| Audit Metadata | Detail |
|:---------------|:-------|
| **Standard**   | Schema.org compliant JSON-LD syntax, entity graph validation |
| **Status**     | **PASS (Certified)** |
| **Audit Date** | 2026-08-06 |
| **Scope**      | `SchemaMarkup.tsx`, Entity definitions, LocalBusiness, Organization, BreadcrumbList |

---

## 1. Executive Summary

Rich snippet eligibility and knowledge graph presence are established via typed Schema.org JSON-LD injections (`SchemaMarkup.tsx`). All schemas are sanitized against injection attacks (`serializeJsonLd`) and provide complete structured data for Google Search rich results.

---

## 2. Evidence & Schema Implementations

### 2.1 LocalBusiness & InteriorDesigner Entity
- **Properties:** Name, `@id`, telephone, price range, address (Jamshedpur / Jharkhand), opening hours, geo coordinates, customer service contact points.
- **Location Coverage:** Structured localized service areas for Jamshedpur, Ranchi, and eastern regional hubs.

### 2.2 Organization & Brand Entity
- **Properties:** Official name, logo URI, founding date (2015), founder (`Aayush Sharma`, Founder & Lead Architect), verified social links (Instagram, Facebook).

### 2.3 BreadcrumbList Schema
- Programmatically emitted across nested routes (`/services/:category/:service`, `/portfolio/:slug`, `/blog/:slug`) providing Google Search breadcrumb display trails.

### 2.4 FAQPage Schema
- Embedded on FAQ-bearing routes (`/our-process`, `/services`, `/contact-us`) allowing interactive search accordion expansions directly in search engine result pages (SERPs).

---

## 3. Verification Protocol

- **Google Rich Results Validation:** Validated schema trees pass without errors or missing required fields.
