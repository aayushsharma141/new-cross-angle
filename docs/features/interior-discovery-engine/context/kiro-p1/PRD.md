# PRD: Reimagining Discovery & Estimator as per kiro-p1

## Goal
Transform the UI of the Discovery and Estimator add-ons to perfectly match the kiro-p1 "Light Editorial/Japandi" visual aesthetic and layout structure.

## Design Tokens (from kiro-p1)
- **Background (--bg)**: #faf8f5
- **Surface (--surface)**: #ffffff
- **Ink (--ink)**: #1a1a1a
- **Ink Soft (--ink-soft)**: #5a5a5a
- **Border/Line (--line)**: #e8e4dd
- **Accent (--accent)**: #8b6f47
- **Accent Soft (--accent-soft)**: #f3ede2

## Scope
1. Update 	ailwind.config.ts to include these kiro tokens.
2. Refactor CostEstimator.tsx (and its steps) from Obsidian-Gold to Light-Editorial.
3. Refactor DiscoveryEngine.tsx (and its components) to Light-Editorial.
4. Implement kiro-p1 structural paradigms (e.g., specific border radiuses, padding, card styling, and .app-shell layout if applicable).
