# Designer Brief Product Validation Sprint

Before moving forward with Phase 17, the system will undergo a Product Validation Sprint with 5–10 real designers. The goal is to optimize *what the designer needs* rather than just *what the AI knows*.

## Layer 1 — Usability Heuristics
1. **5-Minute Rule**: Can a designer unfamiliar with the lead answer: Who is this client? What do they value? What should I emphasize? What should I avoid? (All within 5 minutes).
2. **Zero Raw Data Rule**: No raw JSON or abstract numbers. Everything must be translated into human language.
3. **One-Page Rule**: The brief must fit on one printed page.
4. **Actionability Rule**: Every section must answer "What should I do because of this?"
5. **Trust Rule**: Every AI recommendation must be explainable.
6. **Decision Rule**: The brief should help the designer make *at least one better decision* (e.g., "Skip discussing premium automation in the first meeting"), not just understand the client.

## Layer 2 — Business Impact Metrics
For every designer interview, measure these specific outcomes to determine if Phase 17 is worth building:

| Question | Success Target |
| :--- | :--- |
| Did the brief reduce preparation time? | >50% |
| Did it reveal something the designer wouldn't have asked? | Yes |
| Did it change the planned conversation? | Yes |
| Would you open this before every discovery call? | >80% Yes |

## Layer 3 — Missing Information
After each validation session, ask exactly one question:
> **"What was the first thing you still had to ask the client?"**

This single question will shape the future "Project Intelligence Workspace" better than any brainstorming session. Responses (e.g., "I needed to know if both spouses agreed") will become future Discovery questions or Intelligence prompts.

## Layer 4 — Before vs After Benchmark
Measure the delta in behavior, not just perception.

**Round 1 (Control):** Give the designer a lead with only Name, Property, Budget, and Contact details. Ask them to prepare for a first consultation. Record:
- Preparation time
- Questions they plan to ask
- Initial design direction

**Round 2 (With Intelligence):** Give a comparable lead with the Discovery Profile, AI Recommendation, Evidence Ledger, and Designer Brief. Record:
- Preparation time
- Questions they would ask
- Design direction
- Confidence (1-10)

## Layer 5 — Information Adoption
After the consultation, ask: *"Which parts of the brief did you actually use during the conversation?"* Track this to determine what deserves prime screen space in the future workspace.

| Brief Section | Used? | Useful? |
| :--- | :--- | :--- |
| Archetype | | |
| Emotional Goal | | |
| Sensory Preferences | | |
| AI Recommendation | | |
| Evidence Ledger | | |
| Lifestyle Context | | |

## Structured Feedback Repository
Do not rely on free-form notes. Use this template for every designer to build a quantifiable dataset:

```text
Designer:
Experience:
Client Type:

Preparation Time Before:
Preparation Time After:

First Missing Information:
Most Valuable Insight:
Unused Sections:
Confusing Sections:
One Feature Wish:

Decision Changed Because Of:
```

## Convert Every Finding Into a Product Action
Classify every observation from the interviews into one of four buckets:

| If designers say... | Product Action |
| :--- | :--- |
| "I didn't notice this." | Improve visibility or hierarchy |
| "I don't understand this." | Improve wording or explanation |
| "I understand it but don't use it." | Remove or demote the feature |
| "I needed this but it wasn't there." | Candidate for Phase 17 |

## Add a Feature Survival Test
Every section in the Designer Brief should answer one question:
> **If I removed this section tomorrow, would designers complain?**

If the answer is "probably not," it doesn't deserve to survive into the Project Intelligence Workspace.

## Measure Behavioral Change
The strongest KPI isn't time saved. It's when **AI Recommendation -> Designer changes meeting strategy -> Better client conversation**. Track whether the brief actively changed their meeting strategy:
- Did the designer change the order of the meeting?
- Did they skip topics they would normally discuss?
- Did they introduce topics earlier because of the brief?
- Did they bring different visual references?

## Success Criteria (Gate to Phase 17)
Phase 17 (Project Intelligence Workspace) will remain paused until the following criteria are met:
- [ ] ≥80% of designers say they'd open the workspace before every first consultation.
- [ ] Average preparation time decreases by at least 30%.
- [ ] Every designer identifies at least one decision they changed because of the brief.
- [ ] The same "missing information" appears across multiple interviews (indicating a real product gap).

---
**Product Evolution Status**: We have officially transitioned from building an "Interior Design CMS" to a **Client Intelligence Platform + Interior Design Operating System**. The milestone to optimize for is not shipping Phase 17, but proving that a designer made a better client decision because of this platform.

**Status**: Feature development frozen pending completion of this sprint.
