<!-- /founder:landing-page · 2026-10-13 · input: (empty, product and audience taken from founder/ files) -->

# Landing page copy: free home interior estimate (`/estimate`)

Assumption: the page is for homeowners in `[city]` planning a full home interior. It replaces the weak spot flagged in `founder/go-to-market.md`: every Reel and post should end here.
Assumption: the estimator asks for property type, location, details, services, add-ons, budget and timeline, then shows results (from the step files in `addons/calculators`).
Assumption: the estimate is free and has no obligation. Confirm before publishing.
Anything in `[brackets]` needs a real fact from you.

## 1. Hero

- **Headline:** See what your home interior will cost, in minutes
- **Subheadline:** Answer a few questions about your home and budget. You get a price range for your rooms, from a studio that builds them in [city].
- **Button:** Get my free estimate
- **Proof line:** `[Number of homes completed in city]` homes finished by Cross Angle Interior

## 2. Problem

**Headline:** "I don't know what this will cost, and I'm scared to ask."

- "Every designer gives me a different number." **Quotes vary and nobody explains why**, so you can't tell what is fair.
- "I'm not ready for a sales call." **You want a price range first**, without a salesperson ringing you all week.
- "I don't know what my budget buys." **You can't judge what a good result costs** until you have seen a range for your own home.

## 3. Solution

**Headline:** A clear price range before you speak to anyone

1. **A range for your home**
   You tell us your property type, rooms, services and add-ons. The estimate reflects your choices, not a generic average. `[Typical range for a 2BHK in your city]`
2. **Your budget, respected**
   You enter what you plan to spend. The result shows what that budget covers and what it does not, so you decide with real numbers. `[Time to complete the form: confirm]`
3. **A real person replies**
   After you submit, a designer from the studio contacts you on WhatsApp or phone to talk through the range. `[Reply time you commit to, for example within 24 hours]`

## 4. How it works

1. **Tell us about your home.** Pick your property type, location and rooms.
2. **Choose what you want.** Select services, add-ons, budget and timeline.
3. **See your range.** The estimate appears on screen.
4. **Talk to a designer.** Leave your number and we reply on WhatsApp or by phone.

## 5. Social proof

Stage: early. Use quotes from past clients and photos of finished homes, not logos.

- `[Quote from a past client: what they feared about cost, and what the final bill was compared with the first estimate]`
- `[Quote from a past client: how long the project took, and what they liked about the designer's replies]`
- `[Google review count and average rating, once collected]`

Never publish a quote you did not receive, and ask each client's permission.

## 6. Pricing preview

The estimate is free. `[Confirm: no fee and no obligation to hire the studio.]`
Is it worth it? You see a range for your own home before you decide to talk to anyone.

## 7. FAQ

**Is the estimate final?**
No. It is a range based on your answers. A designer confirms the real number after seeing your plans or visiting the home.

**Will I get spammed with calls?**
You hear from one designer who replies to what you asked. `[Confirm your contact policy and say how many times you will follow up.]`

**What happens to my details?**
Your name, phone and answers go to the studio so a designer can reply. We do not sell them. `[Confirm: who can see the data, how long you keep it, and link the privacy page at /privacy.]`

**What if my budget is small?**
Enter it anyway. The result shows what that budget covers, so you can adjust scope before spending anything.

**How long does the form take?**
`[Confirm by timing it yourself.]` It has seven short steps, and you can pick options instead of typing.

## 8. Final call to action

- **Headline:** Know your number before you talk to a designer
- **Button:** Get my free estimate
- **Risk reversal:** Free, no obligation. `[Use only if true.]`

## 9. SEO metadata

- **Title tag (58 characters):** Home Interior Cost Estimate in [city] | Cross Angle Interior
- **Meta description (about 155 characters):** Get a free price range for your home interior in [city]. Answer a few questions and a Cross Angle designer replies on WhatsApp. No obligation.
- **Keywords:** home interior cost in [city], interior design cost estimator, 2BHK interior cost [city]

## Notes for the build

- The current sitemap lists `/estimator`, which is not a route. The page is `/estimate`. Fix that when you edit.
- Track the estimator's first step as a PostHog event, so you can see where visitors drop. The estimator has produced 0 leads so far, so test the whole flow in production before you send traffic.
