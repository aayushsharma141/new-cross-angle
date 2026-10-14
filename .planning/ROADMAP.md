# Production & Learning Roadmap v1

This roadmap documents the transition from **building software** to **producing evidence**. The platform's core operating infrastructure (DAM, CRM, Recommendation Engines, Primitive Layouts) is complete. The system's primary directive is now learning operations and evidence-gathering under the Platform Constitution.

---

## Phase Status Today

| Area | Status |
| :--- | :---: |
| **Architecture** | ✅ Complete |
| **Primitive System** | ✅ Complete |
| **Workspace** | ✅ Complete |
| **Decision Ledger** | ✅ Complete |
| **Learning Telemetry** | ✅ Complete |
| **Replay Chain** | ✅ Validated |
| **State Reconstruction** | ✅ Validated |
| **Behavioral Replay** | ⏳ Deferred |
| **Governance** | ✅ Frozen |
| **Dataset v1** | ✅ Active |
| **Product Features** | 🟢 Active |

---

## Track A — Product Evolution (Active)

Visual foundation (Gallery Light environment) is frozen. We now move to composition and editorial rhythm.

| Phase | Goal | Status |
| :--- | :--- | :---: |
| **31** | **Editorial Composition** — Kill symmetric SaaS grids, introduce asymmetry and design silence. | 🟢 Active |
| **32** | **Motion Polish** — Implement intent-centric motion defined in Design Genome. | ❄️ Frozen |
| **33** | **Visual QA** — Final cross-browser/responsive visual QA and regression checks. | ❄️ Frozen |

---

## Track B — Learning Operations (Active)

The active track focuses on running the system in production, collecting signal-weighted evidence, maintaining dataset integrity, and refining the recommendation models.

| Phase | Goal | Status |
| :--- | :--- | :---: |
| **L1** | **Production / Learning Mode** — Run live telemetry, feed real client interaction data to CRM and Supabase. | 🟢 Active |
| **L2** | **Founding Cases (Dataset v1)** — Triage and collect the first set of real client genomes under strict pace of reality governance rules. | 🟢 Active |
| **L3** | **Dataset Integrity Reviews (DIR)** — Audit saved decision genomes to verify perfect parity between local storage and DB schemas. | 🟢 Active |
| **L4** | **Operational Investigations (OI)** — Detect and investigate anomalies in the recommendation scoring pipelines. | 🟢 Active |
| **L5** | **Process Learnings (PL)** — Extract and curate reusable institutional design strategies validated by real designer feedback. | 🟢 Active |
| **L6** | **Instrument Stability Review (Case 5)** — Perform deep-dive telemetry validation upon reaching 5 founding cases. | 🟡 Planned |
| **L7** | **Learning Baseline Report v1 (Case 20)** — Synthesize the first baseline recommendation performance report. | 🟡 Planned |

---

## Track C — Admin Operations (Active)

Make the admin panel safe and usable for non-technical operators. Source: docs/reports/admin-panel-audit-2026-10-14.md.

| Phase | Goal | Status |
| :--- | :--- | :---: |
| **40** | **Admin Panel Remediation** — Lead notifications and auto-replies work end to end, no admin control promises something it does not do, SEO/CMS gaps closed, real 2FA and idle logout. | 🟢 Active |

---

## Phase Details & Success Criteria

### Phase 31: Editorial Composition

- **Goal:** Transform the UI from a "custom built UI" to a professionally art-directed studio experience.
- **Success Criteria:**
  1. No remaining symmetric SaaS grids.
  2. Editorial asymmetry and "design silence" implemented.
  3. Photography dictates vertical rhythm.
  4. Validation through Attention Purity Index (API) >90% on focal points.

### Phase L1: Production / Learning Mode

- **Goal:** Operate the platform as a continuous learning loop. Ensure client interactions on Discovery/Estimator flows consistently generate telemetry and route recommendations with explainable evidence.
- **Success Criteria:**
  1. Live telemetry correctly logs client selections to the Decision Ledger.
  2. Every recommendation serves a complete evidence chain explaining the top drivers.

### Phase L2: Founding Cases (Dataset v1)

- **Goal:** Accumulate high-quality client cases. No synthetic data is allowed.
- **Success Criteria:**
  1. Capturing and organizing real client journeys as distinct cases.
  2. Adherence to Terminology Freeze; use existing FC, DIR, OI, and PL schemas.

### Phase L3: Dataset Integrity Reviews (DIR)

- **Goal:** Keep database structures and JSON genomes perfectly aligned without drift.
- **Success Criteria:**
  1. Run automated validation checks showing zero schema validation errors in active client dossiers.

### Phase L4: Operational Investigations (OI)

- **Goal:** Diagnose recommendation outliers or conflicts (e.g., mismatched user sensory profiles vs archetype expectations).
- **Success Criteria:**
  1. System highlights design conflicts and reports exact trade-off impact scores.

### Phase L5: Process Learnings (PL)

- **Goal:** Curate recommendations based on explicit human validation.
- **Success Criteria:**
  1. Designers approve or modify AI recommendations, and the outcome is logged to compound system intelligence.

### Phase 40: Admin Panel Remediation

- **Goal:** Close the gaps found in the 14 Oct 2026 admin audit so a non-technical owner can run lead capture, notifications and website content without a developer.
- **Source:** docs/reports/admin-panel-audit-2026-10-14.md (findings C1-C4, H1-H6, M1-M7).
- **Success Criteria:**
  1. A new lead triggers the team email alert and the customer auto-reply in production, recorded in the activity log.
  2. Every setting shown in Security, Email Templates and General Settings either takes effect or is labelled as not active.
  3. No admin action saves placeholder data or fails silently.
  4. Projects and Services have SEO fields; menus, footer links and the default share image are editable.
  5. Two-factor sign-in is enforced for every admin login, and inactive sessions log out after the configured time.
  6. The Lead Workspace "lock decision" saves real session data. (Phone access is out of scope: admin stays desktop-only.)
- **Pre-execution gate:** the owner's uncommitted home-page work on feat/home-scroll-choreography (content/registry.ts, content/types.ts, pages/Index.tsx, components/home/Hero.tsx, ExpertiseChapter.tsx, ProcessChapter.tsx, motion/PinnedChapter.tsx) must be committed, stashed or branched before execution; plan 40-01 Task 0 is a blocking checkpoint for it and 40-15 depends on 40-01.
- **Plans:** 29 plans
- **Plan list:**
  - [ ] 40-01-PLAN.md — Pre-execution tree-clean gate, Wave 0 test stubs + TOTP e2e helper
  - [ ] 40-02-PLAN.md — Pure lead-notify and stale-digest libs (TDD)
  - [ ] 40-03-PLAN.md — Schema migration (lead columns, recipients column, settings guard trigger)
  - [ ] 40-04-PLAN.md — Vault trigger function, gated 2FA RLS backstop, cron SQL, secrets test
  - [ ] 40-05-PLAN.md — handle-new-lead rewrite, leadEmail lib, lock auto-reply-lead
  - [ ] 40-06-PLAN.md — notify-telegram / posthog-to-telegram read the admin chat-id list
  - [ ] 40-07-PLAN.md — stale-lead-checker and weekly-report-email hardening
  - [ ] 40-08-PLAN.md — Notifications tab: recipient lists UI
  - [ ] 40-09-PLAN.md — Email Templates screen (subject, chips, safe preview)
  - [ ] 40-10-PLAN.md — Server-side MFA API (login withholds cookies, mfa endpoint)
  - [ ] 40-11-PLAN.md — reset-mfa, mfa-status, edge aal check (gated)
  - [ ] 40-12-PLAN.md — Two-factor sign-in screens in AdminAuth
  - [ ] 40-13-PLAN.md — Truthful Security page and Users table 2FA column/reset
  - [ ] 40-14-PLAN.md — Idle logout hook and warning dialog
  - [ ] 40-15-PLAN.md — Share image + noindex on every page SEO block
  - [ ] 40-16-PLAN.md — Editable menu and footer links
  - [ ] 40-17-PLAN.md — Form wording blocks + contact/pop-up/newsletter wiring
  - [ ] 40-18-PLAN.md — Estimator and quiz wording wiring
  - [ ] 40-19-PLAN.md — Project/Service SEO fields and resolver
  - [ ] 40-20-PLAN.md — SeoMeta component and page wiring (browser SEO output)
  - [ ] 40-21-PLAN.md — Lead Workspace lock decision with real data
  - [ ] 40-22-PLAN.md — Blog publish date, silent errors, gallery confirms
  - [ ] 40-23-PLAN.md — Unlabelled buttons, nav labels, device-gate message
  - [ ] 40-24-PLAN.md — [OPERATOR] Schema, Vault, secrets, function deploys
  - [ ] 40-25-PLAN.md — [OPERATOR] Rotate secret, trigger swap, end-to-end proof
  - [ ] 40-26-PLAN.md — [OPERATOR] Reminder cron jobs, retire old token
  - [ ] 40-27-PLAN.md — [OPERATOR] App deploy, 2FA enrolment, RLS backstop, extra-recipient proof
  - [ ] 40-28-PLAN.md — Default share image setting and fallback
  - [ ] 40-29-PLAN.md — Crawler share-preview middleware and ogFromSeo (blog/project query fix)
