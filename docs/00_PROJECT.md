# Project Charter

## Purpose

7ice is a multi-tenant enterprise platform for the commercial and operational lifecycle of configurable products: discovery, quotation, order handoff, installation, service, invoicing, and customer self-service. It gives internal teams one governed operating record while customers see timely, role-appropriate progress.

## Scope and outcomes

The platform provides CMS-led acquisition journeys, product catalogue and configuration, CRM, operational work management, financial integrations, portals, analytics, and administration. The primary outcomes are a shorter quote-to-install cycle, traceable service delivery, trustworthy customer communication, and controlled revenue operations.

Out of scope for the core platform are manufacturing execution, general ledger replacement, and bespoke customer-specific source-code forks. Integrations may connect to systems of record for these functions; see [Integrations](./31_INTEGRATIONS.md).

## Stakeholders

| Stakeholder       | Accountable outcome                         |
| ----------------- | ------------------------------------------- |
| Executive sponsor | Value realization and investment priorities |
| Product           | Customer and operational outcomes           |
| Engineering       | Reliable, secure delivery                   |
| Operations        | Installation and service execution          |
| Finance           | Accurate billable events and reconciliation |
| Customers         | Transparent self-service                    |

## Success measures

- Conversion, quote turnaround, installation lead time, first-time-fix rate, and payment collection are measurable by tenant.
- Every material state transition is attributable to an actor or system and is auditable.
- New tenant configuration is possible without a deployment.

See [Product Vision](./01_PRODUCT_VISION.md), [Business Rules](./37_BUSINESS_RULES.md), and [Product Principles](./38_PRODUCT_PRINCIPLES.md).
