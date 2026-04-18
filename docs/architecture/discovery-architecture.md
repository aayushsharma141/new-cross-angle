Below is a **clean Markdown conversion of your HTML architecture document**, preserving the structure, technical details, and insights. I also added **clarifying notes** where it helps explain the engine’s strategic effectiveness.

Source: 

---

# CrossAngle — Discovery Engine Architecture Map

**Version:** v2.1 (Current State)

This document describes the **current architecture, workflow, scoring model, and structural issues** of the CrossAngle Discovery Engine.

The goal is to explain:

* How the engine works
* How data flows through the system
* Where scoring happens
* Whether the architecture is strategically sound
* What improvements are required

---

# 1. Engine Flow Overview

## Stage Flow

The engine follows a **multi-phase behavioral discovery process** that converts user preferences into a **Spatial Identity Blueprint**.

The system supports **two modes**:

* **Quick Mode** → shorter path
* **Deep Mode** → full discovery experience

---

## Phase 0 — Entry

### Welcome Screen

**File:** `WelcomeScreen.tsx`
**Size:** ~448 lines

**Purpose**

* Entry point of the engine
* User selects:

```
Quick Mode
Deep Mode
```

This choice determines the entire routing of the flow.

**UX Role**

Mode selection reduces friction by offering a faster option for impatient users.

**Issues**

* Large component for a simple landing state
* Animation + copy + mode logic mixed together

---

# Phase Routing

```
User Starts
   ↓
Welcome Screen
   ↓
Mode Selection
   ↓
Quick Mode → Skip Reflection
Deep Mode → Reflection Prompt
```

---

# Phase 1 — Reflection Prompt (Deep Mode Only)

**File:** `ReflectionPrompt.tsx`
**Structure:** 8 sections, 15 questions

### Sections

1. Morning Habits
2. Daytime Energy
3. Evening Mood
4. Night Routine
5. Social Life
6. Sensory Awareness
7. Emotional Environment
8. Personal Identity

### Question Types

* Image cards
* Chip selections

### Data Produced

```
reflectionAnswers[]
```

These answers are passed to the AI system later.

### Scoring Impact

None.

Reflection answers **do not update scores directly**.

They are interpreted by the AI later.

### Issue

No visible progress indicator for the 8 sections.

This increases abandonment risk.

---

# Phase 2 — Lifestyle Reflection

**File:** `LifestyleReflection.tsx`

**Structure:** 4 step flow

### Purpose

Captures behavioral lifestyle signals:

* morning activity
* work patterns
* social energy
* routine structure

### Data Produced

```
lifestyleChoices[]
```

### Scoring Impact

Direct updates to:

```
AestheticScores
```

Example:

```
warmth +1
minimalism -1
social +2
structure +1
```

### Issue

Content overlaps with Phase 1.

Users in Deep mode experience similar questions twice.

---

# Phase 3 — Visual Instinct

**File:** `VisualInstinct.tsx`

### Interaction

User selects **5+ interior images**.

Images are tagged with aesthetic traits.

Example tags:

```
warm
minimal
structured
experimental
```

### Scoring

Selected image tags produce score deltas.

```
minimalism +1
warmth +2
novelty +1
structure +1
```

### Stored Signals

```
selectedImageIds[]
```

### Issue

No weighting of preference intensity.

All images treated equally.

---

# Mode Branch

After Visual Instinct:

```
Quick Mode → Light Calibration
Deep Mode → Adjective Selection
```

---

# Phase 4 — Adjective Selection (Deep Mode)

**File:** `AdjectiveSelection.tsx`

### Interaction

User selects **3–5 descriptive words**.

Examples:

```
Calm
Warm
Bold
Structured
Modern
Luxurious
```

### Data Stored

```
selectedAdjectives[]
freeTextReflection
```

### Scoring

Each adjective maps to score weights.

Example:

```
Warm → warmth +2
Modern → minimalism +1
Structured → structure +2
```

### Issue

The score map is defined directly inside the component.

This mixes UI and business logic.

---

# Phase 5 — Emotional Mapping (Deep Mode)

**File:** `EmotionalMapping.tsx`

### Interaction

User adjusts **4 bipolar sliders**.

```
Calm ↔ Energized
Private ↔ Social
Minimal ↔ Layered
Organic ↔ Structured
```

### Scoring

Slider positions convert into numeric score deltas.

This is the **most nuanced scoring input** in the system.

### Issue

Slider interaction time is not recorded.

Behavioral signals are lost.

---

# Phase 6 — Material Resonance

**File:** `MaterialResonance.tsx`

User chooses one material.

Examples:

```
Warm Timber
Concrete
Slate
Linen
Steel Blue
```

### Scoring

Single material → score delta.

Example:

```
Timber → warmth +2
Concrete → minimalism +1
```

### Issue

Single choice only.

Ranking could produce better signal resolution.

---

# Phase 7 — Light Calibration

**File:** `LightCalibration.tsx`

User selects lighting archetype.

Examples:

```
Dramatic Spotlight
Soft Ambient
Architectural Grid
Natural Diffused
```

### Scoring

Lighting type affects:

```
structure
warmth
novelty
```

---

# Mode Branch

After Light Calibration:

```
Quick Mode → Analysis
Deep Mode → Pattern Preview
```

---

# Phase 8 — Pattern Preview (Deep Mode)

**File:** `PatternPreview.tsx`

This screen displays:

* score bars
* behavioral insights
* emerging style signals

### Example Output

```
You gravitate toward warm materials
You prefer structured environments
You value visual calm
```

### Scoring

Read-only.

No new scores are added.

### Issue

Insight text uses simple threshold rules.

Example:

```
if warmth > 6
→ show sentence
```

Users with score **6.1 and 9.0 receive identical insights.**

---

# Phase 9 — AI Analysis

**File:** `AnalysisPhase.tsx`

### Function

Calls Supabase edge function:

```
aesthetic-ai
```

### Input

```
UserSignals
Scores
ReflectionAnswers
VisualSelections
```

### Output

```
AIAestheticResult
```

Includes:

* narrative description
* archetype interpretation
* traits
* design guidance

### UX Behavior

Minimum animation duration:

```
5 seconds
```

Even if AI returns faster.

### Issue

No streaming.

If AI takes long → user waits.

---

# Phase 10 — Lead Gate

**File:** `LeadGatePhase.tsx`

### Interaction

User must submit:

```
Name
Email
Phone
```

### Function

Calls edge function:

```
submit-discovery-lead
```

Stores lead in database.

### Problem

This gate appears **before the user sees results**.

After completing the entire engine.

This is the **highest drop risk point in the funnel.**

---

# Phase 11 — Results Reveal

**Files**

```
ResultsReveal.tsx
BlueprintPage.tsx
```

Total size:

```
~2186 lines
```

### Output

User receives:

```
Archetype name
Moodboard
Radar chart
Cognitive profile
Design recommendations
Download card
```

This is the **reward moment** of the engine.

### Issues

* Very large component
* Not lazy loaded
* Free text reflection not shown

---

# 2. Layer Architecture

The engine currently contains **six structural layers**.

---

# Layer 1 — UI Duplication

Location:

```
discovery/components/ui/
```

Contains **49 duplicated shadcn UI files**.

Example:

```
button.tsx
input.tsx
accordion.tsx
tabs.tsx
slider.tsx
dialog.tsx
```

### Problem

Two design systems exist.

```
shared/ui
discovery/components/ui
```

### Impact

* bundle size increase
* maintenance risk
* inconsistent UI updates

### Fix

Delete duplicated folder.

Use shared components only.

---

# Layer 2 — Flow Controller

**File:** `DiscoveryEngine.tsx`

This component currently handles:

* session state
* stage routing
* score updates
* score normalization
* UI shell
* AI invocation
* archetype resolution

This violates **Single Responsibility Principle**.

---

# Layer 3 — Scoring Logic

Score weights exist in **6 different UI components**.

Examples:

```
AdjectiveSelection.tsx
EmotionalMapping.tsx
MaterialResonance.tsx
LightCalibration.tsx
LifestyleReflection.tsx
VisualInstinct.tsx
```

This makes the scoring model hard to understand.

### Recommended Structure

```
core/
  scoring.ts
  weights.ts
  normalization.ts
  archetype.ts
```

---

# Layer 4 — AI Integration

Edge functions:

```
aesthetic-ai
submit-discovery-lead
```

These are relatively well structured.

Good practices observed:

* cancellation handling
* fallback archetype
* error recovery

---

# Layer 5 — Page Coupling

Engine is tied to router.

```
DiscoveryPage.tsx
BlueprintPage.tsx
```

Therefore the engine cannot be embedded easily.

### Fix

Create mountable component:

```
DiscoveryAddon.tsx
```

Usage:

```
<DiscoveryAddon config={} />
```

---

# Layer 6 — Analytics (Missing)

Currently the engine tracks **no behavioral events**.

This means:

* drop rate unknown
* completion rate unknown
* archetype distribution unknown
* Quick vs Deep performance unknown

### Required System

```
analytics/
tracker.ts
```

Event examples:

```
start_session
step_viewed
step_completed
restart_clicked
submit_clicked
```

---

# 3. Scoring Model

The engine uses a **5 axis aesthetic scoring system**.

Axes:

```
minimalism
warmth
social
structure
novelty
```

Each score begins at:

```
5
```

Range:

```
0 → 10
```

Final output normalized to:

```
1 → 9
```

---

# Score Normalization

Formula currently inside `DiscoveryEngine.tsx`.

```
centered = (raw - 5) / 5
compressed = centered × 0.7
output = 5 + compressed × 5
clamp(1, 9)
```

Purpose:

Reduce extreme scores.

---

# 4. Major Strategic Issues

## Critical

1. UI duplication
2. Scoring logic scattered
3. Lead gate before reward
4. No analytics

## Medium

1. Monolithic blueprint page
2. Quick mode not differentiated
3. Reflection lacks progress feedback

## Low

1. Free text reflection unused
2. Engine not portable

---

# 5. Strategic Effectiveness Evaluation

### Strengths

The engine architecture demonstrates several strong product principles.

**Behavioral discovery**

Questions focus on lifestyle rather than style.

This produces deeper signals.

**Multimodal inputs**

Inputs include:

* images
* adjectives
* sliders
* reflection

This increases signal quality.

**Narrative payoff**

The blueprint output creates a strong emotional reward.

---

### Weaknesses

The architecture mixes:

```
UI
logic
scoring
routing
integration
```

inside the same components.

This reduces:

* scalability
* maintainability
* portability

---

# Final Assessment

The engine concept is **strategically strong**, but the implementation needs structural refactoring.

Key improvements:

```
Extract scoring core
Remove UI duplication
Add analytics layer
Reposition lead gate
Lazy load blueprint
```

After these changes the engine becomes:

```
Portable
Measurable
Maintainable
Product-grade
```

---
I analyzed the **“Fixing Blueprint Rendering / Spatial Identity OS results page”** document you uploaded. Below is a **structured technical + product analysis** of that proposal and how it fits with your current **Discovery Engine architecture**.

Source: 

---

# CrossAngle Spatial Identity OS

## Result Page Architecture Analysis

This document proposes replacing the current **quiz results page** with a new **Spatial Identity OS Blueprint page** designed as:

* a **psychological identity reveal**
* a **lead qualification funnel**
* a **future white-label SaaS module**

The implementation brief includes:

1. Static deployment
2. Dynamic personalization via query parameters
3. CRM lead intelligence integration
4. White-label SaaS foundation

Below is a **deep architectural and strategic analysis**.

---

# 1. Functional Architecture

## Current Flow (Your Engine)

```
Quiz Engine
   ↓
Score Calculation
   ↓
AI Analysis
   ↓
Lead Gate
   ↓
Blueprint Page
```

Problems previously identified:

* lead gate before reward
* heavy monolithic results component
* low shareability
* weak psychological reveal

---

## Proposed Flow (Spatial Identity OS)

```
Quiz Engine
   ↓
Score Calculation
   ↓
URL Parameters
   ↓
Spatial Identity OS Page
   ↓
Psychological Reveal
   ↓
Lead Qualification Form
   ↓
Strategy Call CTA
```

This introduces **three major product shifts**.

### Shift 1 — Result Page becomes a product

The results page is no longer a simple output.

It becomes:

```
Identity Narrative
+ Moodboard
+ Psychological profile
+ Transformation readiness
+ Lead capture
```

Essentially:

**Result Page = Conversion Engine**

---

### Shift 2 — Score → Identity → Offer

Instead of showing data first:

```
Score → Graph → Recommendation
```

The page now reveals identity first.

```
Identity → Meaning → Evidence → Offer
```

This follows **high-end psychology funnel design**.

---

### Shift 3 — Quiz → CRM intelligence pipeline

The result page becomes a **lead enrichment layer**.

Data captured:

```
archetype
readiness score
openness
detail
emotional
thinking
budget
project type
timeline
city
```

That is extremely powerful.

Before sales even talks to the client they know:

```
psychology
budget
urgency
project type
```

This is **rare for interior design firms**.

---

# 2. Structural Design Evaluation

## Page Sections

The blueprint page contains **9 structural layers**.

### S1 — Identity Reveal

Purpose:

```
Create emotional payoff
```

Elements:

```
Archetype name
rarity badge
identity narrative
score orb
readiness preview
```

Psychology used:

```
identity framing
rarity bias
self-recognition
```

This is excellent design.

---

### S2 — Emotional Mirror

Moodboard reflecting user's instincts.

Purpose:

```
show them their taste visually
```

Each image explains:

```
why they liked it
what it means
how it relates to scores
```

This is **very strong product storytelling**.

---

### S3 — Aesthetic DNA

Radar visualization of 5 axes.

```
minimalism
warmth
social
structure
novelty
```

With hover insights.

Good idea.

But the current implementation could be simplified.

---

### S4 — Cognitive Profile

Four psychological traits:

```
Openness
Detail
Emotion
Thinking
```

Each expands with explanation.

Purpose:

```
show deeper personality analysis
```

This increases **perceived sophistication**.

---

### S5 — Transformation Readiness

This is one of the **strongest ideas**.

A readiness score like:

```
82% Ready
```

with breakdown:

```
Vision clarity
Investment readiness
Decision momentum
Lifestyle alignment
```

This does two things:

1. **qualifies leads**
2. **creates urgency**

---

### S6 — Upgrade Path

Comparison:

```
Current Identity
vs
Evolved Identity
```

Example:

```
Expressive Collector
→ Refined Collector
```

This is brilliant.

Because it introduces:

```
problem → solution
```

without sounding salesy.

---

### S7 — Design Blueprint

Actionable strategy pillars:

```
Lighting logic
Material strategy
Layout logic
Narrative layer
```

This positions CrossAngle as:

```
strategic designer
not decorator
```

---

### S8 — Lead Capture Gate

Important change:

Lead gate appears **after value delivery**.

User has already seen:

```
identity
scores
analysis
blueprint
```

Now they are asked for:

```
project type
budget
timeline
contact
```

This is the **correct position**.

---

### S9 — Social Share Card

Allows user to download their identity card.

Example:

```
I am an Expressive Collector
Design Resonance 9/10
```

Purpose:

```
organic sharing
viral discovery
```

---

# 3. Technical Architecture Evaluation

## Current Proposed Implementation

Phase 1 uses:

```
HTML + JS prototype
```

with parameters like:

```
/blueprint?archetype=expressive-collector
&openness=9
&detail=2
&emotional=8
&thinking=9
&readiness=82
```

Pros:

```
extremely simple
fast deployment
no backend needed
```

Cons:

```
not secure
not scalable
URL can be manipulated
```

---

### Recommended Architecture

Instead of URL parameters:

```
Quiz Engine
   ↓
save session in database
   ↓
redirect to
/identity/{sessionId}
```

Then load data from database.

Better structure.

---

# 4. Performance Analysis

The blueprint page is extremely heavy.

Issues:

### 1 Cursor system

Custom cursor animations:

```
dot
ring
glow
```

Unnecessary.

Costs CPU.

---

### 2 Large CSS

This page contains **1000+ lines of CSS**.

Better structure:

```
tokens.css
layout.css
components.css
animations.css
```

---

### 3 No componentization

The HTML page contains:

```
S1
S2
S3
S4
S5
S6
S7
S8
S9
```

Each should be a component.

Example:

```
IdentityReveal.tsx
MoodBoard.tsx
AestheticDNA.tsx
CognitiveProfile.tsx
TransformationReadiness.tsx
UpgradePath.tsx
DesignBlueprint.tsx
LeadGate.tsx
ShareCard.tsx
```

---

### 4 Radar chart rendering

Current version likely uses raw SVG.

Better approach:

```
d3.js
or
Recharts
```

---

# 5. Strategic Product Evaluation

This blueprint page is **very strategically strong**.

It combines **four high-end product ideas**.

---

## 1 Identity product

User receives:

```
Spatial Identity
```

not just design advice.

Identity products are extremely powerful.

Examples:

```
Spotify Wrapped
16Personalities
Apple Fitness rings
```

---

## 2 Narrative persuasion

Instead of saying:

```
hire us
```

the page shows:

```
this is who you are
this is who you can become
```

Then:

```
strategy call
```

---

## 3 Lead intelligence

Very few firms capture this much data before consultation.

You will know:

```
psychology
budget
urgency
project type
```

This massively improves sales efficiency.

---

## 4 Future SaaS potential

The document already anticipates:

```
white label
theme switching
archetype configs
multi firm support
```

Meaning the engine could become:

```
CrossAngle Identity OS
```

licensed to other firms.

---

# 6. Critical Weaknesses

Despite strong strategy, there are some serious issues.

---

## Issue 1 — Prototype architecture

The document proposes deploying **raw HTML**.

That is fine for testing but not long term.

Better:

```
Next.js page
```

---

## Issue 2 — No analytics layer

The system does not track:

```
scroll depth
section engagement
lead drop-off
share rate
```

This is essential.

---

## Issue 3 — No AI usage on page

Currently the blueprint text is static.

Better system:

```
AI writes personalized blueprint narrative
```

based on user signals.

---

## Issue 4 — heavy animation

Too many animations:

```
cursor
aura
orb
radar
hover panels
```

This may slow mobile.

---

# 7. Strategic Conclusion

Your **Discovery Engine + Spatial Identity OS** concept is **very strong**.

But the current system has three layers mixed together:

```
quiz engine
analysis engine
conversion engine
```

They should be separated.

---

## Ideal Architecture

```
Layer 1
Discovery Engine
(quiz)

Layer 2
Identity Engine
(scoring + archetype)

Layer 3
Spatial Identity OS
(results + lead funnel)

Layer 4
CRM Intelligence
(lead scoring)
```

---

# Final Assessment

The **Spatial Identity OS blueprint page is a very powerful conversion layer**.

It transforms your engine from:

```
a design quiz
```

into

```
a psychological identity system
+ lead qualification funnel
+ future SaaS product
```

However it should be implemented with:

```
proper architecture
component system
analytics
database sessions
```

not as a single HTML file.

---


