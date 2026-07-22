# Phase 28: Primitive System

## Goal
Build the Primitive visual layout block system strictly from the extracted Design Genome. This phase is broken into three chronological sub-phases (Foundation, Interactive, Composite) to ensure component-first thinking is avoided. Every primitive will be strictly tracked back to its Genome intent using a unique Genome ID.

## Sub-Phases

### Phase 28A — Foundation Primitives
Implement only core layout and typographic primitives. These will compose 80-90% of layouts.
1. **P001 Container**
2. **P002 Stack** (vertical rhythm)
3. **P003 Cluster** (horizontal grouping)
4. **P004 Grid**
5. **P005 Surface**
6. **P006 Divider**
7. **P007 Text**

### Phase 28A.5 — Primitive Validation
Before building interactive elements, verify that the seven foundation primitives can recreate every major layout in the project.
Target Layouts:
1. Entrance Hero
2. Editorial Split
3. Gallery Grid
4. Workspace Panel
5. Form Section
6. Sidebar
7. Dossier Card

**Success criteria:**
* ✅ No new foundation primitives required.
* ✅ No primitive needs page-specific props.
* ✅ Existing seven primitives can compose all canonical layouts.
* ✅ No design-token bypasses.
* ✅ Every primitive maps cleanly to one or more Genome intents.

### Phase 28B — Interactive Primitives
Implement interaction targets *only* after the layout primitives are stable. Build in dependency order:
1. **P008 Button** *(reference implementation for interaction patterns)*
2. **P009 Link** *(shares interaction semantics with Button)*
3. **P010 Input**
4. **P011 Textarea**
5. **P012 Select**
6. **P013 Checkbox**
7. **P014 Radio**
8. **P015 Badge** *(last, because it's display-only and depends on typography/surface primitives)*

**Interactive Primitive Rule:**
Every interactive primitive must expose **behavior primitives**, not styling props.
* Good: `variant`, `size`, `state`, `disabled`, `loading`, `invalid`
* Avoid: `backgroundColor`, `borderColor`, `padding`, `radius`, `shadow`

**Validation Gate for each primitive:**
* ✅ Maps to one or more Genome intents.
* ✅ Uses only P001–P007 plus semantic tokens.
* ✅ Has no hardcoded visual values.
* ✅ Supports keyboard accessibility and focus states.
* ✅ Has documented states (default, hover, active, focus, disabled, loading where applicable).

### Phase 28C — Composition Patterns & Reusable Components
Do not build "Hero", "Card", or "Form" as generic reusable components first. Distinguish between Patterns and Components.

#### Level 1 — Patterns (Build First)
Layout compositions built **only** from P001–P015.
1. Editorial Hero
2. Editorial Split
3. Workspace Panel
4. Gallery Stack
5. Form Layout
6. Sidebar Layout
7. Dossier Layout

**Pattern Metadata Rule:**
Each pattern must include a metadata object for traceability:
```tsx
export const patternMeta = {
  genomeIds: ["P001", "P002", "P005", "P007"],
  intents: ["Editorial", "Hero", "Arrival"],
  reusable: true,
};
```

#### Level 2 — Reusable Composite Components (Only if reused ≥3 times)
1. Card
2. Hero
3. Form
4. Navigation
5. Testimonial
6. Gallery Item

**Governance Rule for Component Extraction:**
Before creating any composite component, answer:
1. Is this a layout pattern or a domain component?
2. Is it reused at least 3 times?
3. Does extracting it reduce complexity rather than hide it?
*If any answer is No, keep it as a composition pattern.*

### Full Architectural Hierarchy
1. Constitution
2. Design Genome
3. Foundation Primitives (P001–P007)
4. Interactive Primitives (P008–P015)
5. Composition Patterns
6. Reusable Composite Components
7. Rooms
8. Journey

## Architectural Rules
1. **Traceability:** Every component file must document its Genome ID in a comment block at the top.
2. **Composite Strictness:** Phase 28C composite primitives cannot introduce raw DOM layout elements (`<div className="flex">`); they must use Phase 28A structural primitives (`<Stack>`, `<Cluster>`).
3. **Genome Enforcement:** The styling mapped to these primitives must come *exactly* from the canonical intents defined in `DESIGN_GENOME.md` (e.g. `surface.primary`, `typography.body`).

**Phase 28 Exit Criteria:**
* ✅ All canonical patterns implemented.
* ✅ At least two rooms built entirely from patterns.
* ✅ No page imports primitives directly except pattern files.
* ✅ No new primitives required.

## Next Step
Execute Phase 28C (Level 1) by implementing the specified patterns with `patternMeta` and creating two room structures (`MarketingRoom`, `AppRoom`) to satisfy the exit criteria.
