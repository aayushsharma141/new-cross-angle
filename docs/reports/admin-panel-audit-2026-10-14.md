# Admin Panel Audit — Functionality, Usability and CMS Coverage

**Date:** 14 October 2026 · **Scope:** everything under `/admin` (about 40 screens, 168 components) plus the backend it depends on
**Written for:** owners and stakeholders. Technical detail is in the "Evidence" lines.

---

## 1. Verdict in one page

**The admin panel is broad and mostly well built, but several of its most important promises are not actually delivered.** Content editing (projects, blog, services, gallery, media) and the lead pipeline work. The weak spots are all in the area you care about most: **what happens after a lead arrives**, and **settings that look like they protect or configure the business but do nothing**.

| Area | Rating | One-line summary |
|---|---|---|
| Data connections ("pipelines") | 🟡 Mostly good | All 38 database tables and 7 database functions the admin uses exist. 9 backend functions were never deployed and 2 deployed ones have no source code. |
| Buttons and actions | 🟡 Good with defects | No dead (do-nothing) buttons found. Two actions write wrong data or silently fail. |
| Dynamic features | 🔴 Weak | Customer auto-reply and email alerts have **never run**. 2FA and session timeout are **not enforced**. Analytics is **5 months stale**. |
| Look and feel (UI) | 🟢 Good | Consistent, readable, clean login page. Some cosmetic and labelling issues. |
| Ease of use for non-technical people | 🟠 Needs work | Blocked on phones and tablets, technical words like "Slug", duplicated menu names. |
| CMS completeness | 🟠 Partial | Page text, blog, media and legal pages are editable. SEO for projects/services, share image, menus and form messages are not. |

**If you only fix five things**, fix these (details in section 3):
1. Make new-lead **email alerts and the customer auto-reply** actually work (they have never run).
2. Remove or truly enforce the **2FA / session-timeout** switches (they currently tell admins something false).
3. Stop the Lead Workspace "lock decision" button from saving **made-up placeholder data**.
4. Restore the **analytics sync** (no new data since 15 May 2026) so reports can be trusted.
5. Let the admin be used on a **phone/tablet** (owners cannot check a new lead away from a desktop).

---

## 2. How this audit was done, and its limits

**What I did**
- Read the code of every admin screen and traced every database table, database function and backend function it calls.
- Checked each of those against the **live production database** (read-only queries; nothing was changed).
- Scanned all admin code for do-nothing buttons, placeholder data, silent failures, unlabelled controls and technical wording.
- Compared what the CMS lets a non-developer edit against what the public site and the database actually contain.
- Looked at the login page in a browser.

**What I could not do — please read this**
- I **did not log in**, so I did not click through the authenticated screens. "Every button" below means: *its click handler exists and is connected to real logic*, not *I pressed it and watched the result*. A hands-on click-through by a real admin is still worth doing; the checklist in section 7 is designed for that.
- The database has little data (12 leads, 10 blog posts, 3 projects, 6 team members), so some screens could not be judged under realistic volume.

---

## 3. Findings, ranked

### 🔴 Critical — the business impact is real

**C1. New-lead emails (customer auto-reply and internal alert) have never worked.**
*What it means:* when a visitor submits a form, the only automatic alert is a Telegram message. The thank-you email to the customer and the email alert to your team are not sent. The "Email Templates" screen lets you edit wording that nothing ever sends.
*Evidence:* the function that sends both (`handle-new-lead`) was never deployed; the auto-reply function is deployed but nothing triggers it; the live `leads` table is missing the two columns those functions write (`auto_reply_sent_at`, `internal_notified_at`); in 6 months the activity log has zero "auto-reply sent" or "internal notification sent" events (it has only 14 "lead viewed").
*Fix:* deploy the function, add the two columns, add the trigger, then test with a real submission. *Effort: ½–1 day.*

**C2. The 2FA and session-timeout switches do nothing.**
*What it means:* Security Settings says "All admin users will be required to set up two-factor authentication" and "Inactive users will be logged out after N minutes". Neither is true. The values are saved to the database and no code reads them; there is no two-factor code anywhere in the system.
*Evidence:* no MFA/TOTP/idle-timeout code exists in the app, API or middleware.
*Fix:* either remove the switches, label them "not active yet", or build them (Supabase supports two-factor; an idle timer is small). *Effort: 1 hr to relabel, 2–3 days to build.*

**C3. "Lock decision" in the Lead Workspace saves invented data.**
*What it means:* locking a decision stores fixed placeholder values ("12 nodes", "budget 15000", "Market Comparable 1") instead of the real session data. If this is used with a client, the saved record is fiction. If saving fails, the admin sees no error.
*Evidence:* `AdminLeadWorkspace.tsx` lines ~100–120; the table already holds 22 such rows (some may be placeholders).
*Fix:* save real data or disable the button until it can; add an error message. *Effort: 1 day.*

**C4. Analytics reports are 5 months out of date.**
*What it means:* Traffic, Blog and Discovery analytics look live but show nothing newer than 15 May 2026.
*Evidence:* the nightly sync is scheduled but rejected with "401 Unauthorized" every night because its key setting is missing.
*Fix:* documented step-by-step in `docs/runbooks/2026-10-13-admin-cms-deploy-checklist.md` section 2. *Effort: 30 min.*

### 🟠 High

**H1. Editing a published blog post resets its publish date.** Every save of a published post stamps "published now". Old articles jump to the top of the blog and search engines see a changing date. *Fix: only set the date the first time a post is published. Effort: 1 hr.*

**H2. The admin cannot be used on phones or tablets.** Anything under 1024 px wide (all phones, iPads, small laptop windows) is blocked with a "use a desktop" screen. An owner cannot check or reply to a new lead on the move. *Fix: allow read-only lead view and notifications first; full responsive later. Effort: 2–4 days.*

**H3. SEO controls are missing for Projects and Services.** Blog posts have an SEO title and description; individual projects and services do not, so those public pages cannot be tuned. No page has an editable share image, canonical address or "hide from Google" switch. *Effort: 1–2 days.*

**H4. Settings that exist but are not connected.** The database has fields for navigation links, footer columns, default share image, SEO title template, Facebook pixel and favicon. None has an editing screen and the public site does not read them. The editable "Telegram chat IDs" list is also never read by any function — adding a recipient there has no effect. *Fix: either build them into the CMS or remove them so nobody assumes they work. Effort: 2–3 days.*

**H5. Backend functions are out of sync with the code.** Nine functions in the repository were never deployed (including the lead-alert, stale-lead reminder and webhook-retry ones); two live functions (`send-lead-email`, `submit-discovery-lead`) have **no source code in the repository**, so nobody can review or safely change them. The "Send Email" button in a lead's detail panel depends on one of them. *Effort: 1 day to reconcile.*

**H6. Lead scoring is mostly zero.** 11 of 12 leads score 0, so Hot/Warm/Cold labels are meaningless. A single formula and insert-time scoring are now written (in the open pull request) but not yet deployed or back-filled.

### 🟡 Medium

- **M1. Technical words shown to users:** "Slug" appears in 5 places (should read "Web address"), plus "payload" and "Supabase Write Failures".
- **M2. Unlabelled icon buttons:** 21 of 56 icon-only buttons have no accessible name (mainly the Estimator and Discovery editors, Quote Requests). Screen-reader users cannot tell what they do.
- **M3. Inconsistent confirmation dialogs:** the Gallery uses the browser's plain pop-up for "delete?"; the rest of the app uses styled dialogs.
- **M4. Silent failures:** in 5 screens an error is only written to a developer console (Lead Workspace lock, Settings, Blog Performance, Blog Engagement, Learning Health). The user sees nothing.
- **M5. Dead and duplicate code:** `AdminMediaOld` (616 lines) and `AdminUsers` are not used anywhere. Two menu items are both called **"Team Members"** (one in Content, one in User Access) and refer to different things.
- **M6. Menu size:** 8 modules and about 40 menu items. "Visual Media Library" vs "Media Uploader", "Static Resources", and a hidden "Learning Health" page are unclear to non-technical staff.
- **M7. Blog scheduling is not available** (the control was removed because it never worked) — acceptable, but not obvious to editors.

### 🟢 Low
- Login page shows developer text ("ANALYTICS OS V3.0.0", example email "admin@crossangle.com").
- A few comments in code still describe "mock logic" (urgent badge on lead cards uses a simple rule: Hot + has next step).

### ✅ What is working well
- Every database table (38/38) and database function (7/7) the admin uses exists in production.
- Role-based access (viewer / editor / admin / super admin) is applied on every route; the audit log is recording actions (26 entries).
- Lead management is complete: search, filters, bulk actions, assign, notes, export, add a lead, WhatsApp and email links.
- Media library, blog editor, project and service editors, gallery, testimonials and team all save to the database.
- New Site Content editor (draft, publish, history) covers home, legal pages, process, locations, about, services, contact, portfolio, gallery, blog, footer message and 404 page.
- Login page is clear: labelled fields, show-password, forgot-password, keyboard friendly.

---

## 4. Do the lead, notification and capture features meet a non-developer standard?

| Need | Can a non-developer do it today? | Gap |
|---|---|---|
| See and work new leads | ✅ Yes | Only on a desktop (H2) |
| Be told instantly about a new lead | ⚠️ Telegram only | Email alert never works (C1); chat list not connected (H4); recipient is set by a developer secret |
| Customer gets an instant thank-you | ❌ No | C1 |
| Edit the wording of that thank-you | ⚠️ Screen exists, nothing sends it | C1 |
| Weekly summary email | ⚠️ Recipients editable | The weekly schedule is not installed in production |
| Chase stale leads automatically | ❌ No | Reminder function never deployed or scheduled |
| Edit form wording / thank-you message / fields | ❌ No | Not in the CMS |
| Choose where leads are sent (Google Sheet etc.) | ❌ No | Developer-only setting |
| Lead score you can trust | ⚠️ Not yet | H6 |

## 5. CMS and SEO coverage

| Need | Status |
|---|---|
| Page titles and descriptions for main pages | ✅ Editable (home, about, services, contact, portfolio, gallery, blog, process, locations) |
| Blog title/description per article | ✅ |
| Project and service page titles/descriptions | ❌ (H3) |
| Default and per-page share image | ❌ |
| Hide a page from Google, canonical address | ❌ |
| Redirects for moved pages | ❌ |
| Sitemap | ⚠️ Generated automatically; not visible or controllable in the admin; the live sitemap function is old |
| Privacy / Terms with history | ✅ |
| Menus and footer links | ❌ (H4) |
| Image descriptions (alt text) | ⚠️ Possible on some screens, not required |
| Analytics / tracking IDs | ⚠️ Google Analytics and PostHog yes; Facebook pixel no |
| Business details (phone, email, address, hours) | ✅ |

---

## 6. UI and UX: what to improve (no custom standard needed)

A simple standard to measure against: **a new staff member should complete the five common jobs without help** — add a project, publish a blog post, check a new lead, change a phone number, update page wording.

1. **Plain language:** replace "Slug" with "Web address", "payload" with "details"; hide developer-only screens (Learning Health, Static Resources) from non-super-admins.
2. **One name per thing:** rename the duplicate "Team Members" → "Website Team" and "Admin Users".
3. **Say what happens:** every Save/Publish should show one clear result message; no silent failures (M4).
4. **Never promise what isn't true:** C2 and the unused Email Templates screen are the worst cases; if a feature is not live, say "Not active yet".
5. **Consistent confirmations:** use the same styled dialog for every delete.
6. **Mobile:** at least a read-only, phone-friendly lead list and lead detail with a call/WhatsApp button.
7. **Guided first-run:** a short "Getting started" panel on the Hub with the five common jobs as buttons.
8. **Accessibility:** label the 21 icon-only buttons; keep the visible focus ring already used elsewhere.

## 7. Hands-on click-through checklist (to finish the audit)

Have a non-technical person do each in under 3 minutes, logged in as an *editor* and as an *admin*, and note any hesitation:
add a project with photos → publish a blog post and edit it → find today's lead and mark it contacted → export leads → change the phone number → edit the About page wording and publish → upload an image and use it → invite a team member → change a Privacy Policy line and restore the old version.

## 8. Suggested order of work

| Phase | Items | Effort |
|---|---|---|
| **Now (trust)** | C2 relabel, C3, C4, H1, M4 | ~1–2 days |
| **Next (leads work end to end)** | C1, H5, H6, Telegram recipients (H4) | ~2–3 days |
| **Then (SEO and CMS)** | H3, share image, menus/footer, form wording | ~4–6 days |
| **Then (access and polish)** | H2 mobile lead view, M1–M3, M5–M6, first-run guide | ~4–7 days |

---

## Appendix — evidence summary (for the developer)

- Live check: `information_schema.tables` returned 38 of 38 admin tables; `pg_proc` returned 7 of 7 RPCs.
- `supabase functions list` vs `supabase/functions/`: local-only = auto-score-lead, handle-new-lead, integration-status, log-lead-activity, media-import, notify-hot-lead, process-lead, retry-webhooks, stale-lead-checker. Deployed-only = send-lead-email, submit-discovery-lead.
- `leads` columns present: status, assigned_to, next_step; absent: auto_reply_sent_at, internal_notified_at.
- `lead_activities`: only `lead_viewed` (14 rows, last 2026-06-25).
- `cron.job`: one job; HTTP result 401; newest `analytics_reporting_daily` row 2026-05-15.
- Triggers on `leads`: `on_lead_insert_webhook_notify`, `update_inquiries_updated_at` only.
- No `mfa|totp|aal2|session_timeout|enforce_2fa` reads outside the Security page.
- `BlogEditorForm.tsx`: `published_at: status==='published' ? new Date().toISOString() : null` on every save.
- `AdminDeviceGate.tsx`: blocks viewport < 1024 px, mobile user agents and coarse pointers.
- Admin icon buttons: 56 with `size="icon"`, 21 without `aria-label`/`title`.
