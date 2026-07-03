# Crossangle Token Decisions Log

This document records every change, addition, merger, or deprecation within the token system, referencing the specific architectural or constitutional rationale.

---

## Log Entries

### [2026-07-03] Initial Architecture Ratification (Phase 25)

*   **Action:** Initialized the 5-stage token system: Colors $\rightarrow$ Materials $\rightarrow$ Primitives $\rightarrow$ Semantic $\rightarrow$ Environments.
*   **Justification:** Decentralizes the hardcoded, duplicate styles from `index.css` into dynamic architectural layers.
*   **Constitutional Mapping:** Law 10 ("Systems outlast ideas"), Law 11 ("Color exists to serve light. Light exists to reveal form"), Law 21 ("No decorative borders").
*   **Alternatives Considered:** Direct semantic-to-foundation mapping was rejected (user feedback) to decouple environments from semantic bindings, utilizing the Material Roles (`--m-*`) layer instead.
*   **Change summary:** Created all CSS token modules in `tokens/` and connected them to `index.css` and `tailwind.config.ts`.
