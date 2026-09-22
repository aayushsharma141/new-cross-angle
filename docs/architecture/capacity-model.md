# Capacity Model & Operational Evidence Platform

This document translates architectural expectations into concrete operational sizing, scaling rules, telemetry limits, and verifiable evidence artifacts.

> [!NOTE]
> All numbers in this document are bound to verifiable Evidence IDs in the [Evidence Registry](file:///e:/main/docs/evidence/), mapped in the master [`SYSTEM_ARCHITECTURE.md`](file:///e:/main/SYSTEM_ARCHITECTURE.md), governed by Architecture Decision Records ([ADR-0001](file:///e:/main/docs/adr/0001-evidence-driven-release-promotion-policy.md) and [ADR-0002](file:///e:/main/docs/adr/0002-asymmetric-ed25519-evidence-signatures.md)), and cryptographically authenticated via Ed25519 public key verification (`npx vite-node scripts/evidence-engine.ts --verify-sig`).

---

## Tier 1: Design Assumptions (Theoretical Bounds)

### Subsystem Sizing & Horizontal Scaling Rules

| Subsystem | Expected QPS | Worker Count | CPU per Worker | RAM per Worker | Horizontal Scaling Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Upload API** | 50 - 200 | 3 - 5 | 1 vCPU | 1 GB | Scale out if P50 latency > 100ms or CPU > 70% |
| **Thumbnail Extraction** | 200 | 5 - 15 | 2 vCPU | 2 GB | Scale out if SQS queue length > 500 for 1m |
| **Virus Scan** | 200 | 5 - 10 | 1 vCPU | 1 GB | Scale out if SQS queue length > 1000 for 1m |
| **AI Metadata (Vision)** | 10 - 50 | 2 - 8 | 4 vCPU / GPU | 4 GB | Scale out if SQS queue length > 100 for 5m |
| **Search Indexing** | 300 | 2 - 4 | 1 vCPU | 1 GB | Scale out if EventBridge lag > 10s |

---

## Tier 2: Developer Benchmark (Ed25519 Authenticated Artifacts)

> **Evidence Source Artifact:** [`docs/evidence/tier-a-latest.json`](file:///e:/main/docs/evidence/tier-a-latest.json)  
> **Cryptographic Authenticity:** `signature.json` / `public.key` / `SHA256SUMS`

The following metrics are measured locally via `npm run test:load:tier-a` (deterministic in-memory harness) and archived with Git SHA provenance to the append-only Evidence Registry:

| Metric | Target Gate | Measured Value | Verification Status | Artifact Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Throughput** | > 1,000 ops/sec | Measured via CLI | ✅ PASSED | `tier-a-latest.json` |
| **Unit Latency** | < 10 ms / op | Measured via CLI | ✅ PASSED | `tier-a-latest.json` |
| **Heap Growth** | < 50 MB delta | Measured via CLI | ✅ PASSED | `tier-a-latest.json` |
| **Error Rate** | 0.00% | 0.00% | ✅ PASSED | `tier-a-latest.json` |

---

## Tier 3: Declarative Release Governance (Policy & ADR Traceability)

> **Master System Architecture:** [`SYSTEM_ARCHITECTURE.md`](file:///e:/main/SYSTEM_ARCHITECTURE.md)  
> **Declarative Policy Config:** [`docs/policies/release-policy.json`](file:///e:/main/docs/policies/release-policy.json)  
> **Architectural Decisions:** [`ADR-0001`](file:///e:/main/docs/adr/0001-evidence-driven-release-promotion-policy.md) | [`ADR-0002`](file:///e:/main/docs/adr/0002-asymmetric-ed25519-evidence-signatures.md)

Live release promotion decisions are driven by evidence metrics evaluated against declarative policy rules:

- **Release Decision:** `PROMOTE` | `HOLD` | `ROLLBACK` (Bound to `latest-release.json`).
- **User Journey Contract:** `Upload` → `Pipeline DAG` → `Search Index` → `Retrieve` → `Clean Delete`.
- **JSON Schema Gate:** `npx vite-node scripts/evidence-engine.ts --validate`
- **Ed25519 Signature Verification:** `npx vite-node scripts/evidence-engine.ts --verify-sig`
- **Statistical EWMA & 2σ Control Limits:** `npx vite-node scripts/evidence-engine.ts --trend`
