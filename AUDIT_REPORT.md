# Cross Angle Interior — Public Pages Audit Report

**Generated:** June 10, 2026
**Scope:** 19 public-facing pages, media usage, content hierarchy, UX behavior

---

## A. Pages Overview

| # | Page | Route | Data Source | Editability | h1 | `<main id="main-content">` | OG Tags |
|---|------|-------|-------------|-------------|----|----------------------------|---------|
| 1 | Index (Home) | `/` | Mixed (CMS + static) | Partial | In Hero component | ✅ | ✅ Full |
| 2 | About Page | `/about-us` | Mixed (CMS + static) | Partial | In AboutHero | ✅ | ✅ Full |
| 3 | Our Process | `/our-process` | Mostly static | Low | ✅ Direct h1 | ✅ | ✅ Full |
| 4 | Services | `/services` | CMS + static | Medium | In ServicesHero | ✅ | ✅ Full |
| 5 | Service Category | `/services/:category` | Mixed | Medium | ✅ Dynamic h1 | ✅ | ✅ Full |
| 6 | Service Detail | `/services/:category/:service` | Mixed | Medium | ✅ Dynamic h1 | ✅ | ✅ Full |
| 7 | Project Hub | `/portfolio` | Mixed (CMS + static) | Medium | In HubHero | ✅ (fixed) | ✅ Full |
| 8 | Project Page | `/portfolio/:slug` | CMS | **High** | In ProjectHero | ✅ | ✅ Full |
| 9 | Gallery | `/gallery` | CMS | **High** | ✅ Direct h1 | ✅ | ✅ Full |
| 10 | Blog | `/blog` | CMS | Medium | ✅ Featured h1 | ✅ | ✅ Full |
| 11 | Blog Detail | `/blog/:slug` | CMS | **High** | ✅ Direct h1 | ✅ | ✅ Full |
| 12 | Contact | `/contact-us` | Mixed | Partial | In CTAContact | ✅ | ✅ Full |
| 13 | Location | `/locations/:city` | Static | Low | ✅ Direct h1 | ✅ | ✅ Full |
| 14 | Price Estimator | `/estimate` | Static + localStorage | Low | ✅ Direct h1 | ✅ | ✅ Full |
| 15 | Discovery Engine | `/aesthetic-discovery-engine` | Static + localStorage | Low | ✅ sr-only h1 | ✅ | ✅ Full |
| 16 | Shared Result | `/aesthetic-discovery-engine/results/:slug` | CMS | Medium | In ResultsReveal | ✅ (fixed) | ✅ Full |
| 17 | Privacy Policy | `/privacy` | Static | None | ✅ Direct h1 | ✅ | ✅ Full |
| 18 | Terms | `/terms` | Static | None | ✅ Direct h1 | ✅ | ✅ Full |
| 19 | Not Found | `*` | Static | None | ✅ Fixed (h1: "404") | ✅ (fixed) | ✅ Added |

> **Key:** ✅ = Good / Fixed, Partial = Partially implemented, Low/Medium/High = relative ability to edit via admin CMS

---

## B. Issues Found & Fixed

### B.1 Content Hierarchy (h1-h6)

| Issue | Pages | Fix |
|-------|-------|-----|
| Missing `<main>` + `id="main-content"` | Index, NotFound, SharedResultPage | Added `<main id="main-content">` |
| Missing `id="main-content"` on `<main>` | ProjectHubPage | Added `id="main-content"` |
| Missing `<h1>` at page level | NotFound (was "404" only), AboutPage/ServicesPage/ContactPage had h1 in child components (verified OK) | NotFound: changed to meaningful title + Helmet |

### B.2 Accessibility

| Issue | Pages | Fix |
|-------|-------|-----|
| No skip-link target | Index, ProjectHubPage, NotFound, SharedResultPage | Added `id="main-content"` to `<main>` |
| Missing Helmet (page title) | NotFound | Added `<title>` + description + `noindex` |
| ARIA tabs without tabpanel | BlogPage (category filter) | Known limitation — filter buttons not true ARIA tabs |
| CSS columns tab order | GalleryPage | Migrated from CSS columns to JS-based flex column distribution |

### B.3 Bugs Fixed

| Bug | Page | Fix |
|-----|------|-----|
| `sortBy` state never applied to filtering | BlogPage | Added sort logic to `filtered` useMemo |
| Featured post appears twice in DOM | BlogPage | Excluded `blogPosts[0]` from `paginatedPosts` |
| Trending posts = first 6, not most viewed | BlogPage | Added `view_count` sort for trending |
| FAQ heading renders with empty FAQ array | ServiceDetailPage | Wrapped section in `service.faq?.length > 0` |
| Gallery items ordered top-to-bottom | GalleryPage | Replaced CSS columns with JS distribution (`distributeIntoColumns`) |
| Estimator full-screen had no site navigation | PriceEstimator | Added floating "← Home" button |

### B.4 Missing OG/Social Tags Fixed

| Tags Added | Pages |
|------------|-------|
| Full OG tags (title, description, type, url) | Gallery, ProjectHub, OurProcess, ServiceCategory, ServiceDetail, Project, Location, Privacy, Terms, PriceEstimator (×2 states), Discovery |
| OG tags + canonical | All 12 previously missing pages |

### B.5 Error & Empty States

| Issue | Pages | Severity |
|-------|-------|----------|
| No error state on API failure | ServicesPage, GalleryPage, BlogPage | **Medium** (user sees empty state silently) |
| No empty state for empty category | ServiceCategoryPage | **Low** (hero + CTA still show) |
| FAQ heading without items | ServiceDetailPage | **Fixed** |

---

## C. Media Audit — Full Catalog

### C.1 Editable via Admin CMS (Supabase)

| Page | Section | Media | Source Table |
|------|---------|-------|-------------|
| Index | Hero slideshow | Images/video | `hero_media` |
| Index | Portfolio preview | Project hero images | `projects` |
| Index | Services grid | Service hero images | `services` |
| Index | Process steps | Step images | `services` / `steps` |
| Index | Testimonials | Avatar images | `testimonials` |
| Index | Blog preview | Blog cover images | `blog_posts` |
| Index | Before/After | Comparison images | `projects.gallery[]` |
| Index | Brand partners | Logo SVGs | `trust_section` / partners |
| Index | ServiceLocations | City images | Location data array |
| AboutPage | About video | YouTube URL | `site_settings.about_video_url` |
| AboutPage | Team members | Profile images | `team` |
| AboutPage | Timeline | Milestone images | `timeline` data |
| ServicesPage | Service cards | Hero images | `services` |
| ServiceCategoryPage | Hero + cards | Service images | `services` |
| ServiceDetailPage | Hero + related | Service images | `services` |
| ProjectHubPage | Featured/Grid/StyleSelector | Project images | `projects` |
| ProjectHubPage | SpaceNavigator | Category images | ImageKit CDN (config) |
| ProjectHubPage | InspirationGallery | Moodboard images | ImageKit CDN (config) |
| ProjectPage | Hero/Gallery/BeforeAfter | Project images | `projects.gallery[]` |
| ProjectPage | Palette | Material swatches | `materials` |
| GalleryPage | Grid/Lightbox | Gallery images | `gallery` |
| BlogPage | Hero/Grid/Trending | Cover images | `blog_posts` |
| BlogDetailPage | Article header | Cover image | `blog_posts.cover_image_url` |
| BlogDetailPage | Article body | Inline images | `blog_posts.content` (HTML) |
| ContactPage | Map | Google Maps iframe | `site_settings.map_embed_url` |
| SharedResultPage | OG image | Archetype preview | Static files (10 archetypes) |
| OurProcessPage | Process workflow | Images | Via child CMS components |

### C.2 Hardcoded (Not Editable via Admin)

| Page | Section | Media | File Path |
|------|---------|-------|-----------|
| Index | Hero fallback | Background | `/hero_reality_render_1775299733746.png` |
| Index | TactileJourney | 4 mood images | `@/assets/portfolio-bedroom.jpg`, `portfolio-kitchen.jpg`, `portfolio-office.jpg` |
| Index | ServiceLocations | 5 city images | Hardcoded array |
| Index | Brand partners | 7 SVG logos | `/asian%20paint.svg`, `/Hafele.png`, `/Godrej.svg`, `/philips.png`, `/Hettich.svg`, `/Jaquar.svg` |
| Index | Logo | Brand logo | `@/assets/logo-icon.png` |
| Index | Footer + ServiceLocations | Noise texture | `/noise.svg` |
| Index | Schema | OG image URLs | `https://crossangleinterior.com/reality_render.jpg` |
| Index | Schema | Logo URL | `https://crossangleinterior.com/logo-icon.png` |
| AboutPage | Schema | Logo URL | `https://crossangleinterior.com/logo-icon.png` |
| ServicesPage | Hero | Background | `/reality_render.jpg`, `/blueprint_shell.jpg` |
| ServicesPage | ServicesWhyUs | Illustration | `/images/projects/discovery/visual-5.jpg` |
| ProjectHubPage | HubHero | 3 rotating hero images | `@/assets/portfolio-bedroom.jpg`, `kitchen.jpg`, `office.jpg` |
| ProjectHubPage | HubLightExperience | Feature image | `/images/projects/discovery/lifestyle-5.jpg` |
| ProjectHubPage | HubFinalCTA | Background | External Wix static URL |
| ProjectPage | Fallback gallery | 5 images | `/images/projects/discovery/lifestyle-5.jpg`, `visual-11.jpg`, `portfolio-*.jpg` |
| ProjectPage | Video placeholder | Background | `/images/projects/discovery/lifestyle-4.jpg` |
| BlogPage | Newsletter | Decorative image | Unsplash external URL |
| ContactPage | Background | `/reality_render.jpg` | Static file |
| ContactPage | Map fallback | `/map-preview.png` | Static file |
| LocationPage | Hero | Unsplash image | `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0` |
| NotFound | Background | `/reality_render.jpg` | Static file |
| DiscoveryPage | VisualInstinct | 18 images | `@/assets/discovery/visual-1.jpg` .. `visual-18.jpg` |
| DiscoveryPage | ReflectionPrompt | 33 images | `@/assets/discovery/reflect-*.jpg` |
| DiscoveryPage | LifestyleReflection | 9 images | `@/assets/discovery/lifestyle-1.jpg` .. `lifestyle-9.jpg` |
| DiscoveryPage | LightCalibration | Room base | `/common_bedroom_base.png` |
| DiscoveryPage | WelcomeScreen | Preview | `/images/projects/discovery/visual-2.webp` |
| SharedResultPage | OG | 10 archetype images | `/og/archetypes/*.jpg` |
| All pages | Global | Favicons | `/favicon.ico`, `/favicon-32x32.png`, `/favicon-16x16.png`, `/favicon.svg`, `/apple-touch-icon.png` |
| All pages | Global | Web manifest | `/site.webmanifest` |
| All pages | Global | Social icons | Inline SVGs (Facebook, Instagram, YouTube, WhatsApp, Phone) |
| All pages | Global | Navbar logo | `@/assets/logo-icon.png` |
| All pages | Global | Footer noise | `/noise.svg` |

### C.3 Lucide Icons Used (by Page)

| Page | Icons |
|------|-------|
| Index | ArrowRight, Sparkles, MapPin, Star, ShieldCheck, Award, Users, Clock, Check, Hammer, Home, Palette, Ruler, ArrowUpRight, X, Quote, ChevronLeft, ChevronRight, BookOpen |
| AboutPage | ArrowRight, Target, Lightbulb, Award, Users, Clock, Sparkles, Compass, Gem, Ruler, LayoutGrid, MapPinHouse, X, Phone, Instagram, Linkedin, Mail |
| ServicesPage | Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed, ArrowRight, Check, ShieldCheck, Zap, BarChart3, Compass, Calculator, Sparkles, Fingerprint, Layers, X, ChevronLeft, ChevronRight, Loader2 |
| ServiceCategory | ArrowRight, Check, Loader2 |
| ServiceDetail | ArrowRight, CheckCircle2, ChevronRight, Loader2, Sparkles |
| ProjectHub | ArrowUpRight, Building2, MessageCircle, Calendar |
| ProjectPage | ArrowDown, ArrowRight, MapPin, Ruler, Clock, Palette, Calendar, Banknote, Sparkles, ChevronLeft, ChevronRight, Play, Quote, MessageCircle |
| GalleryPage | Heart, Share2 |
| BlogPage | Search, Clock, Eye, ArrowRight, ArrowDown, TrendingUp, Mail, Sparkles, BookOpen, Tag, ChevronRight, Armchair, Lamp |
| BlogDetail | Clock, Eye, ArrowLeft, ArrowRight, ChevronRight, List, Calculator, ChevronUp, Linkedin |
| ContactPage | Various (via CTAContact, ContactFAQ) |
| LocationPage | MapPin, Building, Home, Users, ArrowRight |
| PrivacyPage | Shield, Database, Lock, Eye, Mail, Trash2, ArrowLeft, Users, AlertTriangle, FileText |
| TermsPage | ArrowLeft, Scale, Hammer, Clock, ShieldCheck, CreditCard, Lightbulb, AlertTriangle, XCircle, FileText, Phone |
| PriceEstimator | LayoutGrid, Building2, PaintBucket, PenTool, Compass, Sparkles, MessageSquareText |
| DiscoveryPage | Sparkles, Compass, ArrowRight, Heart, Brain, Star, Quote, MessageCircle, Wand2, Layers, Palette, Check, X, Eye, Clock, Mountain, Zap, Leaf, Globe, Map, Users, Shield, Home, Award, Grid3x3, Wrench, BookOpen, Lightbulb, Pen, BarChart3, SlidersHorizontal, Play, Pause, Maximize2, Minimize2, Sun, Moon, Monitor, Smartphone, Table, Sigma, Crosshair, FlaskConical, ScrollText, Hash, Bed, Utensils, Bath, Monitor, Coffee, Briefcase, Plus, AlertTriangle, ChevronDown, Building2, LayoutTemplate, Ruler, PaintRoller, Hammer, MapPin, TrendingDown, Loader2, Sunrise, Sunset, Moon, Leaf, Brain, Flame, Dog, Home, ChefHat, Timer, Wine, CalendarDays, CalendarHeart, CalendarClock, Copy, Download, Share2, ChevronUp, Instagram, Linkedin, Mail, ArrowLeft |

**Total: ~110 unique Lucide icons** (many repeated across pages)

---

## D. Data Flow & Worthiness

### D.1 Pages with Strong User Value (Content-Rich)
1. **Index** — Full marketing narrative: hero → about → services → portfolio → testimonials → blog → CTA
2. **ProjectPage** — Deep storytelling: hero → story → design decisions → gallery → materials → outcomes → related
3. **BlogDetailPage** — Rich reading: progress bar → ToC → sticky bar → share → related → lead magnet
4. **GalleryPage** — Browse + save: category filter → masonry grid → lightbox → inspiration board (localStorage + share)
5. **PriceEstimator** — Utility flow: blueprint integration → scope selection → step-by-step estimate
6. **DiscoveryPage** — Immersive quiz: 9-step flow → AI analysis → blueprint results

### D.2 Pages with Thin Content (SEO Risk)
1. **LocationPage** — 5 real cities + generic fallback for unknown slugs. Fallback has duplicate content across unknown cities. Commented-out schema reminder suggests incompleteness.
2. **OurProcessPage** — Minimal shell with only 2 sections. Heavy reliance on sub-components.
3. **ServiceCategoryPage** — No empty-state message when category has no services (hero + CTA still render).

### D.3 Pages with No Admin Editability
1. **PrivacyPage** — Fully static legal text
2. **TermsPage** — Fully static legal text
3. **NotFound** — Fully static
4. **LocationPage** — Static city data in code
5. **PriceEstimator** — Static ecosystem copy + localStorage discovery
6. **DiscoveryPage** — 60 static images, localStorage-based quiz

---

## E. Performance Observations

- **5439 modules** in bundle, **~1.5 MB** discovery chunk (largest)
- **60 static images** in DiscoveryPage alone (visual/reflect/lifestyle) — largest contributor to asset weight
- Pre-existing warnings: chunk sizes >500 KB, ambiguous Tailwind classes (`duration-[2s]`, `duration-[900ms]`)
- CSS columns → JS masonry change may slightly increase CLS if column count recalculates after paint
- All gallery/blog/project images lazy-loaded via `<Image loading="lazy">` or `LazySection`

---

## F. Remaining Recommendations

### Priority: Medium
1. **Error boundaries** for lazy-loaded sections (ProjectHubPage Suspense fallbacks could show on network failure)
2. **LocationPage schema** — implement the commented-out `LocalBusiness` markup
3. **BlogPage ARIA tabs** — replace fake tablist pattern with proper `aria-controls` + `tabpanel`

### Priority: Low
1. **ServicesPage/ServiceCategoryPage error state** — show retry button on API failure
2. **GalleryPage error state** — show toast/retry on gallery fetch failure
3. **LocationPage canonical** — ensure unknown-city fallback pages don't compete with known-city pages

---

*End of report. 19 pages audited, 15+ issues fixed, 51+ media sources cataloged.*
