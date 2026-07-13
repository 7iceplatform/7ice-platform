# Integrations

## Principles

Integrations extend 7ice without eroding domain ownership, security, or operational visibility. Every integration has a business owner, technical owner, data-processing purpose, system-of-record declaration, contract version, support path, and exit plan.

## Patterns

| Pattern            | Use                                   | Controls                                           |
| ------------------ | ------------------------------------- | -------------------------------------------------- |
| Synchronous API    | Immediate validation or user response | Timeout, circuit breaker, scoped credentials       |
| Webhook            | Downstream event notification         | Signed payload, replay protection, delivery log    |
| Asynchronous event | Reliable decoupled processing         | Outbox, schema version, deduplication, dead letter |
| Scheduled sync     | Reconciliation or legacy exchange     | Incremental cursor, idempotency, exception report  |
| File exchange      | Contractual batch need                | Encryption, checksum, quarantine, retention        |

## Lifecycle and security

Before onboarding, define data fields, classifications, legal basis, mapping, rate limits, failure behavior, observability, test environment, and decommission plan. Use unique service identities, least privilege, secret-manager references, TLS, signed webhooks, and key rotation. Never transmit data merely because it is convenient.

Failures are visible in an operational queue with correlation IDs, retries, retry limits, and authorized replay. Reconciliation compares counts and material values to detect silent loss. See [API](./12_API.md), [Backend](./10_BACKEND.md), [Finance](./22_FINANCE.md), [Notifications](./30_NOTIFICATIONS.md), [Security](./25_SECURITY.md), and [Deployment](./32_DEPLOYMENT.md).
