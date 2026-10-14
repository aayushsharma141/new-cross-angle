# Phase 40: Admin Panel Remediation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-14
**Phase:** 40-admin-panel-remediation
**Areas discussed:** Lead alerts & auto-reply, Security switches, SEO & editable content scope, Phone & tablet access, Lead Workspace lock button

Phase was created for this discussion: the user ran the command without a phase number and chose "Admin panel remediation (new phase)"; it was added to ROADMAP.md as Track C — Admin Operations.

---

## Lead alerts & auto-reply

| Question | Options | Selected |
|---|---|---|
| Internal alert recipients | Default + extra in admin / Single secret only / All admin users | Default + extra recipients in admin |
| Who gets the customer thank-you | All with email except newsletter / Contact + estimator only / Held for review | All with email except newsletter |
| Telegram recipients | Admin-managed list the function reads / Single secret chat / Both | Admin-managed list |
| Reminder jobs | Both / Weekly only / Neither | Both |

**User's choice:** all recommended options.
**Notes:** User also stated Telegram chat 1228126069 is the intended chat (earlier in the session).

---

## Security switches

| Question | Options | Selected |
|---|---|---|
| 2FA switch | Build real 2FA / Show "Not active yet" / Remove | Build real 2FA |
| 2FA scope | Admins + super admins / Everyone with an admin login / Super admins only | Everyone with an admin login |
| Session timeout | Auto logout after inactivity / Remove / Show "Not active yet" | Auto logout after inactivity |
| Rotate webhook token | Include / Separate later | Include |

**User's choice:** recommended, except 2FA scope: chose the strictest option (everyone).

---

## SEO & editable content scope

| Question | Options | Selected |
|---|---|---|
| Project/Service SEO | Title+description+image / Title+description / Automatic only | Title, description and share image |
| Page SEO extras | Image + noindex / Image only / Neither | Share image + hide-from-Google |
| Menus and footer | Make editable / Remove unused fields / Later | Make editable |
| Form wording | Intro + success messages / Full builder / Not now | Intro text and success messages |

**User's choice:** all recommended options.

---

## Phone & tablet access (raised in "explore more")

| Option | Selected |
|---|---|
| Phone-friendly Leads view first | |
| Make the whole admin responsive | |
| Tablets yes, phones no | |
| Stay desktop-only | ✓ |

**User's choice:** Stay desktop-only. (Overrides the audit's recommendation H2; roadmap success criterion updated.)

---

## Lead Workspace lock button

| Option | Selected |
|---|---|
| Hide until it saves real data | |
| Fix it now to save real data | ✓ |
| Keep with warning + error message | |

**User's choice:** Fix it now to save real data. (Chosen over the recommended "hide"; larger scope.)

---

## Claude's Discretion

Layout of recipient editors and 2FA enrolment/recovery screens; honest "not active" wording during rollout; the small audit defects on the same code paths.

## Deferred Ideas

Phone/tablet access; full form builder; scheduled blog publishing; moving submit-estimate to the shared scoring formula; reconciling the two source-less deployed functions.
