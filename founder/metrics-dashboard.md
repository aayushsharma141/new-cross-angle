<!-- /founder:metrics-dashboard · 2026-10-13 · input: (empty, numbers taken from founder/ files and production counts) -->

# Metrics dashboard: Cross Angle Interior lead engine

Assumption: the stage is post-launch with fewer than 100 users, so the focus is engagement and core-action completion. Here the core action is a lead that turns into a meeting.
Assumption: there is no fundraising plan, so section 6 is skipped.
Assumption: targets are Estimates, built on today's baseline of 6 leads in 90 days and 2 in the last 30.

## 1. Stage assessment

Post-launch, 0 to 100 users. The site is live, volume is about 2 leads a month, and 10 of 11 leads sit at `new`. Revenue metrics (MRR, churn, LTV) do not apply. Track whether leads arrive, get answered and become meetings.

## 2. The five metrics

**1. New leads per month**
- Definition: rows added to `leads` per calendar month, excluding your own test submissions.
- Current: 2 in the last 30 days, 6 in the last 90.
- Targets: 4 at day 30, 6 at day 60, 10 at day 90.
- Informs: whether your channels work at all.
- If below target: pick the single channel with the most reach (Instagram or Google profile) and add one post or one ask per day for two weeks.

**2. Hours to first reply**
- Definition: time from `leads.created_at` to the first logged activity or status change.
- Current: not tracked. The oldest lead is from April and is still `new`.
- Targets: under 24 hours at day 30, under 6 at day 60, under 2 at day 90.
- Informs: whether to hire or assign help.
- If below target: set `assigned_to` to yourself by default and add a phone alert (the new-lead email may be getting missed).

**3. Leads moved off `new` within 48 hours**
- Definition: leads whose status changes from `new` within 48 hours, divided by leads created.
- Current: 1 of 11 ever moved (about 9%).
- Targets: 70% at day 30, 80% at day 60, 90% at day 90.
- Informs: whether follow-up happens or leads die.
- If below target: read the `new` list every morning for 10 minutes and either message or mark `lost`.

**4. Estimator completion rate**
- Definition: estimator leads divided by visitors who start the estimator.
- Current: 0 leads. Start counts are not tracked.
- Targets (Estimate): at least 1 lead by day 30, 10% completion by day 60, 15% by day 90.
- Informs: whether the estimator earns its place or gets cut.
- If below target: find the step where people leave (see events below) and remove that question.

**5. Meetings booked per month**
- Definition: leads reaching `meeting_planned` or later in a month.
- Current: 0. One lead is at `in_conversation`.
- Targets (Estimate): 1 at day 30, 2 at day 60, 3 at day 90.
- Informs: whether leads turn into work.
- If below target: shorten the first message, propose two dates, and move the call to WhatsApp video.

## 3. Metrics to ignore

| Metric | Feels important because | Misleads because | Track instead |
|---|---|---|---|
| Page views | Traffic looks like progress | 5,000 views and 2 leads is a conversion problem | Leads per month |
| Instagram followers | Easy to see | Followers rarely hire a designer | Leads from Instagram |
| Quiz starts | Shows interest | `quiz_results` has 0 rows, so starts never became results | Estimator completion rate |
| Total leads all-time | Grows forever | Hides that 10 are cold | Leads moved off `new` in 48 hours |
| Popup signups | 7 of 11 leads | One contact field and no budget, so low intent | Meetings booked |

## 4. Tracking setup

| Need | Tool | Cost | Setup time |
|---|---|---|---|
| Product analytics | PostHog, already installed | Free tier: 1M events a month ([pricing](https://posthog.com/pricing)) | 0 days |
| Revenue tracking | The CRM `leads` table (status, budget, `closed_at`) | $0 | 0.5 day |
| User feedback | One WhatsApp question after each meeting | $0 | 1 hour |
| Dashboard | A Google Sheet, filled each Monday | $0 | 1 hour |

Cost note: replay is a separate meter (5,000 free recordings a month), and you already turned it off in `founder/mvp-scope.md`.

**Events to track** (existing events come from `analytics/events.ts`)

| Event | Fires when | Tells you |
|---|---|---|
| `page_viewed` (exists) | Any page loads | Where visitors come from |
| `cta_clicked` (exists) | Any call-to-action click | Which buttons work |
| `estimate_path_selected` (exists) | Visitor chooses the estimator | Estimator interest |
| `estimator_step_completed` (new) | Each estimator step | Where people leave |
| `estimator_submitted` (new) | Estimator form sent | Completion rate |
| `contact_form_started` (exists) | First field typed | Contact interest |
| `contact_form_submitted` (exists) | Contact form sent | Contact conversion |
| `welcome_popup_submitted` (new) | Popup form sent | Popup performance |
| `whatsapp_clicked` (new) | WhatsApp button click | Chat interest |
| `call_clicked` (new) | Call button click | Call interest |
| `quiz_started` / `quiz_completed` (exist) | Quiz begins or ends | Quiz drop-off |
| `lead_gate_submitted` (exists) | Quiz asks for contact details | Quiz leads |
| `lead_first_reply` (new, server) | First activity logged on a lead | Hours to first reply |
| `lead_status_changed` (new, server) | Status updated | Moves off `new`, meetings |

"New" means the event is not in the event map I read. Check before adding.

## 5. Weekly review template (15 minutes, Mondays)

```
Week of: ___
New leads this month: ___ (target: ___)
Hours to first reply (median): ___ (target: ___)
Moved off "new" within 48 hours: ___% (target: ___)
Estimator completion: ___% (target: ___)
Meetings booked this month: ___ (target: ___)

Leads still at "new" older than 7 days: ___
What worked: ___
What didn't: ___
One thing to try this week: ___
```

## 6. Investor-ready metrics

Skipped. No fundraising plan is saved. If that changes, rerun `/founder:fundraise-prep`.

Before you trust any number above, fix two things from the data audit: the Hub and CRM pages contain hardcoded figures, and status labels use old names. A dashboard showing false numbers is worse than a spreadsheet.
