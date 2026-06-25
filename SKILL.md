---
name: my-rules
description: "Repository rules for graphify, visual design history, security execution, and audit protocols."
---

# My Rules

## Overview

This skill contains the custom workspace and environment rules for this repository, including Graphify usage, Visual Design History protocols, Security & Execution Constraints, and Audit Protocols.

## When to Use

- Trigger at the start of any conversation or task inside this repository to ensure strict compliance with project guidelines.

## Instructions

### 1. Graphify Knowledge Graph

- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- After modifying code files, run `graphify update .` to keep the graph current (AST-only, no API cost).

### 2. Visual Design History Rules

- At the start of ANY conversation regarding UI, styling, layout, or frontend modifications:
  1. Read the root `DESIGN_HISTORY.md` and the `design-history/` directory to identify what visual variations and layout checkpoints currently exist for the target files.
  2. Before editing any UI code, report the current active visual iteration and its design properties to the user.
  3. Ask the user if they want to build on top of the current layout, toggle features from previous design checkpoints, or perform a custom overhaul.
  4. Never overwrite previous design features without verifying the design history log and creating a new git checkpoint tag (e.g. `checkpoint/v5-...`).

### 3. Security & Execution Constraints

- **Strictly Disable Auto-Execute:** NEVER execute ANY terminal command, script, or system action (e.g., `rm`, `mv`, `sudo`, `npm run build`) without explicit, in-line, affirmative confirmation.
- **Limit File Access:** Restrict file system read/write operations ONLY to files explicitly provided or mathematically relevant to the module under review.
- **Artifact Generation:** All findings must be documented persistently in highly structured markdown files utilizing tables, code blocks, and clear hierarchical headers. Export thoughts to a `/audit-reports` directory continuously.

### 4. Output Formatting & Evaluation Scale

When rendering final verdicts, exclusively utilize the following tiering scale:

- Beginner / Freelancer-level
- Intermediate agency-level
- Professional production-level
- Elite / FAANG-level
