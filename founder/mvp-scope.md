<!-- /founder:mvp-scope · 2026-10-13 · input: audit current already build on in this project validate it, as its useful or not -->

# MVP scope: audit of what is already built

Assumption: Cross Angle Interior is an interior design studio, and the site exists to turn visitors into paying design clients (PROJECT.md, lead-generation README).
Assumption: `founder/` was empty. Lead counts come from a read-only query on 2026-10-13. I did not check traffic.
Assumption: build times are Estimates, in days, for one developer.

## Verdict

The lead-capture core is useful. The "intelligence" layer around it is not validated, and the repo's own gate says so.

- **Size:** about 113k lines of TypeScript in `apps/web/src`, 33 edge functions, 103 migrations, 338 commits since 2026-02-05. Admin pages plus admin components are about 39k lines.
- **Validation gate unmet:** `VALIDATION-SPRINT.md` freezes Phase 17 until 5 to 10 designer interviews pass four criteria. `NEVER-BUILD.md` still reads "Awaiting results". `learning-baseline-v1.md` shows 0 of 20 cases.
- **Numbers you could not trust:** the 2026-09-24 audit found 47 issues, 14 hardcoded or fabricated, including a fake named lead on the Hub. Commits on 09-24 and 09-26 claim fixes. I did not re-verify them.
- **Exposure:** `/lab`, `/system-blueprint` and `/foundation` are public routes. The static `sitemap.xml` has 5 URLs (committed copy: 10) and lists `/contact` and `/estimator`, which are not canonical routes (`/contact-us`, `/estimate`). Verify the live one.

**Production numbers (read 2026-10-13, counts and flags only).** 11 leads since 2026-04-13: 6 in the last 90 days, 2 in the last 30. Last 90 days by source: welcome popup 4, contact form 1, workspace studio 1, estimator 0. All time: welcome popup 7, contact form 2, other 1, workspace studio 1, estimator 0. The estimator labels its leads `estimator`, so its zero is real. None of the 11 look like test data. 10 of 11 are still status `new`, the oldest from April, because no staff is assigned to follow-up (founder, 2026-10-13). One has no phone or email. One has a budget. None has a quiz archetype. `quiz_results` has 0 rows.

The bottlenecks are follow-up capacity and low lead volume. No admin module fixes either.

## 1. Feature triage

| Feature (as built) | Category | Reasoning |
|---|---|---|
| Public portfolio, services, contact pages | Must | Visitors judge the studio here. No trust, no lead. |
| Lead capture into one `leads` table (welcome popup, contact form, estimator, WhatsApp and call bar) | Must | No capture, no business. The popup is the top source: 7 of 11. |
| Instant new-lead alert (`handle-new-lead`, `notify-hot-lead`, Telegram or email) | Must | Reply speed is the studio's edge. One channel is enough. |
| Lead inbox with 7-status pipeline and notes (`AdminLeads`) | Must | Follow-up should happen here, but 10 of 11 leads sit at `new` for lack of staff. Fix its status labels. |
| Portfolio, services, blog CMS with ImageKit upload | Must | The owner must publish projects without a developer. |
| Cookie auth and roles | Must | Protects lead data. Built and guarded by `arch:supabase-auth`. Do not touch. |
| Cost estimator (`/estimate`) | Should | Attaches a budget to a lead, but 0 estimator leads on record. Test it in production before judging it. |
| Style quiz, public flow only | Should | Plausible differentiator, but `quiz_results` has 0 rows and no lead has an archetype. |
| Estimator pricing config | Should | Prices change without a deploy. |
| Blog, location pages, schema markup | Should | Slow traffic source. Content already written. |
| Weekly report email, stale-lead checker | Should | Cheap, already scheduled, nudges follow-up. |
| One CRM analytics page (leads by source and status) | Should | Replaces the Hub tiles once the enum is fixed. |
| Recommendation engine (ALCS), lead workspace, learning health, evidence ledger | Won't | Own gate unmet: no interviews, 0 of 20 cases. |
| DAM v3 (versions, usage graph, collections, duplicate grouping) | Won't | A studio needs upload, tag, replace. |
| Discovery admin config (archetypes, moodboards, reflections) | Won't | Freeze the content. Edit in the database if needed. |
| Hub tiles, system health, architecture portal, service integrations, audit-log UI | Won't | 14 fabricated numbers. The owner needs a lead count, not a dashboard. |
| `score-lead` and `auto-score-lead` | Won't | Different formulas write the same `score` column with no version stamp. Sort by recency. |
| Public `/lab` pages, blog engagement analytics, session replay | Won't | Internal tooling on a production domain, and no decision depends on the rest. |

## 2. MVP definition

A homeowner can find a project they like, get a rough budget from the estimator and send an inquiry in under 5 minutes, and the studio gets a phone alert within 1 minute.

1. Portfolio, services and contact pages
2. Estimator that submits a lead
3. Contact form with WhatsApp and call bar
4. Instant alert to the owner's phone
5. Lead inbox with status and notes
6. Portfolio CMS

## 3. User flow

```
Step 1: Visitor lands on a portfolio project from search or social.
Step 2: Visitor clicks "Get an estimate" and answers the estimator (about 2 minutes).
Step 3: Visitor sees a budget range and enters name and phone.
Step 4: Studio gets an alert, replies on WhatsApp, moves the lead to in_conversation.
```

## 4. Technical scope

- **Build vs. buy:** keep what exists: Supabase for database and auth, Resend for email, ImageKit for media, a Telegram bot for alerts, PostHog for basic events. Do not rewrite anything.
- **Stack:** unchanged (React 18, Vite, Supabase, Vercel).
- **Work to get here (Estimate, one developer):**

| Task | Days |
|---|---|
| Pull 90-day leads by source. Call the last 10 leads and ask how they found the site | 0.5 |
| Remove or gate `/lab`, `/system-blueprint`, `/foundation` | 0.5 |
| Hide the Won't modules from nav and Hub behind a flag, no deletion | 1 |
| Fix old status names in CRM labels (CRM-01, 02, 06) and in `stale-lead-checker`. Re-verify the 09-24 and 09-26 fixes | 1.5 |
| Default new leads to the owner's `assigned_to` until staff exist | 0.5 |
| Pick one lead scorer or drop scoring | 0.5 |
| Fix the sitemap to list real routes | 0.5 |
| Prove each lead source end to end in production, alert included | 1 |
| **Total** | **6.0** |

- **Hosting:** Vercel's Hobby plan is limited to personal, non-commercial use, and a studio's lead site is commercial ([Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)). Estimate: Pro is about $20 per seat per month. Supabase Free pauses a project after 1 week of inactivity and caps the database at 500 MB ([Supabase pricing](https://supabase.com/docs/pricing)). A live lead pipeline should not go dark, so use Pro, about $25 per month per [third-party guides](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/).

## 5. What you are not building

| Feature | Why it feels important | Why it can wait | Revisit when |
|---|---|---|---|
| ALCS and lead workspace | It is the stated moat | No designer has confirmed they want it | 5 interviews meet the four gate criteria in `VALIDATION-SPRINT.md` |
| DAM v3 workspace | Orphan files and re-uploads feel risky | A studio adds projects slowly | Two editors overwrite or duplicate images in one month |
| Lead scoring | "Prioritise hot leads" | At low volume the owner reads every lead | 50 new leads in a month |
| Analytics suite (blog engagement, traffic, replay) | Measure everything | No decision depends on it today | 100 leads in the table and a named question |
| Quiz and estimator config workspaces, architecture portal, learning health | Configurability | One owner, rare content changes | A second non-developer must edit quiz content weekly |

## 6. Launch criteria

Done means:

- [ ] Contact form, estimator and quiz each create a `leads` row with the right source, tested in production
- [ ] An alert reaches the owner's phone within 60 seconds for every source
- [ ] The lead inbox shows all 7 statuses with correct labels
- [ ] Every new lead has an `assigned_to` within 24 hours
- [ ] No literal number on the Hub or CRM pages. Each is computed or removed
- [ ] Sitemap lists the real routes: `/contact-us`, `/estimate`, services, portfolio, blog, locations
- [ ] `/lab`, `/system-blueprint`, `/foundation` return 404 on the production domain
- [ ] Vercel and Supabase plans allow commercial use and do not auto-pause
- [ ] `contact-form-flow` and `estimator-smoke` Playwright specs pass

Can be ugly: admin visual polish, the frozen modules' empty states, the shared quiz-result pages.

Test with the first 10 leads: of those from the estimator or quiz, how many reply to the first WhatsApp message, compared with plain contact-form leads.
