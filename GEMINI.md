## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Visual Design History Rules

- At the start of ANY conversation regarding UI, styling, layout, or frontend modifications:
  1. Run `git tag --list 'checkpoint/*'` to identify what visual variations and layout checkpoints currently exist for the target files (e.g. `checkpoint/v1-dark-meteors`, `checkpoint/home-page-ux-luxury-funnel`, `checkpoint/v-pre-skeleton-overhaul`). Checkpoints are tracked as git tags — there is no `DESIGN_HISTORY.md` or `design-history/` directory in this repo.
  2. Before editing any UI code, report the current active visual iteration and its design properties to the user.
  3. Ask the user if they want to build on top of the current layout, restore features from a previous checkpoint, or perform a custom overhaul.
  4. Never overwrite previous design features without first creating a new git checkpoint tag (e.g. `checkpoint/v5-...`).

## Three-Layer Token Architecture Rules

- Do NOT map Lighting States directly into CSS variables. Keep the token architecture decoupled into three distinct layers:
  1. **Foundation Tokens (Raw Materials):** Only these may contain actual color HSL values (e.g. `stone-50`, `charcoal-900`).
  2. **Semantic Tokens:** Components may ONLY consume semantic tokens (e.g. `canvas-primary`, `border-subtle`). Never reference Foundation tokens in components.
  3. **Lighting States (Environments):** Remap semantic tokens under environment triggers (e.g., `gallery`, `workspace`). Lighting States do NOT define colors directly.
- After the token architecture is frozen, do not add new tokens casually. Require that every new token answers:
  - Can an existing semantic token be reused?
  - Is this a true design concept or just a page-specific need?
  - Would this token still make sense if the website were redesigned in five years?

## Automatic Skill Routing Rules

- At the start of ANY conversation or when given a new task, check the Available Skills list to identify if any skills are relevant.
- Proactively read the matched `SKILL.md` files (and their referenced guides) using the `view_file` tool to apply their rules to your planning and coding.
- You can call multiple skills in parallel or sequentially if a task covers multiple domains (e.g. applying both `ux-writing` and `accessibility` for UI modifications).
