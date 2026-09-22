# Decision Ledger v1.0

Treats workspace commitments as immutable revisions (analogous to Git).

## Schema Concept
```
Commitment
    id

Revision 1
Revision 2
Revision 3
Revision 4
```

## Lifecycle Events
- `workspace.commitment.created`: A new thread begins.
- `workspace.commitment.revised`: A new revision is appended to the ledger.
- `workspace.commitment.locked`: The commitment is finalized, triggering learning metric calculation.
- `workspace.commitment.unlocked`: A locked commitment is re-opened for edits.
- `workspace.commitment.archived`: A commitment is abandoned or replaced.

## Snapshots
When a commitment is locked, the exact state that produced it is stored.
This includes:
- `decision_genome`: The AI nodes and logic.
- `project_snapshot`: The budget and constraints.
- `workspace_state`: The designer's context (e.g. active room).
