# ADR-005: Decelerating Mass Motion Physics

**Status:** Accepted  
**Date:** 2026-08-01  
**Deciders:** Motion Designer, Frontend Lead  

## Context
Interactive transitions used bouncy spring animations or fast linear slides, violating the physical weight and mass expected of heavy architectural structures.

## Decision
All transitions, page fades, and drawer slides MUST use custom decelerating ease curves:
- `cubic-bezier(0.22, 1, 0.36, 1)` (Heavy Mass Deceleration)
- Standard Duration: `0.4s` to `0.6s`.
- Bouncy spring physics or linear loops are strictly banned.

## Consequences
- Physical, silent, heavy interaction feel mimicking wooden pocket doors sliding into plaster walls.
