# ADR-001: Structural Corner Radii Geometry Standard

**Status:** Accepted  
**Date:** 2026-08-01  
**Deciders:** Lead Product Designer, Frontend Architect  

## Context
The Crossangle interface suffered from "radius drift," mixing sharp rectangular buttons (`0px`), rounded cards (`16px`/`rounded-2xl`), pills (`rounded-full`), and inputs (`rounded-md`). This created an inconsistent, generic SaaS template feel that conflicted with architectural studio art direction.

## Decision
We enforce a strict, unified geometric rule across all UI components:
- **Default Corner Radius:** `0px` (`rounded-none`) for structural containers, cards, images, and action buttons.
- **Subtle Surface Radius:** `2px` (`rounded-sm`) for form inputs and micro-elements where edge separation is required.
- **Prohibited Radii:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full` (except strict circular avatar frames).

## Alternatives Considered
- *Rounded Pill Cards (16px):* Rejected because rounded corners communicate consumer software/mobile apps rather than physical limestone/charcoal architectural structures.
- *Fully Sharp Everywhere (0px strictly):* Considered, but 2px was allowed for inputs to avoid visual harshness on low-DPI displays.

## Consequences
- **Positive:** Instantly elevates the visual design to an architectural monograph standard. Eliminates AI component template drift.
- **Negative:** Requires refactoring legacy components using Tailwind `rounded-2xl` classes.
