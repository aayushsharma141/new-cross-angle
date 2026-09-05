# CrossAngle AI Review & Operational Workflow

> **Purpose:** Operational manual for AI assistants and engineers conducting automated reviews, code polish, and quality verification on CrossAngle surfaces.
>
> **Authority Relationship:** This operational guide executes the standards defined in `DESIGN_PLAYBOOK.md` and `ART_DIRECTION_BIBLE.md`. If any AI tool instruction conflicts with the playbook, `DESIGN_PLAYBOOK.md` governs.

---

## 1. Automated Review Tooling Protocols

When auditing or refining components with AI agent tools, execute commands in targeted, narrow passes rather than evaluating an entire application at once.

### 1.1 The Pre-Ship Gauntlet

Run these passes in sequence on a specific component or section file:

```bash
# 1. Accessibility, Performance, Responsive & Anti-Pattern Scan
/impeccable audit [target_section]

# 2. UX Copy, Microcopy, Button Labels & Structural Clarity
/impeccable clarify [target_section]

# 3. Defensive States, Long Names, Edge Cases & Error Handling
/impeccable harden [target_section]
```

### 1.2 Motion & Kinetic Polish

For interaction engineering and animation audits:

```bash
# Inspect transition curves, duration tables, and scale feedback
/impeccable audit-motion [target_section]
```

**Verification Targets:**
- Replace any generic `transition: all` with explicit properties (`transform`, `opacity`, `color`).
- Confirm entrance easing matches `--ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`).
- Validate that pressable elements feature `:active { transform: scale(0.97); }`.

### 1.3 Token Promotion & Drift Extraction

Run periodically or after multi-component feature sprints:

```bash
# Extract recurring visual patterns (used 3+ times) into semantic tokens
/impeccable extract
```

---

## 2. Agent Prompt Templates for PR & Section Reviews

Use these structured evaluation prompts when prompting sub-agents or conducting peer reviews.

### 2.1 Section Visual & Aesthetic Review Prompt

```text
Evaluate [Path/To/Component] against CrossAngle DESIGN_PLAYBOOK.md:
1. Brand Tension: Does it sit in the architectural center (restrained, crafted, deliberate)?
2. Hierarchy of Emphasis: Does photography dominate before typography, spacing, or UI containers?
3. Layout Cadence: Does it respect the 3/30 rule and museum pacing?
4. Token Adherence: Are all colors, easings, and margins mapped to semantic tokens?
Report any violations in a structured table.
```

### 2.2 Accessibility & Performance Review Prompt

```text
Audit [Path/To/Component] for Layer 2.7 and Layer 2.8 compliance:
1. Are touch targets on mobile >= 44x44px?
2. Does it implement @media (prefers-reduced-motion: reduce)?
3. Are all animations strictly on GPU-accelerated properties (transform, opacity)?
4. Is WCAG AA contrast satisfied across all lighting environments?
```

---

## 3. Workflow Integration Pipeline

```text
Code Change Initiated
       │
       ▼
Local AI Review (/impeccable audit -> clarify -> harden)
       │
       ▼
Pass Layer 4 Checklists in DESIGN_PLAYBOOK.md
       │
       ▼
Verify in Chrome DevTools / Browser Agent
       │
       ▼
Commit & Production PR
```
