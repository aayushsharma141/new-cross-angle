# ADR-004: Typed Telemetry Event Contract Architecture

**Status:** Accepted  
**Date:** 2026-08-01  
**Deciders:** Lead Telemetry Engineer, Fullstack Architect  

## Context
Event tracking was scattered across inline string calls (`track('click_button')`), causing untyped telemetry data, missing funnel step metrics, and zero autocomplete enforcement.

## Decision
All analytics events MUST be registered in `apps/web/src/analytics/events.ts` under the `AnalyticsEventMap` interface. Calls to `track()` are strictly validated against this event map at build time.

## Consequences
- Guaranteed payload schema correctness.
- Full autocomplete and type-checking across all component track invocations.
