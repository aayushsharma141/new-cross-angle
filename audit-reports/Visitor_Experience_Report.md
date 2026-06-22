# Visitor Experience & Perception Report — CrossAngle Interior

This report evaluates the **CrossAngle Interior** website from the perspective of an ultra-high-net-worth (UHNW) luxury client and a standard visitor, capturing live browser observations, design token consistency, scroll performance, micro-interactions, and visual bugs.

---

## 1. Visual Hierarchy, Design Language & Aesthetics

The design uses a dark-mode cinematic theme with a luxury brand appeal (reminiscent of premium European architectural design agencies).

- **Core Palette:** Charcoal canvas (`#000000`, `#020202`, `#0D0D0D`) paired with Gold (`#C6A15B`) and Crimson (`#C41230`) typography highlights.
- **Typography:** Architectural serif headers (**Cormorant Garamond**) paired with high-readability sans-serif body copy (**DM Sans**).
- **Hero Grid System:** High-fidelity architectural renders and widescreen imagery immediately establish premium expertise.

---

## 2. Page-by-Page Visual Audit & Traversal Verification

### A. Homepage (`/`)
- **First Impression:** Instantly loads a full-screen hero banner with staggered slides and text animations. Smooth scrolling (powered by Lenis) runs at a consistent 60fps.
- **Navigation Dock:** Floating top menu adjusts from transparent to a glassmorphic frosted border on scroll (`backdrop-blur-xl bg-background/95`).
- **Interactive Elements:** Scroll dot navigator works seamlessly; clicking dot 3 transitions to the Selected Works (Portfolio) section.
- **Visual Screenshots:**
  - ![Homepage View](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/homepage_view_1781855711528.png)
  - ![Homepage Style Quiz Teaser](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/homepage_scroll_1_1781855728266.png)
  - ![Selected Works Grid](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/homepage_portfolio_section_1781855772989.png)

---

### B. About Us Page (`/about-us`)
- **Layout Integrity:** Keeps the premium dark aesthetic, adding a clear breadcrumb (`Home / About Us`) and founder profile sections.
- **⚠️ Critical Data Inconsistency:**
  > [!WARNING]  
  > The experience metrics on the About page say **"15+ Years Experience"** and **"500+ Projects Delivered"**, which directly contradicts the Homepage metrics: **"12+ Years Experience" and "150+ Projects Completed"**.
- **Visual Screenshot:**
  - ![About Us Page](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/about_page_view_1781855873296.png)

---

### C. Services Hub (`/services`)
- **Before/After Component:** The GSAP-driven slider handles drag actions without latency (successfully verified dragging from `734px` to `600px`).
- **⚠️ Typography Layering Bug:**
  > [!CAUTION]  
  > In the hero text animation overlay, the two headlines **"Architecture Without Intelligence Is Decoration."** and **"Architecture Without Execution Is Incomplete."** render directly on top of each other, creating an unreadable mess.
- **Visual Screenshots:**
  - ![Services Hub Overview](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/services_hub_view_1781855960477.png)
  - ![Services Hub Overlapping Text](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/services_hub_clean_1781856017598.png)

---

### D. Service Category & Service Detail Pages (`/services/:category`, `/services/:category/:service`)
- **Category View:** Hero overlays use standard category banners. Renders alternating feature breakdowns.
- **Detail View:** Incorporates breadcrumbs (`Home / Services / Residential Design / Living Room Design`), process timelines, and service-specific FAQs.
- **⚠️ Discrepancy (Missing Elements):**
  - The side floating social media strip (`Facebook / Instagram / Pinterest` vertical side rail) present on the Homepage, About page, and Services Hub is **missing** from both the Category page and Detail page, creating visual navigation inconsistency.
- **Visual Screenshots:**
  - ![Service Category Page](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/service_category_view_1781856094673.png)
  - ![Service Detail Page](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/service_detail_view_1781856157123.png)

---

### E. Portfolio Hub (`/portfolio`)
- **Interaction:** Sorting buttons (All, Residential, Commercial) work dynamically.
- **⚠️ DB Inconsistency:**
  - Clicking "Commercial" correctly shows the empty state: *"Collection curation in progress."*. However, on the Homepage, the portfolio segment includes an "Executive Workspace" card categorized as Commercial.
- **Visual Screenshot:**
  - ![Portfolio View](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/portfolio_view_1781856224736.png)

---

### F. Gallery & Moodboard (`/gallery`)
- **Moodboard Saving:** Heart/save features correctly save elements to `localStorage`. The saved badge counter dynamically updates from `0` to `2`.
- **Visual Feedback Gap:** Saving an item updates the counter, but no visual Toast confirmation displays, giving low tactile feedback on interaction.
- **Visual Screenshot:**
  - ![Gallery Moodboard View](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/gallery_view_1781857218671.png)

---

### G. Cost Estimator (`/estimate`)
- **Supabase Load Timeout:** When loading the page locally, it takes 15 seconds to mount Step 0 selections due to a backend connection timeout.
- **⚠️ Visual Design Token Disconnect:**
  - The step selection buttons use a **green gradient highlight** (light-mode styled button) instead of the deep gold/crimson styling seen elsewhere on the platform, breaking the unified color palette.
- **Visual Screenshot:**
  - ![Cost Estimator Step 0](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/estimator_view_1781857319321.png)

---

### H. Aesthetic Discovery quiz page (`/aesthetic-discovery-engine`)
- **Layout & Onboarding**: The landing page has been updated to the V3 luxurious split layout. The Left Panel holds brand narrative and CTAs, while the Right Panel hosts the interactive tabs.
- **Redesigned Archetypes Tab**: The horizontal scroll card slider has been replaced:
  - **Desktop**: A sleek split catalog with scrollable style names on the left (35%) and detailed traits, material bias, design strategy, and interactive color palettes with hover tooltips on the right (65%).
  - **Mobile**: Collapsible accordions with instant transition animations, providing perfect vertical fitting without horizontal clip constraints.
- **Visual Screenshots**:
  - ![Aesthetic Discovery Quiz](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/discovery_quiz_view_1781857502111.png)
  - ![Warm Modernist Detail Grid](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/8198f32b-2298-403f-9a77-66f0699dd811/warm_modernist_hover_1781953520704.png)
  - ![Serene Naturalist Detail Grid](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/8198f32b-2298-403f-9a77-66f0699dd811/serene_naturalist_hover_1781953550784.png)


---

### I. Contact Page (`/contact-us`)
- **Brief Builder:** A multi-step form detailing project metadata. Progresses properly from user identification to project layout properties.
- **Visual Screenshot:**
  - ![Contact Page View](file:///C:/Users/aayus/.gemini/antigravity-ide/brain/6eaa78d9-dbbc-4188-a679-422ed9345545/contact_page_view_1781857731211.png)

---

## 3. Top Visitor-Facing Visual & Interaction Anomalies

| Discrepancy | Severity | Location | Description |
| --- | --- | --- | --- |
| **Text Overlapping** | CRITICAL | `/services` Hero | Underlining phrases are animated synchronously, causing overlapping rendering. |
| **Experience Metric Inconsistency** | MAJOR | `/` vs `/about-us` | Homepage lists 12+ years / 150+ projects, while About lists 15+ years / 500+ projects. |
| **Color System Deviation** | MAJOR | `/estimate` | Accent buttons use green gradients, diverging from Crimson/Gold design tokens. |
| **Auth Connection Timeout** | MAJOR | `/estimate` | White screen for 15s before the wizard mounts because of backend retry delays. |
| **Missing Social Float Strip** | MINOR | `/services/:category` | Vertical side social panel is completely absent on Category/Detail routes. |
| **Gallery Toast Absence** | MINOR | `/gallery` | Saving an item updates the counter, but does not render a visual notification. |
| **Portfolio DB Disparity** | MINOR | `/portfolio` vs `/` | Homepage lists one Commercial project, but the Portfolio page lists none. |
