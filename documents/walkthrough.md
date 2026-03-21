# UX/UI Overhaul Verification Walkthrough: Aesthetic Discovery Engine

This document outlines the verification steps for the major UX/UI overhaul of the "Discovery Engine" (formerly Style Quiz). This update focuses on premium aesthetics, Magic UI integration, and consistent branding.

## 1. Feature Overview & Design Intent
*   **Goal**: Transform a functional quiz into an immersive "Discovery" experience.
*   **Key Design Elements**:
    *   **Magic UI**: Using `BlurFade`, `WordRotate`, `ShimmerButton`, `DotPattern`, `AnimatedShinyText` for high-end visual polish.
    *   **Split-Screen Layout (Desktop)**: A persistent "Creative Identity" panel on the left with a vertical progress bar, keeping context while the user interacts on the right.
    *   **Responsive Mobile Layout**: Collapses to a single column with a horizontal progress bar for mobile users.
    *   **Branding**: Complete migration from "Style Quiz" to "Discover Your Aesthetic".

## 2. Verification Checklist

### A. Branding & Navigation (Global)
- [ ] **Navigation Menu**: Verify the main nav link says **"Discovery"** (not Quiz).
- [ ] **Home Page Hero**: Verify the CTA button says **"Discover Your Aesthetic"** and links to `/discovery`.
- [ ] **Service Pages**: Check "Residential" or "Commercial" service pages; the footer CTA should link to `/discovery`.
- [ ] **URL Redirects**: Visiting `/quiz` should automatically redirect to `/discovery`.

### B. Discovery Engine Experience (Desktop)

#### 1. Welcome Screen (`WelcomeScreen.tsx`)
- [ ] **Animations**:
    *   Text should fade in smoothly (`BlurFade` staggered effect).
    *   Background should have a subtle `DotPattern`.
    *   **Brand Text**: "AESTHETIC DISCOVERY ENGINE" should have a shimmering effect (`AnimatedShinyText`).
- [ ] **Interactions**:
    *   Clicking **"Begin Your Journey"** (Deep Dive) starts the full flow.
    *   Clicking **"Quick Discovery"** starts a shorter version.

#### 2. Layout & Progress (`DiscoveryEngine.tsx`)
- [ ] **Split-Screen**: The left panel should remain fixed with the title "Creative Identity" and the vertical progress bar.
- [ ] **Right Panel**: Question content scrolls independently on the right.
- [ ] **Transitions**: verify the "Cinematic Wipe" effect (black overlay sweeps across) between major stage changes.

#### 3. Interaction Stages
- [ ] **Visual Instinct**: Selecting images should feel responsive.
- [ ] **Sliders**: Dragging sliders in `EmotionalMapping` should be smooth.
- [ ] **Text Input**: Adjective selection allows for custom text input without layout breaking.

#### 4. Results Reveal (`ResultsReveal.tsx`)
- [ ] **Dynamic Title**: The title keywords (e.g., "SPATIAL SOUL") should rotate using `WordRotate`.
- [ ] **Radar Chart**: The `Recharts` radar graph should animate into view.
- [ ] **Lead Capture**: Click **"Request Full Blueprint"**.
    *   Verify the `LeadCaptureDialog` opens.
    *   Verify the default message pre-fills with the user's specific result (e.g., "I just discovered my aesthetic is...").

### C. Mobile Responsiveness
- [ ] **Layout**: resizing the browser window to mobile width (< 768px):
    *   Left panel disappears.
    *   Horizontal progress bar appears at the top.
    *   "Discovery Engine" branding moves to a fixed bottom position or simplified header.

### D. Technical & Performance
- [ ] **Ref Console Errors**: Open DevTools (F12) and check for any red errors during the flow.
- [ ] **Performance**: Animations should run at 60fps without jank.

## 3. Known Design Decisions
*   **"Style Quiz" Removal**: All code related to the old quiz component has been deleted.
*   **Dark Mode Default**: The experience is optimized for the application's dark theme aesthetics.

## 4. Next Steps for User
1.  **Run the App**: Ensure `npm run dev:web` is running.
2.  **Open Browser**: Go to `http://localhost:5173/discovery`.
3.  **Walk Through**: Follow the checklist above to verify the experience "feels" premium.
