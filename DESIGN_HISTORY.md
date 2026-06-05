# ✦ CrossAngle Global Design History Tracker ✦

Welcome! This is the unified **Global Design Timeline and Checkpoint Log** for all pages and components across the CrossAngle platform.

If we are editing or updating any UI component, this history file acts as our shared "Truth Engine." To make alterations fully controlled and reversible, look up the target page section below.

---

## 1. Page and Component History Segments

Select a component segment below to view its full visual history, design variations, and exact Git checkpoint tags:

* 🖥️ **[Welcome Screen Layouts](file:///c:/Users/aayus/Desktop/main/design-history/welcome_screen.md)**
  Tracks the Main Aesthetic welcome page iterations (Meteors dark theme, SoftAurora light theme, Zen step wizard, and the active Hybrid scrolling version).
* 🧭 **[Discovery Quiz Wizard Steps](file:///c:/Users/aayus/Desktop/main/design-history/discovery_wizard.md)**
  Tracks individual quiz step components (LightCalibration daylight/candlelight toggles, PropertyReality selections, results DNA reveal pages, etc.).
* 🏠 **[Homepage Components](file:///c:/Users/aayus/Desktop/main/design-history/homepage.md)**
  Tracks home sections (Minimal curating Hero, process timelines, BeforeAfter showcase splitter, and Tactile carousel).
* 🌐 **[Global brand & Layouts](file:///c:/Users/aayus/Desktop/main/design-history/global_layout.md)**
  Tracks global elements (logo dimensions, Navbar inline wordmark configurations, Footer quick link updates, and translation language switches).
* 📬 **[Contact Page](file:///c:/Users/aayus/Desktop/main/design-history/contact_page.md)**
  Tracks Contact page iterations. v1 = 5-section cluttered layout. v2 = Full redesign: merged hero+form, compact map card, slim FAQ, social pill strip.
* 📖 **[About Page Layouts](file:///c:/Users/aayus/Desktop/main/design-history/about_page.md)**
  Tracks About page components (Luxury Cursor Hero, dynamic glass panels, cascades, custom gradients, floating ambient glowing orbs, and timeline adjustments).
* 🗺️ **[Blueprint Page Timeline](file:///c:/Users/aayus/Desktop/main/design-history/blueprint_page.md)**
  Tracks the System Blueprint page iterations (V1 Tech Stack, V2 Bento Grid, and V3 Active Interactive Chronological Timeline showcasing database schemas, staggering layouts, and CRM realtime syncing).

---

## 2. Dynamic Alignment Protocol (For AI Agents)

Whenever a new coding conversation is started for a UI update or styling overhaul:

1. **Scan Checkpoints First:** The agent must automatically read this hub file and navigate to the relevant design history segment file under the `design-history/` directory.
2. **Display State Summary:** The agent must present a short summary to the user outlining what the active visual layout is, and what historical design variations exist for that file in our history log.
3. **Ask before Overwriting:** The agent will ask you: *"Do you want to build directly on top of the current layout, restore/toggle a specific feature from a previous checkpoint (e.g. Iteration #2), or execute a brand new alteration?"*
4. **Git Checkpointing:** Before executing any changes, the agent will tag a new Git checkpoint (e.g. `checkpoint/v5-...`) to ensure your current design is never lost.

---

## 3. How You Can Command Reverts

To selectively revert any specific component, simply tell me in our chat:

* **Whole Component Revert:**
  > *"Revert `WelcomeScreen.tsx` completely to the **v3-zen-wizard** checkpoint."*
* **Granular Block Revert:**
  > *"Pull the **AnimatedBeam diagram** from **checkpoint/v3-zen-wizard**, but keep my current **stats row** from **HEAD**."*
