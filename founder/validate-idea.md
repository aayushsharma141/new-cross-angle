<!-- /founder:validate-idea · 2026-10-13 · input: (empty, idea taken from PROJECT.md and VALIDATION-SPRINT.md) -->

# Validation: Client Intelligence Platform for interior designers

Assumption: the idea is the "Client Intelligence Platform" in `PROJECT.md` and `VALIDATION-SPRINT.md`: a quiz, estimator and recommendation layer that gives designers a one-page brief on each lead. The input was empty and no product brief exists.
Assumption: the customer is a solo or small-studio interior designer in India. No planning doc defines pricing, other tenants or any customer besides your own studio.
Assumption: you run the studio, since you work its leads in the CRM. Nothing else about you is saved.

## 1. The 30-second assessment

Right now this is a solution looking for a problem. Your own data shows the studio's pain is follow-up and traffic: 11 leads in six months, 10 still at `new` because nobody is assigned. A recommendation engine does not fix either. The idea is not dead, but nobody outside your studio has said they want it.

## 2. The five fatal questions

**Q1: Who is the customer, and would they pay today?**
A solo designer running leads on WhatsApp in a metro or tier-2 city. One indicative figure says over 93% of Pune's designers are solo ([LinkedIn post](https://in.linkedin.com/in/noorhaji), unverified). Willingness to pay: no one has been asked, so the answer is no for now. Estimate: below US$39 a month, the cheapest tool I found ([Foyr Neo via DesignFiles blog](https://blog.designfiles.co/interior-design-project-management-tool/), vendor-written). I found no INR pricing for any tool.

**Q2: Why hasn't someone built this?**
They have, and the field is littered.
- Modsy raised about $73M and [shut down in 2022](https://www.designerstoday.com/e-commerce/modsy-shutters-its-business/). It teased "Modsy Pro" software for designers on the way out. [Surface](https://www.surfacemag.com/?p=143269) names Homepolish and Laurel & Wolf as earlier failures.
- Havenly survived by shifting toward selling product. Its [style quiz already matches customers to designers](https://businessden.com/2019/12/19/interior-design-startup-havenly-to-launch-second-private-furniture-brand/), so a quiz is not new.
- Livspace, the Indian incumbent, reported [₹1,460 crore FY25 revenue and a ₹243 crore loss](https://inc42.com/buzz/livspaces-fy25-loss-declines-43-to-inr-243-cr/). It owns the homeowner funnel, and interior projects were [93.7% of its income](https://entrackr.com/fintrackr/livspace-posts-rs-1460-cr-revenue-in-fy25-losses-shrink-42-10559863).
- Designer tools exist: [Houzz Pro](https://www.capterra.com/p/199689/Houzz-Pro/pricing/) (CRM and proposals, from about $99 to $149 a month depending on source) and [Zygn](https://www.goodfirms.co/software/zygn), an India-based tool covering leads, BOQs and procurement.

What is different now: AI makes recommendations cheap. That helps everyone equally, and nothing in the repo shows an edge.

**Q3: What is the distribution advantage?**
None. The first 100 users have no channel. Your own site produced 6 leads in 90 days. The shareable quiz-result page could be a loop, but `quiz_results` has 0 rows, so there is no loop yet. Selling to designers is a different channel from attracting homeowners, and you have built only the homeowner one.

**Q4: Big business or a feature?**
A feature. "Client style profile" fits inside Houzz Pro or Zygn in a quarter. The ceiling is set by small buyers. Arithmetic: $1M ARR at $50 a month needs 1,667 paying studios (1,000,000 / 600). At $99 a month it needs 842. Each would have to be found one by one.

**Q5: Can the founder build it?**
Building is not the constraint: the repo holds about 113k lines of TypeScript. The hard part is getting designers to change how they prepare for a call, and that is a sales and community problem. The first hire would be someone who sells to designers, or a practising designer who can say what they use.

## 3. Idea scorecard

| Dimension | Score | Notes |
|---|---|---|
| Problem severity | 2 | Unvalidated. Zero interviews, 0 of 20 founding cases. |
| Market size | 3 | India interiors is a [~$31.5B market (2023)](https://www.imarcgroup.com/interior-design-market-india), but buyers are mostly solo. |
| Willingness to pay | 2 | Cheapest rivals start near $39 a month. Nobody asked. |
| Competition gap | 2 | CRM, BOQ and quiz-to-designer all exist. The evidence ledger is untested. |
| Distribution | 2 | No channel to designers. |
| Timing | 3 | AI lowers cost, but Modsy shows the category punishes burn. |
| Founder fit | ? | Unknown. See the verdict. |
| **Total** | **14/30** | Founder fit unscored. Scaled to 35 that is about 16: significant concerns. |

## 4. Validation experiments

**Experiment 1: five designer interviews (reuse your own sprint).**
- Test: designers would open a one-page lead brief before every first call.
- How: print the brief for your three newest leads, anonymised. Book 5 designers by WhatsApp or Instagram DM. Run `VALIDATION-SPRINT.md` Round 1 and Round 2 with each.
- Success: 4 of 5 say they would open it before every call, and 3 name a decision they would change.
- Time and cost: 10 days, about $0.

**Experiment 2: pre-sell before building more.**
- Test: someone pays for a narrow tool.
- How: one-page offer, "lead brief and follow-up reminders for solo designers, monthly price you pick". DM 30 designers with the sample brief. Ask for a small UPI deposit or a signed pilot note.
- Success: 3 of 30 pay or sign.
- Time and cost: 10 days, under $50 (Estimate, mostly your time).

**Experiment 3: clear your own backlog.**
- Test: whether the problem is insight or just follow-up.
- How: this week, message the 10 leads waiting at `new`, starting with the three newest, using a plain WhatsApp note. Log replies in the CRM.
- Success: at least 2 of 10 reply and 1 books a meeting.
- Time and cost: 3 days, $0.

If experiment 3 works with a plain message, the intelligence layer was not the missing piece.

## 5. The honest verdict

**Pivot it.** As a platform for other designers it is a feature with no buyer, no channel and a graveyard of well-funded predecessors. The stronger angle is to treat your own studio as the only customer until it proves the loop: popup, estimator and quiz bring leads, someone follows up fast, and deals close. If that works, sell the narrow tool you used, WhatsApp-first follow-up and estimate-to-lead for solo Indian designers, and only then build intelligence on top.

Single most important thing this week: run experiment 3, and book the five interviews.

One question for you: do you have a personal network of designers who would take a call, and have you sold anything to a stranger before? That decides founder fit.
