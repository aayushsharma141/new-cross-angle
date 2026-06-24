# Phase 12: Estimator Workspace Discussion Log

## Discussion Details

- **Date**: 2026-06-25
- **Phase**: Phase 12: Estimator Workspace

## Area 1: Formula Complexity

- **Options presented**:
  - Option 1 (Recommended): Simple base price × multipliers. (Easier to build, predictable, stored as simple JSON).
  - Option 2: Advanced expressions. (Admin can write custom math equations like `(base * 1.5) + (sqft * 0.5)`).
- **Selection**: Option 1 (Recommended)

## Area 2: Visual Assets

- **Options presented**:
  - Option 1 (Recommended): Yes, integrate `MediaPickerField` so we can map DAM assets to estimator selections (property types, packages).
  - Option 2: No, keep it simple with predefined icons or text for now.
- **Selection**: Option 1 (Recommended)

## Area 3: Publishing Workflow

- **Options presented**:
  - Option 1 (Recommended): Go live instantly. (Simpler architecture, rely on the admin to be careful).
  - Option 2: Implement Draft vs. Published states so we can test pricing calculations safely before customers see them.
- **Selection**: Option 1 (Recommended)
