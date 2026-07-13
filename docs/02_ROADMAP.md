# Product Roadmap

## Planning model

The roadmap is outcome-based, not a release contract. Product maintains priorities quarterly; Engineering converts approved items into delivery slices with measurable acceptance criteria. Dates are intentionally not fixed here because they depend on discovery, tenant commitments, and capacity.

| Horizon      | Outcome                                        | Capabilities                                                |
| ------------ | ---------------------------------------------- | ----------------------------------------------------------- |
| Foundation   | A secure, operable multi-tenant core           | Identity, tenant isolation, admin shell, audit trail, CI/CD |
| Commercial   | A consistent acquisition-to-order journey      | CMS, catalogue, CRM, API, notifications                     |
| Delivery     | Controlled installation and service operations | Work orders, scheduling, technician workflows, evidence     |
| Optimization | Measurable, extensible operations              | Finance sync, analytics, automation, integrations           |

## Delivery gates

A capability may progress from discovery to build only when its owner, actors, lifecycle states, data classification, integrations, and success metric are known. It may release only after security, accessibility, performance, rollback, support, and documentation checks pass; see [Release Strategy](./36_RELEASE_STRATEGY.md).

## Dependency rules

- Portal functionality depends on identity, notifications, and authoritative domain APIs.
- Automation depends on auditable events and idempotent processing.
- Finance integrations consume approved billable events rather than UI state.

Track decisions in [ADRs](./39_ADR.md) and business constraints in [Business Rules](./37_BUSINESS_RULES.md).
