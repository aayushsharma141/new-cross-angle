---
phase: 12
slug: estimator-workspace
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-25
---

# Phase 12 ?" Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | playwright / vitest |
| **Config file** | playwright.config.ts |
| **Quick run command** | `npx playwright test --grep @estimator` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | EST-CONFIG-01 | - | N/A | lint | `npm run lint` | o. | o pending |

*Status: o pending A o. green A ?O red A s,? flaky*

---

## Wave 0 Requirements

- [ ] `tests/estimator.spec.ts` ?" stubs for estimator workspace tests

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Media Upload | EST-CONFIG-02 | Requires UI | Upload an image in PropertyTypes editor and verify it saves. |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
