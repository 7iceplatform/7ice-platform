# Backend Engineering

## Responsibilities

The backend owns domain invariants, authorization, transactional consistency, integration orchestration, and audit production. It exposes stable contracts to web applications and authorized external consumers without leaking persistence details.

## Service rules

- Resolve tenant and actor context from verified identity claims; scope every query and mutation.
- Validate commands at the boundary and enforce cross-record invariants inside a transaction.
- Publish domain events via the transactional outbox after a successful commit.
- Make externally retried commands idempotent using a caller-supplied idempotency key and retained response record.
- Return problem details that are safe for clients and correlated to private diagnostic logs.

## Operations

Services emit structured logs, metrics, traces, health checks, and audit records. Workers use bounded retries with backoff, a dead-letter path, and replay procedures. Configuration is validated at startup and secrets arrive only through the approved secret manager.

Contract specifics are in [API](./12_API.md), data rules in [Database](./11_DATABASE.md), and operational requirements in [Security](./25_SECURITY.md), [Deployment](./32_DEPLOYMENT.md), and [Testing](./33_TESTING.md).
