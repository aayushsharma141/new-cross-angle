# CrossAngle Design Constitution

**Status:** Immutable Core  
**Scope:** All digital properties  

> **Every future design decision must be evaluated against this document before implementation.**

---

## 1. Mission

CrossAngle exists to deliver uncompromising material craft and spatial intelligence. Our digital presence must mirror the physical perfection of our built environments. We exist to increase the quality of professional judgment by making decision-making observable, replayable, and falsifiable.

## 2. Design Philosophy

**The Gallery Walk**
The interface is completely silent—acting as a quiet, physical gallery wall with high mathematical proportions. It allows the craftsmanship, light, and geometry of the spaces to speak. Every digital element must feel inevitable, permanent, and physical rather than designed.

> "Photography owns attention. Interface owns clarity."

## 3. Brand Principles (The Tension Scale)

To maintain art direction consistency, all designs must balance strictly on the center column:

| Too Corporate (Software) | Crossangle (The Center) | Too Editorial (Art Mag) |
| :--- | :--- | :--- |
| Software / Utility | **Architectural Studio** | Art Magazine / Fashion Zine |
| Efficient / Rushed | **Deliberate** | Slow / Pretentious |
| Premium / Shiny | **Restrained** | Cold / Sterile |
| Luxury / Expensive | **Crafted** | Decorative / Trendy |
| Minimal / Sparse | **Human** | Empty / Void |

## 4. Experience Principles

1. **The 3/30 Rule:** Every section must be skimmable and comprehensible in 3 seconds (through visual hierarchy), and rewarding in 30 seconds (through typography and copy depth).
2. **Design Silence:** Negative space is load-bearing. We embrace vast empty spaces (`20vh` to `30vh` vertical margins) where nothing exists except the background canvas.
3. **Material Truth:** All UI elements must represent real, structural materials. Digital-only effects (neon glows, floating orbs) are prohibited.
4. **Physical Kinetics:** Animations must simulate physical mass, weight, and friction. No bouncing, spring physics, or erratic slides.

## 5. Non-Goals

CrossAngle is **NOT**:
- A high-velocity SaaS dashboard optimized for click-rate over experience.
- A trendy marketing landing page filled with generic illustrations.
- A portfolio template that sacrifices accessibility for aesthetics.
- A platform that requires loud UI to capture attention.

## 6. Review Process & Approval Matrix

**Approval Gate:**
No design moves to code without passing the **Master QA Gate**:
1. Does it violate the Anti-Patterns (e.g., multiple button shapes, gradients)?
2. Does it pass WCAG AA contrast (4.5:1)?
3. Is it aligned with the 3-Layer Token Architecture?
4. Does it use the correct lighting environment (Gallery Light)?

**Authority:**
- Visual/Motion Decisions → Governed by `ART_DIRECTION_BIBLE.md`
- Token/System Decisions → Governed by `Design-System.md`
- Data/Architectural Decisions → Governed by `CROSSANGLE.md`

## 7. Versioning & Governance

This document is immutable. It cannot be rewritten without explicit founder approval. Tactical updates (like a new color hex or component state) belong in the Design System Specification, never here.
