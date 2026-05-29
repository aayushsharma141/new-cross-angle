# Main Website

## What Is This?

The public-facing website at **crossangleinterior.com** — the first thing potential clients see. It's designed to showcase Cross Angle Interior's work, build trust, and convert visitors into leads.

---

## Pages & What They Do

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Hero section, process overview, portfolio highlights, testimonials |
| Services | `/services` | Residential, commercial, and turnkey interior services |
| Portfolio | `/portfolio` | Project gallery with filtering and detail views |
| About Us | `/about-us` | Company story, team, values, and trust signals |
| Blog | `/blog` | SEO-driven articles about interior design |
| Contact | `/contact-us` | Contact form, office location map, WhatsApp link |
| Style Quiz | `/style-quiz` | Interactive aesthetic discovery experience |
| Cost Estimator | `/estimate` | Budget calculator for interior projects |

---

## Key Design Decisions

- **Dark luxury theme** — Black backgrounds with gold (#FFD700) accents and crimson (#C41230) CTAs
- **Scroll-driven animations** — Sections reveal as you scroll using GSAP and Framer Motion
- **Mobile-first** — Fully responsive, optimized for phones and tablets
- **Fast loading** — Images lazy-loaded, code split by route, optimized for Core Web Vitals

---

## How Visitors Become Leads

Every page has strategic "call-to-action" buttons that guide visitors toward:
1. **"Get Free Estimate"** button (always visible in navigation) → Cost Estimator
2. **"Discover Your Aesthetic"** → Style Quiz
3. **Contact form** → Direct lead capture
4. **WhatsApp button** → Instant messaging

All leads flow into the Admin Panel's CRM system automatically.

---

## Navigation Structure

```
┌─────────────────────────────────────────────────────┐
│  Logo   Home  Services  Portfolio  About  Blog  Contact  │  [Get Free Estimate]  │
└─────────────────────────────────────────────────────┘
```

---

## Design References

HTML mockups for the original design specifications are stored in this folder:
- `homepage_v2.html` — Homepage design spec
- `services.html` — Services page design
- `design_spec_v2.2.html` — Overall design system spec

---

## Related Documentation

- [Portfolio Showcase](../portfolio-showcase/README.md) — How the project gallery works
- [Lead Generation System](../lead-generation-system/README.md) — How contact forms capture leads
- [CMS-Driven Content](../cms-driven-content/README.md) — How blog and services content is managed
