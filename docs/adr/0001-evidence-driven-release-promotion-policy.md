# ADR-0001: Evidence-Driven Release Promotion Policy

- **Status:** Accepted
- **Date:** 2026-08-08
- **Authors:** Core Platform Architecture Team
- **Linked Evidence:** [`docs/evidence/manifest.json`](file:///e:/main/docs/evidence/manifest.json), [`docs/policies/release-policy.json`](file:///e:/main/docs/policies/release-policy.json)

## Context

Previously, release promotion decisions (`PROMOTE`, `HOLD`, `ROLLBACK`) were embedded directly in imperative pipeline script logic (`release-verification.ts`). As release policies grow in operational complexity, hardcoding thresholds in code makes it difficult for SRE and operational teams to evolve criteria without modifying code.

## Decision

We decouple deployment promotion logic into a declarative configuration file at [`docs/policies/release-policy.json`](file:///e:/main/docs/policies/release-policy.json). The release verification pipeline evaluates evidence metrics against this declarative policy contract to automatically decide whether a release qualifies for `PROMOTE`, `HOLD`, or `ROLLBACK`.

## Consequences

### Positive

- SRE and platform operations teams can modify release thresholds declaratively without codebase edits.
- Auditing release promotion rules becomes trivial by inspecting version-controlled JSON policy schemas.

### Negative

- Requires maintaining policy schema validation to prevent malformed rules.
