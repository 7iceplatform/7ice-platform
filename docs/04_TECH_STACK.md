# Technology Stack

## Selection posture

7ice favors boring, supported technologies with strong security practices, predictable hiring, and managed operational characteristics. This document defines selection criteria, not an unverified inventory of packages. Approved versions and deployment manifests are the implementation source of truth.

| Layer    | Baseline choice                                | Rationale                                    |
| -------- | ---------------------------------------------- | -------------------------------------------- |
| Web      | TypeScript, component-based SSR/SPA framework  | Typed, accessible, performant journeys       |
| API      | TypeScript service runtime with REST contracts | Shared language and mature ecosystem         |
| Data     | PostgreSQL-compatible relational database      | Transactions, constraints, reporting support |
| Async    | Durable queue/event infrastructure             | Retryable integration and notification work  |
| Storage  | Object storage with signed access              | Media scale and lifecycle control            |
| Delivery | Containers, CI/CD, infrastructure as code      | Repeatable promotion and rollback            |

## Technology decisions

Any addition must document purpose, owner, support status, license, data exposure, operational cost, exit strategy, and security review. Prefer platform capabilities before adding libraries or services. Pin versions, maintain a software bill of materials, and patch within defined service-level objectives.

See [Frontend](./09_FRONTEND.md), [Backend](./10_BACKEND.md), [Database](./11_DATABASE.md), [Deployment](./32_DEPLOYMENT.md), and [ADRs](./39_ADR.md).
