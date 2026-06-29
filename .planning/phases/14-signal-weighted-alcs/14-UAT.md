---
status: complete
phase: 14-signal-weighted-alcs
source: 14-PLAN.md
started: 2026-06-25T22:15:00Z
updated: 2026-06-25T22:12:16Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Run Behavioral Invariants Test Suite
expected: |
  Run `npx tsx .planning/phases/14-signal-weighted-alcs/verify-alcs.ts` in the terminal.
  The script should output passing checks for Sensory Isolation, Social Priority Isolation, Budget Dominance, Property Dominance, Recommendation Stability, and the Explainability Contract with zero failures.
result: pass

### 2. Run Regression Test Suite
expected: |
  Run `npx tsx .planning/phases/14-signal-weighted-alcs/regression-alcs.ts` in the terminal.
  The script should output passing regression checks against the golden fixtures for user-a, user-b, and user-c with zero regressions.
result: pass

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

