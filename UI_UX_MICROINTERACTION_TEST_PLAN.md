# Comprehensive UI/UX Micro-Interaction Testing Plan

## Overview

This document outlines a comprehensive testing plan for verifying all micro-interactions, content visibility, text rendering, responsive behavior, and module functionality across the frontend application. The codebase is built with React 18 + Vite, Tailwind CSS, Radix UI, Framer Motion, and GSAP.

---

## 1. Content Visibility & Text Rendering Tests

### 1.1 Text Overflow & Truncation

| Element | Test Criteria | Pass Condition |
|---------|--------------|----------------|
| **Headings (H1-H6)** | No text truncation, no overflow | All heading text fully visible |
| **Body Text** | No hidden content, proper wrapping | Text wraps within container bounds |
| **Navigation Links** | No overlapping with adjacent elements | Links don't overflow container |
| **Buttons** | Text fully visible, no truncation | Button text not cut off |
| **Card Titles** | Consistent truncation if needed | Truncated with ellipsis, not cut mid-word |
| **Footer Text** | Full visibility, proper alignment | No horizontal scroll |
| **Form Labels** | Clear visibility, no overlap | Labels don't overlap inputs |
| **Error Messages** | Fully visible, distinct color | Error text not truncated |
| **Tooltips** | Content fully displayed | Tooltip text fully visible |
| **Modal Titles** | No truncation | Titles display completely |

### 1.2 Text Overlap Detection

| Scenario | Test Method | Expected Result |
|----------|-------------|----------------|
| **Overlapping Elements** | Inspect z-index and positioning | No elements overlap unexpectedly |
| **Layered Content** | Check z-index hierarchy | Modal > Dropdown > Content > Background |
| **Fixed Elements** | Verify fixed nav/headers don't overlap content | Content scrolls under fixed elements |
| **Absolute Positioning** | Check for hidden overflow | Positioned elements within bounds |
| **Sticky Elements** | Verify sticky headers don't hide content | Content starts below sticky header |
| **Image Text Overlay** | Check contrast ratio | Text readable over images |
| **Gradient Overlays** | Verify text legibility | Sufficient contrast maintained |

### 1.3 Typography & Font Rendering

| Aspect | Test Cases |
|--------|-----------|
| **Font Loading** | Web fonts load without FOUT (Flash of Unstyled Text) |
| **Fallback Fonts** | Fallback fonts display correctly when primary fails |
| **Font Weights** | All weights (300-900) render correctly |
| **Line Height** | Adequate line height for readability |
| **Letter Spacing** | Proper letter spacing, especially for headings |
| **Font Size Scaling** | Font sizes scale properly at different viewports |
| **Font Styling** | Italics, bold, underline render correctly |
| **Chinese/Indic Support** | Non-Latin characters render properly (if applicable) |

### 1.4 Content Section Tests

#### Homepage Content
| Section | Content Test | Validation |
|---------|--------------|------------|
| **Hero** | Headline, subheadline, CTA visible | All text readable, no overlap |
| **About Preview** | Company description, stats | Text fully visible |
| **Services Preview** | Service names, descriptions | Cards display correctly |
| **Portfolio Preview** | Project thumbnails, titles | No text overflow |
| **Testimonials** | Quote, author name, role | All text visible |
| **Trust Indicators** | Logo strip, stats | No truncation |
| **Footer** | All footer content | Proper alignment |

#### Services Page Content
| Component | Test Criteria |
|-----------|--------------|
| **ServicesHero** | Main headline, supporting text visible |
| **Service Categories** | Category names, icons, descriptions |
| **Service Cards** | Title, description, price range, CTA |
| **Process Steps** | Step numbers, titles, descriptions |
| **Why Choose Us** | Stats, benefits, icons |
| **FAQ Section** | Questions, expandable answers |
| **CTA Section** | Headline, form/button |

#### Projects/Portfolio Content
| Component | Test Criteria |
|-----------|--------------|
| **Project Hub** | Filter tabs, project grid |
| **Project Cards** | Title, category, thumbnail, hover overlay |
| **Project Detail** | Hero, story, gallery, specs |
| **Moodboard** | Image grid, captions |
| **Color Palette** | Color swatches, hex codes |
| **Project Stats** | Stat values, labels |
| **Related Projects** | Similar project cards |

#### About Page Content
| Component | Test Criteria |
|-----------|--------------|
| **AboutHero** | Company name, tagline, image |
| **About Story** | Long-form content, milestones |
| **Team Section** | Team member cards, bios |
| **Values Section** | Value cards with icons |
| **Timeline** | Company history, events |
| **Awards/Certifications** | Badge images, labels |

#### Contact Page Content
| Component | Test Criteria |
|-----------|--------------|
| **ContactForm** | All form fields visible |
| **Contact Info** | Address, phone, email |
| **Map Section** | Map renders, markers visible |
| **FAQ** | Questions and answers |
| **Social Links** | All social media icons |

#### Blog Page Content
| Component | Test Criteria |
|-----------|--------------|
| **Blog List** | Post cards with title, excerpt, date |
| **Blog Detail** | Full article, author, tags |
| **Related Posts** | Related article cards |
| **Categories** | Category filter, tags |
| **Pagination** | Page numbers, navigation |

---

## 2. Route Flow & Automation Tests

### 2.1 Public Route Flows

| Route | Flow Sequence | Content Context |
|-------|--------------|-----------------|
| **Home → Services** | Home → Services | Services content loads with categories |
| **Home → Portfolio** | Home → Portfolio Hub → Project Detail | Project content renders properly |
| **Home → Gallery** | Home → Gallery → Lightbox | Images load in context |
| **Home → About** | Home → About | About content with all sections |
| **Home → Contact** | Home → Contact Form | Form fields with validation |
| **Home → Blog** | Home → Blog List → Blog Detail | Article content renders |
| **Home → Discovery Quiz** | Home → Discovery → Quiz Steps → Results | Quiz flows with state |
| **Home → Estimator** | Home → Estimator → Wizard Steps → Results | Calculator maintains state |

### 2.2 Navigation Flow Tests

| Flow | Test Steps | Pass Criteria |
|------|------------|---------------|
| **Breadcrumb Navigation** | Click breadcrumb links sequentially | Correct page loads, context maintained |
| **Back Button** | Navigate then use browser back | Returns to previous state |
| **Forward Button** | Go back then forward | Restores forward state |
| **Direct URL Access** | Enter URL directly | Page loads with correct data |
| **Deep Linking** | Click internal anchor link | Scrolls to section |
| **External Link** | Click external link | Opens in new tab, correct URL |
| **Mobile Menu Flow** | Open menu → select link → verify close | Menu closes, correct page |

### 2.3 Automation Flow Tests

| Automation | Expected Behavior |
|------------|-------------------|
| **Form Auto-save** | Draft saves without page refresh |
| **Session Timeout Warning** | Modal appears before timeout |
| **Image Lazy Loading** | Images load as they enter viewport |
| **Infinite Scroll** | New content loads on scroll |
| **Filter Persistence** | Filters persist on page refresh |
| **Cart Updates** | Real-time updates without reload |
| **Real-time Notifications** | Toast appears on events |
| **Search Suggestions** | Debounced search results appear |

### 2.4 Content Context Verification

| Context | Test | Validation |
|---------|------|------------|
| **Dynamic Data** | Check API data renders | No "undefined" or "[object Object]" |
| **Localized Content** | Verify translations load | All text in selected language |
| **Role-based Content** | Check admin vs user views | Correct content per role |
| **Personalized Content** | Verify user-specific data | Name, preferences display |
| **Cached Content** | Clear cache, reload | Stale data doesn't persist |
| **Loading States** | Network slow simulation | Skeleton screens appear |

---

## 3. Admin Module Functionality Tests

### 3.1 Admin Authentication

| Test | Steps | Expected Result |
|------|-------|-----------------|
| **Admin Login** | Enter credentials | Redirects to dashboard |
| **Invalid Login** | Wrong credentials | Error message displayed |
| **Session Persistence** | Close browser, reopen | Session maintained |
| **Logout** | Click logout | Redirects to login |
| **Role-Based Access** | Test different roles | Correct permissions applied |
| **Protected Routes** | Access admin without auth | Redirects to login |

### 3.2 CMS Module

| Component | Functionality Test | Content Validation |
|-----------|-------------------|-------------------|
| **Blog Manager** | Create, edit, delete posts | Content saves correctly |
| **Portfolio Manager** | CRUD projects | Images and text persist |
| **Services Manager** | Manage service listings | Categories work |
| **Team Manager** | Add/remove team members | Photos upload correctly |
| **Testimonial Manager** | Approve/reject testimonials | Status updates |
| **Media Library** | Upload, delete, organize | Files accessible |

### 3.3 CRM Module

| Component | Functionality Test | Content Validation |
|-----------|-------------------|-------------------|
| **Lead Management** | Create, edit, delete leads | Data persists |
| **Lead Pipeline** | Drag between stages | Status updates |
| **Lead Detail View** | View all lead info | Complete data display |
| **Lead Filtering** | Filter by status, source | Correct results |
| **Lead Export** | Export to CSV | All data exports |
| **Lead Import** | Bulk upload | Records created |

### 3.4 Discovery Module

| Component | Functionality Test |
|-----------|-------------------|
| **Quiz Configuration** | Edit quiz questions |
| **Result Templates** | Customize results display |
| **Analytics Dashboard** | View quiz performance |
| **Lead Captures** | View quiz submissions |

### 3.5 Estimator Module

| Component | Functionality Test |
|-----------|-------------------|
| **Rate Configuration** | Update pricing rates |
| **Service Categories** | Manage estimator categories |
| **Lead Management** | View estimator submissions |
| **Formula Settings** | Adjust calculation formulas |

### 3.6 System Module

| Component | Functionality Test |
|-----------|-------------------|
| **Settings** | Update site settings |
| **User Management** | CRUD users, roles |
| **Audit Logs** | View activity logs |
| **Health Checks** | Verify system status |

### 3.7 Admin Table Functionality

| Feature | Test | Validation |
|---------|------|------------|
| **Sorting** | Click column header | Data sorts correctly |
| **Pagination** | Navigate pages | Correct records display |
| **Search** | Enter search term | Results filter |
| **Bulk Select** | Select multiple items | Selection persists |
| **Bulk Actions** | Apply bulk operation | Action executes |
| **Column Resize** | Drag column edge | Width adjusts |
| **Row Click** | Click table row | Detail view opens |
| **Inline Edit** | Double-click cell | Edit mode activates |

---

## 4. Responsive Behavior Tests

### 4.1 Desktop View (1280px+)

| Element | Desktop Behavior |
|---------|----------------|
| **Navigation** | Full horizontal nav, all links visible |
| **Layout** | Multi-column grids, sidebars visible |
| **Images** | Full-size images, high resolution |
| **Typography** | Larger font sizes, more spacing |
| **Hover Effects** | All hover states active |
| **Tables** | Full table with all columns |
| **Modals** | Centered with backdrop |

### 4.2 Tablet View (768px - 1024px)

| Element | Tablet Behavior | Adaptation |
|---------|----------------|------------|
| **Navigation** | Condensed nav, possibly hamburger | Responsive nav |
| **Layout** | 2-column grids, collapsible sidebars | Adaptive grid |
| **Images** | Scaled images, lazy loading | Optimized sizes |
| **Typography** | Medium font sizes | Slightly reduced |
| **Touch Targets** | Larger tap targets (44px min) | Touch-optimized |
| **Tables** | Horizontal scroll or simplified | Responsive table |
| **Forms** | Stacked fields | Mobile-friendly layout |
| **Cards** | 2-column layout | Grid adapts |

### 4.3 Mobile View (320px - 767px)

| Element | Mobile Behavior | Adaptation |
|---------|----------------|------------|
| **Navigation** | Hamburger menu, slide-out drawer | Mobile nav |
| **Layout** | Single column, full-width | Stacked layout |
| **Images** | Responsive images, optimized | Smaller file sizes |
| **Typography** | Readable on small screens | Adequate size |
| **Touch Targets** | Minimum 44x44px | Touch-optimized |
| **Buttons** | Full-width CTAs | Larger touch areas |
| **Tables** | Card view or horizontal scroll | Mobile table |
| **Forms** | Single column, larger inputs | Touch-friendly |
| **Modals** | Full-screen or bottom sheet | Mobile modals |
| **Carousels** | Swipe navigation | Touch-enabled |
| **Gallery** | Single column, tap to expand | Mobile gallery |
| **Footers** | Accordion or stacked | Mobile footer |

### 4.4 Small Mobile (<320px)

| Element | Small Mobile Behavior |
|---------|----------------------|
| **Text** | No horizontal overflow |
| **Images** | Scale to fit |
| **Buttons** | Minimum width maintained |
| **Layout** | Single column only |
| **Scroll** | Vertical scroll only |

### 4.5 Responsive Breakpoint Verification

| Breakpoint | Width | Key Adaptations |
|------------|-------|----------------|
| **xs** | < 640px | Mobile-first layout |
| **sm** | 640px - 767px | Small tablets |
| **md** | 768px - 1023px | Tablets |
| **lg** | 1024px - 1279px | Small laptops |
| **xl** | 1280px - 1535px | Desktops |
| **2xl** | 1536px+ | Large screens |

### 4.6 Adaptive Layout Tests

| Layout Type | Desktop | Tablet | Mobile |
|-------------|---------|--------|--------|
| **Grid Layout** | 4 columns | 2 columns | 1 column |
| **Card Layout** | 3-4 cards/row | 2 cards/row | 1 card/row |
| **Table Layout** | Full table | Horizontal scroll | Card view |
| **Form Layout** | Side-by-side | Stacked | Full-width inputs |
| **Navigation** | Horizontal | Hamburger | Hamburger |
| **Sidebar** | Visible | Collapsible | Hidden |
| **Hero Section** | Full-width | Adjusted | Simplified |

---

## 5. Base UI Components (`src/components/ui/`)

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **Button** | Hover scale/color, active press state, disabled opacity, loading spinner, ripple effect |
| **Input** | Focus ring animation, label float animation, error shake, character count, clear button |
| **Select** | Dropdown open/close animation, option hover highlight, search filtering, multi-select chips |
| **Dialog** | Backdrop fade, scale-up entrance, close on backdrop click, escape key dismissal |
| **Sheet** | Slide-in from edge, drag to dismiss, backdrop blur, resize handle |
| **Carousel** | Swipe gestures, dot navigation, autoplay toggle, infinite scroll |
| **Accordion** | Smooth height expansion, chevron rotation, disabled state |
| **Tabs** | Underline slide animation, keyboard navigation (arrow keys), lazy loading content |
| **Tooltip** | Delay show/hide, position flip on edge, fade animation |
| **Popover** | Click-to-toggle, arrow positioning, focus trap |
| **Switch** | Toggle slide animation, disabled state, label click |
| **Checkbox** | Check animation, indeterminate state, disabled state |
| **Progress** | Fill animation, indeterminate mode, value label transitions |
| **Alert/Dialog** | Entrance/exit animations, close button hover, dismiss gesture |
| **Avatar** | Fallback initials, loading skeleton, status indicator |
| **Badge** | Hover tooltip, dismiss animation, count overflow |
| **Calendar** | Date selection, range selection, disabled dates, navigation arrows |
| **DateRangePicker** | Dual calendar sync, preset ranges, clear selection |
| **Separator** | Fade-in animation, vertical/horizontal variants |
| **Textarea** | Auto-resize, character count, focus states |
| **Compare** | Before/after slider, drag handle interaction |
| **Image** | Lazy load, blur placeholder, error fallback |
| **ScrollArea** | Custom scrollbar, smooth scroll, momentum |

---

## 6. Navigation Components

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **Navbar** | Mobile hamburger → X animation, dropdown menus, active state highlight, sticky scroll behavior, blur on scroll, mega menu hover |
| **Footer** | Link hover underline animation, social icon hover scale, newsletter form validation, collapse sections on mobile |
| **FixedSocialBar** | Hover expand animation, mobile hide/show toggle, click-to-copy |
| **Breadcrumb** | Hover underline, truncation with ellipsis, separator animation |
| **ScrollToTop** | Appear on scroll threshold, smooth scroll, hover pulse, hide on mobile scroll down |
| **PageTransition** | Fade/slide between pages, loading state |
| **WhatsAppButton** | Float animation, click to open chat, mobile positioning |
| **SchemaMarkup** | JSON-LD injection (no visual interaction) |

---

## 7. Homepage Animations & Effects

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **Hero** | Text reveal animation, CTA button hover, background parallax, scroll indicator bounce |
| **HeroIntro** | Staggered text entrance, cursor blink, typewriter effect |
| **MarqueeStrip** | Seamless loop, pause on hover, speed control, direction toggle |
| **LogoAnimation** | Hover reveal, continuous subtle animation, sequence playback |
| **AnimatedLogo** | Loading state, hover effect, click interaction |
| **MagneticHover** | Magnetic pull effect on elements, elastic return |
| **ScrollReveal** | Fade-up on scroll intersection, stagger children |
| **KineticText** | Kinetic typography animation, mouse parallax |
| **SpotlightNavbar** | Spotlight follow effect, blur backdrop |
| **TactileJourney** | Tactile texture animation, hover response |
| **DesignProcessVisual** | Step reveal on scroll, connector line animation |
| **CrossAngleShowcase** | Infinite scroll, brand logos |
| **TrustSection** | Stat counter animation, logo reveal |
| **Services** | Card hover lift, icon animation, CTA reveal |
| **Portfolio** | Filter animation, grid layout shift, load more |
| **Testimonials** | Carousel swipe, quote transition, avatar hover |
| **BeforeAfterShowcase** | Slider reveal, touch drag, keyboard control |

---

## 8. Magic UI Effects (`src/components/magicui/`)

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **AnimatedBeam** | Beam path animation, hover trigger, loop behavior |
| **AnimatedShinyText** | Shimmer sweep on hover, text readability |
| **DotPattern** | Parallax movement, hover ripple, density control |
| **Meteors** | Fall animation, random spawn, fade out |
| **NeonGradientCard** | Glow pulse on hover, color cycling |
| **RetroGrid** | Scroll parallax effect, perspective shift |
| **ShimmerButton** | Shimmer sweep on hover, disabled state |
| **SparklesText** | Sparkle particle animation, color customization |
| **TypingAnimation** | Character-by-character reveal, cursor blink, speed control |

---

## 9. ReactBits Animations (`src/components/ReactBits/`)

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **BlurText** | Blur-to-clear animation, timing control |
| **CountUp** | Number increment animation, easing curve |
| **GridDistortion** | Mouse-follow distortion, image quality |
| **IridescenceGlow** | Color shift on hover, performance |
| **ScrollVelocity** | Speed-based text scroll, direction change |
| **ShinyText** | Shimmer effect, text legibility |
| **SplitText** | Word/char stagger reveal, animation timing |
| **SpotlightCard** | Spotlight follow effect, smooth tracking |
| **Squares** | Grid square animations, hover trigger |
| **TiltedCard** | 3D tilt on mouse move, perspective depth |

---

## 10. Portfolio & Gallery Components

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **GalleryMasonryGrid** | Lazy load images, layout shift on filter, infinite scroll |
| **GalleryLightbox** | Open/close zoom, swipe navigation, keyboard arrows, image preloading |
| **GalleryCard** | Hover zoom, overlay reveal, caption slide-up, touch ripple |
| **CursorSpotlight** | Custom cursor with spotlight, trail effect, mobile fallback |
| **MagneticFilterTabs** | Magnetic button tabs, active indicator slide |
| **GalleryScrollIndicator** | Progress indicator, click to jump |
| **HubHero** | 3D parallax, text reveal |
| **HubLightExperience** | 3D space navigation, category switching |
| **SpaceNavigator** | Infinite scroll, category filter, keyboard nav |
| **StyleSelector** | Style card selection, visual feedback, multi-select |
| **FeaturedJourneys** | Carousel navigation, auto-play, pause on hover |
| **InspirationGallery** | Masonry grid, load more, category filter |

---

## 11. Project Detail Components

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **ProjectHero** | Fullscreen image, parallax scroll, title reveal |
| **ProjectGallery** | Horizontal scroll, fullscreen toggle, zoom on hover |
| **ProjectStory** | Text reveal on scroll, image parallax |
| **ProjectMoodboard** | Image hover zoom, drag to rearrange |
| **ProjectPalette** | Color swatch hover expand, copy to clipboard |
| **ProjectStats** | Counter animation, icon hover |
| **ProjectQuote** | Fade-in on scroll, author reveal |
| **ProjectAmbience** | Video/audio controls, ambient effect toggle |
| **ProjectHotspots** | Hotspot pulse, click reveal, keyboard nav |

---

## 12. About Page Components

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **AboutHero** | Video autoplay, parallax background |
| **AboutStats** | Counter animation, icon animation |
| **AboutTeam** | Card hover, social links, modal bio |
| **AboutTimeline** | Vertical line draw, event reveal |
| **AboutValues** | Icon animation, text fade |
| **AboutCTA** | Button hover, background animation |
| **AboutVideoModal** | Open/close animation, video controls |

---

## 13. Services Page Components

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **ServicesHero** | Parallax background, text reveal |
| **ServicesMarquee** | Seamless loop, hover pause |
| **ServicesProcess** | Step reveal, connector animation |
| **ServicesEngines** | Card hover, feature reveal |
| **ServicesWhyUs** | Icon animation, stat counter |
| **OurApproach** | Accordion reveal, step progression |
| **ServicesCTA** | Button animation, background effect |

---

## 14. Contact Page Components

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **ContactHero** | Parallax effect, text reveal |
| **ContactFAQ** | Accordion animation, search filter |
| **InteractiveMap** | Map zoom, marker hover, route display |
| **SocialBar** | Icon hover scale, tooltip |

---

## 15. Admin Dashboard Components

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **DataTable** | Sort animation, row hover, pagination, bulk select, column resize |
| **LeadTable** | Status badge update, inline edit, drag reorder, filter dropdown |
| **LeadCard** | Flip animation for details, quick actions, hover lift |
| **LeadPipeline** | Drag-and-drop cards, stage transition, drop zone highlight |
| **LeadTimeline** | Event expand, filter by type, date navigation |
| **LeadDetailSheet** | Slide-in animation, tab navigation, close gesture |
| **LeadHealthScore** | Score animation, color gradient |
| **DuplicateBanner** | Slide-in warning, dismiss animation |
| **InsightCard** | Hover lift, trend indicator animation |
| **MediaGrid** | Grid/list view toggle, upload progress, selection overlay |
| **MediaUploadZone** | Drag-over highlight, upload progress, success/error state |
| **MediaPicker** | Multi-select with preview, search filter |
| **MediaDetailsSheet** | Edit metadata, tag management |
| **RichTextEditor** | Toolbar hover, link insertion modal, image upload |
| **KPICard** | Trend arrow animation, value count-up, sparkline |
| **FunnelWidget** | Stage highlight on hover, tooltip |
| **LeadFunnelChart** | Segment hover, tooltip, legend toggle |
| **LeadSourceChart** | Donut hover, breakdown reveal |
| **ProjectPipelineChart** | Kanban drag, status update |
| **SparklineChart** | Hover data point tooltip |
| **CommandPalette** | Open with Cmd+K, search filter, keyboard navigation |
| **BulkActionsToolbar** | Appear on selection, action confirm, progress |
| **AdminBadge** | Color variants, hover tooltip |
| **AdminButton** | Loading state, disabled state, icon animation |
| **AdminEmptyState** | Illustration, action button |
| **AdminLoading** | Skeleton pulse, spinner animation |
| **AdminPageHeader** | Breadcrumb navigation, action buttons |
| **ModuleHeader** | Title animation, description reveal |
| **ModuleLayout** | Sidebar toggle, content area resize |
| **TopBar** | Search expand, notification bell, user menu |
| **AdminBreadcrumb** | Link navigation, truncation |
| **RoleGuard** | Permission check animation, redirect |

---

## 16. Discovery Quiz Addon

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **WelcomeScreen** | Get started button animation, entrance stagger |
| **DiscoveryAddon** | Overall flow navigation |
| **DiscoveryEngine** | Progress tracking, step transitions |
| **AnalysisPhase** | Processing animation, progress indicator, spinner |
| **EmotionalMapping** | Emotion selection, ripple effect, multi-select |
| **VisualInstinct** | Image selection grid, hover highlight |
| **LightCalibration** | Slider interaction, brightness preview |
| **LifestyleReflection** | Chip selection, tag animation |
| **MaterialResonance** | Material card hover, texture preview |
| **LeadGatePhase** | Form validation, submit animation, success state |
| **PatternPreview** | Pattern animation, selection toggle |
| **MiniResultPreview** | Quick preview card, expand animation |
| **ResultsReveal** | Staggered reveal animation, share buttons, save CTA |
| **AdjectiveSelection** | Tag toggle, count indicator |
| **ReflectionPrompt** | Text input, submit animation |
| **ProgressBar** | Step transition animation, percentage update |

---

## 17. Price Estimator Addon

| Component | Micro-Interactions to Test |
|-----------|---------------------------|
| **EstimatorWizard** | Step transition slide, progress indicator, back/forward navigation |
| **StepPropertyType** | Card selection, icon animation, visual highlight |
| **StepPropertyDetails** | Input focus, validation, error shake |
| **StepLocation** | Map interaction, pin drop, address autocomplete |
| **StepBudget** | Range slider, value display, preset buttons |
| **StepServices** | Checkbox group, price preview update, category collapse |
| **StepAddons** | Toggle switches, price update animation, recommendations |
| **StepTimeline** | Date picker, calendar, urgency indicator |
| **StepResults** | Total calculation animation, breakdown reveal, CTA buttons |
| **CostEstimator** | Real-time price update, discount animation |

---

## 18. Forms & Validation

| Interaction | Test Cases |
|-------------|-----------|
| **Form Submission** | Loading state, success animation (checkmark), error shake, retry button |
| **Field Validation** | Real-time validation, error message slide-in, success checkmark |
| **Required Fields** | Visual indicator (asterisk), prevent submit on empty |
| **Character Limits** | Live counter, overflow warning (red), truncation |
| **File Upload** | Drag zone highlight, progress bar, preview thumbnail, error state |
| **Password Strength** | Real-time meter animation, requirement checklist |
| **Email Validation** | Format check, domain verification hint |
| **Phone Validation** | Country code picker, format mask |
| **Search Input** | Debounce, clear button, search history |
| **Date Input** | Calendar picker, range validation, disabled dates |

---

## 19. Accessibility (a11y) Micro-Interactions

| Element | Test Cases |
|---------|-----------|
| **Focus States** | Visible focus ring (2px solid) on all interactive elements |
| **Focus Order** | Logical tab order through page |
| **ARIA Labels** | All icons/buttons labeled, images have alt text |
| **ARIA Live** | Dynamic content announcements (toasts, errors, loading states) |
| **Skip Links** | "Skip to main content" link functional |
| **Modal Traps** | Focus trapped within modals, escape to close |
| **Keyboard Nav** | Full app navigable via Tab/Enter/Space/Escape/Arrows |
| **Screen Reader** | Proper heading hierarchy, landmark regions |
| **Touch Targets** | Minimum 44x44px on mobile |
| **Color Contrast** | 4.5:1 for normal text, 3:1 for large text |
| **Motion Sensitivity** | Pause/stop animations option |

---

## 20. Animation & Performance

| Aspect | Test Cases |
|--------|-----------|
| **Animation Duration** | All animations between 150-500ms (per WCAG) |
| **Easing Curves** | Natural easing (ease-out, spring), no linear animations |
| **GPU Acceleration** | No jank during scroll, transform/opacity only |
| **Loading States** | Skeleton screens, not spinners (for content) |
| **Lazy Loading** | Images/components load on demand |
| **Bundle Size** | Code splitting by route |
| **First Paint** | Critical CSS inline, fonts preload |
| **Time to Interactive** | Hydration complete, no layout shift |

---

## 21. Error Handling & Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| **Network Error** | Toast notification, retry button, cached data fallback |
| **Empty States** | Friendly illustration, helpful message, CTA |
| **404 Content** | Graceful message, navigation options |
| **Session Timeout** | Modal warning, extend session option |
| **Form Errors** | Inline error messages, field highlight, scroll to first error |
| **Image Fail** | Blur placeholder, fallback icon, broken image indicator |
| **Slow Connection** | Progress indicators, optimistic UI, timeout handling |
| **Concurrent Updates** | Conflict resolution, last-write-wins or merge |

---

## 22. UI/UX Audit Findings (2026-04-15)

### Critical Bugs (P0)

| ID | File | Line | Issue | Test Action | Status |
|----|------|------|-------|-------------|--------|
| **BUG-001** | `ProjectPage.tsx` | 209 | Route navigation bug: `/contact` should be `/contact-us` | Verify all contact links navigate correctly | ⏳ Pending |
| **BUG-002** | `Hero.tsx` | 156 | Hardcoded phone `"+911234567890"` in SchemaMarkup | Check SchemaMarkup data matches actual contact info | ⏳ Pending |
| **BUG-003** | `ProjectHubPage.tsx` | 34 | Oversized Suspense boundary - entire page blanks if one section fails | Test each section independently for loading failures | ⏳ Pending |
| **BUG-004** | `Hero.tsx` | 80-92 | Memory leak in timer - setTimeout not properly cleared | Test memory usage during extended sessions | ⏳ Pending |
| **BUG-005** | `AboutPage.tsx` | 82 | Hardcoded YouTube video ID fallback | Verify video URLs load correctly | ⏳ Pending |

### High Priority Bugs (P1)

| ID | File | Line | Issue | Test Action | Status |
|----|------|------|-------|-------------|--------|
| **BUG-006** | `ProjectPage.tsx` | 30 | WhatsApp number fallback hardcoded | Verify WhatsApp integration works | ⏳ Pending |
| **BUG-007** | `Hero.tsx` | 97-144 | GSAP cleanup not called on unmount | Test cleanup during navigation | ⏳ Pending |
| **BUG-008** | `BlogPage.tsx` | 60 | Random view counts - `Math.random()` | Verify analytics data is real | ⏳ Pending |
| **BUG-009** | `GalleryLightbox.tsx` | 221 | Potential index mismatch in thumbnail navigation | Test lightbox navigation thoroughly | ⏳ Pending |
| **BUG-010** | `GalleryLightbox.tsx` | 188-196 | Image loads asynchronously causing flicker | Test lightbox image transitions | ⏳ Pending |

### Transition & Animation Glitches (P1)

| ID | File | Line | Issue | Test Action | Status |
|----|------|------|-------|-------------|--------|
| **TRANS-001** | `PageTransition.tsx` | 8-29 | Enter/exit directions inconsistent (y:20 vs y:-20) | Test page transitions feel smooth | ✅ Done |
| **TRANS-002** | `App.tsx` | 313-355 | AnimatePresence mode="wait" conflicts with custom exit | Test transition between pages | ✅ Done |
| **TRANS-003** | `App.tsx` | 408 | SmoothScroll conflicts with page transitions | Test scroll behavior after navigation | ✅ Done |
| **TRANS-004** | `App.tsx` | 125 | DeferredScrollManager 1.2s delay causes scroll behavior jump | Test scroll feel mid-session | ✅ Done |
| **TRANS-005** | `ProjectPage.tsx` | 126 | `-mt-8` creates overlapping content, breaks scroll | Test scroll behavior at Project Stats section | ✅ Done |

### Architectural Issues (P2)

| ID | File | Line | Issue | Test Action | Status |
|----|------|------|-------|-------------|--------|
| **ARCH-001** | `CoreProviders.tsx` | 28-48 | 10-level context provider nesting | Test provider re-render performance | ⏳ Pending |
| **ARCH-002** | `Footer.tsx` | 188-394 | Component exceeds 394 lines (should be <200) | Test footer performance | ⏳ Pending |
| **ARCH-003** | `index.css` | various | Fragmented theme system (CSS vars + HSL) | Test theme consistency | ⏳ Pending |
| **ARCH-004** | `App.tsx` | 138-359 | 4 levels of route guards for admin | Test auth flow thoroughly | ⏳ Pending |
| **ARCH-005** | `BlogPage.tsx` | 154 | Empty catch block: `catch { /* ignore */ }` | Test error handling in blog operations | ✅ Resolved |

### Data & State Issues (P2)

| ID | File | Line | Issue | Test Action | Status |
|----|------|------|-------|-------------|--------|
| **DATA-001** | `ProjectPage.tsx` | 25-27 | Fetches ALL projects, uses only one | Test with large project count | ✅ Resolved |
| **DATA-002** | `BlogPage.tsx` | 95 | No type validation on API response | Test with malformed data | ⏳ Pending |
| **DATA-003** | `ServicesPage.tsx` | 34-47 | Unused variable reassignments | Test services filtering | ✅ Resolved |
| **DATA-004** | Various | - | Query key naming inconsistent | Test cache invalidation | ⏳ Pending |

### Component Organization Issues (P2)

| ID | File | Line | Issue | Test Action | Status |
|----|------|------|-------|-------------|--------|
| **COMP-001** | `Hero.tsx` | entire | Uses both GSAP and Framer Motion | Test animation performance | ⏳ Pending |
| **COMP-002** | `ProjectPage.tsx` | 293 | `motion.img` instead of Image component | Test image optimization | ⏳ Pending |
| **COMP-003** | `DataTable.tsx` | 48-96 | 10 props, some unused | Test table functionality | ⏳ Pending |
| **COMP-004** | `AdminLayout.tsx` | 10-17 | Double loading states (AdminLayout + AuthGuard) | Test auth loading flow | ✅ Resolved |

### Design System Issues (P3)

| ID | File | Line | Issue | Test Action | Status |
|----|------|------|-------|-------------|--------|
| **DESIGN-001** | `Footer.tsx` | 346-367 | Hardcoded social link keys | Test social links from settings | ⏳ Pending |
| **DESIGN-002** | `index.css` | 486 | `Space Mono` loaded but not in Tailwind config | Test font rendering | ✅ Resolved |
| **DESIGN-003** | Various | - | Mix of inline styles and Tailwind | Test style consistency | ⏳ Pending |
| **DESIGN-004** | Various | - | Inconsistent loading state UIs | Test loading experience | ⏳ Pending |

---

## 23. Recommended Testing Approach

### Phase 1: Manual Visual Audit
1. Create a checklist based on the tables above
2. Navigate through each page systematically
3. Document any broken or missing interactions
4. Use browser DevTools to inspect animations
5. Test at all viewport sizes
6. Verify all text content visibility

### Phase 2: Automated E2E Tests (Playwright)

**Test file structure:**
```
e2e/
├── micro-interactions.spec.ts         # Core UI component interactions
├── navigation-routing.spec.ts        # Navigation and routing flows
├── admin-interactions.spec.ts        # Admin dashboard tests
├── quiz-estimator-flow.spec.ts      # Discovery quiz and estimator
├── responsive-accessibility.spec.ts  # Responsive and accessibility
├── content-visibility.spec.ts        # Text and content rendering
├── module-functionality.spec.ts     # Admin module tests
└── bug-fixes-verification.spec.ts    # P0/P1 bug fix verification
```

### Phase 3: Visual Regression Testing
- Use Playwright screenshot comparison
- Test across browsers (Chromium, Firefox, WebKit)
- Integrate with CI/CD pipeline

### Phase 4: Performance Testing
- Lighthouse CI for Core Web Vitals
- Animation performance profiling
- Bundle size tracking

### Phase 5: Accessibility Audit
- Run axe-core on all pages
- Verify keyboard navigation flow
- Test with screen readers (NVDA, VoiceOver)

---

## 24. Testing Checklist Template

```markdown
## [Component/Page Name]

### Visual Checkpoints
- [ ] Initial state renders correctly
- [ ] All text fully visible (no overflow/truncation)
- [ ] No overlapping elements
- [ ] Default/focus/hover/active/disabled states visible
- [ ] Animation timing is smooth (no jank)
- [ ] Colors and typography match design

### Functional Checkpoints
- [ ] Click/tap triggers expected behavior
- [ ] Keyboard navigation works
- [ ] Touch gestures work on mobile
- [ ] Loading state displays correctly
- [ ] Error state handles gracefully
- [ ] Success feedback is visible
- [ ] Route flow maintains context

### Responsive Checkpoints
- [ ] Desktop (1280px+) - Full layout
- [ ] Tablet (768px-1024px) - Adapted layout
- [ ] Mobile (320px-767px) - Mobile layout
- [ ] Touch targets minimum 44px

### Accessibility Checkpoints
- [ ] Focus indicator visible
- [ ] ARIA labels present
- [ ] Screen reader announces correctly
- [ ] Color contrast passes
- [ ] Reduced motion respected
```

---

## 25. Test Environment Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium --with-deps

# Start dev server
npm run dev:web

# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/micro-interactions.spec.ts

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report

# Run specific viewport tests
npx playwright test --project="Mobile Safari"

# Run only critical bug tests
npx playwright test e2e/bug-fixes-verification.spec.ts
```

---

## 26. Priority Matrix

| Priority | Components | Focus Areas |
|----------|-----------|-------------|
| **P0 - Critical** | Forms, Auth, Checkout, Admin CRUD | BUG-001 to BUG-005: Route bugs, memory leaks, Suspense issues |
| **P1 - High** | Navigation, Search, Filters, Tables | TRANS-001 to TRANS-005: Transition glitches, BUG-006 to BUG-010 |
| **P2 - Medium** | Gallery, Quiz, Estimator, Components | ARCH-001 to ARCH-005, DATA-001 to DATA-004 |
| **P3 - Low** | Decorative animations, Marketing effects | DESIGN-001 to DESIGN-004 |

---

## 27. Bug Fix Verification Checklist

### Pre-Fix Verification
- [ ] Document current behavior (screenshot/video)
- [ ] Identify root cause
- [ ] Plan fix approach
- [ ] Notify stakeholders of potential impact

### Post-Fix Verification
- [ ] Fix does not introduce new issues
- [ ] All related interactions still work
- [ ] No console errors
- [ ] No memory leaks introduced
- [ ] Responsive behavior unchanged
- [ ] Accessibility not compromised

### Specific Bug Fix Tests

#### BUG-001: Route Navigation (`/contact` → `/contact-us`)
- [ ] ProjectPage CTA button navigates to `/contact-us`
- [ ] All internal contact links use correct path
- [ ] No 404 errors from contact routes

#### BUG-002: Hardcoded Phone in SchemaMarkup
- [ ] SchemaMarkup uses actual phone from settings
- [ ] Schema validates correctly
- [ ] Structured data passes Google's testing tool

#### BUG-003: Suspense Boundary
- [ ] Each section has independent loading state
- [ ] One section failure doesn't crash entire page
- [ ] Loading skeletons appear for individual sections

#### BUG-004: Memory Leak in Hero Timer
- [ ] Timer clears on page navigation
- [ ] No memory growth during extended sessions
- [ ] Cleanup function runs on unmount

#### TRANS-001: Page Transition Direction
- [ ] Enter animation: slides up (y: 20 → y: 0)
- [ ] Exit animation: slides down (y: 0 → y: 20)
- [ ] Consistent across all pages

#### TRANS-003: SmoothScroll Conflict
- [ ] Page transitions complete without scroll interruption
- [ ] Smooth scroll works after navigation
- [ ] No unexpected scroll jumps

---

## 28. Summary of Test Categories

| Category | Coverage |
|----------|---------|
| **Text Visibility Tests** | 30+ checks for text overflow, truncation, overlap |
| **Route Flow Tests** | 25+ navigation and state preservation tests |
| **Admin Module Tests** | 40+ module-specific functionality tests |
| **Responsive Tests** | 50+ viewport and adaptation tests |
| **UI Component Tests** | 150+ micro-interaction tests |
| **Accessibility Tests** | 20+ a11y compliance checks |
| **Bug Fix Verification** | 30+ specific bug fix tests |

**Total Test Cases: 380+**

---

*Document Version: 3.0*
*Last Updated: 2026-04-15*
*Total Sections: 28*
*Test Categories: 7*
*Total Micro-interactions Catalogued: 380+*
*Critical Bugs Identified: 5 (P0)*
*High Priority Bugs: 5 (P1)*
*Architectural Issues: 5 (P2)*
*Design Issues: 4 (P3)*
