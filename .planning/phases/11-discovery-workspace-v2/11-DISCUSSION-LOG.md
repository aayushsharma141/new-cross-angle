# Phase 11: Discovery Workspace V2 Discussion Log

## Discussion Details
- **Date**: 2026-06-25
- **Phase**: Phase 11: Discovery Workspace V2

## Area 1: Questions Storage & Schema
- **Options presented**:
  - Option 1 (Recommended): Use 'estimator_flow_config' JSONB. Keep all quiz configurations unified, avoiding database schema migrations and keeping query paths simple.
  - Option 2: Dedicated Supabase Tables. Create 'discovery_questions' and 'discovery_choices' tables to allow relational queries and foreign key constraints.
- **Selection**: Option 1 (Recommended)

## Area 2: Visual Prompts Configuration
- **Options presented**:
  - Option 1 (Recommended): Use 'discovery_visual_prompts' in 'estimator_flow_config'. Admin can select assets from DAM via MediaPickerField and assign score multipliers.
  - Option 2: Dedicated 'discovery_visual_prompts' table. Create a new table to map visual prompts directly to Supabase rows.
- **Selection**: Option 1 (Recommended)

## Area 3: Scoring Engine Binding
- **Options presented**:
  - Option 1 (Recommended): Dynamic Binding. Update scoring engine to read dimension weights directly from the loaded Supabase configurations.
  - Option 2: Keep Hardcoded Scores. The admin can change the questions/choices/images, but the underlying scoring logic/weights remain hardcoded in constants.ts.
- **Selection**: Option 1 (Recommended)

## Area 4: Result Page & CTA Editor
- **Options presented**:
  - Option 1 (Recommended): Configurable CTA per Archetype. Allow admin to define custom CTA button text, destination route (defaulting to Estimator), and description per Archetype.
  - Option 2: Static CTA. The results page always has a single static CTA directing all users to the Estimator.
- **Selection**: Option 1 (Recommended)
