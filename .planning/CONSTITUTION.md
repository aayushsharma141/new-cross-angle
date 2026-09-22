# Platform Constitution

> This document almost never changes. Unlike PROJECT.md or ROADMAP.md, it does not track progress—it defines the principles that all future features, AI models, database tables, and workflows must obey. Every engineering decision, no matter how small, must be consistent with these laws.

---

## The North Star

> **The platform exists to help professionals make better decisions today while ensuring every validated decision makes the organization better tomorrow.**

## The Seven Verbs

Every existing module—and every future one—must fit into one of these verbs:

```
Capture → Understand → Recommend → Execute → Measure → Learn → Improve
```

If a proposed feature cannot be placed into one of those seven verbs, it does not belong in the platform.

---

## The Ten Laws

### Law 1 — Evidence First

> Nothing becomes knowledge until it is backed by evidence.

Opinions, guesses, and intuitions are not products of this platform. Every insight, recommendation, and strategic direction must be derived from captured, structured observations.

---

### Law 2 — Human Judgment Wins

> AI recommends. Humans decide. Humans validate. Only validated outcomes contribute to institutional knowledge.

The platform is a tool for augmenting professional judgment, not replacing it. No action is final until a human approves it.

---

### Law 3 — Every Decision is Traceable

Every recommendation must be able to answer three questions:

- What evidence supports it?
- Which insight generated it?
- Which observations produced that insight?

A recommendation that cannot answer all three is incomplete.

---

### Law 4 — Capture Once, Reuse Everywhere

Discovery answers, DAM assets, CRM notes, estimates, briefs, and project data are captured once and become reusable throughout the platform. No data is entered twice.

---

### Law 5 — Context Over Content

Raw data is never the product. The product is context.

`Budget: ₹75L` is data.

`Recommend Premium Lighting because clients with similar priorities accepted it in 83% of validated projects.` is context.

Every screen and report must deliver context, not just data.

---

### Law 6 — Every Screen Exists to Reduce Cognitive Load

Every screen must answer exactly three questions for the user:

- What should I know?
- What should I do?
- Why?

Nothing else. Screens that fail this test add noise, not value.

---

### Law 7 — Every Feature Must Close a Loop

Every feature must end with one of the following four outcomes. If a feature does not produce any of them, it is incomplete:

- Evidence Captured
- Decision Supported
- Outcome Measured
- Insight Generated

---

### Law 8 — Learning is Curated

No autonomous learning. Every new institutional insight requires explicit human validation before it influences future recommendations. This protects the integrity of the knowledge base from edge cases, outliers, and bad habits.

---

### Law 9 — Intelligence Must Compound

Every completed project must leave the organization smarter than before. If a project finishes without generating reusable evidence, the system failed to learn. The value of the platform compounds with every project.

---

### Law 10 — Trust is More Valuable Than Automation

When there is a trade-off, always choose the option that increases designer trust:

```
Explainability > Accuracy
Trust          > Automation
Human Confidence > AI Confidence
```

A designer who understands and trusts a recommendation will act on it. A designer who is given a black-box score will override it.

---

## The Decisive Filter

For the next decade of development, every proposed feature must pass this test before it is built:

> **Does it capture evidence, generate insight, support a decision, or measure an outcome?**

If the answer is no — no matter how impressive it seems — it does not belong in this platform.

---

## Artifact Governance Rule

Every new artifact added to `.planning/` or `design-history/` must explicitly answer one of two questions in its metadata:

1. What new evidence does this introduce?
2. What existing evidence does this reinterpret?

If an artifact answers neither, it does not belong in the repository.

---

## Dataset Execution Rules

These rules govern the collection and evaluation of Dataset v1. They enforce the transition from architecture to empirical operation.

### Rule 1 — The Pace of Reality

> **Founding Cases enter Dataset v1 only when ordinary production work naturally arrives. The pace of learning is determined by reality, not by the team's desire for more data.**

Do not manufacture synthetic cases to advance the dataset. The queue belongs to reality.

### Rule 2 — Terminology Freeze

> **If something new appears, first ask: "Can this be expressed using an existing FC, DIR, OI, or PL artifact?"**

Avoid inventing new labels unless absolutely necessary. Only create a new artifact type if the current vocabulary genuinely cannot represent the observation. This keeps the institution stable while the dataset grows.

---

*This document is permanent. Changes require explicit team consensus and must never be made in response to short-term engineering convenience or product pressure.*
