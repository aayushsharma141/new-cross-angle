<!-- /founder:pricing-strategy · 2026-10-13 · input: (empty, product and buyer taken from founder/ files) -->

# Pricing strategy: lead follow-up tool for solo Indian designers

Assumption: the product priced here is the narrow tool from `founder/validate-idea.md`: lead inbox, WhatsApp-first reminders, estimator embed and a one-page client brief, sold to solo and small-studio interior designers in India.
Assumption: you have no pricing idea saved, and nobody has been asked what they would pay. Every price below is a hypothesis for experiment 2, not a fact.
Assumption: ₹ to $ conversion is about ₹85 per $1. Estimate, not verified.
Warning: the code today is single-tenant (one studio, one database). Selling this needs multi-tenant work first. Do not build it before 3 of 30 designers pay a deposit.

## 1. Pricing model analysis

| Model | Fit | Pros | Cons |
|---|---|---|---|
| Flat subscription | 5 | Simple, matches how rivals charge, easy to explain in a DM | Needs a clear value limit |
| Usage-based | 2 | Scales with leads | Lead volume is tiny (about 2 a month for you), so revenue is tiny |
| Per-seat | 2 | Standard | Most buyers are solo, so seats add nothing |
| Freemium | 3 | Low friction | Support cost with no revenue; works only with a hard cap |
| Credits | 1 | None here | Confusing for a non-technical buyer |
| One-time purchase | 2 | Easy to sell | No money to support WhatsApp and hosting |

**Recommendation:** flat monthly subscription per studio, with a small free tier. Because buyers are solo, seats do not matter, and a flat price is the easiest thing to say in a WhatsApp message.

## 2. Tier design

| | Free | Solo | Studio |
|---|---|---|---|
| Monthly | ₹0 | ₹499 | ₹1,499 |
| Annual | ₹0 | ₹4,990 (2 months free, 17% off) | ₹14,990 (17% off) |
| Seats | 1 | 1 | 3 |
| Leads per month | 10 | 100 | Unlimited |
| WhatsApp or email alerts | Email only | WhatsApp and email | WhatsApp and email |
| Follow-up reminders | No | Yes, 3 per lead | Yes, custom |
| Estimator embed for your site | No | No | Yes |
| One-page client brief | No | 20 per month | Unlimited |

- **Free** hooks users with the inbox and 10 leads. They outgrow it at the 11th lead in a month or when they want reminders.
- **Solo** is the target tier for most buyers. Reminders are the gate, because follow-up is the pain found in your data.
- **Studio** adds seats and the estimator, which is what a 2 to 3 person studio needs. Self-serve. A sales-led tier is not needed yet.

## 3. Competitive pricing context

Checked 2026-10-13 from search results, not from vendors' own pages. Open each link to confirm.

| Competitor | Price | Includes | Where you sit |
|---|---|---|---|
| [Houzz Pro](https://www.capterra.com/p/199689/Houzz-Pro/pricing/) | About $99 to $149 a month, sources conflict | CRM, estimates, proposals, invoices | Far below. You do one job, not a suite. |
| [Foyr Neo](https://blog.designfiles.co/interior-design-project-management-tool/) | $39 to $159 a month (vendor-written blog) | Design and visualisation | Below. Different job. |
| [DesignFiles](https://blog.designfiles.co/interior-design-project-management-tool/) | $49 to $69 a month (vendor-written blog) | Project and client tools | Below, because you start narrower. |
| [DesignerFlow](https://www.capterra.in/software/1099607/DesignerFlow) | €39 Solo, €89 Studio | Project management | Below. |
| [Agiled](https://agiled.app/blog/best-crm-for-interior-designers) | $0 | CRM, proposals, billing | Competes with your Free tier. |

Zygn, the India-based rival, has no price found. Solo at ₹499 is about $6 (Estimate). That is a large discount from the $39 floor, justified because the tool does less and the market is price-sensitive. If pre-sales show people pay more, raise it.

## 4. Unit economics check

All costs are Estimates unless sourced.

- **Fixed:** Vercel Pro about $20 and Supabase Pro about $25 a month, as found in the earlier hosting check. $45 a month is about ₹3,825 (45 × 85).
- **Variable per user:** WhatsApp messages and email. No price found. Assume ₹100 for Solo, ₹250 for Studio. Replace with the real figure once you pick a WhatsApp provider.
- **Gross margin:** Solo: (499 − 100) / 499 = 80%. Studio: (1,499 − 250) / 1,499 = 83%.
- **Break-even on fixed costs:** Solo alone: 3,825 / 399 = 9.6, so 10 customers. Studio alone: 3,825 / 1,249 = 3.1, so 4 customers.
- **Target blended ARPU:** 80% Solo and 20% Studio gives (0.8 × 499) + (0.2 × 1,499) = ₹699 a month.
- **Scale check:** ₹1 crore a year needs 10,000,000 / (699 × 12) = 1,192 paying studios. This excludes your time.

## 5. Pricing psychology

- **Anchor:** put Studio first on the page at ₹1,499. Solo at ₹499 then looks cheap.
- **Decoy:** a Solo plan with reminders limited to 3 per lead makes Studio's custom reminders feel much better, so some Solo users upgrade.
- **Annual framing:** show "₹4,990 a year, 2 months free" and the monthly price crossed out. Say "₹416 a month" (4,990 / 12), billed yearly.

## 6. Launch pricing vs. scale pricing

- **Launch (first 90 days):** ₹299 a month for the first 10 studios on Solo, in exchange for a 20-minute feedback call each month. Collect the first payment by UPI, with no billing system. Because you are testing whether anyone pays, a small real payment is a stronger signal than a free pilot.
- **Grandfathering:** founding studios keep ₹299 for 12 months, then move to the current price with 30 days' notice.
- **Raising prices:** raise Solo to ₹499 after 10 paying studios, and again by about 30% after 25 paying studios with monthly cancellations under 5%. Trigger on those counts, not on feature releases.

## The part that matters

The prices here only matter if experiment 2 works. Ask each designer what they pay now, and what they would cancel to afford this. If 0 of 30 pay a ₹500 deposit, the idea fails at any price, and the right move is to keep the tool for your own studio.
