# ADR-0002: Asymmetric Ed25519 Cryptographic Evidence Signatures

- **Status:** Accepted
- **Date:** 2026-08-08
- **Authors:** Security & Governance Architecture Team
- **Linked Evidence:** [`docs/evidence/signature.json`](file:///e:/main/docs/evidence/signature.json), [`docs/evidence/public.key`](file:///e:/main/docs/evidence/public.key)

## Context

Symmetric HMAC signatures require shared secret keys between evidence generators and verifiers. If a secret is exposed, any entity can forge arbitrary evidence. To make evidence cryptographically authentic and non-repudiable across external auditors and CI/CD pipelines, evidence manifests must be signed asymmetrically.

## Decision

We standardize on **Ed25519 Asymmetric Keypair Signing**.

- Evidence bundles are signed using a private key (`private.key`), producing a detached Ed25519 signature payload in [`docs/evidence/signature.json`](file:///e:/main/docs/evidence/signature.json).
- Verifiers and external auditors verify the authenticity of the evidence registry using only the public key ([`docs/evidence/public.key`](file:///e:/main/docs/evidence/public.key)).
- Symmetric HMAC fallback logic is completely removed.

## Consequences

### Positive

- Cryptographically non-repudiable proof of evidence origin.
- Anyone can verify evidence authenticity using the public key without needing access to private signing secrets.

### Negative

- Requires secure key management for the Ed25519 private signing key in production CI environments.
