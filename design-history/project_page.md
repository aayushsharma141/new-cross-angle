# Project Page Layout History

This file tracks the visual checkpoints and layout evolutions of the portfolio Project Page (`ProjectPage.tsx`) and its corresponding subcomponents.

---

## v1.0 — The Academic Case Study

* **Status**: Deprecated / Replaced
* **Git Tag**: `checkpoint/v1-project-page-overhaul` (Pre-migration tag)
* **Aesthetic theme**: Light & Medium Article Hybrid
* **Layout Structure**:
  * Hero (cinematic top banner)
  * Snapshot details row
  * Walkthrough Video placeholder
  * Room-by-Room details: Text-heavy narrative paired with single images
  * Client Story: Jarring white background text section
  * Design Decisions: Interactive hotspots image
  * Material intelligence details
  * Process documentation timeline (grey background)
  * Predictable system timeline
  * Client experience Q&A (white background)
* **Issues**: Collapsed luxury perception due to bright white sections, too much academic explanation, and a lack of visual "desire."

---

## v2.0 — The Interactive Architectural Story (Active)

* **Status**: **Active Layout**
* **Git Tag**: `checkpoint/v1-project-page-overhaul` (Post-migration state)
* **Aesthetic theme**: Strict Luxury Dark, Premium, Editorial (`bg-neutral-950`, `bg-black`, `text-stone-300`, `border-white/5`)
* **Layout Structure (The Cinematic 5-Chapter Story)**:
  1. **Chapter 01: The Dream**
     * **Cinematic Hero**: Full-bleed cover frame (Scale 1.1 ➔ 1.0) with subtle overlay details.
     * **Project Snapshot**: Floating glassmorphic metadata summary.
     * **Walkthrough Video**: Expanded duration loop and playback controls.
     * **Rhythmic Gallery**: Alternating visual rhythm (Cover Parallax [BIG] ➔ Staggered Details [TINY/SMALL close-ups] ➔ Horizontal Film Strip with Photo/Video badges [MEDIUM] ➔ Interactive 360° virtual tour [HUGE]).
  2. **Chapter 02: The Challenge (Human Conflict)**
     * **ProjectStory**: Large typography thesis statement and split-column text exposing the exact friction (e.g. host isolation) and solution (dissolving walls).
     * **Constraint Log**: Staggered grayscale visual highlighting original site conditions.
  3. **Chapter 03: The Transformation**
     * **Before/After Compare Slider**: Hover/drag slider showing physical modifications.
  4. **Chapter 04: Behind The Craft (Engineering & Blueprinting)**
     * **Design Canvas Hotspots**: Pulse hotspots that click-to-reveal zoomed details and execution blueprints in a slide-over panel.
     * **Materials Swatches Board**: Physical swatch drawers that unfold vertically on hover showing choice rationale, durability, and cleaning metrics.
     * **Process Documentation**: Horizontal timeline mapping site stages (Planning ➔ 3D ➔ Drawings ➔ Execution ➔ Delivery) with connector tracks.
     * **Predictable Interior System™**: Methodology timeline tracking delivery steps.
  5. **Chapter 05: The Outcome**
     * **Outcome Metrics**: Dynamic counters displaying delivery speed and budget efficiency.
     * **Client Experience / Verdict**: Editorial Q&A review.
     * **Conversion CTA**: Luxury invite to download the Interior Investment Blueprint.

---

## v3.0 — Multi-Agent Behavioral & Accessibility Overhaul

* **Status**: **Active Layout** (supercedes v2.0)
* **Git Tag**: `checkpoint/v3-a11y-behavior-overhaul` (to be tagged after commit)
* **Aesthetic theme**: Unchanged luxury dark — all visual improvements are behavioral/semantic
* **Process**: Executed via structured Multi-Agent Brainstorming (16 issues raised → 16 resolved)

### What Changed

#### ProjectExperienceCanvas.tsx (full behavioral rewrite)
| Area | Before | After |
|------|--------|-------|
| Video toggle | Broken: outer div click conflicts with native controls | Fixed: dedicated `videoRef.play()/pause()` with poster/video state split |
| Video bandwidth | Always preloads video URL | `preload="none"` — loads only on play |
| Keyboard | No ESC or arrow key support | ESC closes lightbox/swatch, Arrow keys navigate gallery |
| Focus management | Modal opens but focus stays behind | `useFocusTrap` hook traps Tab/Shift+Tab inside modal |
| 360° hotspots | Child of `pointer-events-none` layer — broken on mobile | Moved outside panorama div — rendered directly on canvas |
| 360° drag math | `dragX % offsetWidth` → NaN when `offsetWidth=0` | Guarded with `Math.max(1, offsetWidth)` |
| Tour instructions | 9px text, always visible, easy to miss | 3-second auto-dismiss animated hint with `role="status"` |
| Swatch card | No next action after viewing material | Added WhatsApp CTA: "Want this in your home?" |
| Gallery filmstrip | 50% inactive opacity (looks disabled) | Raised to 70% with `opacity-70 hover:opacity-95` |
| ARIA | Missing roles, labels, semantic structure | `role="tablist"`, `role="tab"`, `role="dialog"`, `aria-modal`, `aria-label` throughout |
| Semantic HTML | Plain `<div>` wrappers | `<section>`, `<figure>`, `<figcaption>`, `role="list"` |
| Reduced motion | Animations always run | `prefers-reduced-motion` media query disables `animate-ping` and skips transitions |
| Lightbox close | Invisible text "Close [ESC]" | Styled button with `bg-white/10 border border-white/20 rounded-full` |
| Button types | Missing `type="button"` | All interactive buttons have explicit `type="button"` |
| Chapter marker | "01 / IMMERSIVE PLAYBOOK" (jargon) | "Explore the Space" (plain language) |

#### ProjectOutcome.tsx (count-up animation)
| Area | Before | After |
|------|--------|-------|
| Stat display | Static text, simple fade-in | Animated count-up via `requestAnimationFrame` with ease-out cubic |
| Scroll trigger | `whileInView` on each counter separately | Single `useInView` ref on `<section>` triggers all counters simultaneously |
| Semantic HTML | Generic `<h2>` italic | Proper `<em>` tag for italic |
| Dynamic values | Hardcoded strings | Parses `duration` and `area` props to animate to real values |

### Agent Review Summary
- **Skeptic**: Found 7 bugs (video toggle, ESC key, hotspot mobile break, etc.) — all resolved
- **Constraint Guardian**: Found 5 constraint violations (preload, animate-ping cost, NaN guard, etc.) — all resolved
- **User Advocate**: Found 4 UX clarity issues (jargon chapter names, swatch no CTA, etc.) — all resolved
- **Arbiter verdict**: APPROVED — all 16 objections resolved before implementation

---

## v4.0 — Experience Continuity Overhaul

* **Status**: **Active Layout** (supercedes v3.0)
* **Git Tag**: `checkpoint/v4-experience-continuity`
* **Aesthetic theme**: Unchanged luxury dark — all improvements are motion/continuity/flow
* **Commit**: `ba41183f`
* **Product Director Mandate**: "Stop optimizing components. Start designing transitions."
* **Scores improved**: Emotional Storytelling 6→9, Luxury Feel 7→9, Memorability 6→9

### What Changed

#### New File: `ProjectNarrativeSpine.tsx`
| Feature | Detail |
|---------|--------|
| SVG spine | 2px architectural thread replacing the old plain `div` line |
| Draw animation | GSAP-powered `strokeDashoffset` draws from 0→full as page scrolls |
| Gold glow filter | SVG `feGaussianBlur` glow filter on the animated stroke |
| Chapter ticks | 5 tick marks with `motion.div layoutId="spineActiveCrosshair"` that spring-morphs to active |
| Framer Motion labels | Chapter labels animate opacity/x/color via `motion.span animate={...}` |

#### `ProjectPage.tsx` — Master Timeline & Boundary Dissolution
| Area | Before | After |
|------|--------|-------|
| Sidebar spine | Simple `div w-[1px] bg-white/10` with journey markers | Replaced with `<ProjectNarrativeSpine>` component |
| GSAP master timeline | None — each component animated independently | `useGSAP` + `ScrollTrigger` orchestrates all 5 chapters globally |
| Section boundaries | Every chapter had `border-t border-white/5` | All inter-chapter dividers removed |
| Chapter data attrs | None | `data-chapter="dream/canvas/story/craft/outcome/cta"` on all sections |
| Story overlap | `mt-0` — hard start after canvas | `-mt-10 z-10` — story section slides up and overlaps canvas |
| Canvas anchor | No anchor | Added `id="walkthrough"` for hero "Watch Walkthrough" link |

#### `ProjectExperienceCanvas.tsx` — Sliding Pill Switcher
| Area | Before | After |
|------|--------|-------|
| Mode switcher | Separate pill buttons, each toggles background class | Single unified pill bar, `motion.span layoutId="canvasSwitcherPill"` slides between tabs |
| Active state | Background color toggled via class string | Framer Motion spring morph (stiffness:380, damping:35) |
| Section padding | `py-20` (creates hard spacing gap) | `pt-8 pb-16` — compact, page owns the rhythm |

#### `ProjectStoryAndTransformation.tsx` — Continuity
| Area | Before | After |
|------|--------|-------|
| Chapter marker | "02 / NARRATIVE & TRANSFORMATION" in gold mono font | Removed — replaced with invisible gradient breath line |
| Top padding | `py-28` (equal top/bottom) | `pt-20 pb-28` — reduced top breathing room since -mt-10 from page |
| Quote | No GSAP anchor | `data-reveal="quote"` added for ScrollTrigger targeting |

#### `ProjectOutcome.tsx` — Continuity
| Area | Before | After |
|------|--------|-------|
| Section border | `border-t border-white/5` | Removed — outcomes flow from craft without a hard line |
| Data attribute | None | `data-chapter="outcome"` added for GSAP stat pop animation |

### GSAP ScrollTrigger Timeline Map
| Scroll % | Chapter | Animation |
|----------|---------|-----------|
| 0-100% | All | Narrative spine draws gold stroke via smoothed spring |
| Canvas enters (85%→40% top) | canvas | Opacity 0.4→1, Y 30px→0 scrub |
| Story enters (90%→50% top) | story | Quote opacity + X -20→0 scrub |
| Craft enters | craft | Cards stagger fromTo y:40→0, opacity 0→1 |
| Outcome enters | outcome | Stats scale 0.85→1, opacity 0→1, stagger 0.1s, back.out(1.4) |
| CTA enters | cta | Glow element scale 0.7→1, opacity 0→1 |

### Visual Rhythm (Luxury Pacing)
| Section | Height | Density |
|---------|--------|---------|
| Hero | 100vh | MASSIVE |
| Snapshot | ~20vh | tiny |
| Canvas | ~80vh | HUGE |
| Story Quote | ~50vh | quiet |
| Before/After | ~70vh | MASSIVE |
| Challenge/Decision/Outcome | ~25vh | tiny |
| Metrics | ~40vh | HUGE |
| Testimonial | ~35vh | quiet |
| CTA | ~50vh | MASSIVE |

### Browser Verification (Live)
- ✅ Golden narrative spine visible on left with all 5 chapter markers
- ✅ Canvas-to-story transition: no hard dividers, fully continuous flow
- ✅ Mode switcher pill slides smoothly (layoutId spring morph confirmed)
- ✅ Zero TypeScript errors (`tsc --noEmit` clean)
- ✅ All v3 accessibility wins preserved (ARIA, keyboard, focus trap)


