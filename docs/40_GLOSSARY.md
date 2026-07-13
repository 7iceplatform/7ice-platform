# Glossary

| Term            | Definition                                                                     |
| --------------- | ------------------------------------------------------------------------------ |
| Actor           | A person, service, or integration that initiates an action.                    |
| Aggregate       | A domain consistency boundary whose invariants are changed transactionally.    |
| Asset           | A delivered product or configured item with an operational lifecycle.          |
| Audit record    | Protected, attributable evidence of a security- or business-relevant action.   |
| Client portal   | Customer-facing self-service experience.                                       |
| Configuration   | A valid, versioned selection of product options and terms.                     |
| Domain event    | An immutable statement that a business fact occurred.                          |
| Employee portal | Role-oriented experience for internal operational users.                       |
| Idempotency     | Property that repeating a request produces one intended result.                |
| Installation    | A planned and evidenced delivery workflow for a confirmed commitment.          |
| Module          | Logical boundary that owns a subset of domain behavior and data.               |
| Outbox          | Transactionally stored event awaiting reliable asynchronous delivery.          |
| Policy          | Evaluated rule that permits or denies an action in a context.                  |
| Product family  | Grouping of versioned products with common commercial identity.                |
| Service case    | Tracked customer issue, request, or maintenance need.                          |
| Tenant          | An organization whose users, configuration, and data are isolated in 7ice.     |
| Work order      | Executable field or operational task, often linked to installation or service. |

Use these terms consistently across the documentation. Related concepts are expanded in [Project](./00_PROJECT.md), [Architecture](./03_ARCHITECTURE.md), [Auth](./24_AUTH.md), and [Business Rules](./37_BUSINESS_RULES.md).
