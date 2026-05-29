## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Visual Design History Rules

- At the start of ANY conversation regarding UI, styling, layout, or frontend modifications:
  1. Read the root [DESIGN_HISTORY.md](file:///c:/Users/aayus/Desktop/main/DESIGN_HISTORY.md) and the `design-history/` directory to identify what visual variations and layout checkpoints currently exist for the target files.
  2. Before editing any UI code, report the current active visual iteration and its design properties to the user.
  3. Ask the user if they want to build on top of the current layout, toggle features from previous design checkpoints, or perform a custom overhaul.
  4. Never overwrite previous design features without verifying the design history log and creating a new git checkpoint tag (e.g. `checkpoint/v5-...`).

