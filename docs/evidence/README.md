# Operational Evidence Registry

This directory serves as the immutable evidence registry for platform verification artifacts.

## Artifact Structure

- `EV-{YYYY-MM-DD}-{TIMESTAMP}.json`: Immutable release verification evidence bundles.
- `tier-a-latest.json`: Latest measured Tier A developer benchmark evidence artifact.
- `latest-release.json`: Pointer to the most recent release verification evidence bundle.

All evidence files contain machine environment metadata (Node version, OS, commit SHA, timestamp), test results, performance numbers, and gate pass/fail statuses.
